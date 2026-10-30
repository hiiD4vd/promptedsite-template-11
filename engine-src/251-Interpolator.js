Class(function Interpolator(obj, key, speed) {
  Inherit(this, Component);
  const _this = this;
  ((this.value = obj[key]),
    _this.startRender((_) => {
      obj[key] = Math.lerp(_this.value, obj[key], speed);
    }));
});
