Math.rand = Math.random = function (min = 0, max = 1, precision = 0) {
  return 0 === arguments.length
    ? Math._random()
    : min === max
      ? min
      : 0 == precision
        ? Math.floor(Math._random() * (max + 1 - min) + min)
        : Math.round(min + Math._random() * (max - min), precision);
};
