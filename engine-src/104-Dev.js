Class(function Dev() {
  const _this = this;
  let _inter, _timerName;
  function handleRenderCallbackError(info) {
    if (window.RemoteLogger)
      return void Events.emitter._removeEvent(
        Render.RENDER_CALLBACK_ERROR,
        handleRenderCallbackError,
      );
    let { callback: callback, error: error } = info;
    console.error("Error in render callback", callback, error);
  }
  (Events.emitter._addEvent(Render.RENDER_CALLBACK_ERROR, handleRenderCallbackError),
    (this.emulator =
      Device.mobile &&
      navigator.platform &&
      navigator.platform.toLowerCase().includes(["mac", "windows"])),
    (this.expose = function (name, val, force) {
      (Hydra.LOCAL || force) && (window[name] = val);
    }),
    (this.unsupported = function (needsAlert) {
      needsAlert &&
        alert(
          "Hi! This build is not yet ready for this device, things may not work as expected. Refer to build schedule for when this device will be supported.",
        );
    }),
    (this.checkForLeaks = function (flag, array) {
      if (window.AURA) return;
      let exceptions = [
        "_ga",
        "_typeface_js",
        "_xdc_",
        "_babelPolyfill",
        "$jscomp",
        "_sentryDebugIds",
        "_injected",
      ];
      window.HYDRA_LEAKS_EXCEPTIONS &&
        (exceptions = exceptions.concat(window.HYDRA_LEAKS_EXCEPTIONS));
      var matchArray = function (prop) {
        if (!array) return !1;
        for (var i = 0; i < array.length; i++) if (prop.includes(array[i])) return !0;
        return !1;
      };
      (clearInterval(_inter),
        flag &&
          (_inter = setInterval(function () {
            for (var prop in window)
              if (!prop.includes("webkit")) {
                var obj;
                try {
                  obj = window[prop];
                } catch (e) {}
                if (obj && "function" != typeof obj && prop.length > 2) {
                  if (prop.includes(exceptions) || matchArray(prop)) continue;
                  var char1 = prop.charAt(0),
                    char2 = prop.charAt(1);
                  if (("_" == char1 || "$" == char1) && char2 !== char2.toUpperCase())
                    throw (
                      console.log(window[prop]),
                      "Hydra Warning:: " + prop + " leaking into global scope"
                    );
                }
              }
          }, 1e3)));
    }),
    (this.startTimer = function (name) {
      ((_timerName = name || "Timer"),
        console.time && !window._NODE_ ? console.time(_timerName) : (_timer = performance.now()));
    }),
    (this.stopTimer = function () {
      console.time && !window._NODE_
        ? console.timeEnd(_timerName)
        : console.log("Render " + _timerName + ": " + (performance.now() - _timer));
    }),
    (this.writeFile = function (file, data) {
      let promise = Promise.create(),
        protocol = location.protocol,
        port = "https:" === protocol ? ":8018" : ":8017",
        url =
          protocol +
          "//" +
          location.hostname +
          port +
          (_this.filesPath || location.pathname) +
          file;
      return (
        post(url, data, { headers: { "content-type": "text/plain" } }).then((e) => {
          "OK" != e
            ? (console.warn(`Unable to write to ${file}`), promise.reject())
            : promise.resolve();
        }),
        promise
      );
    }),
    (this.execUILScript = async function (name, data) {
      if (!Hydra.LOCAL) return;
      let protocol = location.protocol,
        port = "https:" === protocol ? ":8018" : ":8017",
        url = `${protocol}//${location.hostname}${port}${_this.pathName || location.pathname}/uil/${name}`,
        response = await post(url, data, { headers: { "Content-Type": "text/plain" } });
      if ("ERROR" === response || !1 === response.success) throw response;
      return response;
    }),
    (this.auditCompressedTextures = function () {
      let compressedKeys = [],
        changes = 0;
      (UILStorage.getKeys().forEach((key) => {
        let json,
          element = UILStorage.get(key);
        if ("string" == typeof element)
          try {
            json = JSON.parse(element);
          } catch (e) {}
        else "object" == typeof element && (json = element);
        json?.src &&
          (!0 === json.compressed
            ? console.warn(`The texture ${json.src} is a ktx1 asset. Please convert it to ktx2.`)
            : "ktx2" === json.compressed &&
              compressedKeys.push({ key: key, src: json.src.split("?")[0] }));
      }),
        UILStorage.getKeys().forEach((key) => {
          let json,
            element = UILStorage.get(key);
          if ("string" == typeof element)
            try {
              json = JSON.parse(element);
            } catch (e) {}
          else "object" == typeof element && (json = element);
          json?.src &&
            compressedKeys.find((el) => json.src.split("?")[0] === el.src.split("?")[0]) &&
            "ktx2" !== json.compressed &&
            (changes++,
            console.log(`Changed ${json.src.split("?")[0]} in ${key} to use ktx2 compression.`),
            UILStorage.set(key, {
              ...json,
              src: json.src.split("?")[0],
              compressed: "ktx2",
              useCompressed: !0,
            }),
            Events.emitter._fireEvent(UILControlImage.AUDIT));
        }),
        changes
          ? console.warn(
              "Changes to UIL from auditCompressedTextures will not be saved until saving UIL and refreshing. Use Cmd+S or Ctrl+S to save and refresh any open SceneLayouts.",
            )
          : console.log(
              "auditCompressedTextures did not find any textures that had instances using both uncompressed and compressed versions.",
            ));
    }),
    Hydra.LOCAL && _this.checkForLeaks(!0));
}, "static");
