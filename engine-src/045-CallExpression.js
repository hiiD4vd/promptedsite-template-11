Object.defineProperty(String.prototype, "clip", {
  writable: !0,
  value: function (num, end = "") {
    return this.length > num
      ? this.slice(0, Math.max(0, num - end.length)).trim() + end
      : this.slice();
  },
});
