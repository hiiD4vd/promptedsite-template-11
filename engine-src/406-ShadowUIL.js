Class(function ShadowUIL() {
  this.add = function (light, group) {
    return new ShadowUILConfig(light, null === group ? null : group || UIL.global);
  };
}, "static");
