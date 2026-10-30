class GeometryAttribute {
  constructor(_array, _itemSize, _meshPerAttribute, _dynamic = !1) {
    ((this.array = _array),
      (this.itemSize = _itemSize),
      (this.count = void 0 !== _array ? _array.length / _itemSize : 0),
      (this.dynamic = _dynamic),
      (this.updateRange = { offset: 0, count: -1 }),
      (this.meshPerAttribute = _meshPerAttribute),
      (this.destroyDataAfterUpload = !!Geometry.defaultDestroyDataAfterUpload));
  }
  setArray(array) {
    let newCount = void 0 !== array ? array.length / this.itemSize : 0;
    (newCount != this.count && (this.needsNewBuffer = !0),
      (this.array = array),
      (this.count = newCount),
      (this.needsUpdate = !0));
  }
  clone(noCopy) {
    return noCopy
      ? this
      : (this.array.deleted &&
          !this.array.length &&
          (this.array.copyHasWarned ||
            (console.error("Attempt to copy/clone a deleted geometry attribute", this),
            (this.array.copyHasWarned.hasWarned = !0))),
        new GeometryAttribute(new Float32Array(this.array), this.itemSize, this.meshPerAttribute));
  }
  getX(index) {
    return this.array[index * this.itemSize];
  }
  setX(index, x) {
    return ((this.array[index * this.itemSize] = x), this);
  }
  getY(index) {
    return this.array[index * this.itemSize + 1];
  }
  setY(index, y) {
    return ((this.array[index * this.itemSize + 1] = y), this);
  }
  getZ(index) {
    return this.array[index * this.itemSize + 2];
  }
  setZ(index, z) {
    return ((this.array[index * this.itemSize + 2] = z), this);
  }
  getW(index) {
    return this.array[index * this.itemSize + 3];
  }
  setW(index, w) {
    return ((this.array[index * this.itemSize + 3] = w), this);
  }
  setXY(index, x, y) {
    return (
      (index *= this.itemSize),
      (this.array[index + 0] = x),
      (this.array[index + 1] = y),
      this
    );
  }
  setXYZ(index, x, y, z) {
    return (
      (index *= this.itemSize),
      (this.array[index + 0] = x),
      (this.array[index + 1] = y),
      (this.array[index + 2] = z),
      this
    );
  }
  setXYZW(index, x, y, z, w) {
    return (
      (index *= this.itemSize),
      (this.array[index + 0] = x),
      (this.array[index + 1] = y),
      (this.array[index + 2] = z),
      (this.array[index + 3] = w),
      this
    );
  }
  releaseData() {
    this.dynamic || ((this.array = this.array.slice(0, 0)), (this.array.deleted = !0));
  }
}
