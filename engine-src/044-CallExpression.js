Object.defineProperty(String.prototype, "strpos", {
  writable: !0,
  value: function (str) {
    return (console.warn("strpos deprecated: use .includes()"), this.includes(str));
  },
});
