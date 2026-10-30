Class(function GLUI() {
  Inherit(this, Component);
  const _this = this,
    hasMetal = !!window.Metal,
    hasAuraAR = !!window.AURA_AR;
  function loop() {
    hasMetal ||
      (hasAuraAR && AURA_AR.active && ((World.NUKE.postRender = null), (AURA_AR.postRender = loop)),
      _this.Scene && _this.Scene.render(),
      _this.Stage && _this.Stage.render());
  }
  ((window.$gl = window.glObject =
    function (width, height, map, customCompile) {
      return new GLUIObject(width, height, map, customCompile);
    }),
    (window.$glText = window.glText =
      function (text, fontName, fontSize, options, customCompile) {
        return new GLUIText(text, fontName, fontSize, options, customCompile);
      }),
    (this.init = async function (is2D, is3D) {
      _this.initialized ||
        (void 0 === is2D && ((is2D = !0), (is3D = !0)),
        await AssetLoader.waitForLib("zUtils3D"),
        is2D && (_this.Stage = new GLUIStage()),
        is3D && ((_this.Scene = new GLUIStage3D()), (_this.Scene.interaction.input = Mouse)),
        _this.wait(World, "NUKE", (_) => {
          ((_this.initialized = !0),
            _this.Scene && (World.NUKE.onBeforeRender = _this.Scene.mark),
            (World.NUKE.postRender = loop));
        }));
    }),
    (this.clear = function () {
      (_this.Stage.clear(), _this.Scene.clear());
    }),
    (this.ready = function () {
      return _this.wait(_this, "initialized");
    }),
    (this.renderDirect = function (render) {
      (_this.Scene && _this.Scene.renderDirect(render),
        _this.Stage && _this.Stage.renderDirect(render));
    }));
}, "static");
