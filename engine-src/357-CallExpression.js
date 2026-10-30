FX.Class(function GaussianBlurPass(_size, _radius = 1, _horizontal = !0, _options = {}) {
  Inherit(this, NukePass);
  const _this = this;
  ((_this.uniforms = {
    uDirection: {
      value: new Vector2(_horizontal ? _radius : 0, _horizontal ? 0 : _radius),
      ignoreUIL: !0,
    },
    uSize: { value: _size, ignoreUIL: !0 },
    ..._options.uniforms,
  }),
    (_this.UILPrefix = _options.fsName || "GaussianBlurPass"),
    _this.init(_this.UILPrefix),
    Object.defineProperties(_this, {
      radius: {
        get: () => _radius,
        set(radius) {
          ((_radius = radius),
            _this.uniforms &&
              _this.uniforms.uDirection.value.set(
                _horizontal ? _radius : 0,
                _horizontal ? 0 : _radius,
              ));
        },
      },
      horizontal: {
        get: () => _horizontal,
        set(horizontal) {
          ((_horizontal = horizontal),
            _this.uniforms &&
              _this.uniforms.uDirection.value.set(
                _horizontal ? _radius : 0,
                _horizontal ? 0 : _radius,
              ));
        },
      },
    }));
});
