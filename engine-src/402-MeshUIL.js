Class(function MeshUIL() {
  Inherit(this, Component);
  ((this.exists = {}),
    (this.UPDATE = "mesh_uil_update"),
    (this.add = function (mesh, group) {
      return (
        (group = null === group ? null : group) && (mesh.__uilGroup = group),
        new MeshUILConfig(mesh, group)
      );
    }));
}, "static");
