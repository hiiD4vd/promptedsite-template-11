Class(function Keyboard() {
  Inherit(this, Component);
  var _this = this;
  function addListeners() {
    (__window.keydown(keydown),
      __window.keyup(keyup),
      __window.keypress(keypress),
      window.addEventListener("focus", onFocus));
  }
  function keydown(e) {
    (_this.pressing.includes(e.key) || _this.pressing.push(e.key),
      _this.events.fire(_this.DOWN, e),
      2 == _this.pressing.length &&
        _this.pressing.includes("Meta") &&
        _this.pressing.includes("Shift") &&
        (_this.pressing.length = 0));
  }
  function keyup(e) {
    (_this.pressing.remove(e.key), _this.events.fire(_this.UP, e));
  }
  function keypress(e) {
    _this.events.fire(_this.PRESS, e);
  }
  function onFocus() {
    _this.pressing.length = 0;
  }
  ((this.pressing = []),
    (_this.DOWN = "keyboard_down"),
    (_this.PRESS = "keyboard_press"),
    (_this.UP = "keyboard_up"),
    Hydra.ready(addListeners));
}, "static");
