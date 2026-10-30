Class(
  function FragUIHelper(_obj, _root) {
    Inherit(this, Component);
    const _this = this,
      invalidDomAttrs = ["refname", "_innertext", "_type", "_placeholder", "addto"],
      isGLUI = !!window.GLUI,
      _createdObjs = new Map();
    function isCustomComponentType(type) {
      return (
        !(function isLowerCase(str) {
          return str.charAt(0) == str.charAt(0).toLowerCase();
        })(type) &&
        "UI" !== type &&
        "GLObject" !== type &&
        "glObject" !== type &&
        "glObj" !== type &&
        "GLText" !== type &&
        "glText" !== type &&
        "HydraObject" !== type
      );
    }
    function findStateObject(text) {
      return text.match(/\$([a-zA-z]\w*)\./)[1];
    }
    function getPropByString(obj, propString) {
      if (!propString) return obj;
      for (var props = propString.split("."), i = 0, iLen = props.length - 1; i < iLen; i++) {
        var candidate = obj[props[i]];
        if (void 0 === candidate) break;
        obj = candidate;
      }
      return obj[props[i]];
    }
    function parseTextBindings(text) {
      let match,
        binds = [];
      for (; (match = text.match(/\$([a-zA-z]\w*)\./));) {
        let split = text.split(match[0]);
        ((split[0] = split[0] + "@["), (split[1] = split[1].split(" ")));
        let name = split[1][0];
        ((split[1][0] += "]"),
          (split[1] = split[1].join(" ")),
          (text = split.join("")),
          binds.push(name));
      }
      return [binds, text];
    }
    function parseTextGlobalBindings(text) {
      let match,
        binds = [];
      for (; (match = text.match(/\$([a-zA-z]\w*)\/(\w+)/));) {
        let split = text.split(match[0]);
        ((split[0] = split[0] + "@["), (split[1] = split[1].split(" ")));
        let name = match[0].slice(1).trim();
        ((split[1][0] = name),
          (split[1][0] += "]"),
          (split[1] = split[1].join(" ")),
          (text = split.join("")),
          binds.push(name));
      }
      return [binds, text];
    }
    function parseCSSTransformStr(obj) {
      let data = {};
      return (
        obj.split(",").forEach((param) => {
          let [a, b] = param.split(":");
          ((a = a.trim()), (b = b?.trim?.()), isNaN(b) || (b = Number(b)), (data[a] = b));
        }),
        data
      );
    }
    function doConstructor(obj) {
      if (" " === obj._type || "\n" === obj._type) return document.createTextNode(obj._type);
      switch (obj._type) {
        case "inlinetext":
          return document.createTextNode(obj._innerText);
        case "UI":
          return _this.parent.element || _this.parent.getDOMElement?.();
        case "GLObject":
        case "glObject":
        case "glObj":
          return obj.width && obj.height && obj.bg
            ? $gl(Number(obj.width), Number(obj.height), obj.bg)
            : $gl();
        case "GLText":
        case "glText":
          if (obj._innerText.match?.(/\$([a-zA-z]\w*)\./)) {
            let {
                font: font,
                fontSize: fontSize,
                fontColor: fontColor,
                _innerText: _innerText,
                ...options
              } = obj,
              state = findStateObject(obj._innerText);
            const stateAsNumber = Number(state);
            if (!isNaN(stateAsNumber))
              return $glText(obj._innerText, obj.font, Number(obj.fontSize), {
                color: fontColor,
                ...options,
              });
            let ref = state;
            if (ref.includes(".")) {
              let split = ref.split(".");
              ((ref = split[0]), split.shift(), (state = split.join(".")));
            }
            let [binds, text] = parseTextBindings(obj._innerText),
              $text = $glText(text, obj.font, Number(obj.fontSize), {
                color: fontColor,
                ...options,
                waitForSetText: !0,
              });
            return (
              _this.wait(_this.parent, ref).then((_) => {
                _this.parent.bindState(
                  ref == state ? _this.parent[ref] : getPropByString(_this.parent[ref], state),
                  binds,
                  $text,
                );
              }),
              $text
            );
          }
          if (obj._innerText.match?.(/\$([a-zA-z]\w*)\/(\w+)/)) {
            let [binds, text] = parseTextGlobalBindings(obj._innerText),
              {
                font: font,
                fontSize: fontSize,
                fontColor: fontColor,
                _innerText: _innerText,
                ...options
              } = obj,
              $text = $glText(obj._innerText, obj.font, Number(obj.fontSize), {
                color: fontColor,
                ...options,
              });
            return (_this.parent.bindState(AppState, binds, $text), $text);
          }
          {
            let {
              font: font,
              fontSize: fontSize,
              fontColor: fontColor,
              _innerText: _innerText,
              ...options
            } = obj;
            return $glText(obj._innerText, obj.font, Number(obj.fontSize), {
              color: fontColor,
              ...options,
            });
          }
        default:
          let $obj = $(
            obj.className || obj.refName || "h",
            "HydraObject" != obj._type ? obj._type : "div",
          );
          if (
            (obj.width && obj.height && $obj.size(obj.width, obj.height),
            obj.font && $obj.fontStyle(obj.font, Number(obj.fontSize), obj.fontColor),
            obj._innerText)
          )
            if (obj._innerText.match?.(/\$([a-zA-z]\w*)\./)) {
              let state = findStateObject(obj._innerText),
                ref = state;
              const stateAsNumber = Number(ref);
              if (!isNaN(stateAsNumber)) return ($obj.html(obj._innerText), $obj);
              if (ref.includes(".")) {
                let split = state.split(".");
                ((ref = split[0]), split.shift(), (state = split.join(".")));
              }
              _this.wait(_this.parent, ref).then((_) => {
                let [binds, text] = parseTextBindings(obj._innerText);
                ($obj.html?.(text),
                  _this.parent?.bindState(
                    ref == state ? _this.parent[ref] : getPropByString(_this.parent[ref], state),
                    binds,
                    $obj,
                  ));
              });
            } else if (obj._innerText.match?.(/\$([a-zA-z]\w*)\/(\w+)/)) {
              let [binds, text] = parseTextGlobalBindings(obj._innerText);
              ($obj.html(text), _this.parent.bindState(AppState, binds, $obj));
            } else $obj.html(obj._innerText);
          return $obj;
      }
    }
    function checkIfParentIs(obj, tagName) {
      for (; obj.parentNode;) {
        if (obj.parentNode?.tagName?.toLowerCase?.() === tagName.toLowerCase()) return !0;
        obj = obj.parentNode;
      }
      return !1;
    }
    function applyValues(obj, $obj) {
      const callObjKeyVal = (key) =>
        new Promise((resolve) => {
          const applyValue = (val) => {
              if (!(
                isGLUI &&
                ($obj instanceof GLUIObject || $obj instanceof GLUIText) &&
                ("width" === key || "height" === key || "bg" === key) &&
                obj.width &&
                obj.height &&
                obj.bg
              ))
                if ("function" == typeof $obj[key]) $obj[key](val);
                else {
                  if ($obj instanceof HydraObject && !invalidDomAttrs.includes(key.toLowerCase()))
                    if ("className" === key) {
                      if ("string" != typeof val || "string" != typeof $obj.div.className) return;
                      ($obj.classList().add(...val.split(/\s+/)),
                        $obj.div.className.includes("$") &&
                          $obj.div.classList.forEach((className) => {
                            isDollarExpression(className) && $obj.div.classList.remove(className);
                          }));
                    } else $obj.attr(FragUIHelper.SVG_ALIAS.get(key) || key, val);
                  $obj[key] = val;
                }
            },
            callFn = async () => {
              let val = obj[key];
              if ("string" == typeof val) {
                if (val.match(/\$([a-zA-z]\w*)\./)) {
                  let stateStr = findStateObject(val),
                    state = _this.parent[stateStr];
                  (state ||
                    (await _this.wait(_this.parent, stateStr), (state = _this.parent[stateStr])),
                    state.then && (state = await state));
                  let [binds] = parseTextBindings(val);
                  return _this.parent.bindState(state, binds, (dataVal) => applyValue(dataVal));
                }
                if (val.match(/\$([a-zA-z]\w*)\/(\w+)/)) {
                  let [binds] = parseTextGlobalBindings(val);
                  return _this.parent.bindState(AppState, binds, (dataVal) => applyValue(dataVal));
                }
                if (isDollarExpression(val) && "$element" != val)
                  return applyValue(_this.parent[val.slice(1)]);
              }
              applyValue(val);
            };
          if (_this.parent.__afterInitClass)
            return _this.parent.__afterInitClass.push(() => resolve(callFn()));
          resolve(callFn());
        });
      let handledInteract = !1;
      for (let key in obj)
        if ("_type" !== key && "refName" !== key && "children" !== key && "display" !== key) {
          if ("shader" == key)
            if ($obj.text)
              $obj.text.onCreateMesh = (mesh) => {
                let shader = mesh.shader;
                window[shader.vsName] &&
                  (mesh.shaderClass = _this.parent.initClass(window[shader.vsName], mesh, shader));
              };
            else {
              let shader = _this.initClass(Shader, obj[key], { tMap: { value: null } });
              if (window[shader.vsName]) {
                let mesh = $obj.mesh || {};
                mesh.shaderClass = _this.parent.initClass(window[shader.vsName], mesh, shader);
              }
              $obj.useShader(shader);
            }
          if (
            (obj.width && obj.height && $obj.size && $obj.size(obj.width, obj.height),
            "css" == key || "transform" == key)
          )
            checkIfParentIs($obj.div, "svg")
              ? $obj.attr(key, obj[key])
              : $obj[key](parseCSSTransformStr(obj[key]));
          else if ("onClick" == key || "onHover" == key) {
            if (!handledInteract && ((handledInteract = !0), obj.onClick || obj.onHover)) {
              let handlerKeys = ["onClick", "onHover"],
                handlers = {};
              _this
                .wait(() =>
                  handlerKeys.every((handlerKey) => {
                    let handler = obj[handlerKey];
                    if (((handlers[handlerKey] = handler), !handler)) return !0;
                    if ("function" == typeof handler) return !0;
                    if ("string" != typeof handler)
                      throw new Error(`Unexpected ${handlerKey} type '${typeof handler}'`);
                    return (
                      (handler = _this.parent[handler.slice(1)]),
                      (handlers[handlerKey] = handler),
                      !!handler
                    );
                  }),
                )
                .then(() => {
                  $obj.interact(
                    handlers.onHover || GLUIObject.noop,
                    handlers.onClick || GLUIObject.noop,
                    obj.seoLink,
                    obj.seoText,
                  );
                });
            }
          } else if ("function" == typeof $obj[key]) {
            if ("size" == key) {
              let size = obj.size.split(",");
              (size.map((x) => Number(x)), $obj.size(size[0], size[1]));
              continue;
            }
            (1 === obj[key] && (obj[key] = void 0), callObjKeyVal(key));
          } else callObjKeyVal(key);
        }
    }
    function convertToUsableRef(str) {
      str.startsWith("$") && (str = str.slice(1));
      let ref = str,
        state = str;
      if (str.includes(".")) {
        let split = str.split(".");
        ((state = split[0]), split.shift(), (ref = split.join(".")));
      }
      return [state, ref];
    }
    function isDollarExpression(str) {
      return str && /^\$[a-zA-z]\w*/.test(str);
    }
    function create(obj, parent, isDeferredPhase = !1) {
      if (" " === obj._type || "\n" === obj._type) {
        let textNode = doConstructor(obj);
        return void (parent && parent.div
          ? parent.div.appendChild(textNode)
          : parent && parent.appendChild && parent.appendChild(textNode));
      }
      if (isCustomComponentType(obj._type)) {
        if (propsRequireDefer(obj)) {
          if (!isDeferredPhase)
            return (
              (obj._placeholder = document.createElement("span")),
              void (parent.element || parent)?.add(obj._placeholder)
            );
        } else if (isDeferredPhase)
          return createChildren(obj, _createdObjs.get(obj), isDeferredPhase);
        let paramsState,
          params = {};
        for (let key in obj)
          if (
            "_type" !== key &&
            "refName" !== key &&
            "children" !== key &&
            "display" !== key &&
            "_placeholder" !== key &&
            "conditional" !== key &&
            ((params[key] = obj[key]), params[key])
          )
            if (params[key].match?.(/\$([a-zA-z]\w*)\./)) {
              let [state, ref] = convertToUsableRef(params[key]);
              if (state == ref) params[key] = _this.parent[state];
              else if (_this.parent[state]?.isAppState && ref.indexOf(".") < 0) {
                let [binds, text] = parseTextBindings(params[key]),
                  isInitialized = !1,
                  binding = (newValue) => {
                    ((isInitialized = !0),
                      paramsState ? (paramsState[key] = newValue) : (params[key] = newValue));
                  };
                ((binding._string = text),
                  _this.parent.bindState(_this.parent[state], binds, binding),
                  isInitialized || binding());
              } else params[key] = getPropByString(_this.parent[state], ref);
            } else if (params[key].match?.(/\$([a-zA-z]\w*)\/(\w+)/)) {
              let [binds, text] = parseTextGlobalBindings(params[key]),
                isInitialized = !1,
                binding = (newValue) => {
                  ((isInitialized = !0),
                    paramsState ? (paramsState[key] = newValue) : (params[key] = newValue));
                };
              ((binding._string = text),
                _this.parent.bindState(AppState, binds, binding),
                isInitialized || binding());
            } else if ("string" == typeof params[key] && isDollarExpression(params[key])) {
              let pk = params[key],
                value = _this.parent[pk.slice(1)];
              null == value
                ? ((params["wait_" + key] = _this
                    .wait(_this.parent, pk.slice(1))
                    .then((_) => _this.parent[pk.slice(1)])),
                  (params[key] = void 0))
                : (params[key] = value);
            }
        ((params.__parent = parent),
          "ViewState" == obj._type &&
            ((params.__parent = parent),
            params?.view &&
              "string" == typeof params.view &&
              !window[params.view] &&
              console.warn(
                `ViewState will attempt to create ${params.view}, but it doesn't exist, this will probably break.`,
              )));
        let $obj = _this.parent.initClass(
          window[obj._type],
          (paramsState = AppState.createLocal(params)),
          isDeferredPhase ? null : [parent.element || parent],
        );
        if (isDeferredPhase) {
          if ($obj.element) {
            obj._placeholder.replaceWith($obj.element.div);
            const $parent = parent.element || parent;
            ($parent && ($parent._children.push($obj.element), ($obj.element._parent = $parent)),
              $obj.element.onMountedHook &&
                defer((_) => {
                  ($obj.element.onMountedHook(), delete $obj.element.onMountedHook);
                }));
          } else obj._placeholder.parentNode.removeChild(obj._placeholder);
          delete obj._placeholder;
        }
        return (
          (_this.parent[obj.refName] = $obj),
          _createdObjs.set(obj, $obj),
          createChildren(obj, $obj, isDeferredPhase),
          void (params.css && $obj.element.css(parseCSSTransformStr(params.css)))
        );
      }
      if (isDeferredPhase) return createChildren(obj, _createdObjs.get(obj), isDeferredPhase);
      let $obj = doConstructor(obj);
      if (
        (void 0 !== obj.conditional &&
          _this.parent.state &&
          (_this.parent.state.get(obj.conditional) ? $obj.show?.() : $obj.hide?.(),
          _this.bindState(_this.parent.state, obj.conditional, (bool) => {
            bool ? $obj.show?.() : $obj.hide?.();
          })),
        obj.addTo)
      ) {
        let addTo = obj.addTo;
        ("string" == typeof addTo &&
          ((addTo = addTo.replace(/\$/g, "_this.")),
          (addTo =
            Function("_this", `"use strict";return (${addTo});`)(_this.parent) ||
            _this.parent.element)),
          addTo?.add($obj));
      } else parent && parent.add($obj);
      (applyValues(obj, $obj),
        $obj?.transform?.(),
        obj.refName && (_this.parent[obj.refName] = $obj),
        _createdObjs.set(obj, $obj),
        createChildren(obj, $obj, isDeferredPhase));
    }
    async function createChildren(obj, $obj, isDeferredPhase = !1) {
      (obj.children.forEach((o) => create(o, $obj, isDeferredPhase)),
        !isDeferredPhase &&
          obj === _obj &&
          anyChildrenRequireDefer(obj) &&
          (await defer(), obj.children.forEach((o) => create(o, $obj, !0))),
        obj === _obj && _createdObjs.clear());
    }
    function propsRequireDefer(obj) {
      if (isCustomComponentType(obj._type))
        for (let key in obj) {
          if (
            "_type" === key ||
            "refName" === key ||
            "children" === key ||
            "display" === key ||
            "_placeholder" === key
          )
            continue;
          let param = obj[key];
          if (
            isDollarExpression(param) &&
            (!param?.startsWith?.("$data.") || !_this.parent.contexts.includes("ViewStateElement"))
          )
            return !0;
        }
      return !1;
    }
    function anyChildrenRequireDefer(obj) {
      return obj.children.some((o) => !!propsRequireDefer(o) || anyChildrenRequireDefer(o));
    }
    (_obj.addTo || "UI" == _obj._type || (_obj.addTo = _this.parent.element),
      _root && applyValues(_root, _this.parent.element),
      create(_obj));
  },
  (_) => {
    FragUIHelper.SVG_ALIAS = new Map([
      ["acceptCharset", "accept-charset"],
      ["htmlFor", "for"],
      ["httpEquiv", "http-equiv"],
      ["crossOrigin", "crossorigin"],
      ["accentHeight", "accent-height"],
      ["alignmentBaseline", "alignment-baseline"],
      ["arabicForm", "arabic-form"],
      ["baselineShift", "baseline-shift"],
      ["capHeight", "cap-height"],
      ["clipPath", "clip-path"],
      ["clipRule", "clip-rule"],
      ["colorInterpolation", "color-interpolation"],
      ["colorInterpolationFilters", "color-interpolation-filters"],
      ["colorProfile", "color-profile"],
      ["colorRendering", "color-rendering"],
      ["dominantBaseline", "dominant-baseline"],
      ["enableBackground", "enable-background"],
      ["fillOpacity", "fill-opacity"],
      ["fillRule", "fill-rule"],
      ["floodColor", "flood-color"],
      ["floodOpacity", "flood-opacity"],
      ["fontFamily", "font-family"],
      ["fontSize", "font-size"],
      ["fontSizeAdjust", "font-size-adjust"],
      ["fontStretch", "font-stretch"],
      ["fontStyle", "font-style"],
      ["fontVariant", "font-variant"],
      ["fontWeight", "font-weight"],
      ["glyphName", "glyph-name"],
      ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
      ["glyphOrientationVertical", "glyph-orientation-vertical"],
      ["horizAdvX", "horiz-adv-x"],
      ["horizOriginX", "horiz-origin-x"],
      ["imageRendering", "image-rendering"],
      ["letterSpacing", "letter-spacing"],
      ["lightingColor", "lighting-color"],
      ["markerEnd", "marker-end"],
      ["markerMid", "marker-mid"],
      ["markerStart", "marker-start"],
      ["overlinePosition", "overline-position"],
      ["overlineThickness", "overline-thickness"],
      ["paintOrder", "paint-order"],
      ["panose-1", "panose-1"],
      ["pointerEvents", "pointer-events"],
      ["renderingIntent", "rendering-intent"],
      ["shapeRendering", "shape-rendering"],
      ["stopColor", "stop-color"],
      ["stopOpacity", "stop-opacity"],
      ["strikethroughPosition", "strikethrough-position"],
      ["strikethroughThickness", "strikethrough-thickness"],
      ["strokeDasharray", "stroke-dasharray"],
      ["strokeDashoffset", "stroke-dashoffset"],
      ["strokeLinecap", "stroke-linecap"],
      ["strokeLinejoin", "stroke-linejoin"],
      ["strokeMiterlimit", "stroke-miterlimit"],
      ["strokeOpacity", "stroke-opacity"],
      ["strokeWidth", "stroke-width"],
      ["textAnchor", "text-anchor"],
      ["textDecoration", "text-decoration"],
      ["textRendering", "text-rendering"],
      ["transformOrigin", "transform-origin"],
      ["underlinePosition", "underline-position"],
      ["underlineThickness", "underline-thickness"],
      ["unicodeBidi", "unicode-bidi"],
      ["unicodeRange", "unicode-range"],
      ["unitsPerEm", "units-per-em"],
      ["vAlphabetic", "v-alphabetic"],
      ["vHanging", "v-hanging"],
      ["vIdeographic", "v-ideographic"],
      ["vMathematical", "v-mathematical"],
      ["vectorEffect", "vector-effect"],
      ["vertAdvY", "vert-adv-y"],
      ["vertOriginX", "vert-origin-x"],
      ["vertOriginY", "vert-origin-y"],
      ["wordSpacing", "word-spacing"],
      ["writingMode", "writing-mode"],
      ["xmlnsXlink", "xmlns:xlink"],
      ["xHeight", "x-height"],
    ]);
  },
);
