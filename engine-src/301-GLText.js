Class(
  function GLText({
    font: font,
    italic: italic = !1,
    bold: bold = !1,
    text: text,
    width: width = 1 / 0,
    align: align = "left",
    size: size = 1,
    direction: direction = "ltr",
    letterSpacing: letterSpacing = 0,
    lineHeight: lineHeight = 1.4,
    wordSpacing: wordSpacing = 0,
    wordBreak: wordBreak = !1,
    langBreak: langBreak = !1,
    paragraphSpacing: paragraphSpacing = 1,
    indent: indent = 0,
    waitForSetText: waitForSetText = !1,
    karaoke: karaoke = !1,
    color: color = new Color("#000000"),
    alpha: alpha = 1,
    shader: shader = "DefaultText",
    customCompile: customCompile = !1,
  }) {
    const _this = this;
    var _override,
      _promise = Promise.create(),
      _fontLoaded = !1,
      _needsInit = !0;
    _this.fontLoaded = Promise.create();
    const config = GLText.FONT_CONFIG[font],
      _resizeCallbacks = new Set();
    function setText(txt, promise) {
      (waitForSetText && ((waitForSetText = !1), (promise = _promise)),
        (text = txt),
        (_this.charLength = text.length),
        (_this.string = text),
        (function overrideParams() {
          if (GLText.overrideParams) {
            _override = {
              letterSpacing: letterSpacing,
              size: size,
              wordSpacing: wordSpacing,
              lineHeight: lineHeight,
            };
            let obj = GLText.overrideParams({
              letterSpacing: letterSpacing,
              size: size,
              wordSpacing: wordSpacing,
              lineHeight: lineHeight,
            });
            ((letterSpacing = obj.letterSpacing),
              (size = obj.size),
              (wordSpacing = obj.wordSpacing),
              (lineHeight = obj.lineHeight));
          }
        })(),
        (_this.text = new GLTextGeometry({
          font: font,
          italic: italic,
          bold: bold,
          text: text,
          width: width,
          align: align,
          direction: direction,
          wordSpacing: wordSpacing,
          letterSpacing: letterSpacing,
          paragraphSpacing: paragraphSpacing,
          size: size,
          lineHeight: lineHeight,
          wordBreak: wordBreak,
          langBreak: langBreak,
          config: config,
          indent: indent,
        })),
        _fontLoaded ||
          ((_fontLoaded = !0),
          _this.text.fontLoaded.then((result) => _this.fontLoaded.resolve(result))),
        (function resetOverride() {
          _override &&
            ((letterSpacing = _override.letterSpacing),
            (size = _override.size),
            (wordSpacing = _override.wordSpacing),
            (lineHeight = _override.lineHeight));
        })(),
        promise || (promise = Promise.create()),
        (_promise = promise),
        _this.text.loaded.then(
          ({
            buffers: buffers,
            texture: texture,
            textureBold: textureBold,
            textureItalic: textureItalic,
            height: height,
            numLines: numLines,
          }) => {
            _this.deleted ||
              (_promise === promise
                ? (_needsInit
                    ? ((_needsInit = !1),
                      (_this.texture = texture),
                      bold && (_this.textureBold = textureBold),
                      italic && (_this.textureItalic = textureItalic),
                      (_this.shader = new (shader.includes("PBR") ? PBRShader : Shader)(shader, {
                        tMap: { value: _this.texture, ignoreUIL: !0 },
                        tMapBold: {
                          value: _this.textureBold || Utils3D.getEmptyTexture(),
                          ignoreUIL: !0,
                        },
                        tMapItalic: {
                          value: _this.textureItalic || Utils3D.getEmptyTexture(),
                          ignoreUIL: !0,
                        },
                        uColor: { value: color, ignoreUIL: !0 },
                        uAlpha: { value: alpha, ignoreUIL: !0 },
                        transparent: !0,
                        customCompile: customCompile,
                      })),
                      _this.onCreateShader && _this.onCreateShader(_this.shader),
                      (function createGeometry(buffers) {
                        ((_this.geometry = new Geometry()),
                          _this.geometry.addAttribute(
                            "position",
                            new GeometryAttribute(buffers.position, 3),
                          ),
                          _this.geometry.addAttribute("uv", new GeometryAttribute(buffers.uv, 2)),
                          _this.geometry.addAttribute(
                            "local",
                            new GeometryAttribute(buffers.local, 2),
                          ),
                          _this.geometry.addAttribute(
                            "animation",
                            new GeometryAttribute(buffers.animation, 3),
                          ),
                          karaoke && setKaraokeBuffer(buffers.animation));
                        (_this.geometry.addAttribute(
                          "weight",
                          new GeometryAttribute(buffers.weight, 1),
                        ),
                          _this.geometry.setIndex(new GeometryAttribute(buffers.index, 1)),
                          (_this.geometry.boundingBox = new Box3().copy(buffers.boundingBox)),
                          (_this.geometry.boundingSphere = new Sphere().copy(
                            buffers.boundingSphere,
                          )),
                          (_this.geometry.letterCount = buffers.letterCount + 1),
                          (_this.geometry.wordCount = buffers.wordCount + 1),
                          (_this.geometry.lineCount = buffers.lineCount + 1),
                          tryResizeCallbacks());
                      })(buffers),
                      (_this.mesh = new Mesh(_this.geometry, _this.shader)),
                      (_this.mesh.text = _this),
                      (_this.height = height),
                      _this.needsCenterY && _this.centerY(),
                      _this.onCreateMesh && _this.onCreateMesh(_this.mesh))
                    : (!(function updateGeometry(buffers) {
                        (_this.geometry.attributes.position.setArray(buffers.position),
                          _this.geometry.attributes.uv.setArray(buffers.uv),
                          _this.geometry.attributes.animation.setArray(buffers.animation),
                          karaoke && setKaraokeBuffer(buffers.animation));
                        (_this.geometry.attributes.weight.setArray(buffers.weight),
                          _this.geometry.setIndex(buffers.index),
                          (_this.geometry.indexNeedsUpdate = !0),
                          _this.geometry.boundingBox.copy(buffers.boundingBox),
                          _this.geometry.boundingSphere.copy(buffers.boundingSphere),
                          (_this.geometry.letterCount = buffers.letterCount + 1),
                          (_this.geometry.wordCount = buffers.wordCount + 1),
                          (_this.geometry.lineCount = buffers.lineCount + 1),
                          tryResizeCallbacks());
                      })(buffers),
                      (_this.height = height),
                      _this.needsCenterY && _this.centerY()),
                  promise.resolve())
                : _promise.then((result) => promise.resolve(result)));
          },
        ));
    }
    function setKaraokeBuffer(animationBuffer) {
      const karaokeBuffer = new GeometryAttribute(new Float32Array(animationBuffer), 3),
        karaokeWords = karaoke.words.filter((t) => "word" === t.type);
      for (let i = 0; i < animationBuffer.length; i += 3) {
        animationBuffer[i];
        const wordIndex = animationBuffer[i + 1],
          karaokeItem = (animationBuffer[i + 2], karaokeWords[wordIndex]);
        karaokeItem &&
          ((karaokeBuffer.array[i] = karaokeItem.start),
          (karaokeBuffer.array[i + 1] = karaokeItem.end),
          (karaokeBuffer.array[i + 2] = 0));
      }
      _this.geometry.attributes.karaoke
        ? _this.geometry.attributes.karaoke.setArray(karaokeBuffer.array)
        : _this.geometry.addAttribute("karaoke", karaokeBuffer);
    }
    function tryResizeCallbacks() {
      _resizeCallbacks.forEach((callback) => {
        try {
          callback(_this);
        } catch (e) {
          console.error("Error in GLText resize callback:", e);
        }
      });
    }
    (!(function init() {
      waitForSetText
        ? ((_this.charLength = text.length), (_this.string = text))
        : setText(text, _promise);
    })(),
      void 0 === font && console.log(font, text),
      (this.destroy = function () {
        (_resizeCallbacks.clear(),
          _this.mesh && _this.mesh.destroy && _this.mesh.destroy(),
          (_this.mesh.text = null),
          (_this.deleted = !0));
      }),
      (this.ready = this.loaded =
        function () {
          return _promise;
        }),
      (this.centerY = function () {
        (_this.mesh && (_this.mesh.position.y = 0.5 * _this.height), (_this.needsCenterY = !0));
      }),
      (this.resize = function (options) {
        return this.setText(text, options);
      }),
      (this.tweenColor = function (c, time = 300, ease = "easeOutCubic") {
        c && color.tween(c, time, ease);
      }),
      (this.setColor = function (c) {
        c && color.set(c);
      }),
      (this.setText = function (txt, options) {
        if (
          txt &&
          (text !== txt ||
            !(function match(options) {
              return (
                !options ||
                (options.font == font &&
                  options.italic == italic &&
                  options.bold == bold &&
                  options.width == width &&
                  options.align == align &&
                  options.direction == direction &&
                  !(options.wordSpacing > 0 && options.wordSpacing != wordSpacing) &&
                  options.letterSpacing == letterSpacing &&
                  options.paragraphSpacing == paragraphSpacing &&
                  options.size == size &&
                  options.indent == indent &&
                  options.lineHeight == lineHeight &&
                  !(
                    (!0 === options.wordBreak && !options.wordBreak) ||
                    (0 == options.wordBreak && options.wordBreak)
                  ))
              );
            })(options))
        )
          return (
            (function setVars(options) {
              ((font = options.font || font),
                (karaoke = options.karaoke || karaoke),
                (bold = options.bold || bold),
                (italic = options.italic || italic),
                (width = options.width || width),
                (align = options.align || align),
                (wordSpacing = options.wordSpacing || wordSpacing),
                (letterSpacing = options.letterSpacing || letterSpacing),
                (paragraphSpacing = options.paragraphSpacing || paragraphSpacing),
                (size = options.size || size),
                (lineHeight = options.lineHeight || lineHeight),
                (wordBreak = options.wordBreak || wordBreak),
                (langBreak = options.langBreak || langBreak),
                (direction = options.direction || direction),
                (indent = options.indent || indent));
            })(options || {}),
            setText(txt),
            _promise
          );
      }),
      (this.getData = function () {
        return {
          font: font,
          italic: italic,
          bold: bold,
          text: text,
          width: width,
          align: align,
          direction: direction,
          wordSpacing: wordSpacing,
          letterSpacing: letterSpacing,
          paragraphSpacing: paragraphSpacing,
          size: size,
          lineHeight: lineHeight,
          wordBreak: wordBreak,
          langBreak: langBreak,
          color: color,
          indent: indent,
        };
      }),
      (this.onResize = function (callback) {
        if ("function" == typeof callback) return (_resizeCallbacks.add(callback), this);
      }),
      (this.offResize = function (callback) {
        return (_resizeCallbacks.delete(callback), this);
      }));
  },
  (_) => {
    GLText.FONT_CONFIG = {};
  },
);
