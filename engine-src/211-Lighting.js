Class(function Lighting() {
  Inherit(this, Component);
  const _this = this;
  var _activeScene,
    _scenes = {};
  function loop() {
    if ((decomposeLights(_activeScene.lights), _this.UBO)) {
      let shader = _activeScene.shaders.start();
      shader &&
        (updateArrays(shader),
        _activeScene.ubo.created ? _activeScene.ubo.update() : createUBO(shader.uniforms));
    } else {
      let shader = _activeScene.shaders.start();
      for (; shader;) (updateArrays(shader), (shader = _activeScene.shaders.next()));
    }
  }
  function createUBO(uniforms) {
    uniforms.lightPos &&
      ((_activeScene.ubo.created = !0),
      _activeScene.ubo.push(uniforms.lightPos),
      _activeScene.ubo.push(uniforms.lightColor),
      _activeScene.ubo.push(uniforms.lightData),
      _activeScene.ubo.push(uniforms.lightData2),
      _activeScene.ubo.push(uniforms.lightData3),
      _activeScene.ubo.push(uniforms.lightProperties),
      _activeScene.ubo.upload());
  }
  function decomposeLights(lights) {
    for (let i = lights.length - 1; i > -1; i--) {
      let light = lights[i];
      (light._decomposedTime && Render.TIME - light._decomposedTime < 8) ||
        ((light._decomposedTime = Render.TIME),
        light._parent || light.updateMatrixWorld(),
        light._world || (light._world = new Vector3()),
        light.lockToLocal
          ? light._world.copy(light.position)
          : light.getWorldPosition(light._world));
    }
  }
  function updateArrays(shader) {
    let lighting = shader.__lighting;
    ((lighting.position.length = 0),
      (lighting.color.length = 0),
      (lighting.data.length = 0),
      (lighting.data2.length = 0),
      (lighting.data3.length = 0),
      (lighting.properties.length = 0));
    for (let i = 0; i < _activeScene.lights.length; i++) {
      let light = _activeScene.lights[i];
      (light._world || decomposeLights(_activeScene.lights),
        lighting.position.push(light._world.x, light._world.y, light._world.z, 0),
        lighting.color.push(light.color.r, light.color.g, light.color.b, 0),
        lighting.data.push(light.data.x, light.data.y, light.data.z, light.data.w),
        lighting.data2.push(light.data2.x, light.data2.y, light.data2.z, light.data2.w),
        lighting.data3.push(light.data3.x, light.data3.y, light.data3.z, light.data3.w),
        lighting.properties.push(
          light.properties.x,
          light.properties.y,
          light.properties.z,
          light.properties.w,
        ));
    }
  }
  function findParentScene(obj3d) {
    if (!obj3d) return _activeScene;
    if (obj3d._lightingData) return obj3d._lightingData;
    let scene,
      p = obj3d._parent;
    for (; p;)
      (p instanceof Scene && p._lightingData && (scene = p._lightingData), (p = p._parent));
    return (scene || (scene = _activeScene), scene);
  }
  ((this.fallbackAreaToPoint = !1),
    (this.scenes = _scenes),
    (async function () {
      (await Hydra.ready(), _this.createScene("default"), _this.useScene("default"));
    })(),
    (this.createScene = function (name, scene) {
      if (_scenes[name]) return this;
      let obj = {
        lights: [],
        renderShadows: [],
        ubo: new (window.Metal ? MetalUBO : UBO)(2),
        shaders: new LinkedList(),
        name: name,
      };
      return (scene && (scene._lightingData = obj), (_scenes[name] = obj), this);
    }),
    (this.useScene = function (name) {
      if (!(_activeScene = _scenes[name])) throw `Scene ${name} not found`;
      return (loop(), this);
    }),
    (this.destroyScene = function (name) {
      delete _scenes[name];
    }),
    (this.push = this.add =
      function (light) {
        ((_this.UBO = Renderer.UBO && !(window.AURA || RenderManager.type == RenderManager.WEBVR)),
          window.Metal && (_this.UBO = !0));
        let scene = findParentScene(light);
        (scene.lights.push(light),
          light.isAreaLight && (scene.hasAreaLight = !0),
          _this.startedLoop ||
            ((_this.startedLoop = !0),
            RenderManager.type == RenderManager.WEBVR
              ? _this.startRender(loop, World.NUKE)
              : Render.onDrawFrame(loop)));
      }),
    (this.remove = function (light) {
      _activeScene.lights.remove(light);
    }),
    (this.getLighting = function (shader, force) {
      if (shader.__lighting && !force) return shader.__lighting;
      let scene = findParentScene(shader.mesh);
      (scene.shaders.push(shader),
        window.AreaLightUtil && scene.hasAreaLight && AreaLightUtil.append(shader));
      let lighting = (shader.__lighting = {
        position: [],
        color: [],
        data: [],
        data2: [],
        data3: [],
        properties: [],
      });
      if (!scene.lights.length) return shader.__lighting;
      let lightUBO = _this.UBO;
      return (
        (shader.uniforms.lightPos = {
          type: "v4v",
          value: lighting.position,
          ignoreUIL: !0,
          lightUBO: lightUBO,
          components: 4,
          metalIgnore: !0,
        }),
        (shader.uniforms.lightColor = {
          type: "v4v",
          value: lighting.color,
          ignoreUIL: !0,
          lightUBO: lightUBO,
          components: 4,
          metalIgnore: !0,
        }),
        (shader.uniforms.lightData = {
          type: "v4v",
          value: lighting.data,
          ignoreUIL: !0,
          lightUBO: lightUBO,
          components: 4,
          metalIgnore: !0,
        }),
        (shader.uniforms.lightData2 = {
          type: "v4v",
          value: lighting.data2,
          ignoreUIL: !0,
          lightUBO: lightUBO,
          components: 4,
          metalIgnore: !0,
        }),
        (shader.uniforms.lightData3 = {
          type: "v4v",
          value: lighting.data3,
          ignoreUIL: !0,
          lightUBO: lightUBO,
          components: 4,
          metalIgnore: !0,
        }),
        (shader.uniforms.lightProperties = {
          type: "v4v",
          value: lighting.properties,
          ignoreUIL: !0,
          lightUBO: lightUBO,
          components: 4,
          metalIgnore: !0,
        }),
        updateArrays(shader),
        _this.UBO && !_activeScene.ubo.created && createUBO(shader.uniforms),
        shader.__lighting
      );
    }),
    (this.destroyShader = function (shader) {
      (findParentScene(shader.mesh).shaders.remove(shader), (shader.__lighting = null));
    }),
    (this.sort = function (callback) {
      _activeScene.lights.sort(callback);
    }),
    (this.addToShadowGroup = function (light) {
      findParentScene(light).renderShadows.push(light);
    }),
    (this.removeFromShadowGroup = function (light) {
      findParentScene(light).renderShadows.remove(light);
    }),
    (this.getShadowLights = function () {
      return _activeScene.renderShadows;
    }),
    (this.getShadowCount = function () {
      return _activeScene.renderShadows.length;
    }),
    (this.initShadowShader = function (object, mesh) {
      let scene,
        shader = object.shader || object;
      if ((mesh || (mesh = shader.mesh), mesh)) {
        let p = mesh._parent;
        for (; p;)
          (p instanceof Scene && p._lightingData && (scene = p._lightingData), (p = p._parent));
      }
      if (
        (scene || (scene = _activeScene),
        !World.RENDERER.shadows || 0 == scene.renderShadows.length)
      )
        return "";
      shader._gl || shader.upload();
      let vsName = shader.vsName,
        fsName = "ShadowDepth";
      shader.customShadowShader && (fsName = shader.customShadowShader);
      let customCompile = [vsName, fsName, shader.customCompile].filter(Boolean).join("|");
      ((shader.shadow = new Shader(vsName, fsName, {
        receiveLight: shader.receiveLight,
        UILPrefix: shader.UILPrefix,
        precision: "high",
        customCompile: customCompile,
      })),
        shader.vertexShader && (shader.shadow.vertexShader = shader.vertexShader),
        shader.restoreVS && (shader.shadow.vertexShader = shader.restoreVS),
        shader.customCompile && (shader.shadow.customCompile = shader.customCompile + "_shadow"),
        shader.defines && ((shader.shadow.defines = shader.defines), shader.shadow.resetProgram()),
        (shader.shadow.lights = shader.lights),
        (shader.shadow.isShadow = !0),
        shader.copyUniformsTo(shader.shadow, !0),
        shader.shadow.upload());
    }),
    (this.getShadowUniforms = function (shader) {
      let scene;
      if (shader.mesh) {
        let p = shader.mesh._parent;
        for (; p;)
          (p instanceof Scene && p._lightingData && (scene = p._lightingData), (p = p._parent));
      }
      return (
        scene || (scene = _activeScene),
        World.RENDERER.shadows && 0 != scene.renderShadows.length
          ? [
              `\n#define SHADOW_MAPS ${scene.renderShadows.length}`,
              World.RENDERER.shadows == Renderer.SHADOWS_LOW ? "#define SHADOWS_LOW" : "",
              World.RENDERER.shadows == Renderer.SHADOWS_MED ? "#define SHADOWS_MED" : "",
              World.RENDERER.shadows == Renderer.SHADOWS_HIGH ? "#define SHADOWS_HIGH" : "",
              `uniform sampler2D shadowMap[${scene.renderShadows.length}];`,
              `uniform mat4 shadowMatrix[${scene.renderShadows.length}];`,
              `uniform vec3 shadowLightPos[${scene.renderShadows.length}];`,
              `uniform float shadowSize[${scene.renderShadows.length}];`,
            ].join("\n")
          : ""
      );
    }),
    (this.bindUBO = function (shader) {
      _activeScene.ubo.created && _activeScene.ubo.bind(shader, "lights");
    }),
    (this.fallbackAreaToPointTest = function () {
      return _this.fallbackAreaToPoint;
    }),
    this.get("activeScene", (_) => _activeScene),
    (this.renderShadowsAllowLight = function (object, light) {
      if (!object._renderShadowsAllowLights) {
        let allowed = new WeakMap();
        object._renderShadowsAllowLights = allowed;
        let prevOnBeforeRenderShadow = object.onBeforeRenderShadow;
        object.onBeforeRenderShadow = function (renderLight) {
          let result = prevOnBeforeRenderShadow && prevOnBeforeRenderShadow.apply(this, arguments);
          return !allowed.has(renderLight) || result;
        };
      }
      object._renderShadowsAllowLights.set(light.light || light, !0);
    }));
}, "static");
