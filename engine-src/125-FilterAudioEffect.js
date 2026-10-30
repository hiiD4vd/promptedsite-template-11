Class(function FilterAudioEffect(params) {
  Inherit(this, AudioEffect);
  const _this = this;
  ((this.filter = null),
    (this.filterType = "lowpass"),
    (this.name = "filter"),
    (function () {
      const mix = parseFloat(params?.mix ?? 1);
      (_this.mixWetDry(mix),
        (function setupEffectNodes(params = {}) {
          const { filterType: filterType, frequency: frequency } = params;
          ((_this.filterType = filterType ?? _this.filterType),
            (_this.filter = _this.context.createBiquadFilter()),
            (_this.filter.type = _this.filterType),
            frequency && (_this.filter.frequency.value = frequency ?? 12e3));
          (_this.effectInput.connect(_this.filter), _this.filter.connect(_this.effectOutput));
        })(params));
    })(),
    (this.disconnectEffectNodes = function () {
      _this.filter.disconnect();
    }),
    (this.setFrequency = function (target, { smoothing: smoothing = 0.1 } = {}) {
      smoothing
        ? this.filter.frequency.setTargetAtTime(target, this.context.currentTime, smoothing)
        : (this.filter.frequency.value = target);
    }));
});
