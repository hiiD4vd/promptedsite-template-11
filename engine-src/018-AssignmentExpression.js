Math.randomSeed = function (min = 0, max = 1, precision = 0) {
  return 0 === arguments.length
    ? Math._randomSeed.nextFloat()
    : min === max
      ? min
      : 0 == precision
        ? Math.floor(Math._randomSeed.nextFloat() * (max + 1 - min) + min)
        : Math.round(min + Math._randomSeed.nextFloat() * (max - min), precision);
};
