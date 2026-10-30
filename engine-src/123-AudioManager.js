Class(
  function AudioManager() {
    Inherit(this, Component);
    const _this = this;
    let _ctx,
      _mastergain,
      _maingain,
      _pool = {},
      _effectChains = {},
      _muted = !1;
    const USER_ACTIVATION_EVENTS = [
      "auxclick",
      "click",
      "contextmenu",
      "dblclick",
      "keydown",
      "keyup",
      "mousedown",
      "mouseup",
      "touchend",
    ];
    function init() {
      _this.flag("initialized") ||
        (window.AudioContext &&
          ((_ctx = new window.AudioContext()),
          (_mastergain = _ctx.createGain()),
          _mastergain.connect(_ctx.destination),
          (_mastergain.gain.value = 1),
          (_maingain = _ctx.createGain()),
          _maingain.connect(_mastergain),
          (_maingain.gain.value = 1),
          (function addListeners() {
            (USER_ACTIVATION_EVENTS.forEach((eventName) => {
              Stage.div.addEventListener(eventName, tryResume, { capture: !0, passive: !0 });
            }),
              _this.events.sub(Events.VISIBILITY, onVisibilityChange));
          })(),
          _this.flag("initialized", !0)));
    }
    async function tryResume() {
      "suspended" === _ctx.state &&
        (_this.events.fire(AudioManager.RESUME_CONTEXT, { playing: !0 }),
        _mastergain.gain.cancelScheduledValues(_ctx.currentTime),
        _maingain.gain.cancelScheduledValues(_ctx.currentTime),
        (_mastergain.gain.value = 0),
        (_maingain.gain.value = 0),
        await _ctx.resume(),
        _mastergain.gain.setTargetAtTime(1, _ctx.currentTime + 0.4, 0.5),
        _maingain.gain.setTargetAtTime(1, _ctx.currentTime + 0.4, 0.5));
    }
    function onVisibilityChange(e) {
      if ("blur" === e.type) {
        if ("suspended" === _ctx.state) return;
        (_mastergain.gain.cancelScheduledValues(0),
          Device.mobile
            ? ((_mastergain.gain.value = 0), _ctx.suspend())
            : _mastergain.gain.setTargetAtTime(0, _ctx.currentTime, 0.05));
      } else
        "suspended" === _ctx.state
          ? tryResume()
          : (_mastergain.gain.cancelScheduledValues(0),
            _mastergain.gain.setTargetAtTime(1, _ctx.currentTime, 0.05));
    }
    function waitContextResume() {
      return _this.wait(() => "running" === _ctx.state);
    }
    function destroyAudioNode(key) {
      let node = _pool[key];
      node &&
        (node.sources.forEach((source) => {
          (source.stop(), source.disconnect());
        }),
        node.gain.disconnect(),
        node.destroy(),
        delete _pool[key]);
    }
    (init(),
      (_this.init = init),
      (_this.registerEffectChain = async function (id, chain) {
        (chain.name || (chain.name = id), (_effectChains[id] = chain), chain.connect(_maingain));
      }),
      (_this.registerAudio = async function (
        id,
        pathOrBlobOrArrayBuffer,
        spriteData,
        options = {},
      ) {
        const { baseGain: baseGain, needsTrimming: needsTrimming } = options;
        _pool[id] = _this.initClass(AudioNode, id, _ctx, pathOrBlobOrArrayBuffer, {
          baseGain: baseGain,
          needsTrimming: needsTrimming,
        });
        const effectChainId = options.effectChainId ?? AudioManager.GENERAL_CHAIN_ID,
          audioOutput = _effectChains[effectChainId]?.input ?? _maingain;
        return (
          _pool[id].gain.connect(audioOutput),
          spriteData && (_pool[id].spriteData = spriteData),
          _pool[id].promise
        );
      }),
      (_this.unregisterAudio = destroyAudioNode),
      (_this.play = async function (id, options = {}, spriteName) {
        const resource = _pool[id];
        if (!resource) throw new Error(`No resource registered with id ${id}`);
        if (
          ("running" !== _ctx.state && (await waitContextResume()),
          resource.flag("loaded") || (await resource.promise),
          resource.spriteData && resource.spriteData[spriteName])
        ) {
          const [start, duration] = resource.spriteData[spriteName];
          return resource.play({
            startFrom: start / 1e3,
            stopTo: (start + duration) / 1e3,
            loop: !1,
            playOnce: !1,
            noTween: !0,
            ...options,
          });
        }
        return resource.play(options);
      }),
      (_this.pause = async function (id, options) {
        const resource = _pool[id];
        return (
          "running" !== _ctx.state && (await waitContextResume()),
          resource.flag("loaded") || (await resource.promise),
          resource.pause(options)
        );
      }),
      (_this.seek = async function (id, timestamp) {
        const resource = _pool[id];
        return (
          "running" !== _ctx.state && (await waitContextResume()),
          resource.flag("loaded") || (await resource.promise),
          resource.seek(timestamp)
        );
      }),
      (_this.stop = async function (id, options) {
        const resource = _pool[id];
        return (
          "running" !== _ctx.state && (await waitContextResume()),
          resource.flag("loaded") || (await resource.promise),
          resource.stop(options)
        );
      }),
      (_this.getAudio = function (id) {
        return _pool[id];
      }),
      (_this.getEffectChain = function (id) {
        return _effectChains[id];
      }),
      (_this.mute = function (bool, { duration: duration = 0 } = {}) {
        if (_muted === bool || null === bool) return;
        _muted = bool;
        const targetGain = +!bool;
        if (duration) {
          const targetTime = _ctx.currentTime + duration / 1e3;
          (_mastergain.gain.setTargetAtTime(targetGain, targetTime, 0.25),
            _maingain.gain.setTargetAtTime(targetGain, targetTime, 0.25));
        } else ((_mastergain.gain.value = targetGain), (_maingain.gain.value = targetGain));
        _this.events.fire(_muted ? AudioManager.MUTED : AudioManager.UNMUTED);
      }),
      (_this.reset = () => {
        (_this.flag("initialized") && _this.clear(), init());
      }),
      (_this.blend = function (fromId, toId, mix) {
        const target = Math.clamp(mix, 0, 1),
          from = _this.getAudio(fromId),
          to = _this.getAudio(toId);
        if (!from) throw new Error(`No node is registered with id ${fromId}`);
        if (!to) throw new Error(`No node is registered with id ${toId}`);
        const blend = (target * Math.PI) / 2,
          fromTarget = Math.cos(blend),
          toTarget = Math.sin(blend),
          now = _ctx.currentTime,
          smoothing = AudioConfig.SMOOTHING_TIME;
        (from.gain.gain.setTargetAtTime(fromTarget * from.baseGain, now, smoothing),
          to.gain.gain.setTargetAtTime(toTarget * to.baseGain, now, smoothing));
      }),
      (_this.setVolume = function (
        id,
        volume,
        { smoothing: smoothing = AudioConfig.SMOOTHING_TIME } = {},
      ) {
        const node = _this.getAudio(id);
        if (!node) throw new Error(`No node is registered with id ${id}`);
        const target = Math.max(volume, 0);
        node.gain.gain.setTargetAtTime(target * node.baseGain, _ctx.currentTime, smoothing);
      }),
      (_this.setupFrequencyAnalyzer = function () {
        if (_this.analyzer) return void console.warn("Analyzer already setup");
        ((_this.analyzer = _ctx.createAnalyser()),
          (_this.analyzer.fftSize = 256),
          _maingain.connect(_this.analyzer));
        const bufferLength = _this.analyzer.frequencyBinCount;
        _this.frequencyData = new Uint8Array(bufferLength);
      }),
      (this.getFrequencies = function () {
        return (
          _this.analyzer.getByteFrequencyData(_this.frequencyData),
          [_this.frequencyData, { bufferLength: _this.analyzer.frequencyBinCount }]
        );
      }),
      (_this.clear = () => (
        (function removeListeners() {
          (USER_ACTIVATION_EVENTS.forEach((eventName) => {
            Stage.div.removeEventListener(eventName, tryResume, { capture: !0, passive: !0 });
          }),
            _this.events.unsub(Events.VISIBILITY, onVisibilityChange));
        })(),
        Object.keys(_pool).forEach(destroyAudioNode),
        (_pool = {}),
        _maingain.disconnect(),
        _mastergain.disconnect(),
        _this.flag("initialized", !1),
        _this.ctx.close()
      )),
      this.get("ctx", (_) => _ctx),
      this.get("mastergain", (_) => _mastergain),
      this.get("muted", (_) => _muted),
      this.get("maingain", (_) => _maingain),
      this.get("playing", (_) => false),
      this.get("effectChains", (_) => _effectChains));
  },
  "singleton",
  () => {
    ((AudioManager.RESUME_CONTEXT = "AudioManager.RESUME_CONTEXT"),
      (AudioManager.MUTED = "AudioManager.MUTED"),
      (AudioManager.UNMUTED = "AudioManager.UNMUTED"),
      (AudioManager.GENERAL_CHAIN_ID = "general"));
  },
);
