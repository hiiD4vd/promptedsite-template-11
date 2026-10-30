{
  const mainThread = !!window.document;
  Math.framerateNormalizeLerpAlpha = function (t) {
    return (
      (t = Math.clamp(t)),
      mainThread ? 1 - Math.exp(Math.log(1 - t) * Render.FRAME_HZ_MULTIPLIER) : t
    );
  };
}
