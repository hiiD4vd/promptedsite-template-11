class Texture3D extends Texture {
  constructor(image, width, height, depth, format, type, filter = null) {
    (super(),
      (this.format = format || Texture.RGBAFormat),
      (this.width = width),
      (this.height = height),
      (this.depth = depth),
      (this.image = image),
      (this.minFilter = this.magFilter = filter || Texture.LINEAR),
      (this.wrapS = this.wrapT = this.wrapR = Texture.CLAMP_TO_EDGE),
      (this.generateMipmaps = !1),
      (this.type = type || Texture.FLOAT),
      (this.isTexture3D = !0));
  }
}
