class ColorLAB {
  constructor(l, a, b) {
    return void 0 === l && void 0 === a && void 0 === b
      ? this.setLAB(100, 0, 0)
      : void 0 === a && void 0 === b
        ? this.set(l)
        : void this.setLAB(l, a, b);
  }
  copy(colorLAB) {
    return ((this.l = colorLAB.l), (this.a = colorLAB.a), (this.b = colorLAB.b), this);
  }
  deltaECIE94(colorLAB) {
    var deltaL = this.l - colorLAB.l,
      deltaA = this.a - colorLAB.a,
      deltaB = this.b - colorLAB.b,
      c1 = Math.sqrt(this.a * this.a + this.b * this.b),
      deltaC = c1 - Math.sqrt(colorLAB.a * colorLAB.a + colorLAB.b * colorLAB.b),
      deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC,
      deltaLKlsl = deltaL / 1,
      deltaCkcsc = deltaC / (1 + 0.045 * c1),
      deltaHkhsh = (deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH)) / (1 + 0.015 * c1),
      i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
    return i < 0 ? 0 : Math.sqrt(i);
  }
  getRGB(target = new Color()) {
    let y = (this.l + 16) / 116,
      x = this.a / 500 + y,
      z = y - this.b / 200;
    return (
      (x = 0.95047 * (x * x * x > 0.008856 ? x * x * x : (x - 16 / 116) / 7.787)),
      (y = y * y * y > 0.008856 ? y * y * y : (y - 16 / 116) / 7.787),
      (z = 1.08883 * (z * z * z > 0.008856 ? z * z * z : (z - 16 / 116) / 7.787)),
      (target.r = 3.2406 * x + -1.5372 * y + -0.4986 * z),
      (target.g = -0.9689 * x + 1.8758 * y + 0.0415 * z),
      (target.b = 0.0557 * x + -0.204 * y + 1.057 * z),
      (target.r = Math.clamp(
        target.r > 0.0031308 ? 1.055 * Math.pow(target.r, 1 / 2.4) - 0.055 : 12.92 * target.r,
      )),
      (target.g = Math.clamp(
        target.g > 0.0031308 ? 1.055 * Math.pow(target.g, 1 / 2.4) - 0.055 : 12.92 * target.g,
      )),
      (target.b = Math.clamp(
        target.b > 0.0031308 ? 1.055 * Math.pow(target.b, 1 / 2.4) - 0.055 : 12.92 * target.b,
      )),
      target
    );
  }
  set(value) {
    return (
      value && value instanceof ColorLAB
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
    let x, y, z;
    return (
      (x =
        (0.4124 * (r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92) +
          0.3576 * (g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92) +
          0.1805 * (b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92)) /
        0.95047),
      (y = 0.2126 * r + 0.7152 * g + 0.0722 * b),
      (z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883),
      (x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116),
      (y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116),
      (z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116),
      (this.l = 116 * y - 16),
      (this.a = 500 * (x - y)),
      (this.b = 200 * (y - z)),
      this
    );
  }
  setLAB(l, a, b) {
    return ((this.l = l), (this.a = a), (this.b = b), this);
  }
}
