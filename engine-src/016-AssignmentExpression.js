RNG.prototype.nextFloat = function () {
  return ((this.state = (this.a * this.state + this.c) % this.m), this.state / (this.m - 1));
};
