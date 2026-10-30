Class(function GPUCompute(_sizeX, _sizeY, _renderer = World.RENDERER) {
  Inherit(this, Component);
  const _this = this;
  var _passThrough, _mesh;
  ((this.variables = []), (this.currentTextureIndex = 0));
  var _scene = new Scene(),
    _camera = new PerspectiveCamera(30, 1, 0.1, 100);
  function createShader(fs, uniforms) {
    return new Shader("GPUCompute", fs, Utils.mergeObject({ tMap: { value: null } }));
  }
  ((_camera.position.z = 1),
    (_passThrough = createShader("GPUCompute")),
    ((_mesh = new Mesh(World.QUAD, _passThrough)).frustumCulled = !1),
    _scene.add(_mesh),
    Hydra.LOCAL &&
      (function initHotReload() {
        _this.events.sub(ShaderUIL.SHADER_UPDATE, ({ shader: shader }) => {
          for (let i = 0; i < _this.variables.length; i++) {
            let variable = _this.variables[i];
            if (variable.shader && shader.includes(variable.shader.fsName)) {
              if ((variable.shader.resetProgram(), variable.dependencies))
                for (let d = 0; d < variable.dependencies.length; d++) {
                  let sampler = `uniform sampler2D ${variable.dependencies[d].name};\n`;
                  variable.shader.fragmentShader = variable.shader.fragmentShader
                    .split("__ACTIVE_THEORY_LIGHTS__")
                    .join(sampler + "__ACTIVE_THEORY_LIGHTS__");
                }
              Shader.renderer.hotReloadClearProgram(variable.shader.customCompile);
            }
          }
        });
      })(),
    (this.addVariable = function (variableName, computeFragmentShader, initialValueTexture) {
      let variable = {
        name: variableName,
        initialValueTexture: initialValueTexture,
        shader: createShader(computeFragmentShader),
        dependencies: null,
        renderTargets: [],
        wrapS: null,
        wrapT: null,
        minFilter: Texture.NEAREST,
        magFilter: Texture.NEAREST,
      };
      return (this.variables.push(variable), variable);
    }),
    (this.createRenderTarget = function (
      sizeXTexture = _sizeX,
      sizeYTexture = _sizeY,
      wrapS = Texture.CLAMP_TO_EDGE,
      wrapT = Texture.CLAMP_TO_EDGE,
      minFilter = Texture.NEAREST,
      magFilter = Texture.NEAREST,
    ) {
      return new RenderTarget(sizeXTexture, sizeYTexture, {
        wrapS: wrapS,
        wrapT: wrapT,
        minFilter: minFilter,
        magFilter: magFilter,
        format: Texture.RGBAFormat,
        type: "ios" == Device.system.os ? Texture.HALF_FLOAT : Texture.FLOAT,
      });
    }),
    (this.init = function () {
      for (let i = 0; i < this.variables.length; i++) {
        let variable = this.variables[i];
        ((variable.renderTargets[0] = this.createRenderTarget(
          _sizeX,
          _sizeY,
          variable.wrapS,
          variable.wrapT,
          variable.minFilter,
          variable.magFilter,
        )),
          (variable.renderTargets[1] = this.createRenderTarget(
            _sizeX,
            _sizeY,
            variable.wrapS,
            variable.wrapT,
            variable.minFilter,
            variable.magFilter,
          )),
          this.renderTexture(variable.initialValueTexture, variable.renderTargets[0]),
          this.renderTexture(variable.initialValueTexture, variable.renderTargets[1]));
        let shader = variable.shader,
          uniforms = shader.uniforms;
        if (variable.dependencies)
          for (let d = 0; d < variable.dependencies.length; d++) {
            let depVar = variable.dependencies[d];
            if (depVar.name !== variable.name) {
              let found = !1;
              for (let j = 0; j < this.variables.length; j++)
                if (depVar.name === this.variables[j].name) {
                  found = !0;
                  break;
                }
              if (!found)
                return (
                  "Variable dependency not found. Variable=" +
                  variable.name +
                  ", dependency=" +
                  depVar.name
                );
            }
            uniforms[depVar.name] = { value: null };
            let sampler = `uniform sampler2D ${depVar.name};\n`;
            shader.fragmentShader = shader.fragmentShader
              .split("__ACTIVE_THEORY_LIGHTS__")
              .join(sampler + "__ACTIVE_THEORY_LIGHTS__");
          }
      }
      this.currentTextureIndex = 0;
    }),
    (this.compute = function () {
      let currentTextureIndex = this.currentTextureIndex,
        nextTextureIndex = 0 === this.currentTextureIndex ? 1 : 0;
      for (let i = 0, il = this.variables.length; i < il; i++) {
        let variable = this.variables[i];
        if (variable.dependencies) {
          let uniforms = variable.shader.uniforms;
          for (let d = 0, dl = variable.dependencies.length; d < dl; d++) {
            let depVar = variable.dependencies[d];
            uniforms[depVar.name].value = depVar.renderTargets[currentTextureIndex].texture;
          }
        }
        this.computeRenderTarget(variable.shader, variable.renderTargets[nextTextureIndex]);
      }
      this.currentTextureIndex = nextTextureIndex;
    }),
    (this.computeRenderTarget = function (shader, output) {
      ((_mesh.shader = shader),
        _renderer.render(_scene, _camera, output),
        (_mesh.material = _passThrough));
    }),
    (this.createTexture = function () {
      let a = new Float32Array(_sizeX * _sizeY * 4),
        texture = new DataTexture(a, _sizeX, _sizeY, Texture.RGBAFormat, Texture.FLOAT);
      return ((texture.needsUpdate = !0), texture);
    }),
    (this.renderTexture = function (input, output) {
      ((_passThrough.uniforms.tMap.value = input),
        _this.computeRenderTarget(_passThrough, output),
        (_passThrough.uniforms.tMap.value = null));
    }),
    (this.getCurrentRenderTarget = function (variable) {
      return variable.renderTargets[this.currentTextureIndex];
    }),
    (this.getAlternateRenderTarget = function (variable) {
      return variable.renderTargets[0 === this.currentTextureIndex ? 1 : 0];
    }),
    (this.setVariableDependencies = function (variable, dependencies) {
      varible.dependencies = dependencies;
    }),
    (this.onDestroy = function () {
      for (let i = 0; i < _this.variables.length; i++) {
        let variable = _this.variables[i];
        (variable.renderTargets[0] && variable.renderTargets[0].destroy(),
          variable.renderTargets[1] && variable.renderTargets[1].destroy(),
          variable.shader && variable.shader.destroy());
      }
      (_passThrough && _passThrough.destroy(), _mesh && _mesh.destroy());
    }));
});
