Hydra.ready(function () {
  let box;
  function updateSocialStage() {
    (Mobile.isAllowNativeScroll ||
      (document.body.parentElement.scrollTop = document.body.scrollTop = 0),
      (document.documentElement.style.width = document.body.style.width = `${Stage.width}px`),
      (document.documentElement.style.height = document.body.style.height = `${Stage.height}px`));
  }
  ((window.__window = $(window)),
    (window.__document = $(document)),
    (window.__body = $(document.getElementsByTagName("body")[0])),
    (window.Stage = window.Stage && window.Stage.style ? $(window.Stage) : __body.create("#Stage")),
    Object.defineProperties(Stage, {
      width: {
        get() {
          if (window.visualViewport)
            return Math.round(window.visualViewport.width * window.visualViewport.scale);
          let width;
          return (
            box && (width = box.getBoundingClientRect().width),
            width ||
              window.innerWidth ||
              document.body.clientWidth ||
              document.documentElement.offsetWidth
          );
        },
      },
      height: {
        get() {
          if (Stage.isNormalMobileScroll) {
            let height = Stage.div.offsetHeight;
            if (height) return height;
          }
          if (window.visualViewport)
            return Math.round(window.visualViewport.height * window.visualViewport.scale);
          let height;
          return (
            box && (height = box.getBoundingClientRect().height),
            height ??
              (window.innerHeight ||
                document.body.clientHeight ||
                document.documentElement.offsetHeight)
          );
        },
      },
    }),
    "social" !== Device.system.browser ||
      "ios" !== Device.system.os ||
      window.visualViewport ||
      ((box = document.createElement("div")),
      (box.style.position = "fixed"),
      (box.style.top = box.style.left = box.style.right = box.style.bottom = "0px"),
      (box.style.zIndex = "-1"),
      (box.style.opacity = "0"),
      (box.style.pointerEvents = "none"),
      document.body.appendChild(box),
      Events.emitter._addEvent(Events.RESIZE, updateSocialStage, Stage)),
    "social" === Device.system.browser &&
      (Stage.height >= screen.height || Stage.width >= screen.width) &&
      setTimeout(updateSocialStage, 1e3),
    window.HYDRA_MOBILE_SCROLL && Device.mobile
      ? ((Stage.isNormalMobileScroll = !0), Stage.size("100%", "100vh"))
      : Stage.size("100%"),
    (Stage.__useFragment = !0));
});
