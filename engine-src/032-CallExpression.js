Object.defineProperty(Array.prototype, "shuffle", {
  writable: !0,
  value: function () {
    let randomIndex,
      currentIndex = this.length;
    for (; 0 != currentIndex;)
      ((randomIndex = Math.floor(Math.random() * currentIndex)),
        currentIndex--,
        ([this[currentIndex], this[randomIndex]] = [this[randomIndex], this[currentIndex]]));
    return this;
  },
});
