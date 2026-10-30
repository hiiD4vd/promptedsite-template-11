Class(function GeomThread() {
  Inherit(this, Component);
  const _this = this;
  var _cache = {},
    _cacheWait = {},
    _receive = {},
    _dracoLoaded = null;
  function computeBounding(data) {
    let geom = new Geometry();
    (geom.addAttribute("position", new GeometryAttribute(data.position, 3)),
      data.index && geom.setIndex(data.index),
      geom.computeBoundingBox(),
      geom.computeBoundingSphere(),
      (data.boundingBox = geom.boundingBox),
      (data.boundingSphere = geom.boundingSphere));
  }
  function loadGeometry(e, id) {
    get(e.path)
      .then((data) => {
        let buffers = [];
        if (data.data && data.metadata?.type) {
          let bufferList = { _type: data.metadata.type },
            jsonData = data.data;
          jsonData.index &&
            ((bufferList.index = new Geometry.TYPED_ARRAYS[jsonData.index.type](
              jsonData.index.array,
            )),
            buffers.push(bufferList.index.buffer));
          for (let key in jsonData.attributes) {
            let attrib = jsonData.attributes[key];
            ((bufferList[key] = new Geometry.TYPED_ARRAYS[attrib.type](attrib.array)),
              (bufferList[`${key}ItemSize`] = attrib.itemSize),
              buffers.push(bufferList[key].buffer));
          }
          (bufferList.position && computeBounding(bufferList),
            data.userData && (bufferList.userData = data.userData),
            e.custom && self[e.custom](bufferList),
            resolve(bufferList, id, buffers));
        } else {
          for (let key in data)
            if ("bones" != key)
              if (Array.isArray(data[key])) {
                const ArrayType =
                  "index" == key
                    ? Geometry.arrayNeedsUint32(data[key])
                      ? Uint32Array
                      : Uint16Array
                    : Float32Array;
                ((data[key] = new ArrayType(data[key])), buffers.push(data[key].buffer));
              } else data[key].length > 0 && buffers.push(data[key].buffer);
          (computeBounding(data), e.custom && self[e.custom](data), resolve(data, id, buffers));
        }
      })
      .catch((er) => {
        e.preloading || console.error(er);
        let plane = new PlaneGeometry(1, 1).toNonIndexed(),
          buffers = [],
          data = {};
        for (let key in plane.attributes)
          ((data[key] = plane.attributes[key].array), buffers.push(data[key].buffer));
        (computeBounding(data), resolve(data, id, buffers));
      });
  }
  function loadDracoLib() {
    _dracoLoaded = Promise.create();
    const useJS = "object" != typeof WebAssembly,
      libFolder = "~assets/js/lib/_draco/",
      libs = useJS
        ? [`${libFolder}draco_decoder.js`]
        : [`${libFolder}draco_wasm_wrapper.js`, `${libFolder}draco_decoder.wasm`];
    Promise.all(
      libs.map((url, i) =>
        fetch(Assets.getPath(url)).then((res) => {
          if (!res.ok) throw new Error();
          return 0 === i ? res.text() : res.arrayBuffer();
        }),
      ),
    )
      .then(async (loadedLibs) => {
        Thread.upload(
          [
            "function loadDraco() {",
            "/* draco decoder */",
            loadedLibs[0],
            "",
            "/* worker */",
            "",
            "let decoderConfig, decoderPending;",
            "",
            DracoThread.onError.toString(),
            DracoThread.decodeGeometry.toString(),
            DracoThread.decodeIndex.toString(),
            DracoThread.decodeAttribute.toString(),
            DracoThread.getDracoDataType.toString(),
            DracoThread.readJsonHeader.toString(),
            DracoThread.fetchAndDecodeDracoBundle.toString(),
            DracoThread.fetchAndDecodeDraco.toString(),
            DracoThread.fetchAndDecodeDracoSkinAnimation.toString(),
            DracoThread.decodeDracoBuffer.toString(),
            "",
            "return " + DracoThread.loadDraco.toString(),
            "};",
          ].join("\n"),
        );
        const pool = Thread.shared(!0).array,
          decoderConfig = useJS ? {} : { wasmBinary: loadedLibs[1] };
        (pool.forEach((t) => t.importCode("self.loadDraco = loadDraco();")),
          await Promise.all(
            pool.map((t) => t.loadDraco({ type: "init", decoderConfig: decoderConfig })),
          ),
          _dracoLoaded.resolve());
      })
      .catch(() => {
        (console.warn("Draco libs could not be loaded. Fallback to .json"), _dracoLoaded.reject());
      });
  }
  function parseGeometry(data, path, custom) {
    let geometry;
    if (
      ((geometry =
        custom && _receive[custom]
          ? _receive[custom](data, doParseGeometry)
          : doParseGeometry(data)),
      (geometry._src = path),
      !geometry.attributes.position)
    ) {
      if (!geometry.attributes.positions)
        throw `GeomThread :: Malformed geometry is missing position data. ${path}`;
      ((geometry.attributes.position = geometry.attributes.positions),
        delete geometry.attributes.positions);
    }
    return geometry;
  }
  function doParseGeometry(data) {
    let geom = new Geometry();
    if (data._type) {
      for (let key in data)
        if ("_type" !== key && !key.endsWith("ItemSize"))
          switch (key) {
            case "userData":
              geom.userData = data.userData;
              break;
            case "boundingBox":
              geom.boundingBox = new Box3(
                new Vector3().set(
                  data.boundingBox.min.x,
                  data.boundingBox.min.y,
                  data.boundingBox.min.z,
                ),
                new Vector3().set(
                  data.boundingBox.max.x,
                  data.boundingBox.max.y,
                  data.boundingBox.max.z,
                ),
              );
              break;
            case "boundingSphere":
              geom.boundingSphere = new Sphere(
                new Vector3().set(
                  data.boundingSphere.center.x,
                  data.boundingSphere.center.y,
                  data.boundingSphere.center.z,
                ),
                data.boundingSphere.radius,
              );
              break;
            case "index":
              geom.setIndex(data.index);
              break;
            case "bones":
              geom.bones = data.bones;
              break;
            default:
              data[`${key}ItemSize`] &&
                geom.addAttribute(key, new GeometryAttribute(data[key], data[`${key}ItemSize`]));
          }
    } else {
      (geom.addAttribute("position", new GeometryAttribute(data.position, 3)),
        geom.addAttribute("normal", new GeometryAttribute(data.normal || data.position.length, 3)),
        geom.addAttribute(
          "uv",
          new GeometryAttribute(data.uv || (data.position.length / 3) * 2, 2),
        ),
        data.uv2 && geom.addAttribute("uv2", new GeometryAttribute(data.uv2, 2)),
        data.vdata && geom.addAttribute("vdata", new GeometryAttribute(data.vdata, 3)),
        data.index && geom.setIndex(data.index),
        data.skinIndex && geom.addAttribute("skinIndex", new GeometryAttribute(data.skinIndex, 4)),
        data.skinWeight &&
          geom.addAttribute("skinWeight", new GeometryAttribute(data.skinWeight, 4)),
        (data.rig || data.bones) &&
          (geom.bones = (data.rig ? data.rig.bones : data.bones).slice(0)));
      const knownAttribs = [
        "position",
        "normal",
        "uv",
        "uv2",
        "vdata",
        "index",
        "skinIndex",
        "skinWeight",
        "rig",
        "bones",
        "boundingBox",
        "boundingSphere",
        "userData",
      ];
      for (let key in data)
        if (!knownAttribs.includes(key) && "bones" !== key)
          if (Array.isArray(data[key]) && data[key].length > 0) {
            const itemSize = data.position
              ? Math.floor(data[key].length / (data.position.length / 3))
              : 1;
            itemSize > 0 &&
              itemSize <= 4 &&
              geom.addAttribute(key, new GeometryAttribute(data[key], itemSize));
          } else if (data[key] && "object" == typeof data[key] && data[key].length > 0) {
            const itemSize = data.position
              ? Math.floor(data[key].length / (data.position.length / 3))
              : 1;
            itemSize > 0 &&
              itemSize <= 4 &&
              geom.addAttribute(key, new GeometryAttribute(data[key], itemSize));
          }
      ((geom.boundingBox = new Box3(
        new Vector3().set(data.boundingBox.min.x, data.boundingBox.min.y, data.boundingBox.min.z),
        new Vector3().set(data.boundingBox.max.x, data.boundingBox.max.y, data.boundingBox.max.z),
      )),
        (geom.boundingSphere = new Sphere(
          new Vector3().set(
            data.boundingSphere.center.x,
            data.boundingSphere.center.y,
            data.boundingSphere.center.z,
          ),
          data.boundingSphere.radius,
        )));
    }
    return geom;
  }
  function processPath(path, rawPath) {
    let cacheBust = !1;
    path.includes("?") && ((path = path.split("?")[0]), (cacheBust = "?" + Utils.timestamp()));
    let noQuery = path;
    return (
      path.includes("http") ||
        (Hydra.LOCAL || (cacheBust = !1),
        path.includes("assets/geometry/") || rawPath || (path = "assets/geometry/" + path),
        path.includes(".") || (path += ".json"),
        cacheBust && (path += cacheBust)),
      [Thread.absolutePath(Assets.getPath(path)), noQuery]
    );
  }
  function isGeometryUsable(geom) {
    if (Array.isArray(geom)) return geom.every(isGeometryUsable);
    for (let key in geom.attributes) {
      let attrib = geom.attributes[key];
      if (!attrib._gl && attrib.array.deleted && !attrib.array.length) return !1;
    }
    return !0;
  }
  function getCachedGeometry(path) {
    let geom = _cache[path]?.deref();
    if (geom && isGeometryUsable(geom)) return geom;
  }
  ((this.caching = !0),
    (async function () {
      (await Hydra.ready(), Thread.upload(loadGeometry, computeBounding));
    })(),
    (this.loadGeometry = async function (path, custom, preloading, rawPath) {
      if (!Device.graphics.gpu) return new PlaneGeometry(1, 1);
      let noQuery;
      [path, noQuery] = processPath(path, rawPath);
      let data,
        cached = getCachedGeometry(path);
      if (cached) return cached;
      if (_this.caching) {
        if (_cacheWait[path]) return _cacheWait[path];
        _cacheWait[path] = Promise.create();
      }
      if (noQuery.endsWith(".bin")) {
        (_dracoLoaded || loadDracoLib(), await _dracoLoaded);
        try {
          data = await Thread.shared().loadDraco({
            type: "decode",
            path: path,
            custom: custom,
            preloading: preloading,
          });
        } catch (e) {
          path = path.replace(".bin", ".json");
        }
      }
      data ||
        (data = await Thread.shared().loadGeometry({
          path: path,
          custom: custom,
          preloading: preloading,
        }));
      let geometry = parseGeometry(data, path, custom);
      return (
        _this.caching &&
          ((_cache[path] = new WeakRef(geometry)),
          _cacheWait[path] && _cacheWait[path].resolve(geometry),
          delete _cacheWait[path]),
        geometry
      );
    }),
    (this.loadGeometryBundle = async function (path, preloading) {
      if (!Device.graphics.gpu) return [new PlaneGeometry(1, 1)];
      let noQuery;
      [path, noQuery] = processPath(path);
      let cached = getCachedGeometry(path);
      if (cached) return cached;
      if (_this.caching) {
        if (_cacheWait[path]) return _cacheWait[path];
        _cacheWait[path] = Promise.create();
      }
      (_dracoLoaded || loadDracoLib(), await _dracoLoaded);
      let data = await Thread.shared().loadDraco({
          type: "decodeBundle",
          path: path,
          preloading: preloading,
        }),
        basePath = noQuery.substring(0, noQuery.lastIndexOf("/")),
        geometries = data.geometries.map((geometryData) => {
          let geometryPath = `${basePath}/${geometryData.userData.name}`,
            geometry = parseGeometry(geometryData, geometryPath);
          return (
            _this.caching &&
              ((_cache[geometryPath] = new WeakRef(geometry)),
              _cacheWait[geometryPath] && _cacheWait[geometryPath].resolve(geometry),
              delete _cacheWait[geometryPath]),
            geometry
          );
        });
      return (
        _this.caching &&
          ((_cache[path] = new WeakRef(geometries)),
          _cacheWait[path] && _cacheWait[path].resolve(geometries),
          delete _cacheWait[path]),
        geometries
      );
    }),
    (this.loadSkinAnimation = async function (path, custom, preloading) {
      let noQuery,
        data = _cache[path]?.deref();
      if ((([path, noQuery] = processPath(path)), data)) return data;
      if (_this.caching) {
        if (_cacheWait[path]) return _cacheWait[path];
        _cacheWait[path] = Promise.create();
      }
      if (noQuery.endsWith(".bin")) {
        (_dracoLoaded || loadDracoLib(), await _dracoLoaded);
        try {
          data = await Thread.shared().loadDraco({
            type: "decodeSkinAnimation",
            path: path,
            custom: custom,
            preloading: preloading,
          });
        } catch (e) {
          path = path.replace(".bin", ".json");
        }
      }
      return (
        data || (data = await get(path)),
        custom && _receive[custom] && (data = _receive[custom](data)),
        _this.caching &&
          ((_cache[path] = new WeakRef(data)),
          _cacheWait[path] && _cacheWait[path].resolve(data),
          delete _cacheWait[path]),
        data
      );
    }),
    (this.removeFromCache = function (path) {
      (path.includes("assets/geometry/") || (path = "assets/geometry/" + path),
        path.includes(".") || (path += ".json"),
        (path = Thread.absolutePath(Assets.getPath(path))),
        delete _cache[path],
        delete _cacheWait[path]);
    }),
    (this.clearCache = function () {
      ((_cache = {}), (_cacheWait = {}));
    }),
    (this.loadDracoLib = function () {
      return (_dracoLoaded || loadDracoLib(), _dracoLoaded);
    }),
    (this.loadSkinnedGeometry = function (path, custom, preloading) {
      return this.loadGeometry(path, custom, preloading);
    }),
    (this.customFunction = function (fn, receive) {
      let name = Thread.upload(fn);
      ((name = name[0]), (_receive[name] = receive));
    }));
}, "static");
