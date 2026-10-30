Class(function CameraUIL() {
  ((this.UPDATE = "camera_uil_update"),
    (this.add = function (light, group) {
      return new CameraUILConfig(light, null === group ? null : group || UIL.global);
    }));
}, "static");
