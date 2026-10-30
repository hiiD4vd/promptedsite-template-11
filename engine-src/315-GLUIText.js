class GLUIText {
  constructor(text, fontName, fontSize, options = {}, customCompile) {
    ((options.font = fontName || options.font),
      (options.text = text),
      (options.seoText = options.seoText ?? text),
      (options.width = options.width),
      (options.align = options.align || "left"),
      (options.size = fontSize || options.size),
      (options.lineHeight = options.lineHeight),
      (options.letterSpacing = options.letterSpacing),
      (options.wordSpacing = options.wordSpacing),
      (options.wordBreak = options.wordBreak),
      (options.langBreak = options.langBreak),
      (options.indent = options.indent),
      (options.color = new Color(options.color)),
      (options.customCompile = customCompile),
      (this.text = new GLText(options)),
      (this.text.gluiText = this),
      this.text.onResize((_) => (this._dimensions = null)),
      (this.group = new Group()),
      (this.group.asyncPromise = this.text.fontLoaded),
      (this.alpha = 1),
      (this._x = 0),
      (this._y = 0),
      (this._z = 0),
      (this._scaleX = 1),
      (this._scaleY = 1),
      (this._scale = 1),
      (this._rotation = 0),
      (this.multiTween = !0));
    const _this = this;
    (text &&
      defer((_) => {
        !_this.seo &&
          options.seoText &&
          _this.seoText(options.seoText, this._seoSortOrder ?? options.seoSortOrder);
      }),
      this.text.ready().then((_) => {
        let mesh = _this.text.mesh;
        ((mesh.glui = _this),
          (mesh.shader.visible = !1),
          (_this.mesh = mesh),
          _this.group.add(mesh),
          _this._3d && !_this._style2d && _this.text.centerY(),
          _this._3d || (_this.text.mesh.shader.depthTest = !1),
          (mesh.shader.mesh = mesh),
          (mesh.onBeforeRender = (_) => {
            if (!mesh.determineVisible() && _this.firstRender) return;
            let alpha = _this.getAlpha();
            if (
              (mesh.shader.uniforms.uAlpha && (mesh.shader.uniforms.uAlpha.value = alpha),
              alpha < 0.001)
            ) {
              if (
                ((mesh.shader.visible = !1),
                (mesh.neverRender = !0),
                !_this.isDirty && _this.firstRender)
              )
                return;
            } else ((mesh.neverRender = !1), (mesh.shader.visible = !0));
            (!_this.isDirty && _this.firstRender) ||
              (RenderStats.active &&
                RenderStats.update(
                  "GLUIText",
                  1,
                  mesh.shader.vsName + "|" + mesh.shader.fsName,
                  mesh,
                ),
              (_this.group.position.x = _this._x),
              (_this.group.position.y = _this._3d ? _this._y : -_this._y),
              (_this.group.position.z = _this._z),
              _this.group.scale.set(_this._scaleX * _this._scale, _this._scaleY * _this._scale, 1),
              _this._3d
                ? _this.anchor && _this.anchor._parent
                  ? (_this.anchor.position.copy(_this.group.position),
                    _this.anchor.scale.copy(_this.group.scale),
                    _this.anchor.quaternion.setFromEuler(_this._rotation))
                  : _this.group.quaternion.setFromEuler(_this._rotation)
                : (_this.group.rotation.z = Math.radians(_this._rotation)),
              _this.firstRender ||
                (_this.group.updateMatrixWorld(!0),
                (_this.firstRender = !0),
                (mesh.shader.visible = !0)),
              _this.onInternalUpdate && _this.onInternalUpdate(),
              (_this.isDirty = !1));
          }));
      }));
  }
  get x() {
    return this._x;
  }
  set x(v) {
    (Math.abs(this._x - v) > Base3D.DIRTY_EPSILON && (this.isDirty = !0), (this._x = v));
  }
  get y() {
    return this._y;
  }
  set y(v) {
    (Math.abs(this._y - v) > Base3D.DIRTY_EPSILON && (this.isDirty = !0), (this._y = v));
  }
  get z() {
    return this._z;
  }
  set z(v) {
    (Math.abs(this._z - v) > Base3D.DIRTY_EPSILON && (this.isDirty = !0), (this._z = v));
  }
  get scale() {
    return this._scale;
  }
  set scale(v) {
    (Math.abs(this._scale - v) > Base3D.DIRTY_EPSILON && (this.isDirty = !0), (this._scale = v));
  }
  get scaleX() {
    return this._scaleX;
  }
  set scaleX(v) {
    (Math.abs(this._scaleX - v) > Base3D.DIRTY_EPSILON && (this.isDirty = !0), (this._scaleX = v));
  }
  get scaleY() {
    return this._scaleY;
  }
  set scaleY(v) {
    (Math.abs(this._scaleY - v) > Base3D.DIRTY_EPSILON && (this.isDirty = !0), (this._scaleY = v));
  }
  get rotation() {
    return this._rotation;
  }
  set rotation(v) {
    (Math.abs(this._rotation - v) > Base3D.DIRTY_EPSILON && (this.isDirty = !0),
      (this._rotation = v));
  }
  get dimensions() {
    if (
      (this._dimensions || (this._dimensions = {}),
      this.text && this.text.geometry && !this._dimensions.max)
    ) {
      if (((this._dimensions = new Box3().copy(this.text.geometry.boundingBox)), !this._3d)) {
        let bottom = -this._dimensions.min.y;
        ((this._dimensions.min.y = -this._dimensions.max.y), (this._dimensions.max.y = bottom));
      }
      ((this._dimensions.width = Math.abs(this._dimensions.max.x - this._dimensions.min.x)),
        (this._dimensions.height = Math.abs(this._dimensions.max.y - this._dimensions.min.y)));
    }
    return this._dimensions;
  }
  interact(over, click, camera = World.CAMERA, seoLink, options) {
    ("string" == typeof camera &&
      ((options = seoLink), (seoLink = camera), (camera = World.CAMERA)),
      (this._onOver = over),
      (this._onClick = click),
      (this._interactCamera = camera));
    let stage = this._3d ? GLUI.Scene : GLUI.Stage;
    const _this = this;
    return (
      _this.text.ready().then((_) => {
        if (over) {
          if (
            (_this.text.geometry.boundingBox || _this.text.geometry.computeBoundingBox(),
            !_this.hitArea)
          ) {
            let bb = _this.text.geometry.boundingBox,
              shader = Utils3D.getTestShader();
            if (
              ((shader.visible = !1),
              (_this.hitArea = new Mesh(World.PLANE, shader)),
              (_this.hitArea.glui = _this),
              bb.getSize(_this.hitArea.scale),
              (_this.hitArea.scale.z = 1),
              (_this.hitArea.position.x = (bb.max.x + bb.min.x) / 2),
              (_this.hitArea.position.y = (bb.min.y + bb.max.y) / 2),
              _this._3d)
            )
              switch (_this.text.getData().align) {
                case "center":
                  _this.hitArea.position.x = 0;
                  break;
                case "right":
                  _this.hitArea.position.x = (bb.min.x - bb.max.x) / 2;
              }
            else
              switch (_this.text.getData().align) {
                case "center":
                  _this.hitArea.position.x = 0;
                  break;
                case "right":
                  _this.hitArea.position.x = -(bb.max.x - bb.min.x) / 2;
              }
            _this.text.mesh.add(_this.hitArea);
          }
          stage.interaction.add(_this.hitArea, camera);
        } else stage.interaction.remove(_this.hitArea, camera);
      }),
      defer((_) => {
        seoLink && _this.seo && _this.seo.aLink && _this.seo.aLink(seoLink, options);
      }),
      this
    );
  }
  clearInteract() {
    if (this._onOver) {
      ((this._3d ? GLUI.Scene : GLUI.Stage).interaction.remove(this.hitArea, this._interactCamera),
        (this._onClick = GLUIObject.noop),
        (this._onOver = GLUIObject.noop));
    }
    return this;
  }
  remove(param) {
    param &&
      console.warn("GLUIObject.remove removes ITSELF from its parent. use removeChild instead");
    let stage = this._3d ? GLUI.Scene : GLUI.Stage;
    (this.mesh && this.mesh.parent ? this.group.parent.remove(this.group) : stage.remove(this),
      this.hitArea && stage.interaction.remove(this.hitArea, this._interactCamera),
      this.text && this.text.destroy && (this.text.destroy(), (this.text.gluiText = null)),
      Utils.nullObject(this.mesh),
      Utils.nullObject(this),
      (this.deleted = !0));
  }
  tween(obj, time, ease, delay) {
    return tween(this, obj, time, ease, delay);
  }
  enable3D(style2d) {
    ((this._3d = !0), (this._style2d = style2d), (this._rotation = new Euler()));
    const _this = this;
    if (
      (_this._rotation.onChange((_) => {
        _this.isDirty = !0;
      }),
      this._dimensions?.min)
    ) {
      let bottom = -this._dimensions.max.y;
      ((this._dimensions.min.y = -this._dimensions.min.y), (this._dimensions.max.y = bottom));
    }
    return (
      _this.text.ready().then((_) => {
        _this.deleted || (_this.text.mesh.shader.depthTest = !0);
      }),
      this.anchor || (this.anchor = new Group()),
      (this.anchor.onMatrixDirty = (_) => {
        _this.isDirty = !0;
      }),
      (_this.isDirty = !0),
      this
    );
  }
  depthTest(bool) {
    const _this = this;
    return (
      _this.text.ready().then((_) => {
        _this.deleted || (_this.text.mesh.shader.depthTest = bool);
      }),
      this
    );
  }
  setZ(z) {
    const _this = this;
    return (
      _this.text.ready().then((_) => {
        _this.deleted || (_this.text.mesh.renderOrder = z);
      }),
      this
    );
  }
  height() {
    return this.mesh ? this.text.height : 0;
  }
  async setText(text, options) {
    if (text && ((text = text.toString()), !1 !== options?.seoText)) {
      let seoText = options?.seoText;
      ((seoText = seoText && "boolean" != typeof seoText ? seoText.toString() : text),
        this.seoText(seoText, options?.seoSortOrder));
    }
    return (await this.text.setText(text, options), (this._dimensions = null), this);
  }
  seoText(text, sortOrder = this._seoSortOrder) {
    window.GLSEO && (GLSEO.textNode(this, text, sortOrder), delete this._seoSortOrder);
  }
  get seoSortOrder() {
    return this.seo ? this.seo.sortOrder : this._seoSortOrder;
  }
  set seoSortOrder(sortOrder) {
    this.seo ? GLSEO.textNode(this, this.seo.text(), sortOrder) : (this._seoSortOrder = sortOrder);
  }
  getTextString() {
    return this.text.string;
  }
  setColor(color) {
    const _this = this;
    return (
      _this.text.ready().then((_) => {
        _this.deleted || _this.text.setColor(color);
      }),
      this
    );
  }
  tweenColor(color, time, ease, delay) {
    const _this = this;
    return (
      _this.text.ready().then((_) => {
        _this.deleted || _this.text.tweenColor(color, time, ease, delay);
      }),
      this
    );
  }
  async resize(options) {
    (await this.text.ready(), await this.text.resize(options), (this._dimensions = null));
  }
  show() {
    const _this = this;
    return (
      _this.text.ready().then((_) => {
        _this.deleted || ((this.text.mesh.visible = !0), this.text.mesh.updateMatrixWorld(!0));
      }),
      this
    );
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
  hide() {
    const _this = this;
    return (
      _this.text.ready().then((_) => {
        _this.deleted || (_this.text.mesh.visible = !1);
      }),
      this
    );
  }
  loaded() {
    return this.text.ready();
  }
  length() {
    return this.text.charLength;
  }
  deferRender(parent) {
    ((this.deferred = !0),
      parent || (this.anchor || (this.anchor = new Group()), GLUI.Scene.addDeferred(this)));
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
  size() {}
  onResize(callback) {
    this.text.onResize(callback);
  }
  offResize(callback) {
    this.text.offResize(callback);
  }
  upload() {
    const _this = this;
    return (
      _this.text.ready().then((_) => {
        _this.deleted || _this.text.mesh.upload();
      }),
      this
    );
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
      this.onDivBlurSelect && this.onDivSelect());
  }
  get _parent() {
    return this.parent;
  }
  async useShader(shader) {
    (await this.text.ready(),
      (shader.uniforms.tMap = this.text.shader.uniforms.tMap),
      (shader.uniforms.tMapBold = this.text.shader.uniforms.tMapBold),
      (shader.uniforms.tMapItalic = this.text.shader.uniforms.tMapItalic),
      (shader.uniforms.uAlpha = this.text.shader.uniforms.uAlpha),
      (shader.uniforms.uColor = this.text.shader.uniforms.uColor),
      (shader.transparent = !0),
      (!this._3d || this._3d || this.parent) && (shader.depthTest = !1),
      (this.text.mesh.shader = shader || this.text.shader),
      (this.text.shader = shader),
      (this.text.mesh.shader.mesh = this.text.mesh));
  }
  get shader() {
    return this.text?.shader;
  }
}
