Class(function LineUtil() {
  Inherit(this, Component);
  const _this = this;
  var _builder, _meta;
  ((this.useThread = !0), (this.precision = 3));
  var _processing = !1,
    _queue = [];
  function createGeometry(attributes) {
    let geom = new Geometry();
    for (let key in attributes) {
      if ("index" == key || !attributes[key].length) continue;
      let comp = attributes[key].length / attributes.width.length;
      geom.addAttribute(key, new GeometryAttribute(attributes[key], comp));
    }
    return (
      geom.setIndex(
        new GeometryAttribute(
          new (Geometry.arrayNeedsUint32(attributes.index) ? Uint32Array : Uint16Array)(
            attributes.index,
          ),
          1,
        ),
      ),
      geom
    );
  }
  function initBuilder() {
    _this.useThread
      ? ((_builder = _this.initClass(Thread, LineBuilder)),
        Utils3D.loadEngineOnThread(_builder),
        _builder.importClass(LineGeometry, Line3D, Object3D),
        window.Curve && Curve.loadOnThread(_builder),
        _builder.on("meta", receiveMeta),
        Line3D.taperFunction && _builder.loadFunction(Line.taperFunction))
      : ((_builder = _this.initClass(LineBuilder)).onMeta = receiveMeta);
  }
  function trim(value, precision) {
    let p = Math.pow(10, precision);
    return Math.round(value * p) / p;
  }
  function build(groups, file, data) {
    let promise = Promise.create(),
      promises = [],
      group = null;
    return (
      groups.forEach((group) => {
        promises.push(_builder.createLine({ file: file, data: data, group: group }));
      }),
      Promise.all(promises).then((array) => {
        (array.forEach((attributes) => {
          let merged = new MergedLine(createGeometry(attributes), attributes.lineCount);
          ((merged.meta = attributes.meta),
            (merged.lineCount = attributes.lineCount),
            1 == array.length
              ? promise.resolve(merged)
              : (group || (group = new MergedLineGroup()), group.add(merged)));
        }),
          promise.resolve(group));
      }),
      promise
    );
  }
  async function runQueue() {
    let data,
      obj = _queue.shift();
    obj &&
      ((_processing = !0),
      (data = obj.file
        ? await (function load(file) {
            let promise = Promise.create();
            _builder || initBuilder();
            return (
              (file = Thread.absolutePath(file)),
              _builder.parse({ file: file }).then((groups) => {
                build(groups, file, null).then((merged) => {
                  ((merged.fileMeta = _meta),
                    promise.resolve(merged),
                    _builder.release({ file: file }),
                    (_meta = null));
                });
              }),
              promise
            );
          })(obj.file)
        : await (function loadFromData(data) {
            _builder || initBuilder();
            let promise = Promise.create();
            return (
              _builder.parseFromData({ data: data }).then((groups) => {
                build(groups, null, data).then((merged) => {
                  promise.resolve(merged);
                });
              }),
              promise
            );
          })(obj.data)),
      obj.promise.resolve(data),
      (_processing = !1),
      runQueue());
  }
  function receiveMeta(e) {
    _meta = e;
  }
  ((this.load = function (file) {
    let promise = Promise.create();
    return (_queue.push({ file: file, promise: promise }), _processing || runQueue(), promise);
  }),
    (this.loadFromData = function (data) {
      let promise = Promise.create();
      return (_queue.push({ data: data, promise: promise }), _processing || runQueue(), promise);
    }),
    (this.outputFromArray = function (array) {
      let output = [];
      return (
        array.forEach((l) => {
          let data = l.data;
          for (let key in data.geometry)
            Array.isArray(data.geometry[key]) &&
              data.geometry[key].forEach((v, i) => {
                data.geometry[key][i] = trim(v, _this.precision);
              });
          output.push(data);
        }),
        output
      );
    }),
    (this.trim = trim),
    (this.uploadTaperFunctions = function (fn) {
      if (!_this.useThread) return;
      _builder || initBuilder();
      let upload = { fns: {} };
      for (let key in fn) {
        let code = fn[key].toString();
        upload.fns[key] = code;
      }
      _builder.uploadTaperFunctions(upload);
    }),
    (this.changeTaperFunction = function (fn) {
      _builder.changeTaperFunction({ fn: fn });
    }),
    (this.loadFromSplines = async function (url, subdivisions, color, width, type) {
      _builder || initBuilder();
      let data = await _builder.loadFromSplines({
        url: Thread.absolutePath(url),
        subdivisions: subdivisions,
        width: width,
        color: color,
        type: type,
      });
      return new MergedLine(createGeometry(data), data.lineCount);
    }),
    (this.fromCurve = async function (curve, config) {
      (_builder || initBuilder(), (config.curvePoints = curve.points));
      let data = await _builder.fromCurve(config);
      return new MergedLine(createGeometry(data), data.lineCount);
    }));
}, "static");
