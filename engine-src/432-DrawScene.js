Class(function DrawScene(_vs, _fs, _uniforms) {
  Inherit(this, Component);
  const _this = this,
    _scene = new Scene();
  (!(function () {
    _uniforms.depthWrite = !1;
    let shader = _this.initClass(Shader, _vs, _fs, _uniforms),
      mesh = new Mesh(World.QUAD, shader);
    ((shader.depthWrite = !1),
      (mesh.noMatrices = !0),
      _scene.add(mesh),
      (_this.uniforms = shader.uniforms));
  })(),
    (this.render = function (rt) {
      ((World.RENDERER.autoClear = !1),
        World.RENDERER.renderSingle(_scene.children[0], World.CAMERA, rt),
        (World.RENDERER.autoClear = !0));
    }));
});
