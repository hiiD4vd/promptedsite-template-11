class InterleavedBuffer {
  constructor(array, stride) {
    ((this.array = array),
      (this.stride = stride),
      (this.count = array ? array.length / stride : 0),
      (this.isInterleaved = !0),
      (this.needsUpdate = !1),
      (this.dynamic = !1),
      (this.updateRange = { offset: 0, count: -1 }));
  }
  setArray(array) {
    let newCount = void 0 !== array ? array.length / this.stride : 0;
    (newCount !== this.count && (this.needsNewBuffer = !0),
      (this.array = array),
      (this.count = newCount),
      (this.needsUpdate = !0));
  }
}
