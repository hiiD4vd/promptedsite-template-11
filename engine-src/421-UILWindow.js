Class(function UILWindow(_title, _opts = { hide: !1, drag: !0, resize: !0 }) {
  Inherit(this, Element);
  const _this = this;
  let $this,
    $header,
    $container,
    $toggle,
    $title,
    _folder,
    _hidden,
    _initialX,
    _initialY,
    _open = !_opts.closed,
    _x = _opts.left || 350,
    _y = _opts.top || 50,
    _xOffset = _x,
    _yOffset = _y,
    _dragging = !1;
  function hide() {
    ($this && $this.invisible(), (_hidden = !0), _this.onClose && _this.onClose());
  }
  function show() {
    ($this && $this.visible(), (_hidden = !1));
  }
  function onKeydown(e) {
    if (e.ctrlKey || e.metaKey) {
      if (72 == e.keyCode && e.shiftKey) {
        if (`${document.activeElement.type}`.includes(["textarea", "input", "number"])) return;
        (e.preventDefault(), _hidden ? show() : hide());
      }
      (67 == e.which && e.shiftKey && (e.preventDefault(), _folder.forEachFolder((f) => f.close())),
        79 == e.which &&
          e.shiftKey &&
          (e.preventDefault(), _folder.forEachFolder((f) => f.open())));
    }
  }
  function onMouseDown(e) {
    (e.preventDefault(),
      $header.css({ cursor: "move" }),
      (_initialX = e.clientX - _xOffset),
      (_initialY = e.clientY - _yOffset),
      (_dragging = !0),
      document.addEventListener("mousemove", onMouseMove, !1),
      document.addEventListener("mouseup", onMouseUp, !1));
  }
  function onMouseMove(e) {
    (e.preventDefault(),
      (_x = e.clientX - _initialX),
      (_y = e.clientY - _initialY),
      (_xOffset = _x),
      (_yOffset = _y),
      ($this.x = _x),
      ($this.y = _y),
      $this.transform());
  }
  function onMouseUp() {
    ($header.css({ cursor: "" }),
      (_initialX = _x),
      (_initialY = _y),
      (_dragging = !1),
      document.removeEventListener("mousemove", onMouseMove, !1),
      document.removeEventListener("mouseup", onMouseUp, !1));
  }
  function onToggle(e) {
    ("click" !== e.type && 13 !== e.which) ||
      (_open
        ? (function close() {
            ((_open = !1), $container.css({ display: "none" }), $toggle.text("▶"));
          })()
        : (function open() {
            ((_open = !0), $container.css({ display: "block" }), $toggle.text("▼"));
          })());
  }
  function undim() {
    _dragging || $this.css({ opacity: 1 });
  }
  function dim() {
    _dragging || $this.css({ opacity: 0.3 });
  }
  ((_this.id = _title),
    (function initHTML() {
      (($this = _this.element),
        $this.bg("#161616").transform({ x: _x, y: _y }).mouseEnabled(!0),
        $this.css({
          position: "absolute",
          userSelect: "none",
          overflowY: "auto",
          borderRadius: 4,
          maxHeight: _opts.maxHeight || "100%",
          border: "1px solid #2e2e2e",
        }));
    })(),
    (function initHeader() {
      (($header = $this.create("header")),
        $header.size("100%", "auto").bg("#272727"),
        $header.css({
          display: "block",
          color: "#B1B1B1",
          padding: "4px 4px",
          boxSizing: "border-box",
          fontFamily: "sans-serif",
          fontSize: 11,
          fontWeight: "bold",
          userSelect: "none",
          minWidth: 200,
        }),
        ($toggle = $header.create("toggle")),
        $toggle
          .text(_open ? "▼" : "▶")
          .css({ fontSize: 8, paddingLeft: 4, display: "inline-block", verticalAlign: "middle" }),
        $toggle.click(onToggle),
        ($title = $header.create("title")),
        $title.text(_opts.label || _title).css({ display: "inline-block", marginLeft: 4 }),
        $title.click(onToggle));
      let $close = $header.create("close");
      ($close.text("✕").css({ position: "absolute", right: 7, top: 5, display: "inline-block" }),
        $close.click(hide));
    })(),
    (function initContainer() {
      (($container = $this.create("container")),
        $container.size(_opts.width || "auto", _opts.height || "auto"),
        $container.css({
          position: "realtive",
          overflowY: "auto",
          padding: 4,
          boxSizing: "border-box",
          minWidth: _opts.minWidth || 0,
        }),
        _opts.resize && $container.css({ resize: "both", minWidth: 200, minHeight: 60 }),
        _open || $container.css({ display: "none" }));
    })(),
    (function initGroup() {
      ((_folder = _this.initClass(
        UILFolder,
        _title,
        { hideTitle: !0, background: "#161616" },
        null,
      )),
        (_this.folder = _folder),
        $container.add(_folder));
    })(),
    (function addHandlers() {
      (document.addEventListener("keydown", onKeydown, !1),
        _opts.drag && $header.div.addEventListener("mousedown", onMouseDown, !1),
        _opts.hide &&
          ($this.div.addEventListener("mouseover", undim, !1),
          $this.div.addEventListener("mouseleave", dim, !1)));
    })(),
    (this.add = function (child) {
      return (_folder.add(child), _this);
    }),
    (this.remove = function (x) {
      return (_folder.remove(id), _this);
    }),
    (this.get = function (id) {
      return _folder.get(id);
    }),
    (this.find = function (id) {
      return _folder.find(id);
    }),
    (this.filter = function (str) {
      return _folder.filter(str);
    }),
    (this.show = function () {
      return (show(), _this);
    }),
    (this.hide = function () {
      return (hide(), _this);
    }),
    (this.isVisible = function () {
      return !_hidden;
    }),
    (this.enableSorting = function (key) {
      return (_folder.enableSorting && _folder.enableSorting(key), _this);
    }),
    (this.eliminate = function () {
      (_opts.drag && $header.div.removeEventListener("mousedown", onMouseDown, !1),
        _opts.hide &&
          ($this.div.removeEventListener("mouseover", undim, !1),
          $this.div.removeEventListener("mouseleave", dim, !1)),
        document.removeEventListener("keydown", onKeydown, !1));
    }));
});
