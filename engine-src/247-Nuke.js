Class(
  function Nuke(_stage, _params) {
    Inherit(this, Component);
    var _width,
      _height,
      _nukeMesh,
      _this = this,
      _finalTexture = { texture: Utils3D.getEmptyTexture() };
    (_params.renderer || console.error("Nuke :: Must define renderer"),
      (_this.stage = _stage),
      (_this.renderer = _params.renderer),
      (_this.camera = _params.camera),
      (_this.scene = _params.scene),
      (_this.rtt = _params.rtt),
      (_this.enabled = 0 != _params.enabled),
      (_this.passes = _params.passes || []),
      (_this.format = _params.format || Texture.RGBFormat),
      (_this.useDrawBuffers =
        !Utils.query("noDrawBuffers") &&
        !Nuke.NO_DRAWBUFFERS &&
        (void 0 !== _params.useDrawBuffers
          ? _params.useDrawBuffers
          : !(Renderer.type != Renderer.WEBGL2 && !window.Metal))));
    var _rttPing,
      _rttPong,
      _rttBuffer,
      _dpr = _params.dpr || 1,
      _drawBuffers = [],
      _enabledPasses = [],
      _multisample = _params.multisample || !1,
      _samplesAmount = _params.samplesAmount || 4;
    function resizeHandler() {
      var width = _this.stage.width * _dpr,
        height = _this.stage.height * _dpr;
      (_rttPing.setSize(width, height),
        _rttPong.setSize(width, height),
        _rttBuffer.setSize(width, height),
        Nuke.renameRT(_width, _height, width, height, !1, 1, _this.format, !1, _samplesAmount),
        Nuke.renameRT(_width, _height, width, height, !1, 2, _this.format, !1, _samplesAmount),
        Nuke.renameRT(
          _width,
          _height,
          width,
          height,
          _this.useDrawBuffers,
          -1,
          _this.format,
          _multisample,
          _samplesAmount,
        ),
        (_width = width),
        (_height = height));
    }
    ((_this.scene.nuke = _this),
      (function initDefaultPass() {
        if (Nuke.defaultPass) return;
        let upload = (Nuke.defaultPass = new BlitPass()).upload;
        Nuke.defaultPass.upload = function () {
          (upload.apply(this, arguments), (Nuke.defaultPass.uploaded = !0));
        };
      })(),
      (function initNuke() {
        let width = _this.stage.width * _dpr,
          height = _this.stage.height * _dpr;
        ((_rttPing = Nuke.getRT(width, height, !1, 1, _this.format, !1, _samplesAmount)),
          (_rttPong = Nuke.getRT(width, height, !1, 2, _this.format, !1, _samplesAmount)),
          (_rttBuffer = Nuke.getRT(
            width,
            height,
            _this.useDrawBuffers,
            -1,
            _this.format,
            _multisample,
            _samplesAmount,
          )),
          ((_nukeMesh = new Mesh(World.QUAD, null)).frustumCulled = !1),
          (_nukeMesh.noMatrices = !0),
          (_nukeMesh.transient = !0),
          (_width = width),
          (_height = height),
          _params.vrRT && ((_this.vrRT = !0), (_rttBuffer.vrRT = !0)));
      })(),
      (function addListeners() {
        _this.events.sub(Events.RESIZE, resizeHandler);
      })(),
      (_this.forceResize = resizeHandler),
      (_this.onBeforeShaderCompile = function (obj) {
        if (!obj) return;
        let shader = obj.shader;
        if (!(shader && shader.fragmentShader && _this.useDrawBuffers && _drawBuffers.length))
          return;
        if (shader.fragmentShader.includes("layout(location")) return;
        const WEBGL2 = Renderer.type == Renderer.WEBGL2;
        let matched = !1;
        if (
          (_drawBuffers.forEach((t, i) => {
            let name = t.fxLayer.getName(),
              keyExpr = WEBGL2
                ? new RegExp(`\\b${name}\\s*=`)
                : new RegExp(`\\bgl_FragData\\[${i + 1}\\]\\s*=`),
              defaultOutput = t.fxLayer.defaultOutputColor || "vec4(0.0)";
            if (
              ("Color" === defaultOutput && (defaultOutput = "tmpFragColor"),
              !keyExpr.test(shader.fragmentShader) && _this.useDrawBuffers)
            ) {
              let fs = shader.fragmentShader;
              if (!fs.includes(`#drawbuffer ${name} gl_FragColor`)) {
                let idx = fs.lastIndexOf("}");
                ((fs =
                  fs.slice(0, idx) +
                  `#drawbuffer ${name} gl_FragColor = ${defaultOutput};\n` +
                  fs.slice(idx)),
                  (shader.fragmentShader = fs));
              }
              (t.fxLayer.add(obj), (matched = !0));
            }
          }),
          !(WEBGL2 ? /\bColor\s*=/ : /\bgl_FragData\[0\]\s*=/).test(shader.fragmentShader))
        ) {
          let fs = shader.fragmentShader;
          if (!fs.includes("layout(location=0) out vec4 reflectionsData")) {
            (WEBGL2 || (fs = "#extension GL_EXT_draw_buffers : require\n" + fs),
              (fs = fs.split("void main() {")),
              (fs = fs[0] + "void main() {\nvec4 tmpFragColor;\n" + fs[1]),
              (fs = fs.replace(/gl_FragColor/g, "tmpFragColor")));
            let idx = fs.lastIndexOf("}");
            fs = matched
              ? WEBGL2
                ? fs.slice(0, idx) + "Color = tmpFragColor;\n" + fs.slice(idx)
                : fs.slice(0, idx) + "gl_FragData[0] = tmpFragColor;\n" + fs.slice(idx)
              : fs.slice(0, idx) +
                "#drawbuffer Color gl_FragColor = tmpFragColor;\n" +
                fs.slice(idx);
          }
          shader.fragmentShader = fs;
        }
        shader.onBeforePrecompilePromise.resolve();
      }),
      (_this.add = function (pass, index) {
        "number" != typeof index ? _this.passes.push(pass) : _this.passes.splice(index, 0, pass);
      }),
      (_this.remove = function (pass) {
        "number" == typeof pass ? _this.passes.splice(pass) : _this.passes.remove(pass);
      }),
      (_this.render = function (directCallback) {
        if (_this.paused) return;
        (RenderStats.update("Nuke"),
          RenderManager.fire(_this),
          _this.events.fire(Nuke.RENDER, _this, !0),
          _this.onBeforeRender && _this.onBeforeRender());
        let count = _this.passes.length;
        _enabledPasses.length = 0;
        for (let i = 0; i < count; i++) {
          let pass = _this.passes[i];
          pass.disabled || _enabledPasses.push(pass);
        }
        if (
          (_this.enabled &&
            0 === _enabledPasses.length &&
            !_this.rtt &&
            (_dpr !== Device.pixelRatio || _multisample) &&
            Nuke.defaultPass &&
            _enabledPasses.push(Nuke.defaultPass),
          _this.enabled &&
            0 === _enabledPasses.length &&
            _this.useDrawBuffers &&
            _drawBuffers.length &&
            Nuke.defaultPass &&
            _enabledPasses.push(Nuke.defaultPass),
          !_this.enabled || !_enabledPasses.length)
        ) {
          let autoClear = _this.renderer.autoClear;
          return (
            0 == _this.autoClear && (_this.renderer.autoClear = !1),
            _this.renderer.render(_this.scene, _this.camera, _this.rtt, null, directCallback),
            _this.onBeforeProcess && _this.onBeforeProcess(),
            _this.events.fire(Nuke.BEFORE_PASSES, _this, !0),
            _this.events.fire(Nuke.BEFORE_POST_RENDER, _this, !0),
            _this.postRender && _this.postRender(),
            _this.events.fire(Nuke.POST_RENDER, _this, !0),
            void (
              0 == _this.autoClear &&
              ((_this.renderer.autoClear = autoClear), _this.renderer.clearColor())
            )
          );
        }
        (RenderStats.update("NukePass", _enabledPasses.length),
          (_this.hasRendered = !0),
          _this.onBeforeProcess && _this.onBeforeProcess());
        let autoClear = _this.renderer.autoClear;
        (0 == _this.autoClear && (_this.renderer.autoClear = !1),
          _this.parent.scissor && (_rttBuffer.scissor = _this.parent.scissor),
          _this.preventNewRender || _this.renderer.render(_this.scene, _this.camera, _rttBuffer),
          0 == _this.autoClear && (_this.renderer.autoClear = autoClear),
          _this.onBeforePasses && _this.onBeforePasses(_rttBuffer));
        let pingPong = !0,
          skipMultisample = _this.rtt && _this.rtt.multisample;
        (skipMultisample && (_this.rtt.multisample = !1),
          (count = _enabledPasses.length),
          _this.events.fire(Nuke.BEFORE_PASSES, _this, !0));
        for (var i = 0; i < count; i++) {
          let shader = _enabledPasses[i].pass,
            inTexture =
              0 === i ? _rttBuffer.texture : pingPong ? _rttPing.texture : _rttPong.texture,
            outTexture = pingPong ? _rttPong : _rttPing;
          (i === count - 1 && (outTexture = _this.rtt),
            (_nukeMesh.shader = shader),
            (_nukeMesh.shader.depthTest = !1),
            (_nukeMesh.shader.depthWrite = !1),
            (_nukeMesh.shader.uniforms.tDiffuse.value = inTexture),
            _this.parent.scissor && (outTexture.scissor = _this.parent.scissor),
            _this.renderer.renderSingle(
              _nukeMesh,
              _this.camera || World.CAMERA,
              outTexture,
              i === count - 1 ? directCallback : null,
            ),
            _enabledPasses[i]?.onRenderCallBack?.(),
            (pingPong = !pingPong),
            outTexture && (_finalTexture.texture = outTexture.texture));
        }
        (skipMultisample && (_this.rtt.multisample = !0),
          _this.events.fire(Nuke.BEFORE_POST_RENDER, _this, !0),
          _this.postRender && _this.postRender(),
          _this.events.fire(Nuke.POST_RENDER, _this, !0),
          0 == _this.autoClear && _this.renderer.clearColor(_rttBuffer));
      }),
      (_this.setSize = function (width, height) {
        (width == _width && height == _height) ||
          ((_width = width),
          (_height = height),
          resizeHandler(),
          _this.events.unsub(Events.RESIZE, resizeHandler));
      }),
      (_this.attachDrawBuffer = function (texture) {
        if (
          (_this.hasRendered &&
            console.warn(
              "Attempt to attach draw buffer after first render! Create FXLayer instance before first render.",
            ),
          _drawBuffers.push(texture),
          _rttBuffer && _rttBuffer.attachments)
        ) {
          _rttBuffer.attachments = [
            _this.rtt && _this.rtt.attachments
              ? _this.rtt.attachments[0]
              : _rttBuffer.attachments[0],
          ];
          for (let i = 0; i < _drawBuffers.length; i++)
            (_rttBuffer.attachments.push(_drawBuffers[i]),
              _this.rtt && _this.rtt.attachments && _this.rtt.attachments.push(_drawBuffers[i]));
        }
        return _drawBuffers.length;
      }),
      (_this.upload = function () {
        (_this.passes.length &&
          _this.enabled &&
          (_rttPing.upload(), _rttPong.upload(), _rttBuffer.upload()),
          _rttBuffer.depth && _rttBuffer.depth.upload(),
          _this.rtt && _this.rtt.upload());
      }),
      _this.set("dpr", function (v) {
        ((_dpr = v), resizeHandler());
      }),
      _this.get("dpr", function () {
        return _dpr;
      }),
      _this.get("output", function () {
        return _nukeMesh.shader && _nukeMesh.shader.uniforms
          ? _nukeMesh.shader.uniforms.tDiffuse.value
          : null;
      }),
      _this.get("finalTexture", (_) => _finalTexture),
      _this.get("rttBuffer", function () {
        return _rttBuffer;
      }),
      this.set("rttBuffer", function (v) {
        _rttBuffer = v;
      }),
      _this.get("prevFrameRT", function () {
        return _rttBuffer && _rttBuffer.texture ? _rttBuffer.texture : null;
      }),
      _this.get("nukeScene", function () {
        return _nukeScene;
      }),
      _this.get("ping", function () {
        return _rttPing;
      }),
      _this.get("pong", function () {
        return _rttPong;
      }),
      _this.get("attachments", function () {
        return _rttBuffer.attachments ? _rttBuffer.attachments.length : 0;
      }),
      (_this.disable = function () {
        ((_this.enabled = !1),
          _this.passes.forEach((pass) => {
            pass.enabled = !1;
          }));
      }),
      (this.onDestroy = function () {
        ((!_this.useDrawBuffers && Nuke.recyclePingPong) || _rttBuffer.destroy(),
          Nuke.recyclePingPong || (_rttPing.destroy(), _rttPong.destroy()));
      }),
      (this.clearMemory = function () {
        (_rttBuffer.destroy(), _rttPing.destroy(), _rttPong.destroy());
      }));
  },
  function () {
    ((Nuke.RENDER = "nuke_render"),
      (Nuke.BEFORE_PASSES = "nuke_before_passes"),
      (Nuke.BEFORE_POST_RENDER = "nuke_before_post_render"),
      (Nuke.POST_RENDER = "nuke_post_render"));
    var _rts = {};
    ((Nuke.getRT = function (width, height, multi, index, format, multisample, samplesAmount) {
      let rt,
        exists =
          _rts[`${width}_${height}_${multi}_${index}_${format}_${multisample}_${samplesAmount}`];
      return (
        exists ||
        ((rt = multi
          ? Utils3D.createMultiRT(width, height, void 0, format, multisample, samplesAmount)
          : Utils3D.createRT(width, height, void 0, format, multisample, samplesAmount)),
        Nuke.recyclePingPong &&
          !multi &&
          (_rts[`${width}_${height}_${multi}_${index}_${format}_${multisample}_${samplesAmount}`] =
            rt),
        rt)
      );
    }),
      (Nuke.renameRT = function (
        prevWidth,
        prevHeight,
        width,
        height,
        multi,
        index,
        format,
        multisample,
        samplesAmount,
      ) {
        _rts[`${width}_${height}_${multi}_${index}_${format}_${multisample}_${samplesAmount}`] =
          _rts[
            `${prevWidth}_${prevHeight}_${multi}_${index}_${format}_${multisample}_${samplesAmount}`
          ];
      }));
  },
);
