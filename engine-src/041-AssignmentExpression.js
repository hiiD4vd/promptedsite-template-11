Promise.timeout = function (promise, timeout) {
  Array.isArray(promise) && (promise = Promise.all(promise));
  var timeoutPromise = Promise.create(),
    ref = Timer.create(timeoutPromise.resolve, timeout);
  return Promise.race([promise, timeoutPromise]).finally(function () {
    Timer.__clearTimeout(ref);
  });
};
