Class(
  function GLTextGeometry({
    font: font,
    italic: italic,
    bold: bold,
    text: text,
    width: width = 1 / 0,
    align: align = "left",
    size: size = 1,
    direction: direction = "ltr",
    letterSpacing: letterSpacing = 0,
    paragraphSpacing: paragraphSpacing = 1,
    indent: indent = 0,
    lineHeight: lineHeight = 1.4,
    wordSpacing: wordSpacing = 0,
    wordBreak: wordBreak = !1,
    langBreak: langBreak = !1,
    config: config = {},
  }) {
    let json,
      texture,
      glyphs,
      bJson,
      bTexture,
      bGlyphs,
      iJson,
      iTexture,
      iGlyphs,
      _this = this;
    ((_this.loaded = Promise.create()),
      (_this.fontLoaded = Promise.create()),
      (async function init() {
        (await (async function loadFont() {
          (([json, texture, glyphs] = await GLTextGeometry.loadFont(font)),
            bold && ([bJson, bTexture, bGlyphs] = await GLTextGeometry.loadFont(bold)));
          italic && ([iJson, iTexture, iGlyphs] = await GLTextGeometry.loadFont(italic));
          _this.fontLoaded.resolve();
        })(),
          (async function createGeometry() {
            let buffers = await GLTextThread.generate({
              font: font,
              bold: bold,
              italic: italic,
              text: text,
              width: width,
              align: align,
              size: size,
              direction: direction,
              letterSpacing: letterSpacing,
              paragraphSpacing: paragraphSpacing,
              indent: indent,
              lineHeight: lineHeight,
              wordSpacing: wordSpacing,
              wordBreak: wordBreak,
              langBreak: langBreak,
              json: json,
              glyphs: glyphs,
              bJson: bJson,
              bGlyphs: bGlyphs,
              iJson: iJson,
              iGlyphs: iGlyphs,
              config: config,
            });
            ((_this.buffers = buffers),
              (_this.texture = texture),
              (_this.textureBold = bTexture),
              (_this.textureItalic = iTexture),
              (_this.numLines = buffers.lineLength),
              (_this.height = _this.numLines * size * lineHeight),
              _this.onLayout && _this.onLayout(buffers, texture, _this.height, _this.numLines),
              _this.loaded.resolve({
                buffers: buffers,
                texture: texture,
                textureBold: bTexture,
                textureItalic: iTexture,
                height: _this.height,
                numLines: _this.numLines,
              }));
          })());
      })());
  },
  (_) => {
    async function loadJSON(font) {
      return await get(
        (function getPathTo(font, ext) {
          let fontName = GLTextGeometry.fontMapping[font] || font,
            suffix = ext ? `.${ext}` : "";
          return Assets.getPath(`${getFontPath(font)}${fontName}${suffix}`);
        })(font, "json"),
      );
    }
    function getFontPath(font) {
      return GLTextGeometry.fontMapping[font] && GLTextGeometry.fontPath[font]
        ? GLTextGeometry.fontPath[font]
        : "assets/fonts/";
    }
    let _promises = {},
      _fonts = {};
    ((GLTextGeometry.fontMapping = {}),
      (GLTextGeometry.fontPath = {}),
      (GLTextGeometry.chars = {}),
      (GLTextGeometry.loadFont = async function (font) {
        let info = _fonts[font];
        if (!info)
          if (_promises[font]) info = await _promises[font];
          else {
            let promise = Promise.create();
            _promises[font] = promise;
            let json = await loadJSON(font),
              glyphs = {};
            (json.chars.forEach((d) => (glyphs[d.char] = d)),
              (GLTextGeometry.chars[font] = json.chars),
              (info = [json, null, glyphs]),
              (_fonts[font] = info),
              delete _promises[font],
              promise.resolve(info));
          }
        return (
          (info[1] = (function loadTexture(font) {
            let base = `${getFontPath(font)}${font}`,
              path =
                [`${base}.ktx2`, Assets.supportsWebP() && `${base}.webp`]
                  .filter(Boolean)
                  .find((candidate) => (window.ASSETS?.SW || []).includes(candidate)) ||
                `${base}.png`,
              texture = Utils3D.getTexture(path);
            return ((texture.generateMipmaps = !1), (texture.minFilter = Texture.LINEAR), texture);
          })(font)),
          info
        );
      }));
  },
);
