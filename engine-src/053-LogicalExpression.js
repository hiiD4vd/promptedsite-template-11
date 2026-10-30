"undefined" == typeof WeakRef &&
  (function () {
    var targetProp = "undefined" != typeof Symbol ? Symbol("WeakRefTarget") : "@@WeakRefTarget";
    function WeakRef(target) {
      this[targetProp] = target;
    }
    ((WeakRef.prototype.deref = function () {
      return this[targetProp];
    }),
      (window.WeakRef = WeakRef));
  })();
