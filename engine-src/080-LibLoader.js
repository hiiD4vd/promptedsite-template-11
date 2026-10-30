Class(function LibLoader() {
  Inherit(this, Component);
  const modules = {},
    sanitizeLibName = (libName) => {
      if (!libName || "string" != typeof libName)
        throw new Error("Library name must be a non-empty string");
      const sanitized = libName.trim();
      if (
        sanitized.includes("/") ||
        sanitized.includes("\\") ||
        sanitized.includes("..") ||
        sanitized.startsWith("http") ||
        sanitized.startsWith("//")
      )
        throw new Error("Library name cannot contain paths or URLs");
      return sanitized;
    };
  ((this.import = async function (libName, autoLoadScript = !0) {
    const prom = Promise.create();
    try {
      if (((libName = sanitizeLibName(libName)), !modules[libName] && autoLoadScript))
        await this.preloadESM(libName);
      else if (!modules[libName] && !autoLoadScript)
        throw new Error(
          `Lib ${libName} is not loaded. Please call preloadESM() with the lib name.`,
        );
      if (!modules[libName])
        throw new Error(
          `Lib ${libName} is not loaded. Please use import() with the last parameter of true, or call preloadESM() with the lib name.`,
        );
      prom.resolve(modules[libName]);
    } catch (err) {
      prom.reject(err);
    }
    return prom;
  }),
    (this.preloadESM = async function (libName) {
      let prefix = `assets/js/lib/${(libName = sanitizeLibName(libName))}`,
        libPath = Assets.list().find((p) => p.startsWith(prefix) && p.endsWith(".esm.js"));
      ((libPath = libPath ? libPath.slice(14) : `${libName}.esm.js`),
        (prefix = window._BUILT_ ? "../js/lib/" : "../lib/"),
        (libPath = Assets.getPath(`${prefix}${libPath}`)));
      try {
        const module = await import(libPath);
        modules[libName] = module;
      } catch (err) {
        throw (
          console.error(err),
          new Error(
            `LibLoader encountered an error while loading ${libName}. Please check the console for more details.`,
          )
        );
      }
    }));
}, "static");
