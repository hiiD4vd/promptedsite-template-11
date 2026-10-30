Class(function AccessibilityUtils() {
  Inherit(this, Component);
  const _this = this;
  let addSrDebounce = null,
    removeSrDebounce = null;
  function setAriaHiddenRecursive(element, ignoreElement, value) {
    if (ignoreElement === element) return;
    (_this.originalAttributes.push({
      element: element,
      ariaHidden: element.getAttribute("aria-hidden"),
      tabindex: element.getAttribute("tabindex"),
    }),
      element.setAttribute("aria-hidden", value),
      element.setAttribute("tabindex", value ? "-1" : "initial"),
      null === element.getAttribute("tabindex") && element.removeAttribute("tabindex"));
    const childNodes = element.childNodes;
    for (const childNode of childNodes)
      childNode.nodeType === Node.ELEMENT_NODE &&
        setAriaHiddenRecursive(childNode, ignoreElement, value);
  }
  function hideAriaOnStage(element = null) {
    _this.ariaHideAllApplied ||
      ((_this.ariaHideAllApplied = !0),
      (_this.originalAttributes.length = 0),
      console.log(Stage.div.children[0]),
      setAriaHiddenRecursive(Stage.div.querySelectorAll(".Container")[0], element, !0));
  }
  ((_this.originalAttributes = []),
    (_this.ariaHideAllApplied = !1),
    (this.trapFocus = function trapFocus(element, e, additionalItems = []) {
      if (!("Tab" === e.key || 9 === e.keyCode)) return;
      hideAriaOnStage(element);
      const focusableElements = element.querySelectorAll(
          'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])',
        ),
        elements = additionalItems
          .flatMap((item) =>
            Array.from(
              item.querySelectorAll(
                'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])',
              ),
            ),
          )
          .concat(Array.from(focusableElements)),
        firstFocusableEl = elements[0],
        lastFocusableEl = elements[elements.length - 1];
      e.shiftKey
        ? document.activeElement === firstFocusableEl &&
          (lastFocusableEl.focus(), e.preventDefault())
        : document.activeElement === lastFocusableEl &&
          (firstFocusableEl.focus(), e.preventDefault());
    }),
    (this.trapFocusMobile = function trapFocusMobile({
      element: element,
      exit: exit = !1,
      additionalItems: additionalItems = [],
    }) {
      if (exit) return;
      const focusableElements = element.querySelectorAll(
          'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])',
        ),
        elements = additionalItems
          .flatMap((item) =>
            Array.from(
              item.querySelectorAll(
                'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])',
              ),
            ),
          )
          .concat(Array.from(focusableElements)),
        firstFocusableEl = elements[0],
        lastFocusableEl = elements[elements.length - 1];
      document.activeElement === lastFocusableEl && (firstFocusableEl.focus(), e.preventDefault());
    }),
    (this.createAnnouncer = function createAnnouncer({ immediate: immediate = !0 } = {}) {
      const el = _this.initClass(HydraElement);
      return (
        el.element.attr("aria-live", immediate ? "assertive" : "polite"),
        el.element.css({
          position: "absolute",
          width: "1px",
          height: "1px",
          margin: "-1px",
          padding: "0",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }),
        (el.update = (text) => {
          el.element.div.textContent = text;
        }),
        el
      );
    }),
    (this.srSpeak = function srSpeak(text, priority = "polite") {
      var el = document.createElement("div"),
        id = `speak-${Date.now()}`;
      (el.setAttribute("id", id),
        el.setAttribute("aria-live", priority),
        el.classList.add("sr-only"),
        document.body.appendChild(el),
        addSrDebounce && clearTimeout(addSrDebounce),
        (addSrDebounce = _this.delayedCall((_) => {
          document.getElementById(id).innerHTML = text;
        }, 100)),
        removeSrDebounce && clearTimeout(removeSrDebounce),
        (removeSrDebounce = _this.delayedCall((_) => {
          document.body.removeChild(document.getElementById(id));
        }, 1e3)));
    }),
    (this.hideAriaOnStage = hideAriaOnStage),
    (this.restoreAriaOnStage = function restoreAriaOnStage() {
      (!(function restoreOriginalAttributes() {
        _this.originalAttributes.forEach(
          ({ element: element, ariaHidden: ariaHidden, tabindex: tabindex }) => {
            (null === ariaHidden
              ? element.removeAttribute("aria-hidden")
              : element.setAttribute("aria-hidden", ariaHidden),
              null === tabindex
                ? element.removeAttribute("tabindex")
                : element.setAttribute("tabindex", tabindex));
          },
        );
      })(),
        (_this.ariaHideAllApplied = !1),
        (_this.originalAttributes.length = 0));
    }));
}, "static");
