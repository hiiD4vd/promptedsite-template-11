Class(function Storage() {
  var _storage,
    _this = this,
    _sessionData = {};
  function cookie(key, value, expires) {
    var options;
    if (arguments.length > 1 && (null === value || "object" != typeof value)) {
      if (
        (((options = {}).path = "/"),
        (options.expires = expires || 1),
        null === value && (options.expires = -1),
        "number" == typeof options.expires)
      ) {
        var days = options.expires,
          t = (options.expires = new Date());
        t.setDate(t.getDate() + days);
      }
      return (document.cookie = [
        encodeURIComponent(key),
        "=",
        options.raw ? String(value) : encodeURIComponent(String(value)),
        options.expires ? "; expires=" + options.expires.toUTCString() : "",
        options.path ? "; path=" + options.path : "",
        options.domain ? "; domain=" + options.domain : "",
        options.secure ? "; secure" : "",
      ].join(""));
    }
    var result,
      decode = (options = value || {}).raw
        ? function (s) {
            return s;
          }
        : decodeURIComponent;
    return (result = new RegExp("(?:^|; )" + encodeURIComponent(key) + "=([^;]*)").exec(
      document.cookie,
    ))
      ? decode(result[1])
      : null;
  }
  ((this.noTracking = !1),
    (function testStorage() {
      try {
        if (window.localStorage)
          try {
            ((window.localStorage.test = 1),
              window.localStorage.removeItem("test"),
              (_storage = !0));
          } catch (e) {
            _storage = !1;
          }
        else _storage = !1;
      } catch (e) {
        _storage = !1;
      }
    })(),
    (this.setCookie = function (key, value, expires) {
      cookie(key, value, expires);
    }),
    (this.getCookie = function (key) {
      return cookie(key);
    }),
    (this.set = function (key, value) {
      _this.noTracking
        ? (_sessionData[key] = value)
        : (null != value && "object" == typeof value && (value = JSON.stringify(value)),
          _storage
            ? null === value
              ? window.localStorage.removeItem(key)
              : (window.localStorage[key] = value)
            : cookie(key, value, 365));
    }),
    (this.get = function (key) {
      if (_this.noTracking) return _sessionData[key];
      var val, char0;
      (val = _storage ? window.localStorage[key] : cookie(key)) &&
        (val.charAt && (char0 = val.charAt(0)),
        ("{" != char0 && "[" != char0) || (val = JSON.parse(val)),
        ("true" != val && "false" != val) || (val = "true" == val));
      return val;
    }));
}, "Static");
