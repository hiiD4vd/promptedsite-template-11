Math.sign = function (x) {
  return 0 === (x = +x) || isNaN(x) ? Number(x) : x > 0 ? 1 : -1;
};
