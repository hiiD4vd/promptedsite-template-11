Class(function LineBuilder() {
  const _this = this;
  var _cache = {},
    _taperFunctions,
    _color;
  function merge(geom, line) {
    geom.attributes.position ? mergeAttributes(geom, line) : copyAttributes(geom, line);
  }
  function copyAttributes(geom, line) {
    for (let key in line.attributes) geom.attributes[key] = line.attributes[key];
    geom.index = line.index;
  }
  function mergeAttributes(geom, line) {
    for (let key in line.attributes)
      geom.attributes[key] = new GeometryAttribute(
        Float32ArrayConcat(geom.attributes[key].array, line.attributes[key].array),
        geom.attributes[key].itemSize,
      );
    let indexArray = Array.prototype.slice.call(geom.index),
      startIndex = indexArray[indexArray.length - 1] + 1;
    for (let i = 0; i < line.index.length; i++) indexArray.push(startIndex + line.index[i]);
    geom.index = new (Geometry.arrayNeedsUint32(indexArray) ? Uint32Array : Uint16Array)(
      indexArray,
    );
  }
  function Float32ArrayConcat(first, second) {
    var firstLength = first.length,
      result = new Float32Array(firstLength + second.length);
    return (result.set(first), result.set(second, firstLength), result);
  }
  function geomToObj(geom) {
    let obj = {},
      buffers = [];
    for (let key in geom.attributes)
      ((obj[key] = geom.attributes[key].array), buffers.push(obj[key].buffer));
    return (
      (obj.index = geom.index),
      buffers.push(obj.index.buffer),
      { obj: obj, buffers: buffers }
    );
  }
  function createExtraAttrib(geom, key, value) {
    let len = geom.attributes.position.count;
    if ("number" == typeof value) {
      let array = new Float32Array(len);
      for (let i = 0; i < array.length; i++) array[i] = value;
      geom.addAttribute(key, new GeometryAttribute(array, 1));
    } else {
      let array = new Float32Array(len * value.length);
      for (let i = 0; i < len; i++)
        for (let j = 0; j < value.length; j++) array[i * value.length + j] = value[j];
      geom.addAttribute(key, new GeometryAttribute(array, value.length));
    }
  }
  function parseData(data, e) {
    "string" == typeof data && (data = JSON.parse(JSON.parse(data)));
    let mergedGeom = new Geometry();
    return (
      data.forEach((d) => {
        let lineGeom = new LineGeometry(d.geometry.index, d.geometry.points, d.geometry.pressure);
        (createExtraAttrib(lineGeom.geometry, "thickness", d.meta.width),
          d.meta.color &&
            (_color || (_color = new Color()),
            _color.set(d.meta.color),
            createExtraAttrib(lineGeom.geometry, "aColor", _color.toArray())),
          d.meta.opacity && createExtraAttrib(lineGeom.geometry, "aOpacity", d.meta.opacity),
          merge(mergedGeom, lineGeom.geometry, d.meta));
      }),
      geomToObj(mergedGeom)
    );
  }
  function parseGroups(data, e, callback, promise) {
    let groups = [],
      cached = [];
    for (let i = 0; i < data.length; i++) {
      let meta = data[i].meta,
        key = `${meta.fs || "fs"}_${meta.vs || "vs"}`;
      cached[key] ||
        ((cached[key] = !0), groups.push({ fs: meta.fs || "fs", vs: meta.vs || "vs" }));
    }
    void 0 === callback ? promise.resolve(groups) : resolve(groups, callback);
  }
  ((this.parse = function (e, callback) {
    window.taper && (Line3D.taperFunction = taper);
    let promise = Promise.create();
    return (
      get(e.file).then((data) => {
        if (data.data) {
          let meta = data;
          ((data = data.data),
            delete meta.data,
            window.emit ? emit("meta", meta) : _this.onMeta && _this.onMeta(meta));
        }
        ((_cache[e.file] = data), parseGroups(data, e, callback, promise));
      }),
      promise
    );
  }),
    (this.createLine = function (e, callback) {
      let data = e.data || _cache[e.file],
        selected = [];
      for (let i = 0; i < data.length; i++) {
        let meta = data[i].meta;
        meta.fs != e.group.fs || (meta.vs && meta.vs != e.group.vs) || selected.push(data[i]);
      }
      let meta = selected[0].meta;
      if (_taperFunctions) {
        let key = meta.vs;
        _taperFunctions[key] && (Line3D.taperFunction = _taperFunctions[key]);
      }
      let { obj: obj, buffers: buffers } = parseData(selected, e);
      if (((obj.meta = meta), (obj.lineCount = selected.length), void 0 === callback))
        return Promise.resolve(obj);
      resolve(obj, callback, buffers);
    }),
    (this.parseFromData = function (e, callback) {
      window.taper && (Line3D.taperFunction = taper);
      let data = e.data,
        promise = Promise.create();
      return (parseGroups(data, e, callback, promise), promise);
    }),
    (this.release = function (e) {
      delete _cache[e.file];
    }),
    (this.uploadTaperFunctions = function (e) {
      _taperFunctions = e.fns;
      for (let key in _taperFunctions) eval(`_taperFunctions['${key}'] = ${_taperFunctions[key]}`);
    }),
    (this.changeTaperFunction = function (e) {
      Line3D.taperFunction = _taperFunctions[e.fn];
    }),
    (this.loadFromSplines = function (
      { url: url, subdivisions: subdivisions, width: width, color: color, type: type },
      id,
    ) {
      !(async function () {
        let mergedGeom = new Geometry(),
          array = await get(url),
          curves = array.curves.map((array) => new Curve(array, type)),
          total = 0,
          maxLength = 0;
        (array.curves.forEach((c) => {
          let length;
          ((length = c.metadata ? c.points.length : c.length),
            (maxLength = Math.max(length, maxLength)));
        }),
          curves.forEach((curve, i) => {
            let length,
              points = [];
            length = array.curves[i].metadata
              ? array.curves[i].points.length
              : array.curves[i].length;
            let count = Math.max(10, Math.round(subdivisions * (length / maxLength)));
            for (let i = 0; i <= count; i++) {
              let pct = i / count,
                pos = curve.getPoint(pct);
              points.push(pos.x, pos.y, pos.z);
            }
            let line = new Line3D({ width: width, color: color, index: total++, points: points });
            (createExtraAttrib(line.geometry, "thickness", width),
              createExtraAttrib(line.geometry, "aColor", new Color(color || "#ffffff").toArray()),
              createExtraAttrib(line.geometry, "aOpacity", 1),
              merge(mergedGeom, line.geometry));
          }));
        let { obj: obj, buffers: buffers } = geomToObj(mergedGeom);
        ((obj.lineCount = total), resolve(obj, id, buffers));
      })();
    }),
    (this.fromCurve = function (
      {
        curvePoints: curvePoints,
        subdivisions: subdivisions,
        width: width,
        color: color,
        type: type,
      },
      id,
    ) {
      let curve = new Curve(
          curvePoints.map((p) => new Vector3(p.x, p.y, p.z)),
          type,
        ),
        points = [];
      for (let i = 0; i <= subdivisions; i++) {
        let pct = i / subdivisions,
          pos = curve.getPoint(pct);
        points.push(pos.x, pos.y, pos.z);
      }
      let line = new Line3D({ width: width, color: color, points: points });
      (createExtraAttrib(line.geometry, "thickness", width),
        createExtraAttrib(line.geometry, "aColor", new Color(color || "#ffffff").toArray()),
        createExtraAttrib(line.geometry, "aOpacity", 1));
      let { obj: obj, buffers: buffers } = geomToObj(line.geometry);
      resolve(obj, id, buffers);
    }));
});
