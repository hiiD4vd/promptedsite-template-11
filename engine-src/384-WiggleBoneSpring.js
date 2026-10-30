function WiggleBoneSpring(__target, __options) {
  Inherit(this, Object3D);
  const _this = this,
    options = { stiffness: 0.01, damping: 0.1, ...__options },
    goalPosition = new Vector3(),
    helper = new Base3D();
  let velocity = new Vector3(),
    acceleration = new Vector3(),
    force = new Vector3();
  function step(dt) {
    (_this.target._parent.updateMatrixWorld(!0, !1),
      _this.targetHelper.position.copy(_this.originPosition),
      _this.target._parent.localToWorld(_this.targetHelper.position),
      goalPosition.copy(_this.oldBoneWorldPosition),
      force.subVectors(_this.targetHelper.position, _this.oldBoneWorldPosition),
      force.multiplyScalar(_this.options.stiffness));
    const dampingForce = velocity.clone().multiplyScalar(_this.options.damping);
    (force.sub(dampingForce),
      acceleration.copy(force),
      velocity.add(acceleration.multiplyScalar(dt)),
      goalPosition.add(velocity.clone().multiplyScalar(dt)),
      _this.target.position.copy(goalPosition),
      _this.target._parent.worldToLocal(_this.target.position),
      _this.oldBoneWorldPosition.copy(goalPosition));
    const unit = _this.target.position.clone();
    (unit.normalize(),
      _this.target.up.set(0, 1, 0),
      _this.target.quaternion.setFromUnitVectors(_this.target.up, unit));
    let l = Math.min(_this.target.position.length(), 0);
    (_this.target.position.set(0, l, 0), _this.target.updateMatrix());
  }
  (!(function () {
    ((_this.target = __target), (_this.options = options));
    const wrapper = _this.target.clone();
    (_this.target._parent.add(wrapper),
      wrapper.add(_this.target),
      (_this.targetHelper = helper.clone()),
      (_this.originPosition = _this.target.position.clone()),
      (_this.oldBoneWorldPosition = new Vector3()),
      (_this.oldBoneWorldRotation = new Quaternion()),
      _this.target.getWorldPosition(_this.oldBoneWorldPosition),
      _this.target.getWorldQuaternion(_this.oldBoneWorldRotation));
  })(),
    (this.reset = function reset() {
      (_this.target.position.copy(_this.originPosition),
        _this.target.updateMatrixWorld(!0, !1),
        _this.target.getWorldPosition(_this.oldBoneWorldPosition),
        velocity.set(0, 0, 0));
    }),
    (this.update = function update(dt = null) {
      if (!dt)
        if (_this.ms) {
          const ms = performance.now();
          ((dt = ms - _this.ms), (dt /= 1e3), (_this.ms = ms));
        } else ((_this.ms = performance.now()), (dt = 0.016));
      let times = 1;
      (dt > 0.0085 && (times = 2), dt > 20 && (times = 25));
      for (let index = 0; index < times; index++) step(0.0085 * 100);
    }),
    (this.step = step));
}
