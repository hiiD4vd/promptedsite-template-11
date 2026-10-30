Class(function TestDraw() {
  Inherit(this, Object3D);
  const _this = this;
  let _draw;
  function loop() {
    _draw.position = Mouse;
  }
  !(async function () {
    (await defer(), (_draw = _this.initClass(Draw)), _this.startRender(loop));
    const shader = _this.initClass(Shader, "ScreenQuad", { tMap: { value: _draw.rt.read } }),
      mesh = new Mesh(World.QUAD, shader);
    ((mesh.frustumCulled = !1),
      FBOHelper && Utils.query("fbohelper")
        ? FBOHelper.instance().attach(_draw.rt.fbo, { width: 500, height: 500, name: "TestDraw" })
        : World.SCENE.add(mesh));
  })();
});
