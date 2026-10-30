Math.round = function (value, precision = 0) {
  let p = Math.pow(10, precision);
  return Math._round(value * p) / p;
};
