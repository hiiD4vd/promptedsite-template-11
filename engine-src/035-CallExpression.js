Object.defineProperty(Array.prototype, "remove", {
  writable: !0,
  value: function (element) {
    if (!this.indexOf) return;
    const index = this.indexOf(element);
    return ~index ? this.splice(index, 1) : void 0;
  },
});
