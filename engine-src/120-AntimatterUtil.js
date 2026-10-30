Class(function AntimatterUtil() {
  Inherit(this, Component);
  var _thread,
    _this = this,
    _promises = {};
  function createBufferArrayAntimatter(e, id) {
    let size = e.size,
      num = e.num,
      position = new Float32Array(size * size * 3);
    if (window.NativeUtils) NativeUtils.fillBufferUV(position, num, size);
    else {
      let h = 0.5 / size;
      for (let i = 0; i < num; i++)
        ((position[3 * i + 0] = h + (i % size) / size),
          (position[3 * i + 1] = h + Math.floor(i / size) / size),
          (position[3 * i + 2] = i));
    }
    let { w: w, h: h, d: d } = e.dimensions,
      usedDepth = num / (size * size),
      grid = 0 == w[0] && 0 == w[1] && 0 == h[0] && 0 == h[1];
    var vertices = new Float32Array(size * size * 4);
    if (window.NativeUtils)
      grid
        ? NativeUtils.fillBufferGrid(vertices, num, size, usedDepth)
        : NativeUtils.fillBufferRange(vertices, num, w[0], w[1], h[0], h[1], d[0], d[1]);
    else
      for (let i = 0; i < num; i++)
        (null != e.pointData
          ? ((vertices[4 * i + 0] = e.pointData.positions[3 * i + 0]),
            (vertices[4 * i + 1] = e.pointData.positions[3 * i + 1]),
            (vertices[4 * i + 2] = e.pointData.positions[3 * i + 2]))
          : grid
            ? ((vertices[4 * i + 0] = Math.range(i % size, 0, size, -1, 1)),
              (vertices[4 * i + 1] = Math.range(i / size, size * usedDepth * usedDepth, 0, -1, 1)))
            : ((vertices[4 * i + 0] = Math.random(w[0], w[1], 10)),
              (vertices[4 * i + 1] = Math.random(h[0], h[1], 10)),
              (vertices[4 * i + 2] = Math.random(d[0], d[1], 10))),
          (vertices[4 * i + 3] = 1));
    var attribs = new Float32Array(size * size * 4);
    if (null != e.pointData && e.pointData.random)
      for (let i = 0; i < num; i++)
        ((attribs[4 * i + 0] = e.pointData.random[4 * i + 0]),
          (attribs[4 * i + 1] = e.pointData.random[4 * i + 1]),
          (attribs[4 * i + 2] = e.pointData.random[4 * i + 2]),
          (attribs[4 * i + 3] = e.pointData.random[4 * i + 3]));
    else if (window.NativeUtils) NativeUtils.fillBufferRandom(attribs, attribs.length);
    else
      for (let i = 0; i < num; i++)
        ((attribs[4 * i + 0] = Math.random(0, 1, 10)),
          (attribs[4 * i + 1] = Math.random(0, 1, 10)),
          (attribs[4 * i + 2] = Math.random(0, 1, 10)),
          (attribs[4 * i + 3] = Math.random(0, 1, 10)));
    resolve(
      { geometry: position, vertices: vertices, attribs: attribs, usedDepth: usedDepth },
      id,
      [position.buffer, vertices.buffer, attribs.buffer],
    );
  }
  function createFloatArrayAntimatter({ size: size }, id) {
    let array = new Float32Array(size);
    resolve({ array: array }, id, [array.buffer]);
  }
  ((this.cache = !0),
    (this.createBufferArray = function (size, num, config = {}, _pointData = null) {
      let key;
      if (
        (_thread ||
          (function initThread() {
            ((_thread = !0),
              Thread.upload(createBufferArrayAntimatter),
              Thread.upload(createFloatArrayAntimatter));
          })(),
        _this.cache && ((key = `buffer_${JSON.stringify(config)}_${size}_${num}`), _promises[key]))
      )
        return _promises[key];
      let promise = Promise.create();
      key && (_promises[key] = promise);
      let buffers = [];
      return (
        _pointData?.positions.buffer && buffers.push(_pointData?.positions.buffer),
        Thread.shared()
          .createBufferArrayAntimatter(
            { size: size, num: num, dimensions: config, pointData: _pointData },
            buffers,
          )
          .then((data) => {
            ((data.attribs = new AntimatterAttribute(data.attribs, 4)),
              (data.vertices = new AntimatterAttribute(data.vertices, 4)));
            let geometry = data.geometry;
            ((data.geometry = new Geometry()),
              data.geometry.addAttribute("position", new GeometryAttribute(geometry, 3)),
              data.geometry.addAttribute("random", new GeometryAttribute(data.attribs.buffer, 4)),
              (data.geometry.attributes.random.destroyDataAfterUpload = !1),
              (data.key = key),
              promise.resolve(data));
          }),
        promise
      );
    }),
    (this.createFloatArray = function (size, freshCopy) {
      if (freshCopy || !_this.cache)
        return Thread.shared().createFloatArrayAntimatter({ size: size });
      if (_promises[`float_size${size}`]) return _promises[`float_size${size}`];
      return (_promises[`float_size${size}`] = Thread.shared().createFloatArrayAntimatter({
        size: size,
      }));
    }),
    (this.clearCacheEntry = function (key) {
      _this.cache && key && delete _promises[key];
    }));
}, "static");
