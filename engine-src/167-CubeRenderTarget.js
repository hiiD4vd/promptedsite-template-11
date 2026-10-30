class CubeRenderTarget extends RenderTarget {
  constructor(width, height, options = {}) {
    (super(width, height, options), (this.activeFace = 0), (this.cube = !0));
  }
}
