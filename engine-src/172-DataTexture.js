class DataTexture extends Texture {
  constructor(data, width, height, format, type, filter = null) {
    (super(),
      format && (this.format = format),
      (this.width = width),
      (this.height = height),
      (this.data = data),
      (this.minFilter = this.magFilter = filter || Texture.NEAREST),
      (this.generateMipmaps = !1),
      (this.type = type || Texture.FLOAT),
      (this.isDataTexture = !0),
      (this.destroyDataAfterUpload = !1));
  }
  uploadAsync() {
    return Texture.renderer.uploadAsync(this);
  }
}
