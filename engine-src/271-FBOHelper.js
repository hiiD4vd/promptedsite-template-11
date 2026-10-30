Class(function FBOHelper() {
  Inherit(this, Element);
  const _this = this,
    $this = _this.element,
    { getType: getType } = require("GLTypes"),
    LABEL_OFFSET = 20;
  let _renderer,
    $list,
    $label,
    $tableTop,
    $tableBottom,
    _counter = 0,
    _activeFBO = null,
    _mouseOnStart = new Vector2(),
    _lastOffset = new Vector2();
  function resize() {
    _this.fbos.forEach(resizeSingle);
  }
  function resizeSingle($fbo, index = 0) {
    const prevFboHeight = index > 0 ? _this.fbos[index - 1].height : 0;
    (($fbo.x = 50), ($fbo.y = Stage.height / 2 - $fbo.height / 2 - prevFboHeight));
  }
  function handleQuadOver() {
    if (!_activeFBO) return void $label.css({ display: "none" });
    $label.css({
      top: Mouse.y - LABEL_OFFSET,
      left: Mouse.x + LABEL_OFFSET,
      pointerEvents: "none",
    });
    const quad = _this.quads[_activeFBO],
      quadHit = quad.interaction.checkObjectHit(quad, Mouse);
    if (quadHit) {
      const uv = quadHit.uv;
      !(function readPixel(fbo, u, v) {
        const x = ~~(fbo.width * u),
          y = ~~(fbo.height * v);
        fbo instanceof Texture ||
          _renderer.readPixels(
            fbo,
            x,
            y,
            1,
            1,
            fbo.__pixelBuffer,
            getType(fbo.texture) || _renderer.context.FLOAT,
          );
        const posText = `\n            X: ${x} </br>\n            Y: ${y} </br>\n            u: ${u} </br>\n            v: ${v} </br>\n            </br>\n        `,
          dataText = `\n            R: ${fbo.__pixelBuffer[0]} </br>\n            G: ${fbo.__pixelBuffer[1]} </br>\n            B: ${fbo.__pixelBuffer[2]} </br>\n            A: ${fbo.__pixelBuffer[3]} </br>\n        `;
        ($tableTop.html(posText), $tableBottom.html(dataText));
      })(_this.fbos[_activeFBO], uv.x, uv.y);
    }
  }
  function loop() {
    handleQuadOver();
  }
  ((_this.fbos = []),
    (_this.quads = []),
    (_this.items = []),
    (_renderer = World.RENDERER),
    _this.onResize(resize),
    (function initUI() {
      const styles = {
        position: "absolute",
        top: "0",
        left: "0",
        color: "#FFF",
        background: "#161616",
        fontFamily: "sans-serif",
      };
      (($list = $this.create("div").css({ ...styles, padding: 20, minWidth: 150 })),
        $list
          .create("strong")
          .css({ position: "relative", paddingBottom: 15, fontWeight: 900 })
          .text("FBO helper"),
        ($label = $this
          .create("label")
          .css({
            ...styles,
            display: "flex",
            flexFlow: "column nowrap",
            fontSize: "14px",
            padding: "10px",
          })),
        ($tableTop = $label.create("span").css({ position: "relative" })),
        ($tableBottom = $label.create("span").css({ position: "relative" })),
        Stage.add($label));
    })(),
    Stage.add($this),
    _this.startRender(loop),
    (_this.attach = function (fbo, params = {}) {
      (!(function setFBOBufferType(fbo) {
        const possibleTypes = {};
        ((possibleTypes[Texture.UNSIGNED_BYTE] = Uint8Array),
          (possibleTypes[Texture.FLOAT] = Float32Array),
          (possibleTypes[Texture.HALF_FLOAT] = Uint16Array));
        const type = possibleTypes[fbo.texture ? fbo.texture.type : fbo.type];
        (type || console.warn(`Can't find texture type ${fbo.texture.type}`),
          (fbo.__pixelBuffer = new type(4)),
          _this.fbos.push(fbo));
      })(fbo),
        (function initScreenQuad(fbo, params) {
          const width = params.width || 600,
            height = params.height || fbo.height ? (fbo.height * width) / fbo.width : 600,
            name = params.name || `FBO #${String(_this.fbos.length + 1).padStart(2, "0")}`,
            $quad = $gl(width, height, fbo.texture || fbo);
          (($quad.group.visible = !1),
            ($quad.__i = _counter),
            $quad.interact(
              (e) => {
                _this.flag("isDragging") ||
                  ("over" === e.action &&
                    ($label.css({ display: "flex" }), (_activeFBO = $quad.__i)),
                  "out" === e.action && $label.css({ display: "none" }));
              },
              (e) => {},
            ));
          const input = new Interaction(Stage);
          (_this.events.sub(input, Interaction.END, function onMouseUp() {
            _this.flag("isDragging", !1);
          }),
            _this.events.sub(input, Interaction.START, function onMouseDown() {
              ((_mouseOnStart.x = Mouse.x), (_mouseOnStart.y = Mouse.y));
              const activeQuad = _this.quads[_activeFBO];
              if (!activeQuad?.group) return;
              const activeQuadGroup = activeQuad.group,
                diffX = _mouseOnStart.x - activeQuadGroup.position.x - activeQuad.dimensions.x / 2,
                diffY = _mouseOnStart.y + activeQuadGroup.position.y - activeQuad.dimensions.y / 2;
              ((_lastOffset.x = diffX), (_lastOffset.y = diffY));
            }),
            _this.events.sub(input, Interaction.DRAG, function onMouseDrag() {
              if (_activeFBO) {
                if (_this.quads[_activeFBO].group) {
                  const $obj = _this.quads[_activeFBO],
                    group = $obj.group;
                  ((group.position.x = Mouse.x - $obj.dimensions.x / 2 - _lastOffset.x),
                    (group.position.y = -1 * (Mouse.y - $obj.dimensions.y / 2) + _lastOffset.y));
                }
                _this.flag("isDragging", !0);
              }
            }));
          let $item = $list
            .create("")
            .text(name)
            .css({
              position: "relative",
              wordBreak: "keep-all",
              padding: 5,
              fontSize: "14px",
              marginBottom: 5,
            });
          ($item.interact(
            () => {},
            (e) => {
              const isVisible = $quad.group.visible;
              ($item.css({ background: isVisible ? "#161616" : "#333" }),
                ($quad.group.visible = !isVisible));
            },
          ),
            resizeSingle($quad),
            GLUI.Stage.add($quad),
            _this.quads.push($quad));
        })(fbo, params),
        _counter++);
    }));
}, "singleton");
