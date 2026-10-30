Class(
  function StateArray(_src = [], _filterFn = null) {
    Inherit(this, Events);
    const _this = this;
    var _data = [];
    function wrap(obj) {
      if ("object" != typeof obj || Array.isArray(obj))
        throw "StateArray entries must be {objects}!";
      if ((obj._uid || (obj._uid = Utils.uuid()), obj.createLocal)) return obj;
      let state = AppState.createLocal(obj);
      return ((state.origin = obj), state);
    }
    if (
      (Object.defineProperty(_this, "length", {
        get: function () {
          return _data.length;
        },
      }),
      (this.setFilter = function (fn, refresh = !0) {
        ((_filterFn = fn), refresh && this.refresh(_data.filter(fn)));
      }),
      (this.push = function (obj) {
        if (_filterFn && !_filterFn(obj)) return;
        let state = wrap(obj);
        return (
          _data.push(state),
          (function setInterfaceAtIndex(index) {
            void 0 === _this[index] &&
              Object.defineProperty(_this, index, {
                set: function (v) {
                  for (let key in v) _data[index].set(key, v[key]);
                },
                get: function () {
                  return _data[index];
                },
              });
          })(_data.length - 1),
          _this.events.fire(Events.UPDATE, { type: "add", state: state }),
          state
        );
      }),
      (this.remove = function (obj) {
        for (let i = 0; i < _data.length; i++) {
          let state = _data[i];
          (state.origin !== obj && state !== obj) ||
            (_data.splice(i, 1),
            _this.events.fire(Events.UPDATE, { type: "remove", state: state }, !0));
        }
      }),
      (this.update = async function (obj) {
        var _found = !1;
        for (let i = 0; i < _data.length; i++) {
          var state = _data[i];
          if (state.origin._uid === obj._uid || state._uid === obj._uid)
            return (
              await state.setAll(obj),
              _this.events.fire(Events.UPDATE, { type: "modify", state: state, index: i }),
              (_found = !0)
            );
        }
        return _found;
      }),
      (this.forEach = function (cb) {
        _data.forEach(function (...args) {
          return cb.apply(this, args);
        });
      }),
      (this.find = function (cb) {
        return _data.find(function (...args) {
          return cb.apply(this, args);
        });
      }),
      (this.insertAtIdx = function (idx, obj) {
        if ((obj._uid || (obj = wrap(obj)), !_data[Math.abs(idx)]))
          throw "There is no item at index " + idx + " in this StateArray";
        _data.splice(idx, 0, obj);
        const newData = _data.filter(() => !0);
        this.refresh(newData);
      }),
      (this.map = function (cb) {
        let array = [];
        return (
          _data.forEach(function (...args) {
            return array.push(cb.apply(this, args));
          }),
          array
        );
      }),
      (this.find = function (cb) {
        return _data.find(function (...args) {
          return cb.apply(this, args);
        });
      }),
      (this.toJSON = function () {
        let array = [];
        return (
          _data.forEach((appState) => {
            array.push(appState.toJSON());
          }),
          array
        );
      }),
      (this.getMap = function () {
        let array = [];
        return (
          _data.forEach((appState) => {
            array.push(appState.getMap());
          }),
          array
        );
      }),
      (this.indexOf = function (obj) {
        for (let i = 0; i < _data.length; i++) {
          let state = _data[i];
          if (state.origin === obj || state === obj) return i;
        }
      }),
      (this.refresh = function (array) {
        (Array.isArray(array) || array instanceof StateArray || (array = [array]),
          _this.events.fire(StateArray.REFRESH, { type: "refresh" }, !0));
        let i = _data.length;
        for (; i--;) {
          let state = _data.pop();
          _this.events.fire(Events.UPDATE, { type: "remove", state: state }, !0);
        }
        ((_data.length = 0), array.forEach(_this.push));
      }),
      (this.sort = function (cb) {
        let array = [];
        (_data.forEach((d) => array.push(d)), array.sort(cb), _this.refresh(array));
      }),
      (this.includes = function (obj) {
        return this.indexOf(obj) > -1;
      }),
      (this.reflow = function () {
        this.refresh(_data.map((d) => d.origin));
      }),
      !Array.isArray(_src))
    )
      throw "StateArray can only take an array as a parameter";
    _src.forEach(_this.push);
  },
  (_) => {
    StateArray.REFRESH = "state_array_refresh";
  },
);
