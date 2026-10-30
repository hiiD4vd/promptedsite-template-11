window.put = function (url, body, options = {}) {
  let promise = Promise.create();
  return (
    (options.method = "PUT"),
    body &&
      (options.body = "object" == typeof body || Array.isArray(body) ? JSON.stringify(body) : body),
    fetch(url, options)
      .then(function handleResponse(e) {
        e.text()
          .then((text) => {
            let result = text;
            if (text.charAt(0).includes("[") || text.charAt(0).includes("{"))
              try {
                result = JSON.parse(text);
              } catch (err) {}
            e.ok ? promise.resolve(result) : promise.reject(result);
          })
          .catch(() => {
            promise.reject(e);
          });
      })
      .catch(promise.reject),
    promise
  );
};
