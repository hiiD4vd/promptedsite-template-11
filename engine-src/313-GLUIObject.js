class GLUIObject {
  constructor(width, height, map, customCompile) {
    let shader = (this.textureShader = new Shader("GLUIObject", {
      tMap: { value: null },
      uAlpha: { type: "f", value: 1 },
      transparent: !0,
      depthTest: !1,
      customCompile: customCompile,
    }));
    ((shader.persists = !0),
      (this.tMap = shader.uniforms.tMap),
      (this.group = new Group()),
      (this.alpha = 1),
      (this._x = 0),
      (this._y = 0),
      (this._z = 0),
      (this._scaleX = 1),
      (this._scaleY = 1),
      (this._scale = 1),
      (this._rotation = 0),
      (this.multiTween = !0),
      (this.children = []),
      (this.dimensions = new Vector3(width, height, 1)),
      (this._shader = shader),
      (this.mesh = new Mesh(GLUIObject.getGeometry("2d"), shader)),
      (this.mesh.glui = this),
      this.group.add(this.mesh),
      (shader.mesh = this.mesh),
      window.GLSEO && GLSEO.objectNode(this),
      this.bg(map));
    const _this = this;
    ((this.mesh.onBeforeRender = (_) => {
      if (!_this.mesh.determineVisible() && _this.firstRender) return;
      let alpha = _this.getAlpha();
      _this.mesh.shader.uniforms.uAlpha && (_this.mesh.shader.uniforms.uAlpha.value = alpha);
      let usingCustomShader =
        _this._shader !== this.textureShader && _this._shader !== this.colorShader;
      if (alpha < 0.001 || (!usingCustomShader && !this.usingColor && !this.usingMap)) {
        if (
          ((_this.mesh.neverRender = !0),
          (_this.mesh.shader.visible = !1),
          !_this.isDirty && _this.firstRender)
        )
          return;
      } else ((_this.mesh.neverRender = !1), (_this.mesh.shader.visible = !0));
      if (_this.isDirty || !_this.firstRender) {
        if (
          (RenderStats.active &&
            RenderStats.update(
              "GLUIObject",
              1,
              _this.mesh.shader.vsName + "|" + _this.mesh.shader.fsName,
              _this.mesh,
            ),
          (_this.group.position.x = _this._x),
          (_this.group.position.y = _this._3d ? _this._y : -_this._y),
          (_this.group.position.z = _this._z),
          1 != _this.scale &&
            ((_this.group.position.x +=
              (_this.dimensions.x - _this.dimensions.x * _this.scale) / 2),
            (_this.group.position.y -=
              (_this.dimensions.y - _this.dimensions.y * _this.scale) / 2)),
          _this.calcMask)
        ) {
          let v = _this.isMasked;
          (v.copy(v.origin), _this.group.localToWorld(v), (v.z = v.width), (v.w = v.height));
        }
        (_this.corners ||
          (_this.mesh.scale.set(1, 1, 1).multiply(_this.dimensions),
          _this.group.scale.set(_this._scaleX * _this._scale, _this._scaleY * _this._scale, 1)),
          _this._3d
            ? _this.anchor && _this.anchor._parent
              ? (_this.anchor.position.copy(_this.group.position),
                _this.anchor.scale.copy(_this.group.scale),
                _this.anchor.quaternion.setFromEuler(_this._rotation),
                (_this.anchor.isDirty = !0))
              : (_this.group.quaternion.setFromEuler(_this._rotation),
                (_this.group.matrixDirty = !0))
            : (_this.group.rotation.z = Math.radians(_this._rotation)),
          _this.firstRender ||
            (_this.group.updateMatrixWorld(!0),
            (_this.firstRender = !0),
            _this.onMountedHook && _this.onMountedHook()),
          (_this.isDirty = !1));
      }
    }),
      (_this.isDirty = !0));
  }
  get width() {
    return this.dimensions.x;
  }
  set width(w) {
    let dirty = Math.abs(this.dimensions.x - w) > Base3D.DIRTY_EPSILON;
    ((this.dimensions.x = w),
      dirty && ((this.isDirty = !0), this.__internalDirty && this.__internalDirty()));
  }
  get height() {
    return this.dimensions.y;
  }
  set height(h) {
    let dirty = Math.abs(this.dimensions.y - h) > Base3D.DIRTY_EPSILON;
    ((this.dimensions.y = h),
      dirty && ((this.isDirty = !0), this.__internalDirty && this.__internalDirty()));
  }
  get x() {
    return this._x;
  }
  set x(v) {
    let dirty = Math.abs(this._x - v) > Base3D.DIRTY_EPSILON;
    ((this._x = v), dirty && ((this.isDirty = !0), this.__internalDirty && this.__internalDirty()));
  }
  get y() {
    return this._y;
  }
  set y(v) {
    let dirty = Math.abs(this._y - v) > Base3D.DIRTY_EPSILON;
    ((this._y = v), dirty && ((this.isDirty = !0), this.__internalDirty && this.__internalDirty()));
  }
  get z() {
    return this._z;
  }
  set z(v) {
    let dirty = Math.abs(this._z - v) > Base3D.DIRTY_EPSILON;
    ((this._z = v), dirty && ((this.isDirty = !0), this.__internalDirty && this.__internalDirty()));
  }
  get scale() {
    return this._scale;
  }
  set scale(v) {
    let dirty = Math.abs(this._scale - v) > Base3D.DIRTY_EPSILON;
    ((this._scale = v),
      dirty && ((this.isDirty = !0), this.__internalDirty && this.__internalDirty()));
  }
  get scaleX() {
    return this._scaleX;
  }
  set scaleX(v) {
    let dirty = Math.abs(this._scaleX - v) > Base3D.DIRTY_EPSILON;
    ((this._scaleX = v),
      dirty && ((this.isDirty = !0), this.__internalDirty && this.__internalDirty()));
  }
  get scaleY() {
    return this._scaleY;
  }
  set scaleY(v) {
    let dirty = Math.abs(this._scaleY - v) > Base3D.DIRTY_EPSILON;
    ((this._scaleY = v),
      dirty && ((this.isDirty = !0), this.__internalDirty && this.__internalDirty()));
  }
  get rotation() {
    return this._rotation;
  }
  set rotation(v) {
    let dirty = Math.abs(this._rotation - v) > Base3D.DIRTY_EPSILON;
    ((this._rotation = v),
      dirty && ((this.isDirty = !0), this.__internalDirty && this.__internalDirty()));
  }
  style(props) {
    for (let prop in props) void 0 !== this[prop] && (this[prop] = props[prop]);
    return this;
  }
  size(w, h) {
    return ((this.width = w), (this.height = h), this.corners && this.corners.update(), this);
  }
  add($obj) {
    return (
      $obj?.parent?.children?.remove($obj),
      ($obj.parent = this),
      this.group.add($obj.group),
      this.children.push($obj),
      this.isMasked && $obj.mask(this.isMasked, this.maskShader),
      this._3d && !$obj._3d && $obj.enable3D(),
      this.deferred &&
        ($obj.deferRender(!0), $obj.anchor && this.anchor && this.anchor.add($obj.anchor)),
      this
    );
  }
  interact(over, click, camera = World.CAMERA, url, label, options) {
    "string" == typeof camera &&
      ((options = label), (label = url), (url = camera), (camera = World.CAMERA));
    const bubble = (e, fn) => {
      e.stopPropagation = function () {
        e._stopProp = !0;
      };
      let parent = this._parent;
      for (; parent;) {
        if (e._stopProp) return;
        (parent[fn]?.(e), (parent = parent.parent));
      }
    };
    if (
      ((this._onOver = (e) => {
        (bubble(e, "_onChildHover"), over(e));
      }),
      (this._onClick = (e) => {
        (bubble(e, "_onChildClick"), click(e));
      }),
      (this._interactCamera = camera),
      over ? this.interaction.add(this, camera) : this.interaction.remove(this, camera),
      "string" == typeof url && "string" == typeof label)
    ) {
      const _this = this;
      defer((_) => {
        (!_this.seo && window.GLSEO && GLSEO.objectNode(_this),
          _this.seo && _this.seo.aLink && _this.seo.aLink(url, label, options));
      });
    }
    return this;
  }
  clearInteract() {
    return (
      this._onOver &&
        (this.interaction.remove(this, this._interactCamera),
        (this._onClick = GLUIObject.noop),
        (this._onOver = GLUIObject.noop)),
      this.seo && this.seo.unlink(),
      this
    );
  }
  remove(param) {
    (param &&
      console.warn("GLUIObject.remove removes ITSELF from its parent. use removeChild instead"),
      this.children.slice().forEach((child) => {
        child.remove ? child.remove() : child.destroy && child.destroy();
      }),
      this.clearInteract(),
      this.parent &&
        (this.parent.children ? this.parent.children?.remove(this) : this.stage.remove(this)),
      this.mesh._parent ? this.group._parent?.remove(this.group) : this.stage.remove(this));
    let textureShader = this.textureShader;
    for (let key in textureShader.uniforms) {
      let uniform = textureShader.uniforms[key];
      uniform && uniform.value && uniform.value.destroy && uniform.value.destroy();
    }
  }
  create(width, height, map, customCompile) {
    let $obj = $gl(width, height, map, customCompile);
    return (this.add($obj), this._3d && $obj.enable3D(), $obj);
  }
  removeChild(obj) {
    return (this.group.remove(obj.group), this);
  }
  tween(obj, time, ease, delay) {
    return tween(this, obj, time, ease, delay);
  }
  enable3D(style2d) {
    ((this._3d = !0),
      (this._3dStyle2d = !!style2d),
      this._usingCustomGeometry ||
        (this.mesh.geometry = GLUIObject.getGeometry(style2d ? "2d" : "3d")),
      (this.mesh.shader.depthTest = !0),
      (this._rotation = new Euler()),
      this.anchor || (this.anchor = new Group()),
      (this.anchor.onMatrixDirty = (_) => {
        _this.isDirty = !0;
      }));
    const _this = this;
    return (
      _this._rotation.onChange((_) => {
        _this.isDirty = !0;
      }),
      this
    );
  }
  loaded() {
    return !0;
  }
  setZ(z) {
    return ((this.mesh.renderOrder = z), this);
  }
  bg(path) {
    let color,
      texture = null;
    return (
      "string" == typeof path
        ? path.length <= 10 && (path.startsWith("0x") || path.startsWith("#"))
          ? (color = path)
          : path &&
            "empty" !== path &&
            (texture = Utils3D.getTexture(path, { premultiplyAlpha: !1 }))
        : path instanceof Color
          ? (color = path)
          : (texture = path || null),
      color
        ? (this.colorShader ||
            (this.colorShader = new Shader("GLUIColor", {
              transparent: !0,
              uAlpha: this.textureShader.uniforms.uAlpha,
              uColor: { value: new Color(color) },
            })),
          this.colorShader.uniforms.uColor.value.set(path),
          this._shader.uniforms.uColor || this.useShader(this.colorShader))
        : ((this.tMap.value = texture),
          this._shader.uniforms.tMap || this.useShader(this.textureShader),
          (this.textureShader.visible = !!texture)),
      (this.usingColor = !!color),
      (this.usingMap = !color && !!texture),
      this
    );
  }
  show() {
    return (
      (this.group.matrixDirty = !0),
      (this.mesh.matrixDirty = !0),
      (this.group.visible = !0),
      this.anchor && (this.anchor.visible = !0),
      this
    );
  }
  hide() {
    return ((this.group.visible = !1), this.anchor && (this.anchor.visible = !1), this);
  }
  useShader(shader) {
    return (
      shader || (shader = this.usingColor ? this.colorShader : this.textureShader),
      (this._shader = shader),
      (this.mesh.shader = this._shader),
      (shader.mesh = this.mesh),
      this.usingCustomShader &&
        ((shader.uniforms.tMap = this.tMap),
        (shader.uniforms.uAlpha = this.textureShader.uniforms.uAlpha),
        this._3d || (shader.depthTest = !1),
        (shader.transparent = !0)),
      this
    );
  }
  depthTest(bool) {
    this.mesh.shader.depthTest = bool;
  }
  childInteract(hover, click) {
    ((this._onChildHover = hover), (this._onChildClick = click));
  }
  useGeometry(geom) {
    return (
      geom
        ? ((this.mesh.geometry = geom), (this._usingCustomGeometry = !0))
        : ((this.mesh.geometry = GLUIObject.getGeometry(
            this._3d && !this._3dStyle2d ? "3d" : "2d",
          )),
          (this._usingCustomGeometry = !1)),
      this
    );
  }
  updateMap(src) {
    let texture = "string" == typeof src ? Utils3D.getTexture(src, { premultiplyAlpha: !1 }) : src;
    ((this.tMap.value = texture),
      (this.usingMap = !this.usingColor && !!texture),
      this.usingColor || (this._shader.visible = !!texture));
  }
  async mask(obj, shader) {
    await defer();
    let dimensions = {},
      p = this._parent;
    for (; p;)
      (p.stageLayoutCapture &&
        ((dimensions.width = p.stageLayoutCapture.width),
        (dimensions.height = p.stageLayoutCapture.height)),
        (p = p._parent));
    (dimensions.width || ((dimensions.width = Stage.width), (dimensions.height = Stage.height)),
      obj.group.updateMatrixWorld(!0),
      obj.mesh.onBeforeRender());
    let box = new Box3().setFromObject(obj.mesh),
      minX = box.min.x / dimensions.width,
      minY = box.max.y / dimensions.height,
      maxX = box.max.x / dimensions.width,
      maxY = -box.min.y / dimensions.height;
    (this.shader &&
      (this.useShader(shader),
      this.shader.addUniforms({ uMaskValues: { value: new Vector4(minX, minY, maxX, maxY) } })),
      obj.hide(),
      this.group.traverse((o) => {
        o.glui && o.glui != this && o.glui.mask(obj, shader);
      }));
  }
  deferRender(parent) {
    ((this.deferred = !0), parent || ((this.anchor = new Group()), GLUI.Scene.addDeferred(this)));
  }
  clearTween() {
    return (
      this._mathTweens &&
        this._mathTweens.forEach((t) => {
          t.tween.stop();
        }),
      this
    );
  }
  createCorners() {
    this.corners = new GLUICornerPin(this);
  }
  getAlpha() {
    if (this._gluiParent) {
      let alpha = this._gluiParent.getAlpha();
      return ((this.alpha = alpha), alpha);
    }
    let alpha = this.alpha,
      $parent = this.parent;
    for (; $parent && void 0 !== $parent.alpha;)
      ((alpha *= $parent.alpha), ($parent = $parent.parent));
    return alpha;
  }
  get shader() {
    return this._shader;
  }
  get usingCustomShader() {
    return this._shader !== this.textureShader && this._shader !== this.colorShader;
  }
  _divFocus() {
    (this._onOver && this._onOver({ action: "over", object: this }),
      this.onDivFocus && this.onDivFocus());
  }
  _divBlur() {
    (this._onOver && this._onOver({ action: "out", object: this }),
      this.onDivBlur && this.onDivBlur());
  }
  _divSelect() {
    (this._onClick && this._onClick({ action: "click", object: this }),
      this.onDivSelect && this.onDivSelect());
  }
  get _parent() {
    return this.parent;
  }
  get interaction() {
    return this.stage.interaction;
  }
  get stage() {
    let p = this;
    for (; p;) {
      if (p.gluiToRT) return p.gluiToRT.GLUIStage?.() || GLUI.Stage;
      if (p instanceof GLUIStage) return p;
      if (p instanceof GLUIStage3D) return p;
      p = p.parent;
    }
    return this._3d ? GLUI.Scene : GLUI.Stage;
  }
  forceUpdate() {
    ((this.firstRender = !1), this.mesh.onBeforeRender());
  }
}
