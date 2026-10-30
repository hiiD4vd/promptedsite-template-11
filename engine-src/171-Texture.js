class Texture {
  constructor(img) {
    ((this.magFilter = Texture.LINEAR),
      (this.minFilter = Texture.LINEAR_MIPMAP),
      (this.format = Texture.RGBAFormat),
      (this.wrapS = this.wrapT = Texture.CLAMP_TO_EDGE),
      (this._image = img),
      (this.needsUpdate = !0),
      (this.generateMipmaps = !0),
      (this.anisotropy = 1),
      (this.type = Texture.UNSIGNED_BYTE),
      (this.isTexture = !0),
      img && img.onCreateTexture && img.onCreateTexture(this));
  }
  set image(img) {
    ((this._image = img), img && img.onCreateTexture && img.onCreateTexture(this));
  }
  get image() {
    return this._image;
  }
  upload() {
    this._gl || Texture.renderer.upload(this);
  }
  uploadAsync() {
    return this.isDataTexture || (this.type && this.type.includes("float")) || this.compressed
      ? Texture.renderer.uploadAsync(this)
      : this.upload();
  }
  destroy() {
    (Texture.renderer.destroy(this), (this._image = null));
  }
  clone() {
    let texture = new Texture(this.img);
    return (
      (texture.format = this.format),
      (texture.type = this.type),
      (texture.anisotropy = this.anisotropy),
      (texture.wrapS = this.wrapS),
      (texture.wrapT = this.wrapT),
      (texture.generateMipmaps = this.generateMipmaps),
      (texture.minFilter = this.minFilter),
      (texture.magFilter = this.magFilter),
      texture
    );
  }
}
