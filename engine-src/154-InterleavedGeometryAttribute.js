class InterleavedGeometryAttribute {
  constructor(interleavedBuffer, itemSize, offset) {
    ((this.data = interleavedBuffer),
      (this.itemSize = itemSize),
      (this.offset = offset),
      (this.isInterleaved = !0));
  }
  get count() {
    return this.data.count;
  }
}
