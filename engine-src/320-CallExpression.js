Module(function GPUCalculations() {
  this.exports = {
    hash: function hash() {
      var imageHash = 0,
        canvas = document.createElement("canvas");
      if (null != canvas) {
        var imageData = (function drawImage(canvas) {
          ((canvas.width = 67), (canvas.height = 67));
          var ctx = canvas.getContext("2d", { alpha: !0 });
          if (null != ctx)
            return (
              (ctx.imageSmoothingQuality = "low"),
              (ctx.imageSmoothingEnabled = !0),
              (ctx.globalCompositeOperation = "source-over"),
              (ctx.globalAlpha = 1),
              (ctx.miterLimit = 1 / 0),
              (ctx.filter = "none"),
              (ctx.lineCap = "butt"),
              (ctx.lineDashOffset = 0),
              (ctx.lineJoin = "miter"),
              (ctx.font = "10pt Arial"),
              (ctx.lineWidth = 2),
              void 0 !== ctx.setLineDash && ctx.setLineDash([10, 20]),
              (ctx.shadowColor = "black"),
              (ctx.shadowOffsetX = -3),
              (ctx.shadowOffsetY = -5),
              ctx.translate(canvas.width / 2, canvas.height / 2),
              ctx.rotate(0.8901179),
              (ctx.fillStyle = "green"),
              (ctx.textAlign = "center"),
              (ctx.textBaseline = "middle"),
              ctx.fillText("*51Degrees*", 0, 0),
              ctx.beginPath(),
              (ctx.shadowColor = "yellow"),
              (ctx.shadowBlur = 1),
              (ctx.shadowOffsetX = 1),
              (ctx.shadowOffsetY = 1),
              (ctx.strokeStyle = "red"),
              (ctx.fillStyle = "rgba(0, 0, 255, 0.6)"),
              void 0 === ctx.ellipse
                ? ctx.arc(0, 0, 25, 0, 2 * Math.PI)
                : ctx.ellipse(0, 0, 25, 15, Math.PI / 4, 0, 2 * Math.PI),
              ctx.fill(),
              ctx.stroke(),
              canvas.toDataURL()
            );
        })(canvas);
        imageData &&
          (imageHash = (function fnvHash(str) {
            for (var h = 2166136261, i = 0; i < str.length; ++i)
              ((h ^= str.charCodeAt(i)),
                (h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)));
            return h >>> 0;
          })(imageData));
      }
      return ((Global.iOSGPUHASHVAL = imageHash), imageHash);
    },
    primeTest: function primeTest() {
      let results = [];
      function getPrime() {
        return (function largest_prime_factor(n) {
          return factors(n).filter(primep).pop();
        })(1e12);
      }
      function factors(n) {
        var i,
          out = [],
          sqrt_n = Math.sqrt(n);
        for (i = 2; i <= sqrt_n; i++) n % i == 0 && out.push(i);
        return out;
      }
      function primep(n) {
        return 0 === factors(n).length;
      }
      for (let i = 0; i < 3; i++) {
        let time = performance.now();
        (getPrime(), results.push(10 * (performance.now() - time)));
      }
      return (results.sort((a, b) => a - b), results[0]);
    },
  };
});
