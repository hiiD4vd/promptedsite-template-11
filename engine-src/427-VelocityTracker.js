Class(function VelocityTracker(_vector) {
  Inherit(this, Component);
  var _this = this,
    Vector = "number" == typeof _vector.z ? Vector3 : Vector2,
    _vec = new Vector(),
    _velocity = new Vector(),
    _last = new Vector();
  function loop(time, delta) {
    (_vec.subVectors(_vector, _last).divideScalar(Render.DELTA / (1e3 / Render.REFRESH_RATE)),
      _last.copy(_vector),
      _vec.length() > 0 && _velocity.copy(_vec));
  }
  ((this.value = _velocity),
    (this.start = function () {
      _this.startRender(loop);
    }),
    (this.onDestroy = this.stop =
      function () {
        _this.stopRender(loop);
      }),
    (this.copy = function () {
      _last.copy(_vector);
    }),
    (this.update = loop));
});
