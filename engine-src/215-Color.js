class Color {
  constructor(r, g, b) {
    return null == r && null == g && null == b
      ? this.setRGB(1, 1, 1)
      : void 0 === g && void 0 === b
        ? this.set(r)
        : void this.setRGB(r, g, b);
  }
  set(value) {
    return (
      value && value instanceof Color
        ? this.copy(value)
        : "number" == typeof value
          ? this.setHex(value)
          : "string" == typeof value && this.setStyle(value),
      this
    );
  }
  setScalar(scalar) {
    return ((this.r = scalar), (this.g = scalar), (this.b = scalar), this);
  }
  setHex(hex) {
    return (
      (hex = Math.floor(hex)),
      (this.r = ((hex >> 16) & 255) / 255),
      (this.g = ((hex >> 8) & 255) / 255),
      (this.b = (255 & hex) / 255),
      this
    );
  }
  setStyle(string) {
    return this.setHex(Number(string.replace("#", "0x")));
  }
  setRGB(r, g, b) {
    return ((this.r = r), (this.g = g), (this.b = b), this);
  }
  setHSL(h, s, l) {
    return h instanceof ColorHSL
      ? h.getRGB(this)
      : this.target
        ? void this.target.setHSL(h, s, l).getRGB(this)
        : (this.target = new ColorHSL(h, s, l));
  }
  clone() {
    return new Color(this.r, this.g, this.b);
  }
  copy(color) {
    return ((this.r = color.r), (this.g = color.g), (this.b = color.b), this);
  }
  copyGammaToLinear(color, gammaFactor) {
    return (
      void 0 === gammaFactor && (gammaFactor = 2),
      (this.r = Math.pow(color.r, gammaFactor)),
      (this.g = Math.pow(color.g, gammaFactor)),
      (this.b = Math.pow(color.b, gammaFactor)),
      this
    );
  }
  copyLinearToGamma(color, gammaFactor) {
    void 0 === gammaFactor && (gammaFactor = 2);
    let safeInverse = gammaFactor > 0 ? 1 / gammaFactor : 1;
    return (
      (this.r = Math.pow(color.r, safeInverse)),
      (this.g = Math.pow(color.g, safeInverse)),
      (this.b = Math.pow(color.b, safeInverse)),
      this
    );
  }
  convertGammaToLinear(gammaFactor) {
    return (this.copyGammaToLinear(this, gammaFactor), this);
  }
  convertLinearToGamma(gammaFactor) {
    return (this.copyLinearToGamma(this, gammaFactor), this);
  }
  getHex() {
    return ((255 * this.r) << 16) ^ ((255 * this.g) << 8) ^ (255 * this.b);
  }
  getHexString() {
    return "#" + ("000000" + this.getHex().toString(16)).slice(-6);
  }
  getHSL() {
    return this.target
      ? this.target.setRGB(this.r, this.g, this.b)
      : (this.target = new ColorHSL(this));
  }
  tween(color, time, ease, delay) {
    const _this = this;
    (_this.tweenObj || (_this.tweenObj = { v: 0 }), (_this.tweenObj.v = 0));
    let clone = this.clone();
    return TweenManager.tween(_this.tweenObj, { v: 1 }, time, ease, delay).onUpdate((_) => {
      _this.copy(clone).lerp(color, _this.tweenObj.v);
    });
  }
  offsetHSL(h, s, l) {
    return (
      this.target ? this.target.setRGB(this.r, this.g, this.b) : (this.target = new ColorHSL(this)),
      (this.target.h += h),
      (this.target.s += s),
      (this.target.l += l),
      this.target.getRGB(this)
    );
  }
  add(color) {
    return ((this.r += color.r), (this.g += color.g), (this.b += color.b), this);
  }
  addColors(color1, color2) {
    return (
      (this.r = color1.r + color2.r),
      (this.g = color1.g + color2.g),
      (this.b = color1.b + color2.b),
      this
    );
  }
  addScalar(s) {
    return ((this.r += s), (this.g += s), (this.b += s), this);
  }
  sub(color) {
    return (
      (this.r = Math.max(0, this.r - color.r)),
      (this.g = Math.max(0, this.g - color.g)),
      (this.b = Math.max(0, this.b - color.b)),
      this
    );
  }
  multiply(color) {
    return ((this.r *= color.r), (this.g *= color.g), (this.b *= color.b), this);
  }
  multiplyScalar(s) {
    return ((this.r *= s), (this.g *= s), (this.b *= s), this);
  }
  invert() {
    return ((this.r = 1 - this.r), (this.g = 1 - this.g), (this.b = 1 - this.b), this);
  }
  lerp(color, alpha, hz) {
    return (
      (this.r = Math.lerp(color.r, this.r, alpha, hz)),
      (this.g = Math.lerp(color.g, this.g, alpha, hz)),
      (this.b = Math.lerp(color.b, this.b, alpha, hz)),
      this
    );
  }
  equals(c) {
    return c.r === this.r && c.g === this.g && c.b === this.b;
  }
  fromArray(array, offset) {
    return (
      void 0 === offset && (offset = 0),
      (this.r = array[offset]),
      (this.g = array[offset + 1]),
      (this.b = array[offset + 2]),
      this
    );
  }
  toArray(array, offset) {
    return (
      void 0 === array && (array = []),
      void 0 === offset && (offset = 0),
      (array[offset] = this.r),
      (array[offset + 1] = this.g),
      (array[offset + 2] = this.b),
      array
    );
  }
  toRGBA(alpha = 1) {
    return `rgba(${Math.floor(255 * this.r)}, ${Math.floor(255 * this.g)}, ${Math.floor(255 * this.b)}, ${alpha})`;
  }
}
