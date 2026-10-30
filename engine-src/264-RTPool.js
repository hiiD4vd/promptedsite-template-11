Class(function RTPool(_type, _size = 3, _format, _multisample = !1, _samplesAmount = 4) {
  Inherit(this, Component);
  const _this = this;
  var _pool,
    _indexed = {};
  ((this.nullRT = Utils3D.createRT(2, 2)), (this.nullRT.setSize = () => {}));
  var _array = [],
    _resizeDisabled = !1,
    _rtSize = { width: Stage.width * World.DPR, height: Stage.height * World.DPR };
  function createRT() {
    let rt = Utils3D.createRT(
      _rtSize.width,
      _rtSize.height,
      _type,
      _format,
      _multisample,
      _samplesAmount,
    );
    return ((rt.index = _pool.length()), rt);
  }
  function addListeners() {
    _resizeDisabled || _this.events.sub(Events.RESIZE, resizeHandler);
  }
  function resizeHandler() {
    ((_rtSize.width = Stage.width * World.DPR),
      (_rtSize.height = Stage.height * World.DPR),
      _array.forEach((rt) => {
        rt.setSize(_rtSize.width, _rtSize.height);
      }),
      _this.events.fire(Events.RESIZE, _rtSize, !0));
  }
  (!(function initPool() {
    _pool = new ObjectPool();
    for (let i = 0; i < _size; i++) {
      let rt = createRT();
      (_pool.put(rt), _array.push(rt));
    }
  })(),
    defer(addListeners),
    this.get("array", (_) => _array),
    (this.getRT = function (index) {
      return "number" == typeof index
        ? (_indexed[index] || (_indexed[index] = createRT()), _indexed[index])
        : _pool.get() ||
            (function createExtraRT() {
              Hydra.LOCAL &&
                console.warn(
                  `Not enough RTs in RTPool, initial size=${_size}, growing to ${_array.length + 1}`,
                );
              let rt = createRT();
              return (_pool.put(rt), _array.push(rt), rt);
            })();
    }),
    (this.putRT = function (rt) {
      (delete rt.scissor, delete rt.fxscene, rt !== _this.nullRT && _pool.put(rt));
    }),
    (this.setSize = function (width, height) {
      (_this.disableResize(),
        (_rtSize.width = width),
        (_rtSize.height = height),
        _array.forEach((rt) => {
          rt.setSize(_rtSize.width, _rtSize.height);
        }),
        _this.events.fire(Events.RESIZE, _rtSize, !0));
    }),
    (this.onDestroy = function () {
      let p = _pool.get();
      for (; p;) (p.dispose(), (p = _pool.get()));
    }),
    (this.clone = function (
      type = _type,
      size = _size,
      format = _format,
      multisample = _multisample,
      samplesAmount = _samplesAmount,
    ) {
      return new RTPool(type, size, format, multisample, samplesAmount);
    }),
    (this.disableResize = function () {
      ((_resizeDisabled = !0), _this.events.unsub(Events.RESIZE, resizeHandler));
    }));
}, "singleton");
