Class(function OrbitTargetHelper() {
  Inherit(this, Object3D);
  const _this = this;
  var _velocity = new (function VelocityTracker(_vector) {
    var Vector = "number" == typeof _vector.z ? Vector3 : Vector2,
      _velocity = new Vector(),
      _last = new Vector();
    ((this.value = _velocity),
      (this.update = function loop(time, delta) {
        (_velocity.subVectors(_vector, _last).divideScalar((delta || Render.DELTA) / (1e3 / 60)),
          _last.copy(_vector));
      }));
  })(_this.group.position);
  function set() {
    (_this.flag("needsReset", !1),
      Playground.instance().orbitControls.target.copy(_this.group.position),
      _this.events.unsub(Mouse.input, Interaction.END, set));
  }
  !(async function () {
    Global.PLAYGROUND &&
      (await defer(),
      Playground.instance().orbitControls.target.copy(_this.group.position),
      _this.startRender((_) => {
        (_velocity.update(),
          _velocity.value.length() > 0 &&
            (_this.flag("needsReset", !0), _this.events.sub(Mouse.input, Interaction.END, set)));
      }));
  })();
});
