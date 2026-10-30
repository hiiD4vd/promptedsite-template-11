Promise.catchAll = function (array) {
  return Promise.all(
    array.map((promise) =>
      promise && "function" == typeof promise.catch
        ? promise.catch((error) => {
            Promise.reject(error);
          })
        : promise,
    ),
  );
};
