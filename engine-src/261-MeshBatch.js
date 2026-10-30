Class(
  function MeshBatch(_input, _config) {
    Inherit(this, Object3D);
    const _this = this;
    var _geom,
      _shader,
      _mesh,
      _firstRender,
      _shaderKey,
      _availableIndices,
      _packedData,
      _packedTexture,
      _maxIndices,
      _static = !1,
      _renderOrder = 0,
      _objects = [],
      _offset = [],
      _quaternion = [],
      _scale = [],
      _attributes = {},
      _uniformToAttrib = [],
      _uniformNoAttrib = [],
      _frustumCulled = !0,
      _v1 = new Vector3(),
      _v2 = new Vector3(),
      _q = new Quaternion(),
      _list = new LinkedList();
    function initHotReload(shaderRef) {
      _this.events.sub(ShaderUIL.SHADER_UPDATE, ({ shader: shader }) => {
        if (
          (shaderRef || (shaderRef = _shader),
          shaderRef && shaderRef.vsName && shader.includes(shaderRef.vsName))
        ) {
          let newShader = new Shader(shaderRef.vsName, shaderRef.fsName);
          (delete MeshBatch.shaders[`${shaderRef.vsName}|${shaderRef.fsName}`],
            updateShader(newShader),
            Shader.renderer.hotReloadClearProgram(shaderRef.vsName),
            newShader.upload(_mesh, _geom),
            shaderRef._gl && (shaderRef._gl = newShader._gl),
            shaderRef._gpu && (shaderRef._gpu = newShader._gpu),
            shaderRef._metal && (shaderRef._metal = newShader._metal));
        }
      });
    }
    async function initFromSceneLayout() {
      let wildcard = _input.get("wildcard");
      if (!wildcard || !wildcard.length) return;
      let groupName = wildcard.split("|")[0],
        group = await _this.parent.getLayer(groupName);
      await _this.wait(group.children, "length");
      let children = [...group.children];
      (children.sort((a, b) => a.renderOrder - b.renderOrder),
        wildcard.includes("static") && (_this.static = !0),
        children.forEach((mesh) => _this.add(mesh)),
        (_this.group.renderOrder = children[0].renderOrder),
        group.add(_this.group));
    }
    function updateShader(shader, castShadow) {
      let prefetchCode = Shaders.getShader(shader.vsName + ".vs");
      ((shader.customCompile = `${shader.vsName}|${shader.fsName}|instance`),
        (shader.castShadow = castShadow),
        shader.resetProgram());
      let cached = MeshBatch.shaders[`${shader.vsName}|${shader.fsName}`];
      if (cached)
        return (
          (shader.fragmentShader = shader.restoreFS = cached.fragment),
          void (shader.vertexShader = shader.restoreVS = cached.vertex)
        );
      let vsSplit = shader.vertexShader.split("__ACTIVE_THEORY_LIGHTS__"),
        fsSplit = shader.fragmentShader.split("__ACTIVE_THEORY_LIGHTS__");
      if (
        !vsSplit[1].includes("vec3 pos = position;") &&
        !vsSplit[1].includes("pos = pos;") &&
        !shader.vertexShader.includes("vec3 transformPosition")
      )
        throw `Shader ${shader.vsName} needs to have "vec3 pos = position;" in order for batching to work`;
      let definitions = [];
      (vsSplit[1].split("\n").forEach((line) => {
        if (line.includes("uniform")) {
          if (line.includes("sampler2D")) return;
          let data = line.split(" "),
            uni = data[2].replace(";", "");
          (function uniformToAttrib(key) {
            key = key.trim();
            for (let i = 0; i < _uniformToAttrib.length; i++) {
              let val = _uniformToAttrib[i];
              if (key.includes(val) || val.includes(key)) return !_uniformNoAttrib.includes(key);
            }
            return !1;
          })(uni) &&
            (definitions.push(`${uni} = a_${data[2]}`),
            (vsSplit[1] = vsSplit[1].replace(
              line,
              `attribute ${data[1]} a_${data[2]}\nvarying ${data[1]} ${data[2]}`,
            )),
            (fsSplit[1] = fsSplit[1].replace(line, `varying ${data[1]} ${data[2]}`)));
        }
      }),
        (vsSplit[1] = vsSplit[1].replace(
          /vec3 pos = position;/g,
          "vec3 pos = transformPosition(position, offset, scale, orientation);",
        )),
        (vsSplit[1] = vsSplit[1].replace(
          /pos = pos;/g,
          "pos = transformPosition(pos, offset, scale, orientation);",
        )),
        (vsSplit[1] = vsSplit[1].replace(
          /vNormal = normalMatrix \* normal;/g,
          "vNormal = normalMatrix * transformNormal(normal, orientation);",
        )),
        (vsSplit[1] = vsSplit[1].replace(
          /vWorldNormal = transpose(inverse(mat3(modelMatrix))) \* normal;/g,
          "vWorldNormal = transpose(inverse(mat3(modelMatrix))) * transformNormal(normal, orientation);",
        )),
        (vsSplit[1] = vsSplit[1].replace(
          /vec3 transformedNormal = normal;/g,
          "vec3 transformedNormal = transformNormal(normal, orientation);",
        )));
      let main = vsSplit[1].split("main() {");
      ((main[1] = "\n" + definitions.join("\n") + main[1]),
        (vsSplit[1] = main.join("main() {")),
        (vsSplit[0] += "#define INSTANCED 1\n"),
        (fsSplit[0] += "#define INSTANCED 1\n"),
        (prefetchCode && prefetchCode.includes("attribute vec3 offset")) ||
          ((vsSplit[0] += "\n"),
          (vsSplit[0] += "attribute float instance;\n"),
          (vsSplit[0] += "attribute vec3 offset;\n"),
          (vsSplit[0] += "attribute vec3 scale;\n"),
          (vsSplit[0] += "attribute vec4 orientation;\n")),
        shader.vertexShader.includes("vec3 transformPosition") ||
          (vsSplit[0] += Shaders.getShader("instance.vs") + "\n"),
        _packedData &&
          (vsSplit[0] +=
            "\n            attribute float batchIndex;\n            uniform vec3 uPackedInfo;\n            uniform sampler2D tPackedTexture;\n            vec2 getPackedUV(float index, float offset) {\n                float pixel = (index*uPackedInfo.x) + offset;\n            \n                float size = uPackedInfo.y;\n                float p0 = pixel / size;\n                float y = floor(p0);\n                float x = p0 - y;\n            \n                vec2 uv = vec2(0.0);\n                uv.x = x;\n                uv.y = y / size;\n                return uv;\n            }\n            \n            vec4 getPackedData(float offset) {\n                return texture2D(tPackedTexture, getPackedUV(batchIndex, offset));\n            }\n            "),
        (vsSplit = vsSplit.join("__ACTIVE_THEORY_LIGHTS__")),
        (fsSplit = fsSplit.join("__ACTIVE_THEORY_LIGHTS__")),
        (shader.vertexShader = shader.restoreVS = vsSplit),
        (shader.fragmentShader = shader.restoreFS = fsSplit),
        (_shaderKey = `${shader.vsName}|${shader.fsName}`),
        (MeshBatch.shaders[_shaderKey] = {
          fragment: shader.fragmentShader,
          vertex: shader.vertexShader,
        }));
    }
    function modifyGeometry(dir) {
      if (!_geom || !_geom.attributes || !_geom.attributes.offset) return;
      let count = _config.preallocate ? _config.preallocate : _geom.attributes.offset.count + dir;
      if (!_config.preallocate) {
        ((_offset = new Float32Array(3 * count)),
          (_scale = new Float32Array(3 * count)),
          (_quaternion = new Float32Array(4 * count)),
          _geom.attributes.offset.setArray(new Float32Array(3 * count)),
          _geom.attributes.scale.setArray(new Float32Array(3 * count)),
          _geom.attributes.orientation.setArray(new Float32Array(4 * count)));
        for (let key in _attributes) {
          let components = _geom.attributes[key].itemSize;
          ((_attributes[key] = new Float32Array(count * components)),
            _geom.attributes[key].setArray(new Float32Array(count * components)));
        }
      }
      ((_geom.maxInstancedCount = _objects.length), loop());
    }
    function dirty(a, b) {
      for (let i = a.length - 1; i > -1; i--) if (a[i] != b[i]) return !0;
      return !1;
    }
    function prepareMesh(mesh, i) {
      let pos = _v1,
        scale = _v2,
        quaternion = _q;
      if (_config.worldCoords)
        try {
          if (_config.parent > 0)
            switch (_config.parent) {
              case 1:
                (pos.copy(mesh._parent.position),
                  scale.copy(mesh._parent.scale),
                  quaternion.copy(mesh._parent.quaternion));
                break;
              case 2:
                (pos.copy(mesh._parent._parent.position),
                  scale.copy(mesh._parent._parent.scale),
                  quaternion.copy(mesh._parent._parent.quaternion));
            }
          else
            _config.addParentPosition
              ? (pos.copy(mesh.position).add(mesh._parent.position),
                2 == _config.addParentPosition && pos.add(mesh._parent._parent.position),
                scale.copy(mesh.scale),
                quaternion.copy(mesh.quaternion))
              : (pos.copy(mesh.getWorldPosition()),
                scale.copy(mesh.getWorldScale()),
                quaternion.copy(mesh.getWorldQuaternion()));
          _config.bypassVisibilityCheck ||
            mesh.determineVisible() ||
            (scale.x = scale.y = scale.z = 0);
        } catch (e) {
          (pos.copy(mesh.position), scale.copy(mesh.scale), quaternion.copy(mesh.quaternion));
        }
      else
        (pos.copy(mesh.position),
          scale.copy(mesh.scale),
          quaternion.copy(mesh.quaternion),
          _config.visibilityCheck && !mesh.determineVisible() && scale.setScalar(0));
      mesh.batchOffsetPos && pos.add(mesh.batchOffsetPos);
      let i3 = 3 * i,
        i4 = 4 * i;
      if (
        ((_offset[i3 + 0] = pos.x),
        (_offset[i3 + 1] = pos.y),
        (_offset[i3 + 2] = pos.z),
        (_scale[i3 + 0] = scale.x),
        (_scale[i3 + 1] = scale.y),
        (_scale[i3 + 2] = scale.z),
        (_quaternion[i4 + 0] = quaternion.x),
        (_quaternion[i4 + 1] = quaternion.y),
        (_quaternion[i4 + 2] = quaternion.z),
        (_quaternion[i4 + 3] = quaternion.w),
        mesh.attributes)
      )
        for (let key in mesh.attributes) {
          let attr = mesh.attributes[key],
            value = void 0 === attr.value ? attr : attr.value;
          value instanceof Color
            ? ((_attributes[key][3 * i + 0] = value.r),
              (_attributes[key][3 * i + 1] = value.g),
              (_attributes[key][3 * i + 2] = value.b))
            : value instanceof Vector3
              ? ((_attributes[key][3 * i + 0] = value.x),
                (_attributes[key][3 * i + 1] = value.y),
                (_attributes[key][3 * i + 2] = value.z))
              : value instanceof Vector4 || value instanceof Quaternion
                ? ((_attributes[key][4 * i + 0] = value.x),
                  (_attributes[key][4 * i + 1] = value.y),
                  (_attributes[key][4 * i + 2] = value.z),
                  (_attributes[key][4 * i + 3] = value.w))
                : value instanceof Vector2
                  ? ((_attributes[key][2 * i + 0] = value.x),
                    (_attributes[key][2 * i + 1] = value.y))
                  : (_attributes[key][i] = value);
        }
      if (_packedTexture) {
        let batchIndex = mesh.batchIndex,
          stride = 4 * _packedTexture.keys;
        for (let key in _packedData) {
          let offset = 4 * _packedData[key],
            value = mesh.packedData[key].value,
            index = batchIndex * stride + offset,
            r = (g = b = a = 1);
          (value instanceof Color
            ? ((r = value.r), (g = value.g), (b = value.b))
            : value instanceof Vector3
              ? ((r = value.x), (g = value.y), (b = value.z))
              : value instanceof Vector4 || value instanceof Quaternion
                ? ((r = value.x), (g = value.y), (b = value.z), (a = value.w))
                : value instanceof Vector2
                  ? ((r = value.x), (g = value.y))
                  : (r = value),
            (_packedTexture.data[index + 0] = r),
            (_packedTexture.data[index + 1] = g),
            (_packedTexture.data[index + 2] = b),
            (_packedTexture.data[index + 3] = a));
        }
        _packedTexture.needsUpdate = !0;
      }
    }
    function updateBuffers() {
      if (_mesh) {
        (dirty(_quaternion, _geom.attributes.orientation.array) &&
          (_geom.attributes.orientation.array.set(_quaternion),
          (_geom.attributes.orientation.needsUpdate = !0)),
          dirty(_offset, _geom.attributes.offset.array) &&
            (_geom.attributes.offset.array.set(_offset),
            (_geom.attributes.offset.needsUpdate = !0)),
          dirty(_scale, _geom.attributes.scale.array) &&
            (_geom.attributes.scale.array.set(_scale), (_geom.attributes.scale.needsUpdate = !0)));
        for (let key in _attributes)
          dirty(_attributes[key], _geom.attributes[key].array) &&
            (_geom.attributes[key].array.set(_attributes[key]),
            (_geom.attributes[key].needsUpdate = !0));
      } else
        !(function initMesh() {
          if (_config.preallocate) {
            let count = _config.preallocate,
              offset = new Float32Array(3 * count),
              scale = new Float32Array(3 * count),
              quaternion = new Float32Array(4 * count);
            (offset.set(_offset),
              scale.set(_scale),
              quaternion.set(_quaternion),
              (_offset = offset),
              (_scale = scale),
              (_quaternion = quaternion),
              _geom.addAttribute(
                "offset",
                new GeometryAttribute(new Float32Array(_offset), 3, 1, _this.useDynamic),
              ),
              _geom.addAttribute(
                "scale",
                new GeometryAttribute(new Float32Array(_scale), 3, 1, _this.useDynamic),
              ),
              _geom.addAttribute(
                "orientation",
                new GeometryAttribute(new Float32Array(_quaternion), 4, 1, _this.useDynamic),
              ));
          } else
            ((_offset = new Float32Array(_offset)),
              (_quaternion = new Float32Array(_quaternion)),
              (_scale = new Float32Array(_scale)),
              _geom.addAttribute(
                "offset",
                new GeometryAttribute(new Float32Array(_offset), 3, 1, _this.useDynamic),
              ),
              _geom.addAttribute(
                "scale",
                new GeometryAttribute(new Float32Array(_scale), 3, 1, _this.useDynamic),
              ),
              _geom.addAttribute(
                "orientation",
                new GeometryAttribute(new Float32Array(_quaternion), 4, 1, _this.useDynamic),
              ));
          if (
            ((_geom.attributes.offset.destroyDataAfterUpload = !1),
            (_geom.attributes.scale.destroyDataAfterUpload = !1),
            (_geom.attributes.orientation.destroyDataAfterUpload = !1),
            _frustumCulled)
          ) {
            let box = new Box3();
            (_objects.forEach((mesh) => box.expandByObject(mesh, !0)),
              (_geom.boundingBox = box),
              (_geom.boundingSphere = box.getBoundingSphere()));
          }
          ((_mesh = _this.usePoints ? new Points(_geom, _shader) : new Mesh(_geom, _shader)),
            (_shader.castShadow || _this.castShadow) && defer((_) => (_mesh.castShadow = !0)),
            (_mesh.asyncPromise = _this.group.asyncPromise),
            _this.group.asyncPromise.resolve(),
            (_this.mesh = _mesh),
            (_this.shader = _mesh.shader),
            (_this.mesh.isMeshBatch = !0),
            _this.group.add(_mesh),
            (_mesh.frustumCulled = _frustumCulled),
            _renderOrder && (_mesh.renderOrder = _renderOrder));
          for (let key in _attributes) {
            let components = 1,
              attr = _objects[0].attributes[key],
              value = attr.value || attr;
            value instanceof Vector3
              ? (components = 3)
              : value instanceof Vector4 || value instanceof Quaternion
                ? (components = 4)
                : value instanceof Color
                  ? (components = 3)
                  : value instanceof Vector2 && (components = 2);
            let buffer = new Float32Array(
              _config.preallocate ? _config.preallocate * components : _attributes[key].length,
            );
            (buffer.set(_attributes[key]),
              (_attributes[key] = buffer),
              _geom.addAttribute(
                key,
                new GeometryAttribute(
                  new Float32Array(_attributes[key]),
                  components,
                  1,
                  _this.useDynamic,
                ),
              ),
              (_geom.attributes[key].destroyDataAfterUpload = !1));
          }
          _this.onMeshCreated && _this.onMeshCreated(_mesh);
        })();
    }
    async function initializeStatic() {
      let wasVisible = _this.group.determineVisible();
      if (
        (await (() => {
          let promise = Promise.create(),
            mesh = _list.start(),
            i = 0,
            worker = new Render.Worker((_) => {
              (mesh.updateMatrixWorld(!0),
                prepareMesh(mesh, i),
                i++,
                (mesh = _list.next()),
                mesh || (worker.stop(), promise.resolve()));
            }, 1);
          return promise;
        })(),
        updateBuffers(),
        wasVisible)
      ) {
        if (_frustumCulled) {
          let box = new Box3();
          (_objects.forEach((mesh) => box.expandByObject(mesh, !0)),
            (_geom.boundingBox = box),
            (_geom.boundingSphere = box.getBoundingSphere()));
        }
        _this.flag("isStaticReady", !0);
      } else
        (await _this.wait(() => _this.group.determineVisible()), _static && initializeStatic());
    }
    function loop() {
      _static && _this.stopRender(loop, RenderManager.AFTER_LOOPS);
      let first = !_firstRender;
      _firstRender = !0;
      let i = 0,
        mesh = _list.start();
      for (; mesh;)
        ((!1 !== mesh.batchNeedsUpdate || first) &&
          (first && mesh.updateMatrixWorld(!0), prepareMesh(mesh, i)),
          (mesh = _list.next()),
          i++);
      updateBuffers();
    }
    function firstLoop() {
      (_static || _this.startRender(loop, RenderManager.AFTER_LOOPS), loop());
    }
    ((_this.usePoints = !1),
      (_this.useDynamic = !1),
      (function () {
        if (
          (_input instanceof InputUILConfig || ((_config = _input), (_input = null)),
          (_config = _config || {}),
          _input && _this.parent.ready(!0).then(initFromSceneLayout),
          (_this.group.asyncPromise = Promise.create()),
          Hydra.LOCAL)
        ) {
          let warning = setTimeout(() => {
            console.log("Problem loading instance", _this?.parent?._config?.getFilePath?.("json"));
          }, 5e3);
          _this.group.asyncPromise.then(() => {
            clearTimeout(warning);
          });
        }
        Hydra.LOCAL && initHotReload();
      })(),
      (this.add = function (mesh) {
        (_objects.push(mesh),
          _list.push(mesh),
          (mesh.uploadIgnore = !0),
          (mesh.batch = _this),
          _availableIndices &&
            !mesh.batchIndex &&
            ((mesh.batchIndex = _availableIndices.shift()),
            mesh.attributes || (mesh.attributes = {}),
            (mesh.attributes.batchIndex = { value: mesh.batchIndex })));
        let shader = mesh.shader;
        for (let key in shader.uniforms) {
          let uniform = shader.uniforms[key];
          if (
            uniform.value instanceof Color ||
            uniform.value instanceof Vector2 ||
            uniform.value instanceof Vector3 ||
            uniform.value instanceof Vector4 ||
            uniform.value instanceof Quaternion ||
            "number" == typeof uniform.value
          )
            if (uniform.batchUnique || _config.batchUnique)
              (_uniformToAttrib.push(key),
                mesh.attributes || (mesh.attributes = {}),
                (mesh.attributes["a_" + key] = uniform));
            else if (
              (_uniformNoAttrib.includes(key) || _uniformNoAttrib.push(key),
              void 0 !== uniform.packedIndex)
            ) {
              if ((_packedData || (_packedData = {}), !_availableIndices))
                throw "Can't use packedData without first setting .maxIndices";
              (_packedData[key] || (_packedData[key] = uniform.packedIndex),
                mesh.packedData || (mesh.packedData = {}),
                (mesh.packedData[key] = uniform));
            }
        }
        (_geom ||
          (function initGeometry(mesh) {
            if (
              (((_geom = new Geometry().instanceFrom(mesh.geometry)).batch = _this),
              (_this.geom = _geom),
              !_shader)
            ) {
              if (
                (((_shader = mesh.shader.clone()).debug = !0),
                _this.usePoints || mesh.shader.replicateUniformsTo(_shader),
                _packedData)
              ) {
                let total = Object.keys(_packedData).length,
                  pixels = Math.sqrt(_maxIndices * total),
                  size = Math.pow(2, Math.ceil(Math.log(pixels) / Math.log(2)));
                (((_packedTexture = new DataTexture(
                  new Float32Array(size * size * 4),
                  size,
                  size,
                  Texture.RGBAFormat,
                  Texture.FLOAT,
                )).keys = total),
                  _shader.addUniforms({
                    tPackedTexture: { value: _packedTexture },
                    uPackedInfo: { value: new Vector3(total, size, _maxIndices) },
                  }));
              }
              updateShader(_shader, mesh.castShadow);
            }
            if (mesh.attributes) for (let key in mesh.attributes) _attributes[key] = [];
            ((_geom.maxInstancedCount = _objects.length), _static && defer(initializeStatic));
          })(mesh),
          _mesh &&
            (modifyGeometry(1),
            _static && console.error("Don't add more meshes to a static MeshBatch")),
          (mesh.shader.neverRender = !0),
          _static || RenderManager.scheduleOne(firstLoop, RenderManager.AFTER_LOOPS));
      }),
      (this.remove = function (mesh) {
        _objects.includes(mesh) &&
          (_objects.remove(mesh),
          _list.remove(mesh),
          mesh.batchIndex > -1 &&
            !mesh.persistBatchIndex &&
            (_availableIndices.push(mesh.batchIndex), _availableIndices.sort((a, b) => a - b)),
          modifyGeometry(-1));
      }),
      (this.onDestroy = function () {
        (_this.mesh && _this.mesh.destroy && _this.mesh.destroy(),
          delete MeshBatch.shaders[_shaderKey],
          _this._onDestroy && _this._onDestroy());
      }),
      (this.loadFromFile = async function (shader, geomFile, instanceFile) {
        (geomFile.includes("http") ||
          geomFile.includes("assets/geometry") ||
          (geomFile = "assets/geometry/" + geomFile),
          geomFile.includes(".json") || (geomFile += ".json"),
          instanceFile.includes("http") ||
            instanceFile.includes("assets/geometry") ||
            (instanceFile = "assets/geometry/" + instanceFile),
          instanceFile.includes(".json") || (instanceFile += ".json"));
        let [geom, data] = await Promise.all([
            GeomThread.loadGeometry(Assets.getPath(geomFile)),
            get(Assets.getPath(instanceFile)),
          ]),
          array = [],
          count = data.offset.buffer.length / 3;
        for (let i = 0; i < count; i++) {
          let mesh = new Mesh(geom, shader);
          (mesh.position.fromArray(data.offset.buffer, 3 * i),
            mesh.scale.fromArray(data.scale.buffer, 3 * i),
            mesh.quaternion.fromArray(data.orientation.buffer, 4 * i),
            array.push(mesh),
            _this.add(mesh));
        }
        return (await _this.ready(), array);
      }),
      (this.ready = function () {
        return _this.wait("mesh");
      }),
      (this.staticReady = function () {
        if (_static) return _this.wait("isStaticReady");
      }),
      (this.getMeshByIndex = function (index) {
        return _objects[index];
      }),
      (this.getMeshCount = function () {
        return _objects.length;
      }),
      this.get("static", () => _static),
      this.set("static", (b) => {
        !!b !== _static &&
          ((_static = !!b),
          _objects.length &&
            (_static &&
              console.warn(
                "For better initialization performance, set meshBatch.static before adding any meshes",
              ),
            _this.stopRender(loop, RenderManager.AFTER_LOOPS),
            RenderManager.scheduleOne(firstLoop, RenderManager.AFTER_LOOPS)));
      }),
      this.set("maxIndices", (value) => {
        if (((_maxIndices = value), !(_availableIndices = _config.availableIndices || []).length))
          for (let i = 0; i < value; i++) _availableIndices[i] = i;
      }),
      this.get("attributes", (_) => _attributes),
      this.get("maxIndices", (_) => _maxIndices),
      this.set("renderOrder", (v) => {
        ((_renderOrder = v), _mesh && (_mesh.renderOrder = v));
      }),
      this.get("renderOrder", (_) => _renderOrder),
      this.set("frustumCulled", (b) => {
        ((_frustumCulled = b), _mesh && (_mesh.frustumCulled = b));
      }),
      (this.applyToShader = function (shader, castShadow = shader.mesh?.castShadow ?? !1) {
        (updateShader(shader, castShadow), Hydra.LOCAL && initHotReload(shader));
      }),
      (this.upload = async function () {
        (await _this.ready(), _mesh.upload());
      }));
  },
  (_) => {
    MeshBatch.shaders = {};
  },
);
