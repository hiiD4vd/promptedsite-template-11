class RayManager {
  constructor(origin, direction, near = 0, far = 1 / 0) {
    ((this.ray = new Ray(origin, direction)),
      (this.near = near),
      (this.far = far),
      (this.params = { Mesh: {}, Points: { threshold: 1 } }));
  }
  set(origin, direction) {
    return (this.ray.set(origin, direction), this);
  }
  setFromCamera(coords, camera) {
    camera.isPerspective
      ? (this.ray.origin.setFromMatrixPosition(camera.matrixWorld),
        this.ray.direction
          .set(coords.x, coords.y, 0.5)
          .unproject(camera)
          .sub(this.ray.origin)
          .normalize())
      : (this.ray.origin
          .set(coords.x, coords.y, (camera.near + camera.far) / (camera.near - camera.far))
          .unproject(camera),
        this.ray.direction.set(0, 0, -1).transformDirection(camera.matrixWorld));
  }
  _ascSort(a, b) {
    return a.distance - b.distance;
  }
  _intersectObject(object, raycaster, intersects, recursive, forceAllVisible) {
    if (
      (!1 !== object.visible || forceAllVisible) &&
      (object.raycast && object.raycast(raycaster, intersects), !0 === recursive)
    ) {
      let children = object.children;
      for (let i = 0, l = children.length; i < l; i++)
        this._intersectObject(children[i], raycaster, intersects, !0);
    }
  }
  intersectObject(object, recursive, optionalTarget, forceAllVisible) {
    let intersects = optionalTarget || [];
    return (
      this._intersectObject(object, this, intersects, recursive, forceAllVisible),
      intersects.sort(this._ascSort),
      intersects
    );
  }
  intersectObjects(objects, recursive, optionalTarget) {
    let intersects = optionalTarget || [];
    for (let i = 0, l = objects.length; i < l; i++)
      this._intersectObject(objects[i], this, intersects, recursive);
    return (intersects.sort(this._ascSort), intersects);
  }
}
