Class(
  function Renderer(_params = {}) {
    Inherit(this, Component);
    const _this = this;
    var _canvas,
      _gl,
      _width,
      _height,
      _anisotropy,
      _clearColor,
      _projScreenMatrix,
      _frustum,
      _ubo,
      _dpr = 1,
      _resolution = new Vector2(),
      _m0 = new Matrix4(),
      _m1 = new Matrix4(),
      _time = { value: 0 },
      _stencilActive = !1;
    function initCameraUBO(camera) {
      ((camera._ubo = new UBO(0, _gl)),
        camera._ubo.push({ value: camera.projectionMatrix }),
        camera._ubo.push({ value: camera.matrixWorldInverse }),
        camera._ubo.push({ value: camera.worldPos }),
        camera._ubo.push({ value: camera.worldQuat }),
        camera._ubo.push({ value: _resolution }),
        camera._ubo.push(_time),
        camera._ubo.push(Render.timeScaleUniform),
        camera._ubo.upload());
    }
    function sortFrontToBack(array, sortOrder, camera) {
      for (let i = array.length - 1; i > -1; i--) {
        let obj = array[i];
        (obj.__sortVec || (obj.__sortVec = new Vector3()),
          sortOrder == Scene.FRONT_TO_BACK_BOUNDING && obj.geometry && obj.geometry.boundingSphere
            ? obj.__sortVec.copy(obj.geometry.boundingSphere.center)
            : obj.__sortVec.setFromMatrixPosition(camera.modelViewMatrix));
      }
      array.sort((a, b) => b.__sortVec.z - a.__sortVec.z);
    }
    function projectObject(object, camera, scene) {
      if (
        (object.isOcclusionMesh && scene.displayNeedsUpdate && scene.toRender[0].push(object),
        object.doNotProject)
      )
        return;
      let isVisible = !1;
      if (void 0 !== object.shader) {
        let visible =
          object.determineVisible() &&
          object.shader.visible &&
          !object.shader.neverRender &&
          !object.hidden;
        (visible &&
          (object.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, object.matrixWorld),
          object.normalMatrix.getNormalMatrix(object.modelViewMatrix),
          object.normalMatrixWorld.getNormalMatrix(object.matrixWorld),
          null !== object._occlusionMesh &&
            object.isMesh &&
            this.useOcclusionQuery &&
            (object.updateOcclusionMesh(),
            object._occlusionMesh.matrixWorld.copy(object.matrixWorld),
            object._occlusionMesh.normalMatrix.copy(object.normalMatrix),
            object._occlusionMesh.modelViewMatrix.copy(object.modelViewMatrix))),
          (isVisible = visible),
          (scene.displayNeedsUpdate ||
            (object.shader.transparent && !scene.disableAutoSort && visible)) &&
            object.getWorldPosition(object.worldPos),
          scene.displayNeedsUpdate &&
            scene.toRender[object.shader.transparent ? 1 : 0].push(object));
      } else isVisible = object.visible && !object.hidden;
      if (isVisible || scene.displayNeedsUpdate)
        for (let i = object.childrenLength - 1; i > -1; i--)
          projectObject(object.children[i], camera, scene);
    }
    function attachSceneUniforms(object, scene, camera) {
      if (
        (Shader.renderer.appendUniform(object.shader, "normalMatrix", object.normalMatrix),
        Shader.renderer.appendUniform(object.shader, "normalMatrixWorld", object.normalMatrixWorld),
        Shader.renderer.appendUniform(object.shader, "modelMatrix", object.matrixWorld),
        Shader.renderer.appendUniform(object.shader, "modelViewMatrix", object.modelViewMatrix),
        _ubo
          ? camera._ubo.bind(object.shader._gl.program, "global")
          : (Shader.renderer.appendUniform(
              object.shader,
              "projectionMatrix",
              camera.projectionMatrix,
            ),
            Shader.renderer.appendUniform(object.shader, "viewMatrix", camera.matrixWorldInverse),
            Shader.renderer.appendUniform(object.shader, "cameraPosition", camera.worldPos),
            Shader.renderer.appendUniform(object.shader, "cameraQuaternion", camera.worldQuat),
            Shader.renderer.appendUniform(object.shader, "resolution", _resolution),
            Shader.renderer.appendUniform(object.shader, "time", _time.value),
            Shader.renderer.appendUniform(
              object.shader,
              "timeScale",
              Render.timeScaleUniform.value,
            )),
        _this.shadows && object.shader.receiveShadow && !_this.overridePreventShadows)
      ) {
        let lights = Lighting.getShadowLights();
        (object._gl || (object._gl = {}),
          object._gl.shadowData ||
            (object._gl.shadowData = { combined: new Float32Array(16 * lights.length) }));
        for (let i = 0; i < lights.length; i++) {
          let light = lights[i];
          (_m1.multiplyMatrices(light.shadow.camera.matrixWorldInverse, object.matrixWorld),
            _m0.multiplyMatrices(light.shadow.camera.projectionMatrix, _m1),
            _m0.toArray(object._gl.shadowData.combined, 16 * i));
        }
        scene._shadowData &&
          scene._shadowData.count &&
          ((object.shader.uniforms.shadowMap.value =
            scene._shadowData[_this.overridePreventShadows ? "emptyMaps" : "maps"]),
          Shader.renderer.appendUniform(
            object.shader,
            "shadowMatrix",
            object._gl.shadowData.combined,
            "matrix",
          ),
          Shader.renderer.appendUniform(
            object.shader,
            "shadowLightPos",
            scene._shadowData.pos,
            "vec3",
          ),
          Shader.renderer.appendUniform(
            object.shader,
            "shadowSize",
            scene._shadowData.size,
            "float",
          ));
      }
    }
    function attachShadowUniforms(object, scene, light) {
      (light._mvm || (light._mvm = new Matrix4()),
        light._nm || (light._nm = new Matrix3()),
        light._mvm.multiplyMatrices(light.shadow.camera.matrixWorldInverse, object.matrixWorld),
        light._nm.getNormalMatrix(object.modelViewMatrix),
        Shader.renderer.appendUniform(object.shader.shadow, "normalMatrix", light._nm),
        Shader.renderer.appendUniform(object.shader.shadow, "modelMatrix", object.matrixWorld),
        Shader.renderer.appendUniform(object.shader.shadow, "modelViewMatrix", light._mvm),
        _ubo
          ? (object.shader._gl || object.shader.upload(),
            light.shadow.camera._ubo.bind(object.shader._gl.program, "global"))
          : (Shader.renderer.appendUniform(
              object.shader.shadow,
              "projectionMatrix",
              light.shadow.camera.projectionMatrix,
            ),
            Shader.renderer.appendUniform(
              object.shader.shadow,
              "viewMatrix",
              light.shadow.camera.matrixWorldInverse,
            )));
    }
    function loop(t, dt) {
      _time.value += 0.001 * dt;
    }
    function render(scene, camera, rt) {
      (rt && rt.width
        ? (_resolution.set(rt.width, rt.height),
          rt.multisample
            ? RenderTarget.renderer.bind(rt._rtMultisample)
            : RenderTarget.renderer.bind(rt))
        : (Renderer.overrideViewport ||
            (_gl.viewport(0, 0, _width * _dpr, _height * _dpr),
            _resolution.set(_canvas.width, _canvas.height)),
          _this.autoClear &&
            (_gl.clearColor(
              Renderer.CLEAR[0],
              Renderer.CLEAR[1],
              Renderer.CLEAR[2],
              Renderer.CLEAR[3],
            ),
            _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT))),
        camera.getWorldPosition(camera.worldPos),
        camera.getWorldQuaternion(camera.worldQuat),
        _frustum.setFromCamera(camera),
        _ubo && (camera._ubo ? camera._ubo.update() : initCameraUBO(camera)));
      for (let l = 0; l < 2; l++) {
        let len = scene.toRender[l].length;
        for (let i = 0; i < len; i++) {
          let object = scene.toRender[l][i];
          if (
            (object.onBeforeRender && object.onBeforeRender(),
            (object._drawing = !1),
            object.determineVisible() &&
              object.shader.visible &&
              !object.shader.neverRender &&
              !object.neverRender &&
              (_this.useOcclusionQuery &&
                object._occlusionGroup &&
                (object._occlusionGroup.updateOcclusionBoundingBox(),
                object._occlusionGroup.updateOcclusionVisibility(object?._gl?.occluded)),
              _this.useOcclusionQuery &&
                object.isOcclusionMesh &&
                _this.type == Renderer.WEBGL2 &&
                object._queryMesh.occlusionCulled &&
                (object.shader.draw(object, object.geometry),
                attachSceneUniforms(object, scene, camera),
                object.geometry.draw(object, object.shader, !0)),
              !1 === object.frustumCulled || !0 === _frustum.intersectsObject(object)))
          ) {
            if (
              ((object._drawing = !0),
              object.shader.nullRender || object?._gl?.occluded || object.isOcclusionMesh)
            )
              continue;
            let doubleSideTransparency = object.shader.side === Shader.DOUBLE_SIDE_TRANSPARENCY;
            (doubleSideTransparency && (object.shader.side = Shader.BACK_SIDE),
              object.shader.draw(object, object.geometry),
              attachSceneUniforms(object, scene, camera),
              object.geometry.draw(object, object.shader),
              doubleSideTransparency &&
                ((object.shader.side = Shader.FRONT_SIDE),
                object.shader.draw(object, object.geometry),
                attachSceneUniforms(object, scene, camera),
                object.geometry.draw(object, object.shader),
                (object.shader.side = Shader.DOUBLE_SIDE_TRANSPARENCY)));
          }
        }
      }
      rt &&
        rt.width &&
        (!rt.cube &&
          rt.texture.generateMipmaps &&
          (_gl.bindTexture(_gl.TEXTURE_2D, rt.texture._gl),
          _gl.generateMipmap(_gl.TEXTURE_2D),
          _gl.bindTexture(_gl.TEXTURE_2D, null)),
        rt.cube &&
          rt.texture.generateMipmaps &&
          (_gl.bindTexture(_gl.TEXTURE_CUBE_MAP, rt.texture._gl),
          _gl.generateMipmap(_gl.TEXTURE_CUBE_MAP),
          _gl.texParameteri(_gl.TEXTURE_CUBE_MAP, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR_MIPMAP_LINEAR),
          _gl.bindTexture(_gl.TEXTURE_CUBE_MAP, null)),
        rt.multisample
          ? (_this.blit(rt._rtMultisample, rt), RenderTarget.renderer.unbind(rt._rtMultisample))
          : RenderTarget.renderer.unbind(rt));
    }
    ((this.autoClear = !0),
      (this.shadows = Renderer.SHADOWS_MED),
      (this.useOcclusionQuery = !1),
      (Renderer.instance = _this),
      (Renderer.CLEAR = [0, 0, 0, 1]),
      (function initContext() {
        let contextAttributes = {
          antialias: void 0 !== _params.antialias && _params.antialias,
          powerPreference: _params.powerPreference,
          preserveDrawingBuffer: _params.preserveDrawingBuffer,
          xrCompatible: _params.xrCompatible,
          alpha: void 0 !== _params.alpha && _params.alpha,
          premultipliedAlpha: void 0 === _params.premultipliedAlpha || _params.premultipliedAlpha,
          stencil: _params.stencil,
        };
        if (
          (Device.graphics.webgl.iOSContextLoss && delete contextAttributes.powerPreference,
          (_this.stencil = !!_params.stencil),
          (_canvas = _params.canvas || document.createElement("canvas")).addEventListener(
            "webglcontextlost",
            () => Events.emitter._fireEvent(Events.WEBGL_CONTEXT_LOSS),
            !1,
          ),
          _params.gl
            ? ((_gl = _params.gl),
              (_this.type = Device.graphics.webgl.version.includes(["webgl 2", "webgl2"])
                ? Renderer.WEBGL2
                : Renderer.WEBGL1))
            : Device.graphics.webgl
              ? ["webgl2", "webgl", "experimental-webgl"].forEach((name) => {
                  _gl ||
                    ("webgl2" == name && _params.forceWebGL1) ||
                    ((_gl = _canvas.getContext(name, contextAttributes)),
                    (_this.type = _gl && "webgl2" == name ? Renderer.WEBGL2 : Renderer.WEBGL1));
                })
              : ((_gl = new NoGLPolyfill()), (_this.type = Renderer.WEBGL2)),
          !_gl)
        )
          throw "Error! Could not create WebGL context";
        ((_this.domElement = _canvas),
          (_canvas.style.background = "black"),
          (Renderer.type = _this.type),
          (Renderer.context = _this.context = _gl));
      })(),
      (function setExtensions() {
        ((_this.extensions = {}),
          _this.type != Renderer.WEBGL2
            ? ((_this.extensions.VAO = _gl.getExtension("OES_vertex_array_object")),
              (_this.extensions.instancedArrays = _gl.getExtension("ANGLE_instanced_arrays")),
              (_this.extensions.standardDerivatives = _gl.getExtension("OES_standard_derivatives")),
              (_this.extensions.elementIndexUint = _gl.getExtension("OES_element_index_uint")),
              (_this.extensions.depthTextures = _gl.getExtension("WEBGL_depth_texture")),
              (_this.extensions.drawBuffers = _gl.getExtension("WEBGL_draw_buffers")),
              (_this.extensions.halfFloat = _gl.getExtension("OES_texture_half_float")),
              (_this.extensions.float = _gl.getExtension("OES_texture_float")),
              (_this.extensions.colorBufferFloat = _gl.getExtension("WEBGL_color_buffer_float")),
              (_this.extensions.lod = _gl.getExtension("EXT_shader_texture_lod")),
              (_this.extensions.minMax = _gl.getExtension("EXT_blend_minmax")))
            : ((_this.extensions.disjointTimerQuery = _gl.getExtension(
                "EXT_disjoint_timer_query_webgl2",
              )),
              (_this.extensions.colorBufferFloat = _gl.getExtension("EXT_color_buffer_float")),
              (_this.extensions.oculusMultiview = _gl.getExtension("OCULUS_multiview")),
              (_this.extensions.oculusMultiview2 = _gl.getExtension("OVR_multiview2"))),
          (_this.extensions.filterFloat = _gl.getExtension("OES_texture_float_linear")),
          (_this.extensions.anisotropy =
            _gl.getExtension("EXT_texture_filter_anisotropic") ||
            _gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic")),
          (_this.extensions.astc = _gl.getExtension("WEBGL_compressed_texture_astc")),
          (_this.extensions.atc = _gl.getExtension("WEBGL_compressed_texture_atc")),
          (_this.extensions.etc = _gl.getExtension("WEBGL_compressed_texture_etc")),
          (_this.extensions.etc1 = _gl.getExtension("WEBGL_compressed_texture_etc1")),
          (_this.extensions.pvrtc =
            _gl.getExtension("WEBGL_compressed_texture_pvrtc") ||
            _gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc")),
          (_this.extensions.s3tc =
            _gl.getExtension("WEBGL_compressed_texture_s3tc") ||
            _gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc")),
          (_this.extensions.bptc = _gl.getExtension("EXT_texture_compression_bptc")),
          (_this.extensions.s3tc_srgb = _gl.getExtension("WEBGL_compressed_texture_s3tc_srgb")),
          (Renderer.extensions = _this.extensions));
      })(),
      (function initRenderers() {
        ((Geometry.renderer = new GeometryRendererWebGL(_gl)),
          (Texture.renderer = new TextureRendererWebGL(_gl)),
          (Shader.renderer = new ShaderRendererWebGL(_gl)),
          (RenderTarget.renderer = new FBORendererWebGL(_gl)));
      })(),
      (function initMath() {
        ((_projScreenMatrix = new Matrix4()), new Vector3(), (_frustum = new Frustum()));
      })(),
      (function initUBO() {
        (_this.type == Renderer.WEBGL2 && (_ubo = !0), (Renderer.UBO = _ubo));
      })(),
      _this.startRender(loop),
      (this.render = function (scene, camera, rt, forceToScreen, specialFbo) {
        _this.preventRender ||
          (scene.displayNeedsUpdate &&
            ((scene.toRender[0].length = 0), (scene.toRender[1].length = 0)),
          _this.modifyCameraBeforeRender &&
            (camera.renderCamera || (camera.renderCamera = camera.clone()),
            camera.renderCamera.copy(camera),
            (camera = camera.renderCamera),
            _this.modifyCameraBeforeRender(camera)),
          scene.updateMatrixWorld(),
          camera.parent || camera.updateMatrixWorld(),
          projectObject(scene, camera, scene),
          (scene.displayNeedsUpdate || scene.opaqueSortOrder == Scene.FRONT_TO_BACK) &&
            (function sortOpaque(array, sortOrder, camera) {
              for (let i = array.length - 1; i > -1; i--) {
                let obj = array[i];
                obj.shader._gl || obj.shader.upload(obj, obj.geometry);
              }
              sortOrder == Scene.FRONT_TO_BACK
                ? sortFrontToBack(array, sortOrder, camera)
                : array.sort((a, b) => {
                    if (a.renderOrder !== b.renderOrder) return a.renderOrder - b.renderOrder;
                    let aid = a.shader._gl._id,
                      bid = b.shader._gl._id;
                    return aid !== bid ? aid - bid : a.id - b.id;
                  });
            })(scene.toRender[0], scene.opaqueSortOrder, camera),
          (scene.displayNeedsUpdate || (scene.toRender[1].length && !scene.disableAutoSort)) &&
            (function sortTransparent(array, sortOrder, camera) {
              (RenderStats.update("SortTransparent", array.length),
                sortOrder == Scene.FRONT_TO_BACK || sortOrder == Scene.FRONT_TO_BACK_BOUNDING
                  ? sortFrontToBack(array, sortOrder, camera)
                  : array.sort((a, b) =>
                      a.renderOrder !== b.renderOrder
                        ? a.renderOrder - b.renderOrder
                        : a.worldPos.z !== b.worldPos.z
                          ? a.worldPos.z - b.worldPos.z
                          : a.id - b.id,
                    ));
            })(scene.toRender[1], scene.transparentSortOrder, camera),
          _this.shadows &&
            !_this.overridePreventShadows &&
            !_this.pauseShadowRendering &&
            scene.hasShadowLight &&
            (function renderShadows(scene, camera) {
              let render = (light, lightIndex) => {
                  (RenderTarget.renderer.bind(light.shadow.rt),
                    RenderStats.update("ShadowLights"),
                    light.shadow.camera.updateMatrixWorld(),
                    camera.getWorldPosition(camera.worldPos),
                    _frustum.setFromCamera(camera),
                    _ubo &&
                      (light.shadow.camera._ubo
                        ? light.shadow.camera._ubo.update()
                        : initCameraUBO(light.shadow.camera)));
                  for (let l = 0; l < 2; l++)
                    for (let i = 0; i < scene.toRender[l].length; i++) {
                      let object = scene.toRender[l][i];
                      (object.onBeforeRenderShadow &&
                        object.onBeforeRenderShadow(light, lightIndex)) ||
                        (!0 === object.castShadow &&
                          object.determineVisible() &&
                          object.shader.visible &&
                          !object.shader.neverRender &&
                          !object.neverRender &&
                          ((!1 !== object.frustumCulled &&
                            !0 !== _frustum.intersectsObject(object)) ||
                            (object.shader.shadow || Lighting.initShadowShader(object),
                            object.shader.shadow.draw(object, object.geometry),
                            attachShadowUniforms(object, 0, light),
                            object.geometry.draw(object, object.shader.shadow),
                            _ubo && light.shadow.camera._ubo.unbind(),
                            RenderStats.update("ShadowMesh"))));
                    }
                  RenderTarget.renderer.unbind(light.shadow.rt);
                },
                lights = Lighting.getShadowLights();
              (scene._shadowData ||
                (scene._shadowData = {
                  maps: [],
                  emptyMaps: [],
                  size: new Float32Array(lights.length),
                  pos: new Float32Array(3 * lights.length),
                  count: lights.length,
                }),
                scene._shadowData.count != lights.length &&
                  ((scene._shadowData.size = new Float32Array(lights.length)),
                  (scene._shadowData.pos = new Float32Array(3 * lights.length)),
                  (scene._shadowData.count = lights.length)));
              for (let i = 0; i < lights.length; i++) {
                let light = lights[i];
                (light.prepareRender(),
                  (scene._shadowData.maps[i] = light.shadow.rt.depth),
                  (scene._shadowData.emptyMaps[i] = Utils3D.getEmptyTexture()),
                  (scene._shadowData.size[i] = light.shadow.size),
                  light.position.toArray(scene._shadowData.pos, 3 * i));
              }
              for (let i = 0; i < lights.length; i++) {
                let light = lights[i];
                !light.shadow.frozen && light.determineVisible() && render(light, i);
              }
            })(scene, camera),
          specialFbo && _gl.bindFramebuffer(_gl.FRAMEBUFFER, specialFbo),
          (rt && !rt.vrRT) || !_this.vrRenderingPath || forceToScreen
            ? rt || !_this.arRenderingPath || forceToScreen
              ? render(scene, camera, rt)
              : _this.arRenderingPath(render, scene, camera)
            : _this.vrRenderingPath(
                scene,
                camera,
                _projScreenMatrix,
                _frustum,
                attachSceneUniforms,
                rt,
              ),
          specialFbo && _gl.bindFramebuffer(_gl.FRAMEBUFFER, null),
          (scene.displayNeedsUpdate = !1),
          Shader.renderer.resetState());
      }),
      (this.renderSingle = function (object, camera, rt) {
        if (_this.preventRender) return;
        (rt
          ? (_resolution.set(rt.width, rt.height),
            rt.multisample
              ? RenderTarget.renderer.bind(rt._rtMultisample)
              : RenderTarget.renderer.bind(rt))
          : (Renderer.overrideViewport ||
              (_gl.viewport(0, 0, _width * _dpr, _height * _dpr),
              _resolution.set(_canvas.width, _canvas.height)),
            _this.autoClear &&
              (_gl.clearColor(
                Renderer.CLEAR[0],
                Renderer.CLEAR[1],
                Renderer.CLEAR[2],
                Renderer.CLEAR[3],
              ),
              _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT))),
          camera.getWorldPosition(camera.worldPos),
          camera.getWorldQuaternion(camera.worldQuat),
          object.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, object.matrixWorld),
          object.normalMatrix.getNormalMatrix(object.modelViewMatrix),
          object.normalMatrixWorld.getNormalMatrix(object.matrixWorld),
          object.getWorldPosition(object.worldPos),
          _ubo && (camera._ubo ? camera.pauseUBO || camera._ubo.update() : initCameraUBO(camera)));
        let doubleSideTransparency = object.shader.side === Shader.DOUBLE_SIDE_TRANSPARENCY;
        (doubleSideTransparency &&
          ((object.shader.side = Shader.BACK_SIDE),
          object.shader._renderFrontFirst && (object.shader.side = Shader.FRONT_SIDE)),
          object.shader.draw(object, object.geometry),
          object.noMatrices ||
            (Shader.renderer.appendUniform(object.shader, "normalMatrix", object.normalMatrix),
            Shader.renderer.appendUniform(
              object.shader,
              "normalMatrixWorld",
              object.normalMatrixWorld,
            ),
            Shader.renderer.appendUniform(object.shader, "modelMatrix", object.matrixWorld),
            Shader.renderer.appendUniform(
              object.shader,
              "modelViewMatrix",
              object.modelViewMatrix,
            )),
          _ubo
            ? camera._ubo.bind(object.shader._gl.program, "global")
            : (Shader.renderer.appendUniform(
                object.shader,
                "projectionMatrix",
                camera.projectionMatrix,
              ),
              Shader.renderer.appendUniform(object.shader, "viewMatrix", camera.matrixWorldInverse),
              Shader.renderer.appendUniform(object.shader, "cameraPosition", camera.worldPos),
              Shader.renderer.appendUniform(object.shader, "cameraQuaternion", camera.worldQuat),
              Shader.renderer.appendUniform(object.shader, "resolution", _resolution),
              Shader.renderer.appendUniform(object.shader, "time", _time.value),
              Shader.renderer.appendUniform(
                object.shader,
                "timeScale",
                Render.timeScaleUniform.value,
              )),
          object.geometry.draw(object, object.shader),
          doubleSideTransparency &&
            ((object.shader.side = Shader.FRONT_SIDE),
            object.shader._renderFrontFirst && (object.shader.side = Shader.BACK_SIDE),
            object.shader.draw(object, object.geometry),
            object.geometry.draw(object, object.shader),
            (object.shader.side = Shader.DOUBLE_SIDE_TRANSPARENCY)),
          _ubo && camera._ubo.unbind(),
          rt &&
            (rt.texture.generateMipmaps &&
              (_gl.bindTexture(_gl.TEXTURE_2D, rt.texture._gl),
              _gl.generateMipmap(_gl.TEXTURE_2D),
              _gl.bindTexture(_gl.TEXTURE_2D, null)),
            rt.multisample
              ? (_this.blit(rt._rtMultisample, rt), RenderTarget.renderer.unbind(rt._rtMultisample))
              : RenderTarget.renderer.unbind(rt)),
          Shader.renderer.resetState());
      }),
      (this.setClearColor = function (color, alpha = 1) {
        ((_clearColor = new Color(color)),
          (Renderer.CLEAR = [_clearColor.r, _clearColor.g, _clearColor.b, alpha]));
      }),
      (this.setClearAlpha = function (alpha) {
        Renderer.CLEAR[3] = alpha;
      }),
      (this.getClearColor = function () {
        return (_clearColor || (_clearColor = new Color(0, 0, 0)), _clearColor);
      }),
      (this.getClearAlpha = function () {
        return Renderer.CLEAR[3];
      }),
      (this.setPixelRatio = function (dpr) {
        ((_dpr = dpr), this.setSize(_width, _height));
      }),
      (this.setSize = function (width, height) {
        ((_width = width),
          (_height = height),
          (_canvas.width = width * _dpr),
          (_canvas.height = height * _dpr),
          (_canvas.style.width = `${width}px`),
          (_canvas.style.height = `${height}px`),
          _resolution.set(_canvas.width, _canvas.height));
      }),
      (this.getMaxAnisotropy = function () {
        return Device.graphics.webgl && _this.extensions.anisotropy
          ? (_anisotropy ||
              (_anisotropy = _gl.getParameter(
                _this.extensions.anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT,
              )),
            _anisotropy)
          : 0;
      }),
      (this.readPixels = function (
        rt,
        x = 0,
        y = 0,
        width,
        height,
        array,
        type = _gl.UNSIGNED_BYTE,
        format = _gl.RGBA,
      ) {
        (width || (width = rt ? rt.width : 1),
          height || (height = rt ? rt.height : 1),
          (width = Math.round(width)),
          (height = Math.round(height)),
          (type = type || _gl.UNSIGNED_BYTE));
        let w = Math.round(width - x),
          h = Math.round(height - y);
        return (
          array || (array = new Uint8Array(w * h * 4)),
          _gl.bindFramebuffer(_gl.FRAMEBUFFER, rt ? rt._gl : null),
          _gl.readPixels(x, y, width, height, format, type, array),
          _gl.bindFramebuffer(_gl.FRAMEBUFFER, null),
          array
        );
      }),
      (this.readPixelsAsync = async function (
        rt,
        x = 0,
        y = 0,
        width,
        height,
        array,
        type = _gl.UNSIGNED_BYTE,
        format = _gl.RGBA,
      ) {
        if (_this.type != Renderer.WEBGL2)
          return (
            console.warn("readPixelsAsync is not supported in WebGL1, using readPixels instead"),
            this.readPixels(rt, x, y, width, height, array, type, format)
          );
        (width || (width = rt ? rt.width : 1),
          height || (height = rt ? rt.height : 1),
          (width = Math.round(width)),
          (height = Math.round(height)),
          (type = type || _gl.UNSIGNED_BYTE));
        let w = Math.round(width - x),
          h = Math.round(height - y);
        (array || (array = new Uint8Array(w * h * 4)),
          _gl.bindFramebuffer(_gl.FRAMEBUFFER, rt ? rt._gl : null));
        const bufpak = _gl.createBuffer();
        (_gl.bindBuffer(_gl.PIXEL_PACK_BUFFER, bufpak),
          _gl.bufferData(_gl.PIXEL_PACK_BUFFER, array.byteLength, _gl.STREAM_READ),
          _gl.readPixels(0, 0, width, height, format, type, 0),
          _gl.bindFramebuffer(_gl.FRAMEBUFFER, null));
        var sync = _gl.fenceSync(_gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        if (!sync) return null;
        _gl.flush();
        try {
          return (
            await (function clientWaitAsync(sync, flags = 0, fps = 30) {
              const promise = Promise.create();
              var check = function () {
                var res = _gl.clientWaitSync(sync, flags, 0);
                if (res == _gl.WAIT_FAILED) return (_this.stopRender(check), void promise.reject());
                res != _gl.TIMEOUT_EXPIRED
                  ? (_this.stopRender(check), promise.resolve())
                  : _this.startRender(check, fps);
              };
              return (check(), promise);
            })(sync, 0),
            _gl.bindBuffer(_gl.PIXEL_PACK_BUFFER, bufpak),
            _gl.getBufferSubData(_gl.PIXEL_PACK_BUFFER, 0, array),
            array
          );
        } finally {
          (_gl.deleteSync(sync),
            _gl.bindBuffer(_gl.PIXEL_PACK_BUFFER, bufpak),
            _gl.deleteBuffer(bufpak),
            _gl.bindBuffer(_gl.PIXEL_PACK_BUFFER, null));
        }
      }),
      (this.blit = function (input, output, mask = _gl.COLOR_BUFFER_BIT) {
        if (_this.type != Renderer.WEBGL2) return !1;
        (input._gl || input.upload(), output._gl || output.upload());
        let prevReadFBO = _gl.getParameter(_gl.READ_FRAMEBUFFER_BINDING),
          prevDrawFBO = _gl.getParameter(_gl.DRAW_FRAMEBUFFER_BINDING);
        if (
          (_gl.bindFramebuffer(_gl.READ_FRAMEBUFFER, input._gl),
          _gl.bindFramebuffer(_gl.DRAW_FRAMEBUFFER, output._gl),
          input === output._rtMultisample &&
            (output.depth && (mask |= _gl.DEPTH_BUFFER_BIT),
            output.stencil && (mask |= _gl.STENCIL_BUFFER_BIT)),
          _gl.blitFramebuffer(
            0,
            0,
            input.width,
            input.height,
            0,
            0,
            output.width,
            output.height,
            mask,
            _gl.NEAREST,
          ),
          input === output._rtMultisample && output.multi)
        ) {
          let attachments = output.attachments;
          for (let i = 1; i < attachments.length; i++) {
            let texture = attachments[i];
            (_gl.readBuffer(_gl[`COLOR_ATTACHMENT${i}`]),
              _gl.bindFramebuffer(_gl.DRAW_FRAMEBUFFER, texture._blitFramebuffer),
              _gl.blitFramebuffer(
                0,
                0,
                input.width,
                input.height,
                0,
                0,
                output.width,
                output.height,
                mask,
                _gl.NEAREST,
              ));
          }
          _gl.readBuffer(_gl.COLOR_ATTACHMENT0);
        }
        return (
          _gl.bindFramebuffer(_gl.READ_FRAMEBUFFER, prevReadFBO),
          _gl.bindFramebuffer(_gl.DRAW_FRAMEBUFFER, prevDrawFBO),
          !0
        );
      }),
      (this.setupStencilMask = function (ref = 1) {
        (_stencilActive ||
          (_gl.enable(_gl.STENCIL_TEST), _gl.clear(_gl.STENCIL_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT)),
          (_stencilActive = !0),
          _gl.stencilFunc(_gl.ALWAYS, ref, 255),
          _gl.stencilOp(_gl.KEEP, _gl.KEEP, _gl.REPLACE),
          _gl.stencilMask(255),
          _gl.colorMask(!1, !1, !1, !1),
          _gl.disable(_gl.DEPTH_TEST));
      }),
      (this.setupStencilDraw = function (mode, ref = 1) {
        (_gl.colorMask(!0, !0, !0, !0),
          _gl.enable(_gl.DEPTH_TEST),
          _gl.stencilFunc("inside" == mode ? _gl.EQUAL : _gl.NOTEQUAL, ref, 255),
          _gl.stencilOp(_gl.KEEP, _gl.KEEP, _gl.KEEP));
      }),
      (this.clearStencil = function () {
        (_gl.disable(_gl.STENCIL_TEST), (_stencilActive = !1));
      }),
      (this.clearDepth = function (rt) {
        (rt && !rt._gl && rt.upload(),
          rt && _gl.bindFramebuffer(_gl.FRAMEBUFFER, rt._gl),
          _gl.clear(_gl.DEPTH_BUFFER_BIT),
          rt && _gl.bindFramebuffer(_gl.FRAMEBUFFER, null));
      }),
      (this.clearColor = function (rt) {
        (rt && !rt._gl && rt.upload(),
          rt && _gl.bindFramebuffer(_gl.FRAMEBUFFER, rt._gl),
          _gl.clearColor(
            Renderer.CLEAR[0],
            Renderer.CLEAR[1],
            Renderer.CLEAR[2],
            Renderer.CLEAR[3],
          ),
          _gl.clear(_gl.COLOR_BUFFER_BIT),
          rt && _gl.bindFramebuffer(_gl.FRAMEBUFFER, null));
      }),
      this.get("resolution", (_) => _resolution),
      this.get("time", (_) => _time),
      this.get("canvas", (_) => _canvas));
  },
  (_) => {
    ((Renderer.WEBGL1 = "webgl1"),
      (Renderer.WEBGL2 = "webgl2"),
      (Renderer.STATIC_SHADOWS = "static_shadows"),
      (Renderer.SHADOWS_LOW = "shadows_low"),
      (Renderer.SHADOWS_MED = "shadows_med"),
      (Renderer.SHADOWS_HIGH = "shadows_high"),
      (Renderer.ID = 0));
  },
);
