Object.defineProperty(String.prototype, "equals", {
  writable: !0,
  value: function (str) {
    let compare = String(this);
    if (!Array.isArray(str)) return str === compare;
    for (let i = str.length - 1; i >= 0; i--) if (str[i] === compare) return !0;
    return !1;
  },
});
