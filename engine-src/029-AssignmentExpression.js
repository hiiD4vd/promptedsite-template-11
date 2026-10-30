Math.lerp = function (target, value, alpha, calcHz = !0) {
  return (
    value +
    (target - value) *
      (alpha = calcHz ? Math.framerateNormalizeLerpAlpha(alpha) : Math.clamp(alpha))
  );
};
