Object.defineProperty(String.prototype, "capitalize", {
  writable: !0,
  value: function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
});
