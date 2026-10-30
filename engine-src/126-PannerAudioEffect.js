Class(function PannerAudioEffect(params) {
  Inherit(this, AudioEffect);
  const _this = this;
  ((this.panner = null),
    (this.name = "panner"),
    (function () {
      const mix = parseFloat(params?.mix ?? 1);
      (_this.mixWetDry(mix),
        (function setupEffectNodes(params) {
          const { pan: pan } = params;
          ((_this.panner = _this.context.createStereoPanner()),
            (_this.panner.pan.value = pan ?? 0),
            _this.effectInput.connect(_this.panner),
            _this.panner.connect(_this.effectOutput));
        })(params));
    })(),
    (this.disconnectEffectNodes = function () {
      _this.panner.disconnect();
    }),
    (this.setPan = function (value, { smoothing: smoothing = 0.2 } = {}) {
      const target = Math.clamp(value, -1, 1);
      smoothing
        ? this.panner.pan.setTargetAtTime(target, this.context.currentTime, smoothing)
        : (this.panner.pan.value = target);
    }));
});
