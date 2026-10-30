Object.defineProperty(String.prototype, "replaceAll", {
  writable: !0,
  value: function (find, replace) {
    return this.split(find).join(replace);
  },
});
