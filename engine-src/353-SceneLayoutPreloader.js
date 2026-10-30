Class(function SceneLayoutPreloader(_name) {
  Inherit(this, Component);
  function findMatch(src, arr) {
    return (
      !(!src || src.startsWith(".")) &&
      ((src = src.trim()).startsWith("/") && (src = src.slice(1)),
      arr.find(({ filename: filename }) => filename.includes(src)))
    );
  }
  this.load = function (name) {
    let promise = Promise.create(),
      array = [],
      keys = UILStorage.getKeys(),
      i = 0,
      worker = new Render.Worker((_) => {
        let key = keys[i];
        if (!key) return (worker.stop(), void Promise.all(array).then(promise.resolve));
        if (key.includes(name)) {
          let val = UILStorage.get(key);
          if (!val || !val.includes) return i++;
          if (
            (key.includes("geometry") &&
              ("{" == val.charAt(0) && (val = JSON.parse(val).src),
              val.includes(".json") || val.includes(".bin") || (val += ".json"),
              val.includes("assets/") || (val = "assets/geometry/" + val),
              findMatch(val.split("assets/geometry/")[1], UIL_ASSETS_GEOMETRIES) &&
                array.push(GeomThread.loadGeometry(Assets.getPath(val), null, !0))),
            val.includes(".json") || val.includes(".bin"))
          )
            (val.includes("assets/") || (val = "assets/geometry/" + val),
              findMatch(val.split("assets/geometry/")[1], UIL_ASSETS_GEOMETRIES) &&
                array.push(fetch(Assets.getPath(val)).catch((e) => {})));
          else if (val.includes("src")) {
            let obj = JSON.parse(val),
              src = obj.src;
            if (obj.compressed)
              if ("ktx2" === obj.compressed) {
                let src0 = src.split(".")[0];
                src = src0 + ".ktx2";
              } else {
                let ext,
                  src0 = src.split(".")[0],
                  src1 = src0.split("/");
                ((ext = Renderer.extensions.etc1
                  ? "astc"
                  : Renderer.extensions.pvrtc
                    ? "pvrtc"
                    : Renderer.extensions.astc
                      ? "astc"
                      : "dxt"),
                  (src = src0 + "/" + src1[src1.length - 1] + "-" + ext + ".ktx"));
              }
            findMatch(src.split("assets/images/")[1], UIL_ASSETS_TEXTURES) &&
              array.push(fetch(Assets.getPath(src)).catch((e) => {}));
          }
        }
        i++;
      }, 1);
    return promise;
  };
}, "static");
