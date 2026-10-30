Class(function Modules() {
  const _modules = {},
    _constructors = {};
  function exec() {
    for (let m in _modules)
      for (let key in _modules[m]) {
        let module = _modules[m][key];
        module._ready || ((module._ready = !0), module.exec && module.exec());
      }
  }
  (defer(exec),
    (this.Module = function (module) {
      let m = new module(),
        name = module
          .toString()
          .slice(0, 100)
          .match(/function ([^\(]+)/);
      name
        ? ((m._ready = !0),
          (name = name[1]),
          (_modules[name] = { index: m }),
          (_constructors[name] = module))
        : (_modules[m.module] || (_modules[m.module] = {}), (_modules[m.module][m.path] = m));
    }),
    (this.require = function (path) {
      let root;
      return (
        path.includes("/")
          ? ((root = path.split("/")[0]), (path = path.replace(root + "/", "")))
          : ((root = path), (path = "index")),
        (function requireModule(root, path) {
          let module = _modules[root];
          if (!module) throw `Module ${root} not found`;
          return (
            (module = module[path]),
            module._ready || ((module._ready = !0), module.exec && module.exec()),
            module
          );
        })(root, path).exports
      );
    }),
    (this.getConstructor = function (name) {
      return _constructors[name];
    }),
    (this.modulesReady = async function () {
      let modules = [...arguments].flat();
      await Promise.all(modules.map((name) => Modules.moduleReady(name)));
    }),
    (this.moduleReady = function (name) {
      let promise = Promise.create(),
        check = function () {
          _modules[name] && (Render.stop(check), promise.resolve());
        };
      return (Render.start(check), promise);
    }),
    (window.Module = this.Module),
    window._NODE_ || ((window.requireNative = window.require), (window.require = this.require)));
}, "Static");
