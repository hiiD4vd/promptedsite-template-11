Class(
  function AntimatterFBO() {
    var _this, _gpuGeom, _renderer, _size, _prevRT, _scene, _mesh, _camera, _copy, _geometry;
    Inherit(this, Component);
    var _output = { type: "t", value: null, ignoreUIL: !0 },
      _prevOutput = { type: "t", value: null, ignoreUIL: !0 };
    function copy(input, output) {
      World.RENDERER.blit(input, output) ||
        ((_copy.visible = !0),
        (_mesh.visible = !1),
        (_copy.shader.uniforms.tMap.value = input),
        _renderer.renderSingle(_copy, _camera, output),
        (_copy.visible = !1),
        (_mesh.visible = !0));
    }
    ((this.passes = []),
      (this.init = function (geometry, renderer, size) {
        ((_this = this),
          (_gpuGeom = geometry.attributes.position.array),
          (_renderer = renderer),
          (_size = size),
          (function initPasses() {
            ((_camera = World.CAMERA),
              (_geometry = World.QUAD),
              (_scene = new Scene()),
              ((_mesh = new Mesh(_geometry, null)).frustumCulled = !1),
              (_mesh.noMatrices = !0),
              (_mesh.transient = !0),
              _scene.add(_mesh));
            let copyShader = AntimatterFBO.getCopyShader();
            (((_copy = new Mesh(_geometry, copyShader)).noMatrices = !0),
              _scene.add(_copy),
              (_copy.visible = !1));
          })());
      }),
      (this.getGPUGeom = function () {
        return _gpuGeom;
      }),
      (this.addPass = function (pass, index) {
        ((_this = this),
          pass.init || pass.initialize(_size),
          "number" != typeof index ? _this.passes.push(pass) : _this.passes.splice(index, 0, pass));
      }),
      (this.findPass = function (name) {
        _this = this;
        for (var i = 0; i < _this.passes.length; i++) {
          var pass = _this.passes[i];
          if (pass.name == name) return pass;
        }
      }),
      (this.removePass = function (pass) {
        ((_this = this),
          "number" == typeof pass ? _this.passes.splice(pass) : _this.passes.remove(pass));
      }),
      (this.update = function () {
        if ((_this = this).mesh && !_this.preventRender) {
          var output = _output.value || _this.vertices.texture;
          _this.storeVelocity &&
            (_prevRT
              ? (copy(_output.value, _prevRT), (_prevOutput.value = _prevRT))
              : ((_prevOutput.value = output),
                (_prevRT = _this.passes[0].getRT(0).clone()).upload()));
          for (var i = 0; i < _this.passes.length; i++) {
            var pass = _this.passes[i],
              needsInit = !pass.init,
              firstRender = !pass.first;
            (needsInit && pass.initialize(_size),
              (pass.first = !0),
              (_mesh.shader = pass.shader),
              (_mesh.shader.uniforms.tInput.value = firstRender
                ? _this.vertices.texture
                : pass.output),
              pass.ready || (_mesh.shader.uniforms.tInput.value = _this.vertices.texture));
            var rt = firstRender ? pass.getRT(0) : pass.getWrite();
            output = pass.output;
            (_renderer.renderSingle(_scene.children[0], _camera, rt),
              copy(rt, output),
              pass.swap());
          }
          output &&
            ((_output.value = output),
            (_this.mesh.shader.uniforms.tPos.value = _output.value),
            (_this.mesh.shader.uniforms.tPrevPos.value = _prevOutput.value),
            (_this.mesh.shader.uniforms.uDPR.value = _this.mesh?.shader?._parentnuke?.dpr || 1));
        }
      }),
      (this.onDestroy = function () {
        (_this.vertices && _this.vertices.destroy && _this.vertices.destroy(),
          _this.attribs && _this.attribs.destroy && _this.attribs.destroy(),
          AntimatterUtil.clearCacheEntry(_this.key),
          _this.passes.forEach(function (pass) {
            ((pass.first = !1), _this.persistPasses || (pass && pass.destroy && pass.destroy()));
          }),
          _this.mesh.destroy(),
          (_copy.shader.mesh = null),
          (_copy.shader = null),
          _scene.destroy());
      }),
      (this.getOutput = function () {
        return _output;
      }),
      (this.getPrevOutput = function () {
        return _prevOutput;
      }));
  },
  function () {
    var _shader;
    AntimatterFBO.getCopyShader = function () {
      return (
        _shader ||
          ((_shader = new Shader("ScreenQuad")).addUniforms({ tMap: { type: "t", value: null } }),
          (_shader._attachmentData = {
            format: Texture.RGBAFormat,
            type: Texture.FLOAT,
            attachments: 1,
          })),
        _shader
      );
    };
  },
);
