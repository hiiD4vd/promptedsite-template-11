Math.map = Math.range = function (value, oldMin = -1, oldMax = 1, newMin = 0, newMax = 1, isClamp) {
  const newValue = ((value - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
  return isClamp
    ? Math.clamp(newValue, Math.min(newMin, newMax), Math.max(newMin, newMax))
    : newValue;
};
