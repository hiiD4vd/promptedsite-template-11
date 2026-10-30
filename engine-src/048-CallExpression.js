Object.defineProperty(String.prototype, "replaceAt", {
  writable: !0,
  value: function (index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
  },
});
