window.Namespace = function (obj) {
  "string" == typeof obj
    ? window[obj] || (window[obj] = { Class: Class, __namespace: obj })
    : ((obj.Class = Class),
      (obj.__namespace =
        obj.constructor.name || obj.constructor.toString().match(/function ([^\(]+)/)[1]));
};
