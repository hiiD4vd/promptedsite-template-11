class ColorHSL {
  constructor(h, s, l) {
    return void 0 === h && void 0 === s && void 0 === l
      ? this.setHSL(0, 0, 1)
      : void 0 === s && void 0 === l
        ? this.set(h)
        : void this.setHSL(h, s, l);
  }
  copy(colorHSL) {
    return ((this.h = colorHSL.h), (this.s = colorHSL.s), (this.l = colorHSL.l), this);
  }
  getRGB(target = new Color()) {
    function hue2rgb(p, q, t) {
      return (
        t < 0 && (t += 1),
        t > 1 && (t -= 1),
        t < 1 / 6
          ? p + 6 * (q - p) * t
          : t < 0.5
            ? q
            : t < 2 / 3
              ? p + 6 * (q - p) * (2 / 3 - t)
              : p
      );
    }
    let h = Math.euclideanModulo(this.h, 1),
      s = Math.clamp(this.s, 0, 1),
      l = Math.clamp(this.l, 0, 1);
    if (0 === s) target.r = target.g = target.b = l;
    else {
      let p = l <= 0.5 ? l * (1 + s) : l + s - l * s,
        q = 2 * l - p;
      ((target.r = hue2rgb(q, p, h + 1 / 3)),
        (target.g = hue2rgb(q, p, h)),
        (target.b = hue2rgb(q, p, h - 1 / 3)));
    }
    return target;
  }
  set(value) {
    return (
      value && value instanceof ColorHSL
        ? this.copy(value)
        : value && value instanceof Color
          ? this.setRGB(value.r, value.g, value.b)
          : "number" == typeof value
            ? this.setHex(value)
            : "string" == typeof value && this.setStyle(value),
      this
    );
  }
  setHex(hex) {
    const r = (((hex = Math.floor(hex)) >> 16) & 255) / 255,
      g = ((hex >> 8) & 255) / 255,
      b = (255 & hex) / 255;
    return this.setRGB(r, g, b);
  }
  setStyle(string) {
    return this.setHex(Number(string.replace("#", "0x")));
  }
  setRGB(r, g, b) {
    let hue,
      saturation,
      max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      lightness = (min + max) / 2;
    if (min === max) ((hue = 0), (saturation = 0));
    else {
      let delta = max - min;
      switch (
        ((saturation = lightness <= 0.5 ? delta / (max + min) : delta / (2 - max - min)), max)
      ) {
        case r:
          hue = (g - b) / delta + (g < b ? 6 : 0);
          break;
        case g:
          hue = (b - r) / delta + 2;
          break;
        case b:
          hue = (r - g) / delta + 4;
      }
      hue /= 6;
    }
    return ((this.h = hue), (this.s = saturation), (this.l = lightness), this);
  }
  setHSL(h, s, l) {
    return ((this.h = h), (this.s = s), (this.l = l), this);
  }
}
