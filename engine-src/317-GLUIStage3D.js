Class(function GLUIStage3D() {
  Inherit(this, Object3D);
  const _this = this;
  var _camera,
    _externalRenders = [],
    _scene = new Scene(),
    _list = new LinkedList();
  ((this.alpha = 1),
    (this.interaction = new GLUIStageInteraction3D()),
    (this.add = function (obj, parent) {
      ((obj.parent = _this),
        (obj._gluiParent = parent),
        obj.anchor && (obj.anchor._gluiParent = parent),
        obj._3d || obj.enable3D(),
        obj.deferRender());
    }),
    (this.clear = function () {
      (_scene.traverse((obj) => {
        obj.geometry && obj.shader && obj.destroy();
      }),
        (_scene.children.length = _scene.childrenLength = 0));
    }),
    (this.addDeferred = function (obj) {
      (_list.push(obj), _scene.add(obj.group || obj.mesh));
    }),
    (this.remove = function (obj) {
      (_scene.remove(obj.group || obj.mesh), _list.remove(obj));
    }),
    (this.disableAutoSort = function () {
      _scene.disableAutoSort = !0;
    }),
    (this.renderToRT = function (scene, camera) {
      ((camera = camera.camera || camera),
        scene.traverse((mesh) => {
          let obj = mesh.glui || mesh;
          obj &&
            obj.anchor &&
            obj.anchor.determineVisible() &&
            Utils3D.decompose(obj.anchor, obj.group || obj);
        }),
        (scene._textRenderCamera = camera),
        _externalRenders.push(scene));
    }),
    (this.renderToRT2 = function (scene, rt, camera) {
      let clearAlpha;
      rt.fxscene &&
        rt.fxscene.clearAlpha > -1 &&
        ((clearAlpha = World.RENDERER.getClearAlpha()), World.RENDERER.setClearAlpha(0));
      let autoClear = World.RENDERER.autoClear;
      ((World.RENDERER.autoClear = !1),
        World.RENDERER.render(scene, camera, rt),
        (World.RENDERER.autoClear = autoClear),
        clearAlpha && World.RENDERER.setClearAlpha(clearAlpha));
    }),
    (this.render = function loop() {
      if (!window.Metal) {
        if (_list.length) {
          let obj = _list.start();
          for (; obj;)
            (obj._marked && ((obj._marked = !1), Utils3D.decompose(obj.anchor, obj.group)),
              (obj = _list.next()));
          let clear = World.RENDERER.autoClear;
          (Renderer.context.clear(Renderer.context.DEPTH_BUFFER_BIT),
            (World.RENDERER.autoClear = !1),
            World.RENDERER.render(_scene, _camera || World.CAMERA),
            (World.RENDERER.autoClear = clear));
        }
        if (_externalRenders.length)
          for (; _externalRenders.length;) {
            let scene = _externalRenders.shift(),
              camera = scene._textRenderCamera,
              clear = World.RENDERER.autoClear;
            (Renderer.context.clear(Renderer.context.DEPTH_BUFFER_BIT),
              (World.RENDERER.autoClear = !1),
              World.RENDERER.render(scene, camera),
              (World.RENDERER.autoClear = clear));
          }
      }
    }),
    (this.mark = function mark() {
      let obj = _list.start();
      for (; obj;)
        (obj.anchor._parent && (obj.group.visible = obj.anchor.determineVisible()),
          obj.mesh && obj.mesh.determineVisible() && obj.anchor._parent && (obj._marked = !0),
          (obj = _list.next()));
    }),
    (this.renderDirect = function (callback) {
      if (_list.length) {
        let obj = _list.start();
        for (; obj;)
          (obj._marked && ((obj._marked = !1), Utils3D.decompose(obj.anchor, obj.group)),
            (obj = _list.next()));
        (_scene.traverse((obj) => {
          obj.shader && (obj.shader.depthTest = !1);
        }),
          callback(_scene, _camera || World.CAMERA));
      }
    }),
    this.set("camera", (c) => {
      _camera = c.camera || c;
    }));
});
