class MultiRenderTarget extends RenderTarget {
  constructor(width, height, options = {}) {
    (super(width, height, options), (this.multi = !0), (this.attachments = [this.texture]));
  }
}
