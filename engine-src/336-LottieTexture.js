Class(
  function LottieTexture({
    path: path = null,
    json: json = null,
    dpr: dpr = 1,
    maxResolution: maxResolution = 2048,
  } = {}) {
    Inherit(this, Component);
    let _json,
      _texture,
      _animation,
      _ready = Promise.create();
    (!(async function () {
      (await LottieTexture.LOAD(),
        (_json =
          json ||
          (await (async function loadJSON(file) {
            if (!file) return;
            let req = LottieTexture.CACHE[file];
            req || ((LottieTexture.CACHE[file] = get(file)), (req = LottieTexture.CACHE[file]));
            return ((req = await req), req);
          })(path))),
        _json
          ? (!(function loadLottie() {
              const container = document.createElement("div");
              container.setAttribute("class", "ignore-html2canvas");
              let width = parseInt(_json.w * dpr),
                height = parseInt(_json.w * dpr),
                ratio = width / height;
              const maxSize = maxResolution;
              width > maxSize
                ? ((width = maxSize), (height = width / ratio))
                : height > maxSize && ((height = maxSize), (width = height * ratio));
              let lottieContainer = document.querySelector(".lottie-container");
              lottieContainer ||
                ((lottieContainer = document.createElement("div")),
                lottieContainer.setAttribute("class", "lottie-container"),
                (lottieContainer.style.width = "100vw"),
                (lottieContainer.style.height = "100%"),
                (lottieContainer.style.pointerEvents = "none"),
                (lottieContainer.style.overflow = "hidden"),
                (lottieContainer.style.position = "absolute"),
                (lottieContainer.style.top = "0px"),
                (lottieContainer.style.left = "0px"),
                document.body.appendChild(lottieContainer));
              ((container.style.width = `${width}px`),
                (container.style.height = `${height}px`),
                (container.style.opacity = 0),
                (container.style.position = "relative"),
                (container.style.top = 0),
                (container.style.left = 0),
                (container.style.pointerEvents = "none"),
                lottieContainer.appendChild(container),
                (_animation = window.lottie.loadAnimation({
                  container: container,
                  renderer: "canvas",
                  loop: !1,
                  autoplay: !1,
                  animationData: _json,
                  rendererSettings: { dpr: 1 },
                })));
            })(),
            (function initTexture() {
              ((_texture = new Texture(_animation.container)),
                (_texture.format = Texture.RGBAFormat),
                (_texture.minFilter = Texture.LINEAR),
                (_texture.magFilter = Texture.LINEAR),
                (_texture.generateMipmaps = !1),
                (_texture.loaded = !1),
                _animation.addEventListener("enterFrame", () => {
                  ((_texture.needsUpdate = !0), (_texture.loaded = !0));
                }));
            })(),
            _ready.resolve())
          : console.error("Missing json lottie."));
    })(),
      (this.onDestroy = async function () {
        (await _ready,
          _animation?.container?.parentElement &&
            _animation?.container?.parentElement.parentElement.removeChild(
              _animation?.container?.parentElement,
            ),
          _texture?.destroy(),
          _animation?.destroy(),
          (_texture = null),
          (_animation = null),
          (_json = null));
      }),
      this.get("ready", (_) => _ready),
      this.get("texture", (_) => _texture),
      this.get("animation", (_) => _animation),
      this.get("json", (_) => _json));
  },
  (_) => {
    ((LottieTexture.LOADING = !1),
      (LottieTexture.LOADED = Promise.create()),
      (LottieTexture.CACHE = {}),
      (LottieTexture.QUALITY = "high"),
      (LottieTexture.LOAD = async function () {
        if (LottieTexture.LOADING) return LottieTexture.LOADED;
        ((LottieTexture.LOADING = !0),
          await AssetLoader.loadAssets(["assets/js/lib/lottie.min.js"]),
          await AssetLoader.waitForLib("lottie"));
        const quality = LottieTexture.QUALITY;
        return (window.lottie.setQuality(quality), LottieTexture.LOADED.resolve(), !0);
      }));
  },
);
