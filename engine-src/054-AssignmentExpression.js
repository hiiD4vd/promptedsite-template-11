window.Class = function (_class, _type, _static) {
  const _this = this || window,
    isGlobal = _this === window,
    _name = _class.name || _class.toString().match(/function ?([^\(]+)/)[1];
  ("function" == typeof _type && ((_static = _type), (_type = null)),
    (_type = (_type || "").toLowerCase()));
  let collection =
    isGlobal && Global.RESERVED_CLASSES[_name] ? Global.RESERVED_HYDRA_CLASSES : _this;
  (_type
    ? "static" == _type
      ? (collection[_name] = new _class())
      : "singleton" == _type &&
        ((collection[_name] = _class),
        (function () {
          let _instance, _multitons;
          ((collection[_name].instance = function () {
            return (_instance || (_instance = new _class(...arguments)), _instance);
          }),
            (collection[_name].multiton = function (key) {
              return (
                _multitons || (_multitons = {}),
                _multitons[key] ||
                  (_multitons[key] = new _class(...Array.prototype.slice.call(arguments, 1))),
                _multitons[key]
              );
            }));
        })(),
        _static && _static())
    : ((collection[_name] = _class), _static && _static()),
    isGlobal || (collection[_name]._namespace = _this.__namespace));
};
