Class(function AudioEffect() {
  Inherit(this, Component);
  const _this = this;
  ((this.context = null),
    (this.input = null),
    (this.output = null),
    (this.effectInput = null),
    (this.effectOutput = null),
    (this.wetGain = null),
    (this.dryGain = null),
    (function init() {
      _this.flag("initialized")
        ? console.warn("Effect already initialized.")
        : ((_this.context = AudioManager.instance().ctx),
          (_this.input = _this.context.createGain()),
          (_this.output = _this.context.createGain()),
          (_this.effectInput = _this.context.createGain()),
          (_this.effectOutput = _this.context.createGain()),
          (_this.wetGain = _this.context.createGain()),
          (_this.dryGain = _this.context.createGain()),
          (function connectNodes() {
            (_this.input.connect(_this.dryGain),
              _this.dryGain.connect(_this.output),
              _this.input.connect(_this.effectInput),
              _this.effectOutput.connect(_this.wetGain),
              _this.wetGain.connect(_this.output),
              (_this.wetGain.gain.value = 1),
              (_this.dryGain.gain.value = 0));
          })(),
          _this.flag("initialized", !0));
    })(),
    (this.mixWetDry = function (value) {
      if (null == value) return;
      const mix = parseFloat(value);
      if (Number.isNaN(mix)) throw new Error("Mix is NaN.");
      const blend = (Math.clamp(mix, 0, 1) * Math.PI) / 2,
        dry = Math.cos(blend),
        wet = Math.sin(blend),
        time = this.context.currentTime;
      return (
        _this.wetGain.gain.setValueAtTime(wet, time),
        _this.dryGain.gain.setValueAtTime(dry, time),
        _this
      );
    }),
    (this.connect = function (destination) {
      return (_this.output.connect(destination), _this);
    }),
    (this.disconnect = function () {
      return (_this.output.disconnect(), _this);
    }),
    (this.onDestroy = function () {
      for (const node of Object.values(_nodes)) (node.disconnect?.(), node.destroy?.());
      (_this.input.disconnect(),
        _this.output.disconnect(),
        _this.dryGain.disconnect(),
        _this.wetGain.disconnect(),
        _this.effectInput.disconnect(),
        _this.effectOutput.disconnect());
    }));
});
