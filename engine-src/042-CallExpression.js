(function () {
  function notRegExp(it) {
    if (
      (function isRegExp(it) {
        if (!("object" == typeof it ? null !== it : "function" == typeof it)) return !1;
        var match = it["undefined" != typeof Symbol ? Symbol.match : "match"];
        return void 0 !== match
          ? !!match
          : "RegExp" === Object.prototype.toString.call(it).slice(8, -1);
      })(it)
    )
      throw new Error(
        "First argument to String.prototype.includes must not be a regular expression",
      );
    return it;
  }
  Object.defineProperty(String.prototype, "includes", {
    writable: !0,
    value: function (str) {
      if (!Array.isArray(str)) return !!~this.indexOf(notRegExp(str));
      for (let i = str.length - 1; i >= 0; i--) if (~this.indexOf(notRegExp(str[i]))) return !0;
      return !1;
    },
  });
})();
