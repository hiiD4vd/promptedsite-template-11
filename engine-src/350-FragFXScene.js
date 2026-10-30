Class(function FragFXScene(_name) {
  Inherit(this, FXScene);
  const _this = this;
  function initLayout(name) {
    if (_this.layout)
      return Hydra.LOCAL
        ? console.warn(`FragFXScene: initLayout: layout ${_name} already initialized`)
        : null;
    ((_name = name),
      (_this.layout = _this.initClass(SceneLayout, _name)),
      _this.scene.add(_this.layout.group),
      (_this.cameraController = Camera.instance().createLocal()));
  }
  (_name && initLayout(_name),
    (this.group = new Group()),
    (this._initFXScene = function (nuke, rtPool, options) {
      for (let key in options) options[key] || delete options[key];
      if (RenderManager.type == RenderManager.WEBVR && !options.vrMode)
        return (
          (_this.onFXSceneVisibility = (bool) => {
            if (bool) {
              _this.group.visible = !0;
              let recurse = (obj) => {
                if (obj.classRef?.layers)
                  for (let key in obj.classRef.layers) {
                    let layer = obj.classRef.layers[key];
                    !0 === layer.visible && ((layer.visible = !1), (layer.visible = !0));
                  }
                obj.children.forEach(recurse);
              };
              _this.group.children.forEach(recurse);
            }
          }),
          void _this.vrWorldMode()
        );
      (options.screenQuad &&
        defer((_) => {
          let shader = _this.initClass(Shader, "ScreenQuad", {
              customCompile: Utils.uuid(),
              depthWrite: !1,
              tMap: { value: _this.rt },
            }),
            mesh = new Mesh(World.QUAD, shader);
          ((mesh.frustumCulled = !1), (mesh.renderOrder = -1), _this.group.add(mesh));
        }),
        rtPool ? _this.create(nuke, rtPool(), options) : _this.create(nuke, options),
        _this._initMultiscreenFXScene?.(),
        _this.cameraController &&
          !Utils.query("orbit") &&
          _this.useCamera(_this.cameraController.worldCamera));
    }),
    (this.initLayout = function (name) {
      initLayout(name);
    }),
    (this.uploadSync = function () {
      return Initializer3D.uploadAll(_this.layout);
    }));
});
