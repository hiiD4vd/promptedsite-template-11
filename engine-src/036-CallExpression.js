Object.defineProperty(Array.prototype, "last", {
  writable: !0,
  value: function () {
    return this[this.length - 1];
  },
});
