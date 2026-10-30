Class(function Utils() {
  var _queries = {},
    _searchParams = new URLSearchParams(window.location.search);
  ((this.query = this.queryParams =
    function (key, value) {
      if ((void 0 !== value && (_queries[key] = value), void 0 !== _queries[key]))
        return _queries[key];
      if (_searchParams)
        "0" === (value = _searchParams.get(key))
          ? (value = 0)
          : "false" === value || null === value
            ? (value = !1)
            : "" === value && (value = !0);
      else {
        let escapedKey = encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&");
        "0" ==
        (value = decodeURIComponent(
          window.location.search.replace(
            new RegExp(`^(?:.*?[&?]${escapedKey}(?:=([^&]*)|[&$]))?.*$`, "i"),
            "$1",
          ),
        ))
          ? (value = 0)
          : "false" == value
            ? (value = !1)
            : value.length ||
              (value = new RegExp(`[&?]${escapedKey}(?:[&=]|$)`, "i").test(window.location.search));
      }
      return ((_queries[key] = value), value);
    }),
    (this.addQuery = function (query, value) {
      if (_queries[query] === value) return _queries[query];
      let url = new URL(location.href);
      return (
        url.searchParams.set(query, value),
        (_searchParams = url.searchParams),
        window.history.replaceState({}, document.title, url.toString()),
        (_queries[query] = value)
      );
    }),
    (this.removeQuery = function (...queries) {
      let url = new URL(location.href);
      (queries.forEach((query) => {
        (url.searchParams.delete(query), delete _queries[query]);
      }),
        (_searchParams = url.searchParams),
        window.history.replaceState({}, document.title, url.toString()));
    }),
    (this.addQueryToPath = function (path, hash) {
      let q = _searchParams.toString();
      return (
        q && (path = `${path || ""}?${q}`),
        hash
          ? (hash.startsWith("#") && (hash = hash.slice(1)), `${path || ""}#${hash}`)
          : path || ""
      );
    }),
    (this.addParam = function (url, param, value) {
      let index = url.indexOf("?"),
        prefix = url.substring(0, index + 1),
        suffix = url.substring(index + 1),
        searchParams = new URLSearchParams(suffix);
      return (searchParams.append(param, value), prefix + searchParams.toString());
    }),
    (this.removeParam = function (url, param) {
      let index = url.indexOf("?"),
        prefix = url.substring(0, index + 1),
        suffix = url.substring(index + 1),
        searchParams = new URLSearchParams(suffix);
      return (searchParams.delete(param), prefix + searchParams.toString());
    }),
    (this.getConstructorName = function (obj) {
      return obj
        ? (obj.___constructorName ||
            (obj.___constructorName =
              "function" == typeof obj
                ? obj.name || obj.toString().match(/function ([^\(]+)/)?.[1]
                : obj.constructor.name ||
                  obj.constructor.toString().match(/function ([^\(]+)/)?.[1]),
          obj.___constructorName)
        : obj;
    }),
    (this.nullObject = function (object) {
      if (object && (object.destroy || object.div))
        for (var key in object)
          ("boolean" == typeof object[key] && "deleted" === key) ||
            (void 0 !== object[key] && (object[key] = null));
      return null;
    }),
    (this.cloneObject = function (obj) {
      return JSON.parse(JSON.stringify(obj));
    }),
    (this.headsTails = function (n0, n1) {
      return Math.random(0, 1) ? n1 : n0;
    }),
    (this.mergeObject = function () {
      for (var obj = {}, i = 0; i < arguments.length; i++) {
        var o = arguments[i];
        for (var key in o) obj[key] = o[key];
      }
      return obj;
    }),
    (this.timestamp = this.uuid =
      function () {
        return (
          Date.now() +
          "xx-4xx-yxx-xxx".replace(/[xy]/g, function (c) {
            let r = (16 * Math.random()) | 0;
            return ("x" == c ? r : (3 & r) | 8).toString(16);
          })
        );
      }),
    (this.randomColor = function () {
      var color = "#" + Math.floor(16777215 * Math.random()).toString(16);
      return (color.length < 7 && (color = this.randomColor()), color);
    }),
    (this.numberWithCommas = function (num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }),
    (this.padInt = function (num, digits, isLimit) {
      isLimit && (num = Math.min(num, Math.pow(10, digits) - 1));
      let str = Math.floor(num).toString();
      return (
        Math.pow(10, Math.max(0, digits - str.length))
          .toString()
          .slice(1) + str
      );
    }),
    (this.copyToClipboard = function (string) {
      try {
        var el = document.createElement("textarea"),
          range = document.createRange();
        ((el.contentEditable = !0),
          (el.readOnly = !0),
          (el.value = string),
          document.body.appendChild(el),
          el.select(),
          range.selectNodeContents(el));
        var s = window.getSelection();
        return (
          s.removeAllRanges(),
          s.addRange(range),
          el.setSelectionRange(0, string.length),
          document.execCommand("copy"),
          document.body.removeChild(el),
          !0
        );
      } catch (e) {
        return !1;
      }
    }),
    (this.stringList = function (items = [], limit = 0, options = {}) {
      if (0 === items.length) return "";
      let output = "",
        printed = 0;
      ("object" == typeof limit && ((options = limit), (limit = 0)),
        (options.oxford = !0 === options.oxford),
        (options.more = !1 !== options.more && (options.more ? options.more : "more")),
        (options.and = options.and ? options.and : "&"),
        (options.comma = options.comma ? options.comma : ","),
        isNaN(options.limit) || (limit = options.limit),
        0 === limit && (limit = items.length));
      do {
        ((output = `${output}${items.shift()}${options.comma} `), printed++);
      } while (items.length > 1 && printed + 1 < limit);
      if (
        ((output = output.trim()),
        (output = output.slice(0, output.length - 1)),
        1 === items.length)
      )
        output = `${output}${options.oxford && printed > 1 ? options.comma : ""} ${options.and} ${items.shift()}`;
      else if (items.length > 1 && options.more) {
        let more = `${items.length} ${options.more}`;
        output = `${output}${options.oxford && printed > 1 ? options.comma : ""} ${options.and} ${more}`;
      }
      return output;
    }),
    (this.debounce = function (callback, time = 100, data) {
      (clearTimeout(callback.__interval),
        (callback.__interval = Timer.create((_) => callback(data), time)));
    }),
    (this.compareVersion = (function () {
      const cache = new Map();
      return function (version1, version2) {
        const key = `${version1}|${version2}`;
        if (cache.has(key)) return cache.get(key);
        const v1parts = version1.split(".").map(Number),
          v2parts = version2.split(".").map(Number);
        let result = 0;
        for (let i = 0; i < 3; i++) {
          if (v1parts[i] > v2parts[i]) {
            result = 1;
            break;
          }
          if (v1parts[i] < v2parts[i]) {
            result = -1;
            break;
          }
        }
        return (cache.set(key, result), result);
      };
    })()),
    (this.hydraXVersion = function (version) {
      return this.compareVersion(version, window.CREATED_WITH_HYDRAX || "1.0.0");
    }));
}, "Static");
