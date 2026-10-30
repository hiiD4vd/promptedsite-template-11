Class(function LinkedList() {
  var prototype = LinkedList.prototype;
  ((this.length = 0),
    (this.first = null),
    (this.last = null),
    (this.current = null),
    (this.prev = null),
    "function" == typeof Symbol
      ? ((this.prevKey = Symbol("prev")), (this.nextKey = Symbol("next")))
      : ((this.prevKey = "__prev"), (this.nextKey = "__next")),
    void 0 === prototype.push &&
      ((prototype.push = function (obj) {
        (obj[this.nextKey] && this.remove(obj),
          this.first
            ? ((obj[this.nextKey] = this.first),
              (obj[this.prevKey] = this.last),
              (this.last[this.nextKey] = obj),
              (this.last = obj))
            : ((this.first = obj),
              (this.last = obj),
              (obj[this.prevKey] = obj),
              (obj[this.nextKey] = obj)),
          this.length++);
      }),
      (prototype.remove = function (obj) {
        obj &&
          obj[this.nextKey] &&
          (this.length <= 1
            ? this.empty()
            : (obj == this.first
                ? ((this.first = obj[this.nextKey]),
                  (this.last[this.nextKey] = this.first),
                  (this.first[this.prevKey] = this.last))
                : obj == this.last
                  ? ((this.last = obj[this.prevKey]),
                    (this.last[this.nextKey] = this.first),
                    (this.first[this.prevKey] = this.last))
                  : ((obj[this.prevKey][this.nextKey] = obj[this.nextKey]),
                    (obj[this.nextKey][this.prevKey] = obj[this.prevKey])),
              this.length--),
          (obj[this.prevKey] = null),
          (obj[this.nextKey] = null));
      }),
      (prototype.empty = function () {
        ((this.first = null),
          (this.last = null),
          (this.current = null),
          (this.prev = null),
          (this.length = 0));
      }),
      (prototype.start = function () {
        return ((this.current = this.first), (this.prev = this.current), this.current);
      }),
      (prototype.next = function () {
        if (
          this.current &&
          ((this.current = this.current[this.nextKey]),
          1 != this.length && this.prev[this.nextKey] != this.first)
        )
          return ((this.prev = this.current), this.current);
      }),
      (prototype.destroy = function () {
        return (Utils.nullObject(this), null);
      })));
});
