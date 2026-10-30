Object.defineProperty(Array.prototype, "random", {
  writable: !0,
  value: function (range) {
    let value = Math.random(0, this.length - 1);
    if ((arguments.length && !this.randomStore && Array.storeRandom(this), !this.randomStore))
      return this[value];
    if ((range > this.length - 1 && (range = this.length), range > 1)) {
      for (; ~this.randomStore.indexOf(value);) (value += 1) > this.length - 1 && (value = 0);
      (this.randomStore.push(value), this.randomStore.length >= range && this.randomStore.shift());
    }
    return this[value];
  },
});
