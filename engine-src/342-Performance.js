Class(function Performance() {
  Inherit(this, Component);
  const _this = this;
  var _overrides = Storage.get("performance_override") || {};
  const PLATFORM_ALLOWED_KEYS = [
    "desktopVRAvailable",
    "enableWorldNukeMSAA",
    "msaaSamples",
    "forceWebGL1",
    "blurFX",
  ];
  var IGNORED_FUNCTIONS;
  function save(obj, key, value) {
    ((_overrides[key] = { obj: Utils.getConstructorName(obj), value: value }),
      Storage.set("performance_override", _overrides));
  }
  function convert(tier) {
    if (GPU.BLOCKLIST) return "F";
    switch (tier) {
      case 5:
        return "A++";
      case 4:
        return "A+";
      case 3:
        return "A";
      case 2:
        return "B";
      case 1:
        return "C";
      case 0:
        return "D";
    }
  }
  (!(async function () {
    if ((Utils.query("performance") && Utils.query("edit")) || Utils.query("custom")) {
      await Hydra.ready();
      for (let key in _overrides) {
        let obj,
          value,
          override = _overrides[key];
        (override?.obj
          ? ({ obj: obj, value: value } = override)
          : ((obj = "Tests"), (value = override)),
          window[obj] && (window[obj][key] = (_) => value));
      }
    }
  })(),
    (this.displayResults = async function () {
      let editing = Utils.query("edit");
      (await GPU.ready(),
        $(document.documentElement).bg("#000"),
        __body.bg("#000"),
        Stage.bg("#000"),
        Stage.hide());
      let $results = __body.create("PerformanceResults");
      (__body.css({ overflowY: "scroll", background: "#000" }),
        $results
          .fontStyle("Arial", 16, "#fff")
          .css({ marginLeft: 50, marginRight: 50, "user-select": "auto" }),
        Mobile.allowNativeScroll(),
        HydraCSS.style(".PerformanceResults *", { position: "relative", "user-select": "auto" }));
      Tests.constructor.toString();
      let tests = "",
        keys = [],
        addTest = (obj, key) => {
          let result,
            val = obj[key];
          if ("function" == typeof val) {
            if (!IGNORED_FUNCTIONS) {
              let obj = { __afterInitClass: [] };
              (Inherit(obj, Component),
                "function" == typeof XComponent && Inherit(obj, XComponent),
                obj.__afterInitClass.forEach((cb) => cb()),
                (IGNORED_FUNCTIONS = Object.values(obj)
                  .filter((val) => "function" == typeof val)
                  .map((fn) => fn.toString())));
            }
            if (!IGNORED_FUNCTIONS.includes(val.toString())) {
              try {
                result = obj[key]();
              } catch (e) {
                return;
              }
              ((tests += `<p><b>${key}:</b> `),
                (tests += editing
                  ? "number" == typeof result
                    ? `<input class="${key}" value="${result.toString()}" /></p>`
                    : "boolean" == typeof result
                      ? `<input class="${key}" type="checkbox" ${result ? "checked" : ""}/></p>`
                      : `<input class="${key}" value="${result}" type="text"></p>`
                  : (function sanitizeHTML(str) {
                      return String(str)
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#39;");
                    })(result) + "</p>"),
                keys.push({ obj: obj, key: key }));
            }
          }
        };
      for (let key in Tests) addTest(Tests, key);
      if (window.Platform)
        for (let key in Platform)
          (key.startsWith("use") ||
            key.startsWith("using") ||
            PLATFORM_ALLOWED_KEYS.includes(key)) &&
            addTest(Platform, key);
      let compressionExtensions = ["compressed_texture", "texture_compression"],
        enabledExtensions = Device.graphics.webgl?.extensions || [],
        otherExtensions = enabledExtensions
          .filter((ext) => !compressionExtensions.find((n) => ext.includes(n)))
          .join(", "),
        dedupe = {};
      compressionExtensions = enabledExtensions
        .map((ext) =>
          compressionExtensions
            .map((name) => {
              let index = ext.indexOf(name);
              if (!(index < 0))
                return (
                  (index += name.length),
                  "_" === ext.charAt(index) && (index += 1),
                  ext.substring(index)
                );
            })
            .find(Boolean),
        )
        .filter((ext) => !(!ext || dedupe[ext]) && (dedupe[ext] = !0))
        .join(", ");
      let html = `<h1>Performance Results</h1>\n                    <button id="copy">Copy to clipboard</button>\n                    <p><b>Time:</b> ${new Date()}</p>\n                    <p><b>GPU:</b> ${Device.graphics.webgl ? Device.graphics.webgl.gpu : "WEBGL UNAVAILABLE"}</p>\n                    <p><b>WebGL Version:</b> ${Device.graphics.webgl ? Device.graphics.webgl.version : "WEBGL UNAVAILABLE"}</p>\n                    ${
        "ios" == Device.system.os
          ? (function getiOSGPUStats() {
              return `<p><b>iOS GPU UNMASK:</b>${Global.iOSGPUHASHVAL || "X"} | ${Global.iOSGPUFALLBACKTEST || "X"} | ${Global.iOSGPUHASH3D || "X"}</p>`;
            })()
          : ""
      }\n                    ${"safari" == Device.system.browser ? "<b>SAFARI GPU UNMASK:</b> " + Global.MACOSHASHVALUE : ""}\n                    <p><b>GPU Tier:</b> ${Device.mobile ? convert(GPU.M_TIER) : convert(GPU.TIER)} [${Device.mobile ? GPU.M_TIER : GPU.TIER}]</p>\n                    <p><b>Mobile:</b> ${Device.mobile ? Object.keys(Device.mobile).filter((key) => Device.mobile[key]) : "false"} </p>\n                    <p><b>User Agent:</b> ${Device.agent}</p>\n                    <p><b>OS:</b> ${Device.system.os}</p>${-1 !== Device.system.version ? `\n                    <p><b>OS Version:</b> ${Device.system.version}` : ""}\n                    <p><b>DPR:</b> ${Device.pixelRatio}</p>\n                    <p><b>Screen Size:</b> ${screen.width} x ${screen.height}</p>\n                    <p><b>HZ Multiplier:</b> ${Render.HZ_MULTIPLIER}</p>\n                    <p><b>Stage Size:</b> ${Stage.width} x ${Stage.height}</p>\n                    <p><b>Browser:</b> ${Device.system.browser}</p>\n                    <p><b>Browser Version:</b> ${Device.system.browserVersion}</p>\n                    <p><b>Compressed textures:</b> ${compressionExtensions}</p>\n                    <p><b>WebGL extensions:</b> ${otherExtensions}</p>\n                    <p><b>Media Devices w/ Permissions Granted:</b>${await navigator?.mediaDevices?.enumerateDevices?.().then((devices) => devices?.filter?.((device) => "" !== device.label)?.map((device) => ` ${device.label}`))}</p>\n                    \n                    <h2>Project-Specific Tests</h2>\n                    ${editing ? '<button class="resetBtn">Reset All</button>' : ""}\n                    ${tests}\n        `;
      $results.html(html);
      let copy = $(document.getElementById("copy"));
      if (
        (copy.bind("click", (_) => {
          let text = `${$results.div.innerText.split("\n").slice(2).join("\n").trim()}`;
          (Utils.copyToClipboard(text),
            copy.text("Results copied!"),
            clearTimeout(_this.copyTimer),
            (_this.copyTimer = _this.delayedCall((_) => {
              copy.text("Copy to clipboard");
            }, 3e3)));
        }),
        editing)
      ) {
        (await defer(),
          (document.querySelector(".resetBtn").onclick = (_) => {
            (Storage.set("performance_override", null), location.reload());
          }));
        for (let { obj: obj, key: key } of keys) {
          let div = document.querySelector(`.${key}`);
          div &&
            (div.onchange = (_) => {
              let value = div.value;
              ((value = isNaN(value) ? div.checked : Number(value)), save(obj, key, value));
            });
        }
      }
    }));
}, "static");
