Class(function GLUIUtils() {
  const _this = this;
  ((_this.setRetinaMode = function ($obj, retinaMode, parent) {
    if (
      (RenderManager.type === RenderManager.WEBVR && (retinaMode = !1),
      parent || (parent = ($obj.anchor && $obj.anchor._parent) || $obj.group._parent))
    )
      if (retinaMode) {
        let gluiToRTScene,
          p = parent;
        for (; p;) (p.glSceneEnabled && (gluiToRTScene = p), (p = p.parent));
        (gluiToRTScene ? gluiToRTScene.glScene.add($obj) : GLUI.Scene.add($obj),
          parent.add($obj.anchor),
          ($obj.anchor.retinaAnchorFor = $obj),
          $obj.group.asyncPromise &&
            !$obj.anchor.asyncPromise &&
            ($obj.anchor.asyncPromise = $obj.group.asyncPromise),
          ($obj.anchor.position.equals($obj.group.position) &&
            $obj.anchor.scale.equals($obj.group.scale) &&
            $obj.anchor.quaternion.equals($obj.group.quaternion)) ||
            (($obj.isDirty = !0),
            $obj.mesh && $obj.mesh.onBeforeRender && $obj.mesh.onBeforeRender()));
      } else
        (_this.isRetinaMode($obj) &&
          (parent.remove($obj.anchor),
          GLUI.Scene.remove($obj),
          ($obj.anchor._parent = null),
          ($obj.group.visible = parent.determineVisible()),
          "boolean" == typeof $obj.isDirty && $obj.mesh && $obj.mesh.onBeforeRender
            ? (($obj.isDirty = !0), $obj.mesh.onBeforeRender())
            : ($obj.group.position.setScalar(0),
              $obj.group.quaternion.set(0, 0, 0, 1),
              $obj.group.scale.setScalar(1)),
          ($obj.deferred = !1),
          ($obj.parent = null)),
          parent.add($obj.group));
  }),
    (_this.isRetinaMode = function ($obj) {
      return (
        RenderManager.type !== RenderManager.WEBVR &&
        $obj.anchor &&
        $obj.anchor._parent &&
        $obj.parent === GLUI.Scene
      );
    }));
}, "static");
