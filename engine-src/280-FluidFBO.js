Class(function FluidFBO(_width, _height, _filter) {
  Inherit(this, Component);
  const _this = this,
    type = Device.mobile || Renderer.type != Renderer.WEBGL1 ? Texture.HALF_FLOAT : Texture.FLOAT;
  var _fbo1 = new RenderTarget(_width, _height, {
      minFilter: _filter,
      magFilter: _filter,
      format: Texture.RGBAFormat,
      type: type,
    }),
    _fbo2 = new RenderTarget(_width, _height, {
      minFilter: _filter,
      magFilter: _filter,
      format: Texture.RGBAFormat,
      type: type,
    });
  ((this.fbo = _fbo1),
    (this.uniform = { value: _fbo1 }),
    (_fbo1.disableDepth = !0),
    (_fbo2.disableDepth = !0),
    (_fbo1.generateMipmaps = !1),
    (_fbo2.generateMipmaps = !1),
    (_fbo1.texture.forcePersist = !0),
    (_fbo2.texture.forcePersist = !0),
    (this.swap = function () {
      let temp = _fbo1;
      ((_fbo1 = _fbo2), (_fbo2 = temp), (_this.uniform.value = _fbo1));
    }),
    this.get("read", (_) => _fbo1),
    this.get("write", (_) => _fbo2));
});
