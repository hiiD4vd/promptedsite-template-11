FX.Class(function SeparableGaussianBlur(_nuke = World.NUKE, _iterations, _radius, _options = {}) {
  Inherit(this, Component);
  const _this = this;
  ("object" == typeof _nuke && (_nuke.isAppState || _nuke.iterations || _nuke.radius)
    ? (_nuke = (_options = _nuke).nuke || _this.parent.nuke)
    : "object" == typeof _iterations
      ? (_options = _iterations)
      : "object" == typeof _radius && (_options = _radius),
    "number" != typeof _iterations && (_iterations = _options.iterations || 8),
    "number" != typeof _radius && (_radius = _options.radius || 10));
  let _rttPing,
    _rttPong,
    _mesh,
    _passes = [],
    _enabled = !1 !== _options.enabled,
    _useNuke = !1 !== _options.useNuke,
    _passesIndex = !!_useNuke && _nuke.passes.length,
    _stage = _options.stage || _nuke.stage,
    _size = new Vector2(_stage.width, _stage.height);
  function getPassRadius(passIndex) {
    if (_iterations <= 2) return _radius;
    let step = Math.floor(passIndex / 2);
    return Math.range(step, 0, _iterations / 2 - 1, _radius, _radius / (_iterations / 2));
  }
  function checkSize() {
    _size.set(_stage.width, _stage.height);
    let dpr = _options.dpr || _nuke.dpr || 1;
    if (_rttPing) {
      let width = Math.round(_size.x * dpr),
        height = Math.round(_size.y * dpr);
      (_rttPing.width === width && _rttPing.height === height) ||
        (_rttPing.setSize(width, height), _rttPong.setSize(width, height));
    }
  }
  function render() {
    if (!_this.enabled) return;
    checkSize();
    let usedBuffer = !1,
      pingPong = !0,
      count = _passes.length;
    for (let i = 0; i < count; i++) {
      if (_passes[i].disabled) continue;
      let shader = _passes[i].pass,
        inTexture = usedBuffer
          ? pingPong
            ? _rttPing.texture
            : _rttPong.texture
          : (_options.input ?? _nuke.prevFrameRT),
        outTexture = pingPong ? _rttPong : _rttPing;
      ((_mesh.shader = shader),
        (_mesh.shader.depthTest = !1),
        (_mesh.shader.depthWrite = !1),
        (_mesh.shader.uniforms.tDiffuse.value = inTexture),
        _nuke.renderer.renderSingle(_mesh, _nuke.camera || World.CAMERA, outTexture, null),
        (usedBuffer = !0),
        (pingPong = !pingPong));
    }
    usedBuffer
      ? (_this.rt = _rttPing)
      : ((_this.rt = _options.input ?? _nuke.rttBuffer),
        _this.rt.texture || (_this.rt.texture.overrideTexture = _this.rt));
  }
  (!(function initPasses() {
    (_iterations % 2 && (_iterations += 1), (_iterations = Math.max(_iterations, 2)));
    for (let i = 0; i < _iterations; i++) {
      let pass = _this.initClass(
        FX.GaussianBlurPass,
        _size,
        getPassRadius(i),
        i % 2 == 0,
        _options,
      );
      (_passes.push(pass), pass.radius < 0.01 ? (pass.disabled = !0) : _useNuke && _nuke.add(pass));
    }
  })(),
    (function initRTs() {
      if (_useNuke) return;
      let dpr = _options.dpr || _nuke.dpr || 1,
        width = Math.round(_size.x * dpr),
        height = Math.round(_size.y * dpr);
      ((_rttPing = Nuke.getRT(width, height, !1, 1, _nuke.format, !1, Tests.msaaSamples())),
        (_rttPong = Nuke.getRT(width, height, !1, 2, _nuke.format, !1, Tests.msaaSamples())),
        (_this.rt = _rttPing));
    })(),
    (function initMesh() {
      _useNuke ||
        ((_mesh = new Mesh(World.QUAD, null)),
        (_mesh.frustumCulled = !1),
        (_mesh.noMatrices = !0),
        (_mesh.transient = !0));
    })(),
    (function addHandlers() {
      _options.manualRender
        ? (_this.render = render)
        : _useNuke
          ? RenderManager.schedule(checkSize, _nuke)
          : _this.events.sub(_nuke, Nuke.POST_RENDER, render);
    })(),
    Object.defineProperty(_this, "radius", {
      get: () => _radius,
      set(r) {
        ((_radius = +r),
          _passes.forEach((pass, i) => {
            ((pass.radius = getPassRadius(i)),
              pass.radius < 0.01
                ? ((pass.disabled = !0), _useNuke && _nuke.remove(pass))
                : pass.disabled &&
                  ((pass.disabled = !1), _useNuke && _nuke.add(pass, _passesIndex + i)));
          }));
      },
      enumerable: !0,
    }),
    _this.get("passes", () => _passes),
    _this.set("enabled", (enabled) => {
      _enabled = enabled;
    }),
    _this.get("enabled", () => _enabled && !!_passes.find((pass) => !pass.disabled)));
});
