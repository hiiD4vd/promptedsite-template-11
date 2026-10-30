Class(function VolumeAudioEffect(params) {
  Inherit(this, AudioEffect);
  const _this = this;
  ((this.gain = null),
    (this.name = "volume"),
    (function () {
      const mix = parseFloat(params?.mix ?? 1);
      (_this.mixWetDry(mix),
        (function setupEffectNodes(params) {
          const { volume: volume } = params;
          ((_this.gain = _this.context.createGain()),
            (_this.gain.gain.value = volume ?? 1),
            _this.effectInput.connect(_this.gain),
            _this.gain.connect(_this.effectOutput));
        })(params));
    })(),
    (this.disconnectEffectNodes = function () {
      _this.gain.disconnect();
    }),
    (this.setVolume = function (value, { smoothing: smoothing = 0.1 } = {}) {
      const target = Math.max(0, value);
      smoothing
        ? this.gain.gain.setTargetAtTime(target, this.context.currentTime, smoothing)
        : (this.gain.gain.value = target);
    }));
});
