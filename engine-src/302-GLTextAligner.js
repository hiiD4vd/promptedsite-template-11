Class(function GLTextAligner() {
  Inherit(this, Component);
  const _this = this,
    _stageContainer = Stage.create("stageContainer", "div");
  let _container,
    _currentFont,
    _fonts,
    _glContainer = $gl(),
    _currentOptions = {
      align: "center",
      fontSize: 60,
      letterSpacing: 0,
      lineHeight: 1.2,
      width: 900,
      baseOffset: 0,
    },
    _currentText = "lorem ipsum dolor sit amet consectetur adipiscing elit";
  const inputStyles = {
    width: "100%",
    padding: "8px",
    fontSize: "16px",
    backgroundColor: "#333",
    color: "white",
    border: "1px solid #666",
    borderRadius: "4px",
    cursor: "pointer",
    fontFamily: "monospace",
    display: "block",
  };
  function updateFonts() {
    (_container && _container.remove(),
      _glContainer && GLUI.Stage.remove(_glContainer),
      (_glContainer = $gl()),
      GLUI.Stage.add(_glContainer),
      GLText.FONT_CONFIG[_currentFont] || (GLText.FONT_CONFIG[_currentFont] = {}),
      (GLText.FONT_CONFIG[_currentFont].baseOffset = _currentOptions.baseOffset),
      (_this.outputConfig[_currentFont] =
        `GLText.FONT_CONFIG['${_currentFont}'] = ${JSON.stringify(GLText.FONT_CONFIG[_currentFont], null, 2)};`),
      (_container = Stage.create("container", "div")),
      _container.css({
        color: "red",
        width: "100%",
        display: "flex",
        justifyContent:
          "center" === _currentOptions.align
            ? "center"
            : "right" === _currentOptions.align
              ? "flex-end"
              : "flex-start",
        opacity: 0.5,
      }));
    const element = Stage.create("text", "div");
    (element.css({
      position: "relative",
      fontFamily: _fonts.find((font) => font.name === _currentFont).cssName,
      fontSize: _currentOptions.fontSize,
      textAlign: _currentOptions.align,
      letterSpacing: `${_currentOptions.letterSpacing}px`,
      lineHeight: _currentOptions.lineHeight,
      width: "auto" === _currentOptions.width ? "auto" : `${_currentOptions.width}px`,
      fontVariationSettings: "'wdth' 100, 'wght' 95, 'slnt' 0",
    }),
      element.text(_currentText),
      _container.add(element));
    const $el = $glText(element.div.innerText, _currentFont, parseInt(_currentOptions.fontSize), {
      align: _currentOptions.align,
      letterSpacing: _currentOptions.letterSpacing / _currentOptions.fontSize,
      lineHeight: _currentOptions.lineHeight,
      width: "auto" === _currentOptions.width ? Stage.width : _currentOptions.width,
    });
    ($el.text.ready().then(() => {
      "center" === _currentOptions.align
        ? ($el.x = Stage.width / 2)
        : "right" === _currentOptions.align
          ? ($el.x = Stage.width)
          : ($el.x = 0);
    }),
      _glContainer.add($el));
  }
  ((_this.outputConfig = {}),
    (async function () {
      (console.warn(
        'GLTextAligner: remember to exclude it from the build by adding it to the EXCLUDE array in build.json like so: `"gltext/GLTextAligner|env!=dev"`',
      ),
        await defer(),
        (_fonts = (function loadFontsData() {
          return ASSETS.SW.filter((path) => path.includes("fonts/"))
            .map((path) => {
              const ext = path.split(".").pop(),
                name = path.split("fonts/").pop().split(".").shift(),
                cssName = name.split("/").pop(),
                cssExt = ASSETS.SW.filter((p) => p.includes(name))
                  .map((p) => p.split(".").pop())
                  .filter((ext) => !["json", "png"].includes(ext));
              return { name: name, path: path, ext: ext, cssExt: cssExt, cssName: cssName };
            })
            .filter((font) => "json" === font.ext);
        })()),
        (_currentFont = _fonts[0].name),
        (function createFontFaces(fontsData) {
          fontsData.forEach((font) => {
            const face = Stage.create("fontFace", "style"),
              pathNoExt = font.path.split(".").slice(0, -1).join(".");
            ((font.cssExt || []).forEach((ext) => {
              face.div.innerText += `@font-face { font-family: '${font.cssName}'; src: url('${pathNoExt}.${ext}') format('${"ttf" === ext || "otf" === ext ? "opentype" : ext}'); }`;
            }),
              document.head.appendChild(face.div));
          });
        })(_fonts),
        (function createFontSelector(fontsData) {
          const selectContainer = Stage.create("fontSelector", "div"),
            select = Stage.create("fontSelect", "select");
          (select.css(inputStyles),
            fontsData.forEach((font) => {
              const option = document.createElement("option");
              ((option.value = font.name),
                (option.textContent = font.name),
                (option.style.fontFamily = font.name),
                font.name === _currentFont && (option.selected = !0),
                select.div.appendChild(option));
            }),
            select.div.addEventListener("change", (e) => {
              ((_currentFont = e.target.value), updateFonts());
            }),
            selectContainer.add(select),
            _stageContainer.add(selectContainer));
        })(_fonts),
        (function createTextInput() {
          const inputContainer = Stage.create("textInputContainer", "div");
          inputContainer.css({ marginTop: "10px" });
          const input = Stage.create("textInput", "textarea");
          ((input.div.value = _currentText),
            input.css({ ...inputStyles, minHeight: "100px" }),
            input.div.addEventListener("change", (e) => {
              ((_currentText = e.target.value), updateFonts());
            }),
            inputContainer.add(input),
            _stageContainer.add(inputContainer));
        })(),
        (function createBaseOffsetInput() {
          const inputContainer = Stage.create("baseOffsetContainer", "div");
          inputContainer.css({ marginTop: "10px" });
          const input = Stage.create("baseOffsetInput", "input");
          ((input.div.type = "number"),
            (input.div.step = "0.01"),
            (input.div.value = _currentOptions.baseOffset),
            input.css(inputStyles),
            input.div.addEventListener("change", (e) => {
              ((_currentOptions.baseOffset = parseFloat(e.target.value)), updateFonts());
            }),
            inputContainer.add(input),
            _stageContainer.add(inputContainer));
        })(),
        (function createSaveButton() {
          const buttonContainer = Stage.create("saveButtonContainer", "div");
          buttonContainer.css({ marginTop: "10px" });
          const button = Stage.create("saveButton", "button");
          (button.text("Save"),
            button.css(inputStyles),
            button.div.addEventListener("click", () => {
              (console.log(Object.values(_this.outputConfig).join("\n")),
                navigator.clipboard.writeText(Object.values(_this.outputConfig).join("\n")));
            }),
            buttonContainer.add(button),
            _stageContainer.add(buttonContainer));
        })(),
        updateFonts(),
        _this.onResize(() => {
          updateFonts();
        }),
        _stageContainer.css({
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 100,
          width: "40vw",
        }),
        Stage.add(_stageContainer),
        GLUI.Stage.add(_glContainer));
    })());
});
