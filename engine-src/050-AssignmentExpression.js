window.get = function (url, options = { credentials: "same-origin" }) {
  let promise = Promise.create();
  return (
    (options.method = "GET"),
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
