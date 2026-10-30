Class(function ShaderUILConfig(_shader, _uil, _options) {
  var _textures,
    _this = this;
  const prefix = _shader.UILPrefix;
  var _group =
    _uil && !ShaderUIL.exists[prefix]
      ? (function createFolder() {
          if (!UIL.sidebar) return null;
          let label = (function getName() {
            let split = _shader.UILPrefix.split("/");
            return split.length > 2 ? split[0] + "_" + split[2] : split[0];
          })();
          "_" == label.charAt(label.length - 1) && (label = label.slice(0, -1));
          let folder = new UILFolder(prefix + label, { label: label, closed: !0 });
          _options?.noGraph || _uil.add(folder);
          return folder;
        })()
      : null;
  function createVector(obj, key) {
    let initValue = UILStorage.get(`${prefix}${key}`) || obj.value.toArray();
    if (_group) {
      let vector = new UILControlVector(`${prefix}${key}`, {
        label: key,
        value: initValue,
        step: 0.05,
        description: obj.description,
      });
      (vector.onChange((val) => {
        (obj.value.fromArray(val), _shader.ubo && (_shader.ubo.needsUpdate = !0));
      }),
        (_this["forceUpdate" + key.toUpperCase()] = (_) => {
          let val = _shader.get(key).toArray();
          vector.force(val, !0);
        }),
        vector.onFinishChange((e) => UILStorage.set(`${prefix}${key}`, e)),
        UILStorage.state.bind(`${prefix}${key}`, (val) => vector.setValue(val)),
        _group.add(vector));
    }
    obj.value.fromArray(initValue);
  }
  function createTexture(obj, key) {
    let getTexture;
    (_group && !_textures && (_textures = {}),
      (getTexture = obj.cube
        ? obj.getTexture || ShaderUIL.getCubeTexture || Utils3D.getCubeTexture
        : obj.getTexture || ShaderUIL.getTexture || Utils3D.getTexture));
    const set =
      _shader.parent && _shader.parent.setOverride
        ? _shader.parent.setOverride
        : _shader.setUniform || _shader.set;
    let prefix = _shader.UILPrefix + "_tx",
      data = UILStorage.get(`${prefix}${key}`);
    "string" == typeof data && (data = JSON.parse(data));
    let value = data ? data.src : null,
      change = (data) => {
        if (("string" == typeof data && (data = JSON.parse(data)), !data)) return;
        let val = data.src,
          cleanPath = val.includes("?") && !data.hotreload ? val.split("?")[0] : val;
        (data.compressed && ((val += "-compressedKtx"), "ktx2" === data.compressed && (val += "2")),
          _textures && (_textures[cleanPath] = change),
          (data.src = cleanPath),
          UILStorage.set(`${prefix}${key}`, data),
          set(
            key,
            getTexture(val, { premultiplyAlpha: obj.premultiplyAlpha, scale: obj.scale }),
            _shader,
          ));
      };
    if ((value && value.length && change(data), _group)) {
      let compressOptions = {};
      obj.cube && (compressOptions.cube = !0);
      let img = new UILControlImage(prefix + key, {
        label: key,
        value: data,
        description: obj.description,
        compressOptions: compressOptions,
      });
      (img.onFinishChange(change),
        _group.add(img),
        UILStorage.state.bind(`${prefix}${key}`, (val) => change(val)),
        (_this["forceUpdate" + key.toUpperCase()] = (_) => {
          img.force(_shader.get(key), !0);
        }));
    }
  }
  function createNumber(obj, key) {
    let initValue = UILStorage.get(`${prefix}${key}`);
    if ((void 0 === initValue && (initValue = obj.value), _group)) {
      let number = new UILControlNumber(`${prefix}${key}`, {
        label: key,
        value: initValue,
        step: 0.05,
        description: obj.description,
      });
      (number.onChange((val) => {
        (_shader.ubo && (_shader.ubo.needsUpdate = !0), (obj.value = Number(val)));
      }),
        number.onFinishChange((e) => UILStorage.set(`${prefix}${key}`, e)),
        _group.add(number),
        (_this["forceUpdate" + key.toUpperCase()] = (_) => {
          number.forceUpdate(Number(_shader.get(key)), !0);
        }),
        UILStorage.state.bind(`${prefix}${key}`, (val) => number.setValue(val)));
    }
    obj.value = initValue;
  }
  function createColor(obj, key) {
    let initValue = UILStorage.get(`${prefix}${key}`) || obj.value.getHexString();
    if (_group) {
      let color = new UILControlColor(`${prefix}${key}`, {
        label: key,
        value: initValue,
        description: obj.description,
      });
      (UILStorage.state.bind(`${prefix}${key}`, (val) => color.setValue(val)),
        color.onChange((val) => {
          (obj.value.set(val), _shader.ubo && (_shader.ubo.needsUpdate = !0));
        }),
        color.onFinishChange((e) => UILStorage.set(`${prefix}${key}`, e)),
        _group.add(color),
        (_this["forceUpdate" + key.toUpperCase()] = (_) => {
          color.force(_shader.get(key).getHexString(), !0);
        }));
    }
    initValue && obj.value.set(initValue);
  }
  function createSelect(obj, key) {
    let initValue = UILStorage.get(`${prefix}${key}`);
    if (_group) {
      UILStorage.state.bind(`${prefix}${key}`, (val) => (obj.val = val));
      let { options: options, description: description } = obj,
        select = new UILControlSelect(`${prefix}${key}`, {
          label: key,
          value: initValue,
          options: options,
          description: description,
        });
      (select.onChange((val) => {
        (_group &&
          Events.emitter._fireEvent(ShaderUIL.UPDATE, {
            prefix: prefix,
            key: key,
            val: val,
            group: _this,
          }),
          (obj.value = val),
          UILStorage.set(`${prefix}${key}`, val));
      }),
        _group.add(select));
    }
    initValue && (obj.value = initValue);
  }
  function textureUpdate(e) {
    if (!_textures) return;
    let cleanPath = e.file.split("?")[0];
    for (let key in _textures) {
      cleanPath == (key.includes("?") ? key.split("?")[0] : key) &&
        _textures[key]({ src: e.file, hotreload: !0 });
    }
  }
  function update(e) {
    if (e.prefix == _shader.UILPrefix && e.group != _this)
      if (e.color) {
        let val = e.val,
          obj = _shader.uniforms[e.key];
        Array.isArray(val) ? obj.value.setRGB(val[0], val[1], val[2]) : obj.value.set(val);
      } else
        e.texture
          ? "remote" != e.texture && _shader.set(e.key, e.texture)
          : e.vector
            ? _shader.uniforms[e.key].value.fromArray(e.val)
            : (_shader.uniforms[e.key].value = e.val);
  }
  ((this.group = _group),
    (this.shader = _shader),
    _group && (_shader.shaderUIL = _this),
    (function initItems() {
      for (var key in _shader.uniforms) {
        let obj = _shader.uniforms[key];
        obj &&
          !obj.ignoreUIL &&
          (obj.options && Array.isArray(obj.options)
            ? createSelect(obj, key)
            : ("number" == typeof obj.value && createNumber(obj, key),
              obj.value instanceof Color && createColor(obj, key),
              (null === obj.value || obj.value instanceof Texture) && createTexture(obj, key),
              obj.value instanceof Vector2 && createVector(obj, key),
              obj.value instanceof Vector3 && createVector(obj, key),
              obj.value instanceof Vector4 && createVector(obj, key)));
      }
    })(),
    _group &&
      (function addListeners() {
        (Events.emitter._addEvent(ShaderUIL.UPDATE, update, _this),
          Events.emitter._addEvent(ShaderUIL.TEXTURE_UPDATE, textureUpdate, _this));
      })(),
    (this.setLabel = function (name) {
      _group && _group.setLabel(name);
    }),
    (this.forceUpdate = function (e) {
      ((e.prefix = _shader.UILPrefix), update(e), _this["forceUpdate" + e.key.toUpperCase()]?.());
    }),
    (this.copyTexture = function (key, shader) {
      let newPrefix = shader.UILPrefix + "_tx",
        prefix = _shader.UILPrefix + "_tx",
        data = UILStorage.get(`${prefix}${key}`);
      data && UILStorage.set(`${newPrefix}${key}`, data);
    }));
});
