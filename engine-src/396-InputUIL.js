Class(function InputUIL() {
  ((this.UPDATE = "inputUil_Update"),
    (this.create = function (name, group, decoupled) {
      return new InputUILConfig(name, null === group ? null : group || UIL.global, decoupled);
    }));
}, "static");
