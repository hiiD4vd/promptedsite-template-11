Class(function AudioEffectChain(params) {
  Inherit(this, Component);
  const _this = this;
  ((this.context = null),
    (this.effects = {}),
    (this.input = null),
    (this.output = null),
    (this.effectInput = null),
    (this.effectOutput = null),
    (this.wetGain = null),
    (this.dryGain = null));
  let _mixedWetGainValue = null,
    _mixedDryGainValue = null,
    _overallGainValue = 1;
  function mixWetDry(value, { smoothing: smoothing = 0.1 } = {}) {
    null == value && (value = 1);
    const mix = parseFloat(value);
    if (Number.isNaN(mix)) throw new Error("Mix is NaN.");
    const blend = (Math.clamp(mix, 0, 1) * Math.PI) / 2,
      dry = Math.cos(blend),
      wet = Math.sin(blend),
      time = _this.context.currentTime;
    return (
      _this.wetGain.gain.setValueAtTime(wet * _overallGainValue, time, smoothing),
      _this.dryGain.gain.setValueAtTime(dry * _overallGainValue, time, smoothing),
      (_mixedWetGainValue = wet),
      (_mixedDryGainValue = dry),
      _this
    );
  }
  (!(function init({ effects: effects }) {
    if (_this.flag("initialized")) return;
    const manager = AudioManager.instance();
    ((_this.context = manager.ctx),
      (_this.input = _this.context.createGain()),
      (_this.output = _this.context.createGain()),
      (_this.effectInput = _this.context.createGain()),
      (_this.effectOutput = _this.context.createGain()),
      (_this.wetGain = _this.context.createGain()),
      (_this.dryGain = _this.context.createGain()));
    for (const effect of effects) _this.effects[effect.name] = effect;
    ((function connectNodes() {
      (_this.input.connect(_this.dryGain),
        _this.dryGain.connect(_this.output),
        _this.input.connect(_this.effectInput));
      const effects = Object.values(_this.effects);
      if (effects.length) {
        _this.effectInput.connect(effects[0].input);
        for (let index = 0; index < effects.length - 1; index++) {
          const effect = effects[index],
            nextEffect = effects[index + 1];
          effect.connect(nextEffect.input);
        }
        effects[effects.length - 1].connect(_this.effectOutput);
      } else _this.effectInput.connect(_this.effectOutput);
      (_this.effectOutput.connect(_this.wetGain),
        _this.wetGain.connect(_this.output),
        mixWetDry(params.mix));
    })(),
      _this.flag("initialized", !0));
  })(params),
    (this.setGain = function (value, { smoothing: smoothing = 0.1 } = {}) {
      null == value && (value = 1);
      const gain = parseFloat(value);
      if (Number.isNaN(gain)) throw new Error("Mix is NaN.");
      const time = _this.context.currentTime;
      (_this.wetGain.gain.setValueAtTime(gain * _mixedWetGainValue, time, smoothing),
        _this.dryGain.gain.setValueAtTime(gain * _mixedDryGainValue, time, smoothing),
        (_overallGainValue = gain));
    }),
    (this.connect = function (destination) {
      return (_this.output.connect(destination), _this);
    }),
    (this.disconnect = function () {
      return (_this.output.disconnect(), _this);
    }),
    (this.onDestroy = function () {
      for (const effect of Object.values(_this.effects)) (effect.disconnect(), effect.destroy?.());
      (_this.input.disconnect(),
        _this.output.disconnect(),
        _this.dryGain.disconnect(),
        _this.wetGain.disconnect(),
        _this.effectInput.disconnect(),
        _this.effectOutput.disconnect());
    }),
    (this.mixWetDry = mixWetDry));
});
