Array.prototype.flat ||
  Object.defineProperty(Array.prototype, "flat", {
    configurable: !0,
    value: function flat() {
      var depth = isNaN(arguments[0]) ? 1 : Number(arguments[0]);
      return depth
        ? Array.prototype.reduce.call(
            this,
            function (acc, cur) {
              return (
                Array.isArray(cur) ? acc.push.apply(acc, flat.call(cur, depth - 1)) : acc.push(cur),
                acc
              );
            },
            [],
          )
        : Array.prototype.slice.call(this);
    },
    writable: !0,
  });
