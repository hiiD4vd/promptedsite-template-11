Class(function CurveLayer(_input, _group) {
  Inherit(this, Object3D);
  const _this = this;
  var _config, _curve, _debug;
  function getJSONPath() {
    let path = _config.get("json");
    return (
      path.includes("assets/geometry") || (path = "assets/geometry/" + path),
      path.includes(".json") || (path += ".json"),
      path
    );
  }
  (!(async function () {
    ((_config = InputUIL.create(_input.prefix + "curve", _group)).setLabel("Curve"),
      _config.add("json"),
      _config.addToggle("debug"),
      _config.get("json") &&
        (await (async function initCurve(path) {
          let data = (_this.data = await get(Assets.getPath(path)));
          ((_curve = _this.initClass(Curve, data)),
            Global.PLAYGROUND &&
              (((_debug = _curve.debug()).visible = _config.get("debug")), _this.add(_debug)));
        })(getJSONPath())),
      (_config.onUpdate = (_) => {
        _debug && (_debug.visible = Global.PLAYGROUND && _config.get("debug"));
      }),
      _config.onUpdate(),
      _this.flag("loaded", !0));
  })(),
    (this.getData = async function () {
      return (
        _config.get("json") ||
          console.warn("No json path set on CurveLayer :: Promise won't resolve"),
        await _this.wait("data"),
        _this.data
      );
    }),
    (this.getJSONPath = function () {
      return (_config.get("json") || console.warn("No json path set on CurveLayer"), getJSONPath());
    }),
    (this.getCurve = async function () {
      return (await _this.wait("loaded"), _curve);
    }));
});
