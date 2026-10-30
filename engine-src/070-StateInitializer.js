Class(function StateInitializer(Class, _ref, _params, _stateRef) {
  Inherit(this, Component);
  const _this = this;
  var _initTime = Render.TIME;
  function parseState(state) {
    return (state.includes("/") || (state = _this.parent.fragName + "/" + state), state);
  }
  function onInit(bool) {
    if (((_initTime = Render.TIME), bool)) {
      for (let key in _params)
        if (
          (_params[key].includes?.("#x#") && (_params[key] = _params[key].replace(/#x#/g, "")),
          _params[key].includes?.("_this."))
        ) {
          let path = _params[key].split("_this.")[1].split("."),
            value = _this.parent;
          for (let i = 0; i < path.length && ((value = value[path[i]]), value); i++);
          _params[key] = value;
        }
      _this.parent[_ref] = _this.parent.initClass(Class, AppState.createLocal(_params));
    } else _this.parent[_ref] = _this.parent[_ref]?.destroy();
  }
  async function onInit3D() {
    (await _this.wait(Math.max(1e3 - (Render.TIME - _initTime), 0)),
      await _this.wait((_) => !!_this.parent[_ref]));
    let ref = _this.parent[_ref];
    ref.nuke && (await Initializer3D.uploadNuke(ref.nuke));
    const group = ref.layout || ref.scene || ref.group || ref.element?.group;
    group && (await Initializer3D.uploadAllAsync(group));
  }
  ((this.ref = _ref),
    (function () {
      if (!_stateRef.init) throw "StateInitializer required init parameter";
      (_stateRef.init.includes?.("#x#")
        ? eval(_stateRef.init.replace(/#x#/g, "")) && onInit(!0)
        : "true" == _stateRef.init || 1 == _stateRef.init
          ? onInit(!0)
          : _this.bindState(AppState, parseState(_stateRef.init), onInit),
        _stateRef.init3d && _this.bindState(AppState, parseState(_stateRef.init3d), onInit3D));
    })(),
    (this.force = function () {
      AppState.set(parseState(_stateRef.init), !0);
    }));
});
