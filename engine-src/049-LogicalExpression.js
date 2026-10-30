(!window.fetch || (!window.AURA && location.protocol.includes("file"))) &&
  (window.fetch = function (url, options) {
    options = options || {};
    const promise = Promise.create(),
      request = new XMLHttpRequest();
    (request.open(options.method || "get", url),
      url.includes(".ktx") && (request.responseType = "arraybuffer"));
    for (let i in options.headers) request.setRequestHeader(i, options.headers[i]);
    function response() {
      let header,
        keys = [],
        all = [],
        headers = {};
      return (
        request.getAllResponseHeaders().replace(/^(.*?):\s*([\s\S]*?)$/gm, (m, key, value) => {
          (keys.push((key = key.toLowerCase())),
            all.push([key, value]),
            (header = headers[key]),
            (headers[key] = header ? `${header},${value}` : value));
        }),
        {
          ok: 1 == ((request.status / 200) | 0),
          status: request.status,
          statusText: request.statusText,
          url: request.responseURL,
          clone: response,
          text: () => Promise.resolve(request.responseText),
          json: () => Promise.resolve(request.responseText).then(JSON.parse),
          xml: () => Promise.resolve(request.responseXML),
          blob: () => Promise.resolve(new Blob([request.response])),
          arrayBuffer: () => Promise.resolve(request.response),
          headers: {
            keys: () => keys,
            entries: () => all,
            get: (n) => headers[n.toLowerCase()],
            has: (n) => n.toLowerCase() in headers,
          },
        }
      );
    }
    return (
      (request.onload = () => {
        promise.resolve(response());
      }),
      (request.onerror = promise.reject),
      request.send(options.body),
      promise
    );
  });
