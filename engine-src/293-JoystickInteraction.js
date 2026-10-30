Class(function JoystickInteraction(_config = {}) {
  Inherit(this, Events);
  const _this = this;
  var _joystick, _hitObject;
  function loop(t, delta) {
    if (!_joystick) return;
    let e = { target: {} };
    Math.abs(_joystick.x) < 0.001 && Math.abs(_joystick.y) < 0.001
      ? ((e.x = _this.move.x),
        (e.y = _this.move.y),
        (_this.delta.x = 0),
        (_this.delta.y = 0),
        (_this.move.x = 0),
        (_this.move.y = 0),
        _this.isTouching && ((_this.isTouching = !1), _this.events.fire(Interaction.END, e, !0)))
      : _this.isTouching
        ? ((_this.delta.x = _joystick.x * delta),
          (_this.delta.y = _joystick.y * delta),
          (_this.move.x += _this.delta.x),
          (_this.move.y += _this.delta.y),
          (e.x = _this.move.x),
          (e.y = _this.move.y),
          (_this.velocity.x = Math.abs(_this.delta.x) / delta),
          (_this.velocity.y = Math.abs(_this.delta.y) / delta),
          _this.events.fire(Interaction.MOVE, e, !0),
          _this.events.fire(Interaction.DRAG, e, !0))
        : ((_this.isTouching = !0),
          (e.x = _this.move.x = 0),
          (e.y = _this.move.y = 0),
          (_this.delta.x = 0),
          (_this.delta.y = 0),
          _this.events.fire(Interaction.START, e, !0));
  }
  ((this.delta = new Vector2()),
    (this.move = new Vector2()),
    (_this.velocity = new Vector2()),
    (function () {
      if (Device.system.xr.vr) {
        if (
          (_config && _config.raycast
            ? ((_hitObject = _config), World.CAMERA)
            : _config && ((_hitObject = _config.hit), _config.hitCamera || World.CAMERA),
          !_hitObject)
        )
          throw "JoystickInteraction requires a Mesh for hit testing";
        (!(async function addHandlers() {
          (await VRInput.ready(),
            (_joystick = { x: 0, y: 0 }),
            VRInput.controllers.forEach((controller) =>
              _this.events.sub(controller, VRInput.JOYSTICK, (e) => {
                !(function handleJoystick(e, controller) {
                  !(function checkHit(controller) {
                    return _hitObject.interaction.checkObjectFromValues(
                      _hitObject,
                      controller.group.worldPos,
                      controller.pointer,
                      _config.hitCamera,
                    );
                  })(controller)
                    ? ((_joystick.x = 0), (_joystick.y = 0))
                    : ((_joystick.x = e.x), (_joystick.y = e.y));
                })(e, controller);
              }),
            ));
        })(),
          Render.start(loop));
      }
    })());
});
