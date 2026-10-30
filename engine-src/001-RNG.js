function RNG(seed) {
  ((this.m = 2147483648),
    (this.a = 1103515245),
    (this.c = 12345),
    (this.state = seed || Math.floor(Math.random() * (this.m - 1))));
}
