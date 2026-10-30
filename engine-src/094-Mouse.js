Class(function Mouse() {
  Inherit(this, Events);
  const _this = this;
  ((this.x = 0),
    (this.y = 0),
    (this.normal = { x: 0, y: 0 }),
    (this.tilt = { x: 0, y: 0 }),
    (this.inverseNormal = { x: 0, y: 0 }),
    (this.resetOnRelease = !1));
  const _offset = { x: 0, y: 0 };
  function init() {
    ((_this.x = Stage.width / 2),
      (_this.y = Stage.height / 2),
      defer((_) => {
        _this.resetOnRelease &&
          Device.mobile &&
          ((_this.x = Stage.width / 2), (_this.y = Stage.height / 2));
      }),
      (_this.input = new Interaction(__window)),
      (_this.input.unlocked = !0),
      _this.events.sub(_this.input, Interaction.START, start),
      _this.events.sub(_this.input, Interaction.MOVE, update),
      _this.events.sub(_this.input, Interaction.END, end),
      (_this.hold = _this.input.hold),
      (_this.last = _this.input.last),
      (_this.delta = _this.input.delta),
      (_this.move = _this.input.move),
      (_this.velocity = _this.input.velocity),
      defer(() => {
        (_this.events.sub(Events.RESIZE, resize), resize());
      }));
  }
  function start(e) {
    ((_this.down = !0), update(e));
  }
  function update(e) {
    (_this.force && (e = _this.force),
      (_this.x = e.x),
      (_this.y = e.y),
      Stage.width &&
        Stage.height &&
        ((_this.normal.x = e.x / Stage.width - _offset.x),
        (_this.normal.y = e.y / Stage.height - _offset.y),
        (_this.tilt.x = 2 * _this.normal.x - 1),
        (_this.tilt.y = 1 - 2 * _this.normal.y),
        (_this.inverseNormal.x = _this.normal.x),
        (_this.inverseNormal.y = 1 - _this.normal.y)));
  }
  function end(e) {
    ((_this.down = !1),
      Device.mobile && _this.resetOnRelease && update({ x: Stage.width / 2, y: Stage.height / 2 }));
  }
  function resize() {
    (Stage.css("top") && (_offset.y = Stage.css("top") / Stage.height),
      Stage.css("left") && (_offset.x = Stage.css("left") / Stage.width));
  }
  (Hydra.ready(init), (_this.update = update));
}, "Static");
