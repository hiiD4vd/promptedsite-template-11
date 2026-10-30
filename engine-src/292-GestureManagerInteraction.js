Class(function GestureManagerInteraction(_element, _options = {}) {
  Inherit(this, Component);
  const _this = this;
  var _input,
    _captured,
    _listeners = [];
  function sortListeners() {
    _listeners.sort((a, b) => b.listener.zIndex - a.listener.zIndex);
  }
  function removeListener(listener) {
    let index = _listeners.findIndex((r) => r.listener === listener);
    _listeners.splice(index, 1);
  }
  function touchStart(e) {
    for (let i = 0; i < _listeners.length; ++i) {
      let record = _listeners[i];
      if (record.listener.destroy) {
        if (!record.listener._invisible && record.checkHit.call(record.listener, e)) {
          (_captured = record).input.events.fire(Interaction.START, e, !0);
          break;
        }
      } else (removeListener(record.listener), (i -= 1));
    }
  }
  function touchMove(e) {
    _captured &&
      !_captured.listener._invisible &&
      _captured.input.events.fire(Interaction.MOVE, e, !0);
  }
  function touchEnd(e) {
    _captured &&
      (_captured.listener._invisible || _captured.input.events.fire(Interaction.END, e, !0),
      (_captured = null));
  }
  (window.RenderManager &&
  window.RenderManager.type === window.RenderManager.VR &&
  _options.joystick
    ? (_input = _this.initClass(JoystickInteraction, {
        hit: _element,
        hitCamera: _options.hitCamera,
      }))
    : ((_input = _this.initClass(Interaction, _element)).ignoreLeave = !0),
    (function addHandlers() {
      (_this.events.sub(_input, Interaction.START, touchStart),
        _this.events.sub(_input, Interaction.MOVE, touchMove),
        _this.events.sub(_input, Interaction.END, touchEnd));
    })(),
    (_this.addListener = function (listener, checkHit) {
      let proxied = listener.initClass(Events),
        input = new Proxy(proxied, {
          get: (target, property) => ("events" === property ? target[property] : _input[property]),
        }),
        record = { listener: listener, checkHit: checkHit, input: input };
      _listeners.push(record);
      let zIndex = listener.zIndex || 0;
      return (
        listener.get("zIndex", () => zIndex),
        listener.set("zIndex", (nextZIndex) => {
          ((zIndex = nextZIndex), sortListeners());
        }),
        listener._bindOnDestroy(() => removeListener(listener)),
        sortListeners(),
        input
      );
    }),
    (_this.removeListener = removeListener),
    _this.get("input", () => _input),
    _this.get("empty", () => 0 === _listeners.length));
});
