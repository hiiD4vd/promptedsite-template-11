class VAO {
  constructor(gl) {
    ((this.gl = gl),
      (this.WEBGL2 = Renderer.type == Renderer.WEBGL2),
      this.WEBGL2
        ? (this.vao = gl.createVertexArray())
        : (this.vao = Renderer.extensions.VAO.createVertexArrayOES()));
  }
  bind() {
    const gl = this.gl;
    this.WEBGL2
      ? gl.bindVertexArray(this.vao)
      : Renderer.extensions.VAO.bindVertexArrayOES(this.vao);
  }
  unbind() {
    const gl = this.gl;
    this.WEBGL2 ? gl.bindVertexArray(null) : Renderer.extensions.VAO.bindVertexArrayOES(null);
  }
  destroy() {
    const gl = this.gl;
    (this.WEBGL2
      ? gl.deleteVertexArray(this.vao)
      : Renderer.extensions.VAO.deleteVertexArrayOES(this.vao),
      (this.vao = null));
  }
}
