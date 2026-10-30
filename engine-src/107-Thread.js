Class(
  function Thread(_class) {
    Inherit(this, Component);
    var _this = this,
      _worker,
      _callbacks,
      _path,
      _mvc,
      _msg = {};
    const IGNORE_START = "/*!hydra-thread-ignore*/",
      IGNORE_END = "/*!end-hydra-thread-ignore*/";
    function init() {
      let file = window._ES5_ ? "/hydra-thread-es5.js" : "/hydra-thread.js";
      ((_callbacks = {}), (_worker = new Worker(Assets.getPath(Thread.PATH + file))));
    }
    function importClasses() {
      (importClass(Utils),
        importClass(Component),
        importClass(Events),
        importClass(_class, !0),
        importES5());
    }
    function importClass(_class, scoped) {
      if (_class) {
        var code, namespace;
        if (scoped) {
          code = (code = _class.toString().replace("{", "!!!")).split("!!!")[1];
          let ignores = [];
          for (;;) {
            let startIndex = code.indexOf(IGNORE_START);
            if (startIndex < 0) break;
            let endIndex = code.indexOf(IGNORE_END);
            (endIndex < 0 && (endIndex = code.length),
              ignores.push(code.substring(startIndex, endIndex)),
              (code = code.substring(0, startIndex) + code.substring(endIndex)));
          }
          for (; code.includes("this.");) {
            var name = code.slice(code.indexOf("this.")).split("this.")[1].split(/\s*=/)[0];
            ((code = code.replace("this", "self")), createMethod(name));
          }
          code = (code = code.slice(0, -1)).replace(/_self/g, "_this");
          let index = 0;
          ignores.forEach((ignored) => {
            let endIndex = code.indexOf(IGNORE_END, index);
            ((code = code.substring(0, endIndex) + ignored + code.substring(endIndex)),
              (index = endIndex + ignored.length + IGNORE_END.length));
          });
        } else if ("function" != typeof _class) {
          if ((code = _class.constructor.toString()).includes("[native")) return;
          ((namespace = _class._namespace ? _class._namespace + "." : ""),
            (code = namespace + "Class(" + code + ', "static");'));
        } else
          ((namespace = _class._namespace ? _class._namespace + "." : ""),
            (code = namespace + "Class(" + _class.toString() + ");"));
        (Hydra.LOCAL &&
          (code += `\n//# sourceURL=hydra-thread/${Utils.getConstructorName(_class)}.js`),
          _worker.postMessage({ code: code }));
      }
    }
    function createMethod(name) {
      _this[name] = function (message = {}, callback, buffer) {
        let promise;
        return (
          Array.isArray(callback) && ((buffer = callback), (callback = void 0)),
          Array.isArray(buffer) && ((message = { msg: message, transfer: !0 }).buffer = buffer),
          void 0 === callback && ((promise = Promise.create()), (callback = promise.resolve)),
          _this.send(name, message, callback),
          promise
        );
      };
    }
    function importES5() {
      window._ES5_ &&
        (["_createSuper", "_isNativeReflectConstruct"].forEach((name) => {
          let code = window[name].toString();
          code.includes("[native") || _worker.postMessage({ code: code });
        }),
        _worker.postMessage({
          code: "function _getPrototypeOf(o){_getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf:function _getPrototypeOf(o){return o.__proto__||Object.getPrototypeOf(o);};return _getPrototypeOf(o);}",
        }));
    }
    function addListeners() {
      _worker.addEventListener("message", workerMessage);
    }
    function workerMessage(e) {
      if (e.data.console) console.log(e.data.message);
      else if (e.data.id) {
        ((callback = _callbacks[e.data.id]) && callback(e.data.message),
          delete _callbacks[e.data.id]);
      } else if (e.data.emit) {
        (callback = _callbacks[e.data.evt]) && callback(e.data.msg);
      } else {
        var callback;
        (callback = _callbacks.transfer) && callback(e.data);
      }
    }
    (init(),
      importClasses(),
      addListeners(),
      (this.on = function (evt, callback) {
        _callbacks[evt] = callback;
      }),
      (this.off = function (evt) {
        delete _callbacks[evt];
      }),
      (this.loadFunction = function () {
        let names = [];
        for (var i = 0; i < arguments.length; i++)
          ((split = void 0),
            (name = void 0),
            (split = (code = (code = (code = arguments[i]).toString()).replace("(", "!!!")).split(
              "!!!",
            )),
            (name = split[0].split(" ")[1]),
            (code = "self." + name + " = function(" + split[1]),
            Hydra.LOCAL && (code += `\n//# sourceURL=hydra-thread/function/${name}.js`),
            _worker.postMessage({ code: code }),
            createMethod(name),
            names.push(name));
        var code, split, name;
        return names;
      }),
      (this.importScript = function (path) {
        _worker.postMessage({ path: Thread.absolutePath(path), importScript: !0 });
      }),
      (this.importCode = function (code) {
        _worker.postMessage({ code: code });
      }),
      (this.importClass = function () {
        for (var i = 0; i < arguments.length; i++) {
          importClass(arguments[i]);
        }
      }),
      (this.importModules = this.importModule =
        function () {
          for (var i = 0; i < arguments.length; i++) {
            let code = Modules.getConstructor(arguments[i]).toString();
            _worker.postMessage({ code: `Module(${code})` });
          }
        }),
      (this.importES6Class = function (name) {
        if (window._ES5_) {
          let Class = window[name],
            base = Class.toString(),
            proto = [],
            sup,
            matches = /(_this\w+)\s*=\s*(_super\w+)\.call/g.exec(base);
          if (matches) {
            let superVar = matches[2],
              superConstructor = Object.getPrototypeOf(Class);
            if (!superConstructor.toString().includes("[native")) {
              let superName = Utils.getConstructorName(superConstructor);
              sup = `_inherits(${name}, ${superName}); var ${superVar} = _createSuper(${name});`;
            }
          }
          (Object.getOwnPropertyNames(Class.prototype).forEach((fn) => {
            "constructor" != fn &&
              Class.prototype[fn] &&
              proto.push({ key: fn, string: Class.prototype[fn].toString() });
          }),
            _worker.postMessage({ es5: base, name: name, proto: proto, sup: sup }));
        } else {
          let es6 = `(${eval(name)})`;
          (Hydra.LOCAL && (es6 += `\n//# sourceURL=hydra-thread/${name}.js`),
            _worker.postMessage({ es6: es6, name: name }));
        }
      }),
      (this.send = function (name, message, callback) {
        if ("string" == typeof name) {
          (message = message || {}).fn = name;
        } else ((callback = message), (message = name));
        Thread.UNIQUE_ID > 999999 && (Thread.UNIQUE_ID = 1);
        var id = Thread.UNIQUE_ID++;
        (callback && (_callbacks[id] = callback),
          message.transfer
            ? ((message.msg.id = id),
              (message.msg.fn = message.fn),
              (message.msg.transfer = !0),
              _worker.postMessage(message.msg, message.buffer))
            : ((_msg.message = message), (_msg.id = id), _worker.postMessage(_msg)));
      }),
      (this.onDestroy = function () {
        _worker.terminate && _worker.terminate();
      }));
  },
  () => {
    var _shared;
    ((Thread.PATH = window._THREAD_PATH_ || "assets/js/hydra"),
      (Thread.UNIQUE_ID = 1),
      (Thread.absolutePath = Hydra.absolutePath),
      (Thread.cluster = function () {
        return new (function () {
          let index = 0,
            array = [];
          ((this.push = function (thread) {
            array.push(thread);
          }),
            (this.get = function () {
              let thread = array[index];
              return (index++, index >= array.length && (index = 0), thread);
            }),
            (this.array = array));
        })();
      }),
      (Thread.upload = function (...args) {
        let name;
        Thread.shared();
        for (let i = 0; i < _shared.array.length; i++)
          name = _shared.array[i].loadFunction(...args);
        return name;
      }),
      (Thread.uploadClass = function (...args) {
        let name;
        Thread.shared();
        for (let i = 0; i < _shared.array.length; i++) name = _shared.array[i].importClass(...args);
        return name;
      }),
      (Thread.shared = function (list) {
        if (!_shared) {
          _shared = Thread.cluster();
          let hardware = navigator.hardwareConcurrency || 4,
            count = Math.max(Math.min(hardware, 8), 4);
          for (let i = 0; i < count; i++) _shared.push(new Thread());
        }
        return list ? _shared : _shared.get();
      }));
  },
);
