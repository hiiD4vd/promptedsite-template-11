Class(function GLTextThread() {
  function loadTextGeometry(
    {
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
      indent: indent,
      config: config,
    },
    pid,
  ) {
    const newline = /\n/,
      whitespace = /[^\S ]/,
      langbreak = !!langBreak && new RegExp(langBreak),
      dir = "rtl" === direction ? -1 : 1;
    (config || (config = {}),
      (config.boldBaseOffset = config.boldBaseOffset ? config.boldBaseOffset : 0),
      (config.italicBaseOffset = config.italicBaseOffset ? config.italicBaseOffset : 0));
    let buffers,
      scale = size / json.info.size,
      weights = [],
      weight = { 0: glyphs, 1: bGlyphs, 2: iGlyphs };
    function getKernPairOffset(id1, id2) {
      for (let i = 0; i < json.kernings.length; i++) {
        let k = json.kernings[i];
        if (!(k.first < id1) && !(k.second < id2))
          return k.first > id1 || (k.first === id1 && k.second > id2) ? 0 : k.amount;
      }
      return 0;
    }
    (!(function setWeights() {
      let i = 0,
        w = 0;
      for (; i < text.length;) {
        let code = text.substring(i, i + 3).toLowerCase(),
          endcode = text.substring(i, i + 4).toLowerCase();
        (("<b>" !== code && "<i>" !== code) ||
          ((w = "<b>" === code ? 1 : 2), (text = text.substring(0, i) + text.substring(i + 3))),
          ("</b>" !== endcode && "</i>" !== endcode) ||
            ((w = 0), (text = text.substring(0, i) + text.substring(i + 4))),
          weights.push(w),
          i++);
      }
    })(),
      (function createGeometry() {
        let numChars = text.replace(/[ \n]/g, "").length;
        buffers = {
          position: new Float32Array(4 * numChars * 3),
          uv: new Float32Array(4 * numChars * 2),
          local: new Float32Array(4 * numChars * 2),
          animation: new Float32Array(3 * numChars * 4),
          index: new Uint16Array(6 * numChars),
          weight: new Float32Array(4 * numChars),
        };
        for (let i = 0; i < numChars; i++)
          buffers.index.set([4 * i, 4 * i + 2, 4 * i + 1, 4 * i + 1, 4 * i + 2, 4 * i + 3], 6 * i);
        !(function layout() {
          const lines = [];
          let cursor = 0,
            wordCursor = 0,
            wordWidth = 0,
            line = newLine();
          function newLine(br = !1) {
            const line = { width: 0, glyphs: [] };
            return (
              lines.last() && (lines.last().br = br),
              lines.push(line),
              (wordCursor = cursor),
              (wordWidth = 0),
              line
            );
          }
          for (; cursor < text.length;) {
            let prev = text[cursor - 1],
              char = text[cursor];
            if (
              !line.glyphs.length &&
              whitespace.test(char) &&
              !(prev && newline.test(char) && newline.test(prev))
            ) {
              (cursor++, (wordCursor = cursor), (wordWidth = 0));
              continue;
            }
            if (newline.test(char)) {
              (cursor++, (line = newLine(!0)));
              continue;
            }
            !cursor && indent && (line.width += indent);
            let style = weight[weights[cursor]] || weight[0],
              glyph = style[char];
            if (
              (glyph ||
                (console.warn(`font ${font} missing character '${char}'`),
                (char = Object.keys(style)[0]),
                (glyph = style[char])),
              (glyph.weight = weights[cursor]),
              line.glyphs.length)
            ) {
              const prevGlyph = line.glyphs[line.glyphs.length - 1][0];
              let kern = getKernPairOffset(glyph.id, prevGlyph.id) * scale;
              ((line.width += kern), (wordWidth += kern * dir));
            }
            let gl = { ...glyph };
            ((gl.weight = weights[cursor]), line.glyphs.push([gl, line.width]));
            let advance = 0;
            if (
              (whitespace.test(char) &&
                ((gl.whitespace = !0),
                (wordCursor = cursor),
                (wordWidth = 0),
                (advance += wordSpacing * size)),
              (advance += letterSpacing * size),
              (advance += glyph.xadvance * scale),
              (line.width += advance),
              (wordWidth += advance),
              line.width > width)
            ) {
              if (
                (wordBreak || (char && langBreak && !langbreak.test(char))) &&
                line.glyphs.length > 1
              ) {
                ((line.width -= advance), line.glyphs.pop(), (line = newLine()));
                continue;
              }
              if (!wordBreak && wordWidth !== line.width) {
                let numGlyphs = cursor - wordCursor + 1;
                (line.glyphs.splice(-numGlyphs, numGlyphs),
                  (cursor = wordCursor),
                  (line.width -= wordWidth),
                  (line = newLine()));
                continue;
              }
            }
            cursor++;
          }
          line.glyphs.length || lines.pop();
          if ("justify" === align) {
            let max = -1 / 0;
            (lines.forEach((l) => {
              ((l.whitespaces = 0),
                max < l.width && (max = l.width),
                l.glyphs.forEach((g) => {
                  g[0].whitespace && l.whitespaces++;
                }));
            }),
              lines.forEach((l) => {
                let totalToAdd = max - l.width,
                  addToWhitespace = 0 === l.whitespaces ? 0 : totalToAdd / l.whitespaces;
                l.width = max;
                let additionalOffset = 0;
                l.glyphs.forEach((g) => {
                  ((g[1] += additionalOffset),
                    g[0].whitespace && (additionalOffset += addToWhitespace));
                });
              }));
          }
          !(function populateBuffers(lines) {
            const texW = json.common.scaleW,
              texH = json.common.scaleH,
              baseOffset = config.baseOffset ? config.baseOffset : 0;
            let geom,
              j = 0,
              y = (-size * (lineHeight - 1)) / 2 + baseOffset * size,
              glyphIndex = 0,
              wordIndex = -1,
              lineId = -1;
            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
              const line = lines[lineIndex];
              (wordIndex++, lineId++);
              for (let i = 0; i < line.glyphs.length; i++) {
                const glyph = line.glyphs[i][0];
                let x = line.glyphs[i][1];
                if (
                  (-1 === dir && (x = line.width - x),
                  "center" === align || "justify" === align
                    ? (x -= 0.5 * line.width)
                    : "right" === align && (x -= line.width * dir),
                  whitespace.test(glyph.char))
                ) {
                  wordIndex++;
                  continue;
                }
                (1 === glyph.weight && (y += config.boldBaseOffset * scale),
                  2 === glyph.weight && (y += config.italicBaseOffset * scale),
                  (x += glyph.xoffset * scale * dir),
                  (y -= glyph.yoffset * scale),
                  buffers.weight.set(
                    [glyph.weight, glyph.weight, glyph.weight, glyph.weight],
                    4 * glyphIndex,
                  ));
                const w = glyph.width * scale,
                  h = glyph.height * scale;
                (-1 === dir
                  ? buffers.position.set(
                      [x - w, y - h, 0, x - w, y, 0, x, y - h, 0, x, y, 0],
                      4 * j * 3,
                    )
                  : buffers.position.set(
                      [x, y - h, 0, x, y, 0, x + w, y - h, 0, x + w, y, 0],
                      4 * j * 3,
                    ),
                  buffers.animation.set(
                    [
                      glyphIndex,
                      wordIndex,
                      lineId,
                      glyphIndex,
                      wordIndex,
                      lineId,
                      glyphIndex,
                      wordIndex,
                      lineId,
                      glyphIndex,
                      wordIndex,
                      lineId,
                    ],
                    3 * glyphIndex * 4,
                  ),
                  glyphIndex++);
                const u = glyph.x / texW,
                  uw = glyph.width / texW,
                  v = 1 - glyph.y / texH,
                  vh = glyph.height / texH;
                (buffers.uv.set([u, v - vh, u, v, u + uw, v - vh, u + uw, v], 4 * j * 2),
                  buffers.local.set([0, 1, 0, 0, 1, 1, 1, 0], 4 * j * 2),
                  1 === glyph.weight && (y -= config.boldBaseOffset * scale),
                  2 === glyph.weight && (y -= config.italicBaseOffset * scale),
                  (y += glyph.yoffset * scale),
                  j++);
              }
              y -= size * lineHeight * (line.br ? paragraphSpacing : 1);
            }
            window.zUtils3D &&
              ((geom = new Geometry()),
              geom.addAttribute("position", new GeometryAttribute(buffers.position, 3)),
              geom.computeBoundingBox(),
              geom.computeBoundingSphere());
            let backing = [];
            for (let key in buffers) backing.push(buffers[key].buffer);
            ((buffers.lineLength = lines.length),
              geom &&
                ((buffers.boundingBox = geom.boundingBox),
                (buffers.boundingSphere = geom.boundingSphere)));
            ((buffers.letterCount = glyphIndex),
              (buffers.lineCount = lineId),
              (buffers.wordCount = wordIndex),
              resolve(buffers, pid, backing));
          })(lines);
        })();
      })());
  }
  (Thread.upload(loadTextGeometry),
    (this.generate = async function (obj) {
      return Thread.shared().loadTextGeometry(obj);
    }));
}, "static");
