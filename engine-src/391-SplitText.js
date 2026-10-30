Class(
  function SplitText(
    _element,
    _options = {
      lineThreshold: 0.2,
      type: "lines,words",
      asHydraObject: !0,
      noAriaLabel: !1,
      noBalance: !1,
      balanceRatio: 1,
      minLines: 1,
      debug: !1,
    },
  ) {
    Inherit(this, Component);
    const _this = this;
    ((_this.isSplit = !1),
      (_this.options = {}),
      (_this.chars = []),
      (_this.words = []),
      (_this.lines = []),
      (_this.originals = []),
      (_this.lineParents = []));
    let _warned = !1;
    if ("object" == typeof _element && !_element.div && !_element.children) {
      let element = _element.element;
      for (const key in _options) _options[key] = _element[key] || _options[key];
      ((_element = element), (_this.isHydraX = !0));
    }
    function debug(...args) {
      _this.debug && console.log("[SplitText]", ...args);
    }
    function split() {
      return (
        _this.isSplit && revert(),
        _this.elements.forEach((element, i) => {
          (element instanceof HydraObject && (element = element.div),
            (_this.originals[i] = element.innerHTML.trim()),
            (element.innerHTML = element.innerHTML.trim().replace(/(-(?![^<]*>))/g, "$1<wbr>")),
            (element.innerHTML = element.innerHTML
              .trim()
              .split(/\u200b/)
              .join("<wbr>")));
          let handleCJT = !1;
          if (
            (SplitText.isIntlSegmenterSupported &&
              (handleCJT = SplitText.isCJTChar(element.textContent)),
            debug(`handleCJT: ${handleCJT}`),
            calcLineParents(element),
            handleCJT
              ? (_this.lineParents.forEach((lp) => {
                  lp.__tempInnerHTML = lp.innerHTML;
                  const lpWords = splitElement(lp, "word");
                  let collectedWords = [];
                  lpWords.forEach((w) => {
                    const segments = Array.from(SplitText.segmenter.segment(w.textContent)),
                      fragment = document.createDocumentFragment(),
                      newWords = segments.map((s) => createElement(fragment, "word", s.segment));
                    collectedWords.push(...newWords);
                  });
                  const replaced = collectedWords.reduce(
                    (state, w) => {
                      const text = w.innerHTML;
                      if (!text) return state;
                      const source = lp.__tempInnerHTML,
                        index = source.indexOf(text, state.cursor);
                      return -1 === index
                        ? state
                        : {
                            html:
                              state.html + source.slice(state.cursor, index) + w.outerHTML.trim(),
                            cursor: index + text.length,
                          };
                    },
                    { html: "", cursor: 0 },
                  );
                  lp.innerHTML = replaced.html + lp.__tempInnerHTML.slice(replaced.cursor);
                }),
                (_this.words = Array.from(element.getElementsByClassName("word"))))
              : _this.words.push(...splitElement(element, "word")),
            _this.options.noBalance ||
              _this.lineParents.forEach((e) =>
                BalanceText.relayout(e, _this.options.balanceRatio, _this.useParent),
              ),
            _this.byLines)
          ) {
            !(function detectLinesTop(el, els, lineThreshold) {
              let lineOffsetY = -999;
              const computedStyle = window.getComputedStyle(el),
                threshold = parseFloat(computedStyle.fontSize || 0) * lineThreshold,
                result = els.map((e) => {
                  const top = Math.round(
                    (function offsetTop(el, offsetParent) {
                      let offsetGrandparent = offsetParent.offsetParent,
                        top = 0,
                        p = el;
                      for (; p && p !== offsetParent && p !== offsetGrandparent;)
                        ((top += p.offsetTop), (p = p.offsetParent));
                      return top;
                    })(e, el),
                  );
                  return (
                    Math.abs(top - lineOffsetY) > threshold && (lineOffsetY = top),
                    (e.__top = lineOffsetY),
                    e.__top
                  );
                });
              return [...new Set(result)];
            })(element, _this.words, _this.options.lineThreshold);
            const proceed = (function checkMinLines(element, els) {
              if (_this.options.minLines <= 1 || (_this.options.minLines > 1 && els.length <= 1))
                return !0;
              let lineTop = els[0].__top,
                linesCount = 1;
              els.forEach((a) => {
                const top = a.__top;
                top > lineTop && ((lineTop = top), linesCount++);
              });
              const diff = _this.options.minLines - linesCount;
              diff > 1 &&
                !_warned &&
                ((_warned = !0),
                console.warn(
                  `SplitText is ran ${diff} times. Careful as this option might be expensive 🫰`.toUpperCase(),
                  element,
                ));
              const word = _this.words[_this.words.length - 1];
              let x = word.offsetLeft + 0.9 * word.offsetWidth;
              element.offsetWidth < x && (x = element.offsetWidth - 0.5 * word.offsetWidth);
              if (linesCount < _this.options.minLines && x > 0)
                return (
                  (element.style.width = `${x}px`),
                  revert(),
                  calcLineParents(element),
                  split(),
                  !1
                );
              return !0;
            })(element, _this.words);
            if (!proceed) return;
            (element.style.removeProperty("width"),
              (function attachBr(_, els, useChars = !1) {
                let prevLineParent,
                  prevTop = els[0]?.__top || 0;
                els.forEach((w, i) => {
                  const prevEl = els[i - 1];
                  if (prevTop !== w.__top && prevEl) {
                    const lineParent = findLineParent(w);
                    lineParent.__idx || (lineParent.__idx = `l${w.__top}`);
                    const wordParent = useChars ? w.parentElement : null,
                      elementToCheck = wordParent || w,
                      skipFirstCharBr =
                        useChars && !w.previousElementSibling && isPrevBr(wordParent);
                    (isPrevBr(elementToCheck.parentElement) ||
                      (useChars ? skipFirstCharBr : isPrevBr(elementToCheck)) ||
                      (function isNextBr(el) {
                        return "BR" === el.nextElementSibling?.tagName;
                      })(prevEl) ||
                      (prevLineParent && prevLineParent?.__idx !== lineParent.__idx) ||
                      (useChars
                        ? w.insertAdjacentHTML("beforebegin", "<br>")
                        : elementToCheck.insertAdjacentHTML("beforebegin", "<br>")),
                      (prevLineParent = lineParent),
                      (prevTop = w.__top));
                  }
                });
              })(0, _this.words),
              splitBr(element),
              (function replaceWords(element, useChars) {
                const words = Array.from(element.getElementsByClassName("word"));
                useChars
                  ? (_this.words = words)
                  : words.forEach((el, i) => el.replaceWith(_this.words[i]));
              })(element, (_this.byLines || _this.byWords) && !_this.byChars),
              _this.lines.push(
                ...(function splitLines(el) {
                  const lines = [];
                  findAllBr(el, !1).forEach((br) => {
                    const lineParent = findLineParent(br),
                      line = createLine();
                    ((line.__isLine = !0), lineParent?.__lines?.push(line));
                  });
                  let globalLineIndex = 0;
                  return (
                    _this.lineParents.forEach((lp, i) => {
                      let lineIndex = 0;
                      (i > 0 && globalLineIndex++,
                        toArray(lp.childNodes).forEach((next) => {
                          "BR" === next.tagName
                            ? (globalLineIndex++, lineIndex++, next.remove())
                            : (lp.__lines[lineIndex].appendChild(next),
                              toArray(next.childNodes).forEach((e) => (e.__line = globalLineIndex)),
                              (next.__line = globalLineIndex));
                        }),
                        lp.__lines.forEach((line) => lp.appendChild(line)),
                        lines.push(...lp.__lines));
                    }),
                    lines.forEach((line) => {
                      ((line.__words = toArray(line.getElementsByClassName("word"))),
                        (line.__wordCount = line.__words.length),
                        _this.byChars &&
                          ((line.__chars = toArray(line.getElementsByClassName("char"))),
                          (line.__charCount = line.__chars.length)));
                    }),
                    lines
                  );
                })(element),
              ),
              _this.lineParents.forEach((l) => l.style.removeProperty("max-width")));
          }
          if (
            (!_this.byLines ||
              _this.byWords ||
              _this.byChars ||
              (_this.lines.forEach((l) => {
                (l.__words.forEach((w) => {
                  (w.insertAdjacentHTML("beforebegin", w.textContent), w.remove());
                }),
                  l.normalize());
              }),
              (_this.words.length = 0),
              (_this.chars.length = 0)),
            _this.byChars &&
              (_this.words.forEach((e) => _this.chars.push(...splitElement(e, "char"))),
              _this.byWords ||
                (_this.chars.forEach((e) => {
                  (e.parentElement.insertAdjacentHTML("beforebegin", e.outerHTML), e.remove());
                }),
                (_this.chars = toArray(element.getElementsByClassName("char"))),
                _this.words.forEach((e) => e.remove()),
                (_this.words.length = 0))),
            _this.options.asHydraObject &&
              ((_this.lines = _this.lines.map((l) => $(l))),
              (_this.words = _this.words.map((w) => $(w))),
              (_this.chars = _this.chars.map((c) => $(c)))),
            !_this.options.noAriaLabel)
          ) {
            recursiveAriaLabel(element);
            toArray(element.querySelectorAll("a, button")).forEach((focusableTag) => {
              createAriaLabel(focusableTag);
            });
          }
        }),
        (_this.isSplit = !0),
        _this
      );
    }
    function recursiveAriaLabel(element) {
      const blockTags = toArray(element.childNodes).filter((child) =>
        SplitText.BLOCK_TAGS.includes(child.tagName),
      );
      blockTags.length
        ? blockTags.forEach((child) => {
            recursiveAriaLabel(child);
          })
        : createAriaLabel(element);
    }
    function createAriaLabel(element) {
      const span = document.createElement("span");
      (span.classList.add("sr-only"),
        span.style.setProperty("position", "absolute"),
        span.style.setProperty("width", "1px"),
        span.style.setProperty("height", "1px"),
        span.style.setProperty("padding", "0"),
        span.style.setProperty("margin", "-1px"),
        span.style.setProperty("overflow", "hidden"),
        span.style.setProperty("clip", "rect(0, 0, 0, 0)"),
        span.style.setProperty("white-space", "nowrap"),
        span.style.setProperty("border", "0"),
        (span.textContent = element.textContent),
        element.appendChild(span));
    }
    function revert() {
      0 !== _this.originals.length &&
        (_this.elements.forEach((el, i) => (el.innerHTML = _this.originals[i])),
        [_this.lines, _this.words, _this.chars, _this.originals].forEach((arr) => (arr.length = 0)),
        (_this.isSplit = !1));
    }
    function flagLineParents(e) {
      (e.normalize(),
        toArray(e.childNodes).forEach((next) => {
          (next.normalize(),
            (next.__lineParent = Boolean(
              next.tagName && next.hasChildNodes() && SplitText.BLOCK_TAGS.includes(next.tagName),
            )),
            next.__lineParent && e?.__lineParent && !e.__isParent && (e.__lineParent = !1),
            flagLineParents(next));
        }));
    }
    function gatherLineParents(e, lineParents) {
      toArray(e.childNodes).forEach((next) => {
        (next.__lineParent &&
          ((next.__idx = null),
          next.textContent.replace(/\s+/g, " ").trim().length > 0 &&
            ((next.__lines = [createLine()]), lineParents.push(next))),
          gatherLineParents(next, lineParents));
      });
    }
    function calcLineParents(el) {
      ((_this.lineParents = []),
        flagLineParents(el),
        gatherLineParents(el, _this.lineParents),
        (_this.useParent = !0),
        _this.lineParents.length ||
          (_this.lineParents.push(el),
          (el.__lines = [createLine()]),
          (el.__lineParent = !0),
          (el.__idx = null),
          (_this.useParent = !1)),
        (el.__lineParent = !0));
    }
    function recursiveFindBr(e, brs, onlyNew = !0) {
      (e.normalize(),
        toArray(e.childNodes).forEach((next) => {
          "BR" !== next.tagName || (onlyNew && next.__newBR)
            ? recursiveFindBr(next, brs, onlyNew)
            : brs.push(next);
        }));
    }
    function findAllBr(el, onlyNew = !0) {
      let brs = [];
      return (
        recursiveFindBr(el, brs, onlyNew),
        onlyNew ||
          (brs.forEach((br) => {
            br.nextElementSibling || br.remove();
          }),
          (brs = brs.filter((br) => br.nextElementSibling))),
        brs
      );
    }
    function splitBr(el) {
      let j = 0;
      const brs = findAllBr(el);
      for (; j < brs.length;) {
        let i = 0,
          parent = brs[j++].parentElement;
        if (!parent) return splitBr(el);
        for (; !parent.__lineParent;) {
          if (i++ >= 100) return;
          if (!parent.parentElement) return splitBr(el);
          const cloneInnerHTML = parent.innerHTML,
            parentClone = parent.cloneNode(),
            parentTagName = parentClone.tagName.toLowerCase(),
            cloneOuterHTML = parentClone.outerHTML.split(`</${parentTagName}>`).join(""),
            newInnerHTML = cloneInnerHTML
              .split(/<br\b[^>]*>/)
              .join(`</${parentTagName}><br>${cloneOuterHTML.trim()}`);
          ((parent = parent.parentElement),
            (parent.innerHTML = parent.innerHTML.replace(
              cloneInnerHTML.trim(),
              newInnerHTML.trim(),
            )),
            toArray(parent.childNodes).forEach((child) => {
              "BR" === child.tagName
                ? (child.__newBR = !0)
                : 3 !== child.nodeType && 0 === child.textContent.trim().length && child.remove();
            }));
        }
      }
    }
    function isPrevBr(el) {
      return "BR" === el.previousElementSibling?.tagName;
    }
    function findLineParent(el) {
      let parent = el.parentElement,
        found = !1;
      for (; !found;) (parent.__lineParent && (found = parent), (parent = parent.parentElement));
      return found;
    }
    function splitElement(el, key) {
      el.normalize();
      const elements = [],
        F = document.createDocumentFragment(),
        allElements = [];
      return (
        toArray(el.childNodes).forEach((next) => {
          if (next.tagName && !next.hasChildNodes()) return allElements.push(next);
          next.childNodes.length
            ? (allElements.push(next), elements.push(...splitElement(next, key)))
            : (function handleRawElement(parentEl, el, key, elements, allElements) {
                const wholeText = el.wholeText || "";
                let contents = wholeText;
                contents.trim().length
                  ? ("word" !== key && "char" !== key) ||
                    ((contents = wholeText.trim()),
                    SplitText.SPACES.includes(wholeText[0]) &&
                      allElements.push(document.createTextNode(wholeText[0])),
                    "char" === key
                      ? Array.from(contents).forEach((char) => {
                          const splitEl = createElement(parentEl, key, char);
                          (elements.push(splitEl), allElements.push(splitEl));
                        })
                      : contents
                          .split(/([ \t\n\r\f\v]+)/)
                          .filter(Boolean)
                          .forEach((part, i) => {
                            if (i % 2 == 1) allElements.push(document.createTextNode(part));
                            else if (part) {
                              const splitEl = createElement(parentEl, key, part);
                              (elements.push(splitEl), allElements.push(splitEl));
                            }
                          }),
                    SplitText.SPACES.includes(wholeText[wholeText.length - 1]) &&
                      allElements.push(document.createTextNode(wholeText[wholeText.length - 1])))
                  : allElements.push(document.createTextNode(wholeText));
              })(F, next, key, elements, allElements);
        }),
        allElements.forEach((e) => F.appendChild(e)),
        (el.innerHTML = ""),
        el.appendChild(F),
        elements
      );
    }
    function createLine(parent) {
      const line = document.createElement("span");
      return (
        line.style.setProperty("display", "block"),
        (line.className = "line"),
        line.setAttribute("aria-hidden", !0),
        parent ? parent.appendChild(line) : line
      );
    }
    function createElement(parent, key, text) {
      const el = document.createElement("span");
      return (
        (el.className = key),
        (el.textContent = text),
        !_this.byLines &&
          ((_this.byWords && !_this.byChars) || (_this.byChars && !_this.byWords)) &&
          el.setAttribute("aria-hidden", !0),
        parent.appendChild(el)
      );
    }
    function toArray(e, parent) {
      return e && 0 !== e.length
        ? e.nodeName
          ? [e]
          : [].slice.call(e[0].nodeName ? e : (parent || document).querySelectorAll(e))
        : [];
    }
    (!(async function () {
      if (
        (SplitText.setupSegmenter(),
        _this.isHydraX &&
          (await _this.wait(
            () => void 0 !== _element.div.innerText && !_element.div.innerText.includes("@["),
          )),
        _element instanceof HydraObject && (_element = _element.div),
        SplitText.usingStega)
      ) {
        let stegaSplit = SanityUtils.stegaSplit(_element.textContent);
        if (stegaSplit.encoded) {
          _element.innerHTML = "";
          let stegaSpan = document.createElement("span");
          ((stegaSpan.textContent = stegaSplit.encoded),
            stegaSpan.setAttribute("aria-hidden", !0),
            (stegaSpan.style.display = "none"),
            _element.appendChild(stegaSpan));
          let cleanText = document.createElement("span");
          ((cleanText.textContent = stegaSplit.cleaned),
            _element.appendChild(cleanText),
            (_element = cleanText));
        }
      }
      ((_this.elements = toArray(_element)),
        (_this.options = _options),
        (_this.options.lineThreshold =
          "number" == typeof _this.options.lineThreshold ? _this.options.lineThreshold : 0.2),
        (_this.options.asHydraObject =
          "boolean" != typeof _this.options.asHydraObject || _this.options.asHydraObject),
        (_this.options.noAriaLabel =
          "boolean" == typeof _this.options.noAriaLabel && _this.options.noAriaLabel),
        (_this.options.noBalance =
          "boolean" == typeof _this.options.noBalance && _this.options.noBalance),
        (_this.options.minLines =
          "number" == typeof _this.options.minLines ? _this.options.minLines : 1),
        (_this.options.type =
          "string" == typeof _this.options.type ? _this.options.type : "lines,words"));
      const by = (_this.options.type || "lines").split(",").map((s) => s.trim());
      ((_this.byLines = ~by.indexOf("lines")),
        (_this.byWords = ~by.indexOf("words")),
        (_this.byChars = ~by.indexOf("chars")),
        (_this.debug = "boolean" == typeof _this.options.debug && _this.options.debug),
        debug("options:", _this.options),
        split());
    })(),
      (_this.split = split),
      (_this.revert = revert),
      (_this.ready = () => _this.wait("isSplit")));
  },
  (_) => {
    SplitText.usingStega = !1;
    const NBSP = String.fromCharCode(160),
      NNBSP = String.fromCharCode(8239);
    ((SplitText.NBSPACES = [NBSP, NNBSP]),
      (SplitText.SPACES = [" ", NBSP, NNBSP]),
      (SplitText.BLOCK_TAGS = ["DIV", "H1", "H2", "H3", "H4", "H5", "H6", "P", "UL", "OL", "LI"]));
    const promise = Promise.create();
    ((SplitText.isFontReady = function () {
      return (document.fonts.ready.then(promise.resolve), promise);
    }),
      (SplitText.isCJTChar = function (char) {
        return /[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\u0E00-\u0E7F]/.test(
          char,
        );
      }),
      (SplitText.segmenter = null),
      (SplitText.isIntlSegmenterSupported = !1),
      (SplitText.setupSegmenter = function () {
        if (!SplitText.segmenter && void 0 !== Intl.Segmenter) {
          SplitText.isIntlSegmenterSupported = !0;
          const localeCode = window?.Locale?.CURRENT?.code || document.documentElement.lang || "en";
          SplitText.segmenter = new Intl.Segmenter(localeCode, { granularity: "word" });
        }
      }));
  },
);
