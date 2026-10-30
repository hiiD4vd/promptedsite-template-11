Class(function AntimatterAttribute(_data, _components) {
  Inherit(this, Component);
  var _this = this,
    _size = Math.sqrt(_data.length / (_components || 3));
  ((this.size = _size),
    (this.count = _size * _size),
    (this.buffer = _data),
    (this.texture = new DataTexture(
      _data,
      _size,
      _size,
      4 == _components ? Texture.RGBAFormat : Texture.RGBFormat,
      Texture.FLOAT,
    )),
    this.set("needsUpdate", function () {
      _this.texture && (_this.texture.needsUpdate = !0);
    }),
    (this.bufferData = function (data, components) {
      ((_this.buffer = data),
        components != _components
          ? (_this.texture.destroy(),
            (_this.texture = new DataTexture(
              data,
              _size,
              _size,
              4 == components ? Texture.RGBAFormat : Texture.RGBFormat,
              Texture.FLOAT,
            )))
          : ((_this.texture.data = data), (_this.texture.needsUpdate = !0)),
        (_components = components),
        (_data = data));
    }),
    (this.upload = function () {
      _this.texture.upload();
    }),
    (this.uploadAsync = function () {
      return (
        (_this.texture.distributeTextureData = !0),
        _this.texture.upload(),
        _this.texture.uploadAsync()
      );
    }),
    (this.clone = function () {
      return new AntimatterAttribute(_data, _components);
    }),
    (this.onDestroy = function () {
      _this.texture && _this.texture.destroy && _this.texture.destroy();
    }));
});
