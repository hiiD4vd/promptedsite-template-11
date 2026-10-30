Class(function HDRLoader() {
  this.load = async function (
    path,
    { format: format = Texture.RGBAFormat, type: type = Texture.FLOAT } = {},
  ) {
    const ev = await fetch(path);
    let buffer = await ev.arrayBuffer();
    buffer instanceof ArrayBuffer && (buffer = new Uint8Array(buffer));
    var fileOffset = 0,
      bufferLength = buffer.length;
    function readLine() {
      var buf = "";
      do {
        var b = buffer[fileOffset];
        if (10 === b) {
          ++fileOffset;
          break;
        }
        buf += String.fromCharCode(b);
      } while (++fileOffset < bufferLength);
      return buf;
    }
    let width = 0,
      height = 0,
      exp = 1,
      rle = !1;
    for (let i = 0; i < 20; i++) {
      const line = readLine();
      let match;
      if ((match = line.match("#\\?RADIANCE")));
      else if ((match = line.match("FORMAT=32-bit_rle_rgbe"))) rle = !0;
      else if ((match = line.match("EXPOSURE=\\s*([0-9]*[.][0-9]*)"))) exp = Number(match[1]);
      else if ((match = line.match("#.*")));
      else if ((match = line.match("-Y ([0-9]+) \\+X ([0-9]+)"))) {
        ((height = Number(match[1])), (width = Number(match[2])));
        break;
      }
    }
    if (!rle) throw new Error("File is not run length encoded!");
    var data = new Uint8Array(width * height * 4);
    !(function readPixelsRawRLE(buffer, data, offset, fileOffset, scanline_width, num_scanlines) {
      const rgbe = new Array(4);
      let ptr,
        ptr_end,
        count,
        scanline_buffer = null,
        buf = new Array(2),
        bufferLength = buffer.length;
      function readBuf(buff) {
        let bytesRead = 0;
        do {
          buff[bytesRead++] = buffer[fileOffset];
        } while (++fileOffset < bufferLength && bytesRead < buff.length);
        return bytesRead;
      }
      function readBufOffset(buff, offs, length) {
        let bytesRead = 0;
        do {
          buff[offs + bytesRead++] = buffer[fileOffset];
        } while (++fileOffset < bufferLength && bytesRead < length);
        return bytesRead;
      }
      function readPixelsRaw(dataSet, offs, numpixels) {
        const numExpected = 4 * numpixels,
          numRead = readBufOffset(dataSet, offs, numExpected);
        if (numRead < numExpected)
          throw new Error(
            `Error reading raw pixels: got ${numRead} bytes, expected ${numExpected}`,
          );
      }
      for (; num_scanlines > 0;) {
        if (readBuf(rgbe) < rgbe.length)
          throw new Error(`Error reading bytes: expected ${rgbe.length}`);
        if (2 !== rgbe[0] || 2 !== rgbe[1] || 128 & rgbe[2])
          return (
            (data[offset++] = rgbe[0]),
            (data[offset++] = rgbe[1]),
            (data[offset++] = rgbe[2]),
            (data[offset++] = rgbe[3]),
            void readPixelsRaw(buffer, data, offset)
          );
        if ((((255 & rgbe[2]) << 8) | (255 & rgbe[3])) !== scanline_width)
          throw new Error(
            `Wrong scanline width ${((255 & rgbe[2]) << 8) | (255 & rgbe[3])}, expected ${scanline_width}`,
          );
        (null === scanline_buffer && (scanline_buffer = new Array(4 * scanline_width)), (ptr = 0));
        for (let i = 0; i < 4; i++)
          for (ptr_end = (i + 1) * scanline_width; ptr < ptr_end;) {
            if (readBuf(buf) < buf.length) throw new Error("Error reading 2-byte buffer");
            if ((255 & buf[0]) > 128) {
              if (((count = (255 & buf[0]) - 128), 0 === count || count > ptr_end - ptr))
                throw new Error("Bad scanline data");
              for (; count-- > 0;) scanline_buffer[ptr++] = buf[1];
            } else {
              if (((count = 255 & buf[0]), 0 === count || count > ptr_end - ptr))
                throw new Error("Bad scanline data");
              if (((scanline_buffer[ptr++] = buf[1]), --count > 0)) {
                if (readBufOffset(scanline_buffer, ptr, count) < count)
                  throw new Error("Error reading non-run data");
                ptr += count;
              }
            }
          }
        for (let i0 = 0; i0 < scanline_width; i0++)
          ((data[offset + 0] = scanline_buffer[i0]),
            (data[offset + 1] = scanline_buffer[i0 + scanline_width]),
            (data[offset + 2] = scanline_buffer[i0 + 2 * scanline_width]),
            (data[offset + 3] = scanline_buffer[i0 + 3 * scanline_width]),
            (offset += 4));
        num_scanlines--;
      }
    })(buffer, data, 0, fileOffset, width, height);
    const floatData = new Float32Array(width * height * 4);
    for (let offset = 0; offset < data.length; offset += 4) {
      let r = data[offset + 0] / 255,
        g = data[offset + 1] / 255,
        b = data[offset + 2] / 255;
      const e = data[offset + 3],
        f = Math.pow(2, e - 128);
      ((r *= f), (g *= f), (b *= f));
      const floatOffset = offset;
      ((floatData[floatOffset + 0] = r),
        (floatData[floatOffset + 1] = g),
        (floatData[floatOffset + 2] = b),
        (floatData[floatOffset + 3] = 1));
    }
    return new DataTexture(floatData, width, height, format, type);
  };
}, "static");
