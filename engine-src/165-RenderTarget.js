class RenderTarget {
  constructor(width, height, options = {}) {
    ((this.width = width),
      (this.height = height),
      (this.options = options),
      (this.viewport = new Vector2(0, 0)),
      void 0 === options.minFilter && (options.minFilter = Texture.LINEAR),
      (this.stencil = "boolean" == typeof options.stencil && options.stencil),
      options.sharedRenderbuffer &&
        ((this.sharedRenderbuffer = !0),
        (this.clearDepth = "boolean" != typeof options.clearDepth || options.clearDepth),
        (this._depthBuffer = options.sharedRenderbuffer.rt._depthBuffer)),
      (this.texture = new Texture(null)),
      (this.texture.generateMipmaps = options.generateMipmaps),
      (this.texture.rt = this),
      (this.texture.width = width),
      (this.texture.height = height),
      (this.texture.minFilter = options.minFilter || Texture.LINEAR),
      (this.texture.magFilter = options.magFilter || Texture.LINEAR),
      (this.texture.wrapS = options.wrapS || Texture.CLAMP_TO_EDGE),
      (this.texture.wrapT = options.wrapT || Texture.CLAMP_TO_EDGE),
      (this.texture.format = options.format || Texture.RGBFormat),
      options.type && (this.texture.type = options.type),
      options.multisample &&
        (Renderer.type ? Renderer.type == Renderer.WEBGL2 : Device.graphics.webgl.webgl2) &&
        ((options.multisample = !1),
        (this.multisample = !0),
        (this._rtMultisample = new RenderTarget(width, height, options)),
        (this._rtMultisample.internalMultisample = !0),
        (this._rtMultisample.parent = this),
        (this._rtMultisample._samplesAmount =
          void 0 === options.samplesAmount ? 100 : options.samplesAmount)),
      (this.isRT = !0));
  }
  setSize(width, height) {
    ((this.width = width),
      (this.height = height),
      (this.texture.width = width),
      (this.texture.height = height),
      this.viewport.set(0, 0),
      RenderTarget.renderer.resize(this),
      !this.multisample ||
        (this._rtMultisample.width === width && this._rtMultisample.height === height) ||
        (this._rtMultisample.destroy(),
        (this._rtMultisample = new RenderTarget(width, height, this.options)),
        (this._rtMultisample.internalMultisample = !0),
        (this._rtMultisample.parent = this),
        (this._rtMultisample._samplesAmount =
          void 0 === this.options.samplesAmount ? 100 : this.options.samplesAmount)));
  }
  clone() {
    return new RenderTarget(this.width, this.height, { ...this.options }).copy(this);
  }
  copy(source) {
    ((this.width = source.width), (this.height = source.height));
    let options = { ...this.options };
    return (
      (this.options = options),
      this.viewport.copy(source.viewport),
      (this.stencil = source.stencil),
      source.sharedRenderbuffer &&
        ((this.sharedRenderbuffer = !0),
        (this.clearDepth = source.clearDepth),
        (this._depthBuffer = source._depthBuffer)),
      (this.texture = source.texture.clone()),
      source.multisample &&
        ((options.multisample = !1),
        (this.multisample = !0),
        (this._rtMultisample = new RenderTarget(this.width, this.height, options)),
        (this._rtMultisample.internalMultisample = !0),
        (this._rtMultisample.parent = this),
        (this._rtMultisample._samplesAmount = source._rtMultisample._samplesAmount)),
      this
    );
  }
  createDepthTexture() {
    return (
      (this.depth = new Texture(null)),
      (this.depth.generateMipmaps = !1),
      (this.depth.minFilter = Texture.NEAREST),
      (this.depth.magFilter = Texture.NEAREST),
      (this.depth.wrapS = Texture.CLAMP_TO_EDGE),
      (this.depth.wrapT = Texture.CLAMP_TO_EDGE),
      this._gl && RenderTarget.renderer.destroy(this),
      this.depth
    );
  }
  destroy() {
    RenderTarget.renderer.destroy(this);
  }
  upload() {
    (this._gl || RenderTarget.renderer.upload(this),
      this._rtMultisample && this._rtMultisample.upload());
  }
}
