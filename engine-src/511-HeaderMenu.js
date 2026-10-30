Class(function HeaderMenu(_params, ...restArgs) {
  const _this = this;
  (Inherit(_this, Element, "nav"),
    Inherit(_this, XComponent),
    (_this.fragName = "HeaderMenu"),
    (_this.contexts = "Element, 'nav'"),
    (_this.params = _params),
    (_this.args = arguments),
    (this.isFragment = !0));
  var _promises = [];
  !(async function () {
    (_this.element && (_this.element.onMountedHook = (_) => _this.onMounted?.()),
      _this.initClass(FragUIHelper, {
        _type: "UI",
        refName: "unnamed",
        children: [
          {
            className: "header__background",
            _type: "div",
            refName: "background",
            children: [
              {
                width: "100%",
                height: "100%",
                viewBox: "0 0 100 100",
                preserveAspectRatio: "none",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg",
                _type: "svg",
                refName: "svg",
                children: [
                  {
                    className: "border-path",
                    stroke: "#111111",
                    "stroke-width": 3,
                    vectorEffect: "non-scaling-stroke",
                    _type: "path",
                    refName: "pathTop",
                    children: [],
                  },
                  {
                    className: "border-path",
                    stroke: "#111111",
                    "stroke-width": 3,
                    vectorEffect: "non-scaling-stroke",
                    _type: "path",
                    refName: "pathRight",
                    children: [],
                  },
                  {
                    className: "border-path",
                    stroke: "#111111",
                    "stroke-width": 3,
                    vectorEffect: "non-scaling-stroke",
                    _type: "path",
                    refName: "pathBottom",
                    children: [],
                  },
                  {
                    className: "border-path",
                    stroke: "#111111",
                    "stroke-width": 3,
                    vectorEffect: "non-scaling-stroke",
                    _type: "path",
                    refName: "pathLeft",
                    children: [],
                  },
                ],
              },
            ],
          },
          {
            className: "header__content",
            _type: "div",
            refName: "unnamed",
            children: [
              {
                className: "header__link active",
                _type: "div",
                refName: "experience",
                children: [
                  {
                    _type: "span",
                    _innerText: "EXPERIENCE",
                    refName: "experienceText",
                    children: [],
                  },
                ],
              },
              {
                className: "header__ornament",
                width: 42,
                height: 12,
                viewBox: "0 0 42 12",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg",
                _type: "svg",
                refName: "ornament",
                children: [
                  {
                    d: "M 21 0 C 21 3.5, 25 6, 30 6 C 25 6, 21 8.5, 21 12 C 21 8.5, 17 6, 12 6 C 17 6, 21 3.5, 21 0 Z",
                    fill: "#A78BFA",
                    _type: "path",
                    refName: "unnamed",
                    children: [],
                  },
                ],
              },
              {
                className: "header__link",
                _type: "div",
                refName: "collection",
                children: [
                  {
                    _type: "span",
                    _innerText: "COLLECTION",
                    refName: "collectionText",
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      }),
      _this.layout?.getAllLayers && (_this.layers = await _this.layout.getAllLayers()));
    let onInit = _this.onInit;
    function animateIn() {
      _this.background.tween({ scaleX: 1 }, 1100, "easeOutCubic", 4e3);
      [_this.experience, _this.ornament, _this.collection].forEach((el, i) => {
        let delay = 4200;
        ((delay += 100 * i), el.tween({ opacity: 1, y: 0 }, 800, "easeOutCubic", delay));
      });
    }
    function onChangeScrollY() {
      Math.abs(_this.getSync("Story/scrollY") || 0) > (_this.getSync("TasteScene/y") || 0) - 0.4
        ? _this.set("active", "collection")
        : _this.set("active", "experience");
    }
    function onChangeActive(value) {
      ("experience" === value
        ? (_this.experience.classList().add("active"),
          _this.collection.classList().remove("active"))
        : (_this.experience.classList().remove("active"),
          _this.collection.classList().add("active")),
        _this.experience.hit.attr("aria-pressed", String("experience" === value)),
        _this.collection.hit.attr("aria-pressed", String("collection" === value)));
    }
    function perlin(x, y) {
      return ((x += Render.TIME), ((43758.5453 * Math.sin(12.9898 * x + 78.233 * y)) % 1) * 0.8);
    }
    function loop() {
      let _topD = "M0 0";
      for (let i = 0; i < 11; i++) {
        const progress = i / 10;
        let x = Math.range(progress, 0, 1, 0, 100),
          y = 0;
        _topD += `L${x} ${y + perlin(x, y)}`;
      }
      let _rightD = "M100 0";
      for (let i = 0; i < 6; i++) {
        const progress = i / 5;
        let x = 100,
          y = Math.range(progress, 0, 1, -3, 103);
        _rightD += `L${x + 0.2 * perlin(x, y)} ${y}`;
      }
      let _bottomD = "M0 100";
      for (let i = 0; i < 11; i++) {
        const progress = i / 10;
        let x = Math.range(progress, 0, 1, 0, 100),
          y = 100;
        _bottomD += `L${x} ${y + perlin(x, y)}`;
      }
      let _leftD = "M0 0";
      for (let i = 0; i < 6; i++) {
        const progress = i / 5;
        let y = Math.range(progress, 0, 1, -3, 103),
          x = 0;
        _leftD += `L${x + 0.2 * perlin(x, y)} ${y}`;
      }
      (_this.pathTop.div.setAttribute("d", _topD),
        _this.pathRight.div.setAttribute("d", _rightD),
        _this.pathBottom.div.setAttribute("d", _bottomD),
        _this.pathLeft.div.setAttribute("d", _leftD));
    }
    function suppressAudioUntilScrollSettles() {
      const manager = AudioManager.instance();
      _this.set("Story/suppressTransitionAudio", !0);
      for (const [id, chain] of Object.entries(manager.effectChains))
        ["drone", "vortexFocus"].includes(id) || chain.setGain(0, { smoothing: 0.4 });
      _this.startRender(() => {
        if (Math.abs(Global.SCROLL.delta.y) <= 10) {
          _this.clearRenders();
          for (const chain of Object.values(manager.effectChains))
            chain.setGain(1, { smoothing: 0.1 });
          _this.set("Story/suppressTransitionAudio", !1);
        }
      });
    }
    (_this.set("active", "experience"),
      (_this.onMounted = function () {
        (_this.startRender(loop, 8),
          Config.NO_UI && _this.element.hide(),
          _this.experience.interact({
            clickCallback: () => {
              (Story.scrollToTop(),
                GoogleAnalytics.track("menu_experience"),
                suppressAudioUntilScrollSettles());
            },
            seoText: "experience",
            seoLink: "#",
            role: "button",
          }));
        let collectionTimerId = null;
        (_this.collection.interact({
          clickCallback: () => {
            collectionTimerId && clearTimeout(collectionTimerId);
            const scrollInstance = _this.getSync("Story/scroll"),
              y = _this.getSync("ProductsScene/yPixel") + (Device.mobile ? -50 : 50) || 0,
              diff = Math.abs(scrollInstance.y - y);
            let time = Math.range(diff, Stage.height, 10 * Stage.height, 800, 3e3, !0);
            ((scrollInstance.enabled = !1),
              scrollInstance?.scrollTo?.(y, "y", time, "easeOutCubic"),
              (collectionTimerId = _this.delayedCall(() => (scrollInstance.enabled = !0), 200)),
              GoogleAnalytics.track("menu_collection"),
              AudioUtils.playClick(),
              suppressAudioUntilScrollSettles());
          },
          seoText: "collection",
          seoLink: "#",
          role: "button",
        }),
          _this.element.hover((e) => {
            const isOver = "over" === e.action;
            _this
              .getSync("Story/composite")
              ?.tween?.("uMenuHover", isOver ? 1 : 0, 800, "easeOutCubic");
          }),
          _this.bind("active", onChangeActive),
          _this.bind("Story/scrollY", onChangeScrollY),
          _this.bind("TasteScene/y", onChangeScrollY),
          (function animateSet() {
            _this.background.transform({ scaleX: 0 });
            [_this.experience, _this.ornament, _this.collection].forEach((el) => {
              (el.css({ opacity: 0 }), el.transform({ y: 20 }));
            });
          })(),
          _this.listen("Global/loaderFinished", animateIn));
      }),
      (onInit = _this.onInit === onInit ? null : _this.onInit));
    for (let key in _this)
      if (_this[key]?.then) {
        let store = _this[key];
        (store.then((val) => (_this[key] = val)), _promises.push(store));
      }
    (_promises.length && (await Promise.all(_promises)),
      (_promises = null),
      _this.flag?.("__ready", !0),
      onInit ||
        "HeaderMenu" !== _this.fragName ||
        !_this.onInit ||
        _this.onInit.calledInit ||
        (onInit = _this.onInit),
      onInit && (onInit.calledInit || ((onInit.calledInit = !0), onInit())));
  })();
});
