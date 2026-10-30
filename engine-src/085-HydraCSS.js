Class(function HydraCSS() {
  var _tag,
    _obj,
    _style,
    _needsUpdate,
    _this = this;
  function objToCSS(key) {
    let pattern = /[A-Z]/,
      result = "";
    for (; key;) {
      let match = pattern.exec(key);
      if (!match) {
        result += key;
        break;
      }
      ((result += key.slice(0, match.index)),
        (result += "-"),
        (result += key.charAt(match.index).toLowerCase()),
        (key = key.slice(match.index + 1)));
    }
    return result;
  }
  function setHTML() {
    ((_tag.innerHTML = _style), (_needsUpdate = !1));
  }
  (Hydra.ready(function () {
    ((_obj = {}),
      (_style = ""),
      ((_tag = document.createElement("style")).type = "text/css"),
      document.getElementsByTagName("head")[0].appendChild(_tag));
  }),
    (this._read = function () {
      return _style;
    }),
    (this._write = function (css) {
      ((_style = css), _needsUpdate || ((_needsUpdate = !0), defer(setHTML)));
    }),
    (this.style = function (selector, obj = {}) {
      (_obj[selector] || (_obj[selector] = {}),
        Object.assign(_obj[selector], obj),
        (function render() {
          var s = "";
          for (let selector in _obj) {
            let obj = _obj[selector];
            for (var key in ((s += `${selector} {`), obj)) {
              var prop = objToCSS(key),
                val = obj[key];
              ("string" != typeof val && "opacity" != key && (val += "px"),
                (s += prop + ":" + val + "!important;"));
            }
            s += "}";
          }
          _this._write(s);
        })());
    }),
    (this.get = function (selector, prop) {
      if (!_obj[selector]) return prop ? null : {};
      let obj = Object.assign({}, _obj[selector]);
      return prop ? obj[prop] : obj;
    }),
    (this.textSize = function ($obj) {
      var $clone = $obj.clone();
      ($clone.css({
        position: "relative",
        cssFloat: "left",
        styleFloat: "left",
        marginTop: -99999,
        width: "",
        height: "",
      }),
        __body.addChild($clone));
      var width = $clone.div.offsetWidth,
        height = $clone.div.offsetHeight;
      return ($clone.remove(), { width: width, height: height });
    }),
    (this.prefix = function (style, singlePropertyIfShorthand) {
      if (((style = style.charAt(0).toLowerCase() + style.slice(1)), _this.styles.vendor)) {
        singlePropertyIfShorthand &&
          (singlePropertyIfShorthand =
            singlePropertyIfShorthand.charAt(0).toLowerCase() + singlePropertyIfShorthand.slice(1));
        let prefixed = _this.vendor + objToCSS(singlePropertyIfShorthand || style);
        try {
          let styles = window.getComputedStyle(document.documentElement, "");
          if (Array.prototype.indexOf.call(styles, prefixed) >= 0)
            return _this.styles.vendor + style.capitalize();
        } catch (e) {}
      }
      return style;
    }),
    (this.prefixCSS = function (style, singlePropertyIfShorthand) {
      if (_this.styles.vendor) {
        let prefixed = _this.vendor + (singlePropertyIfShorthand || style);
        try {
          let styles = window.getComputedStyle(document.documentElement, "");
          if (Array.prototype.indexOf.call(styles, prefixed) >= 0) return prefixed;
        } catch (e) {}
      }
      return style;
    }),
    (this._toCSS = objToCSS));
}, "Static");
