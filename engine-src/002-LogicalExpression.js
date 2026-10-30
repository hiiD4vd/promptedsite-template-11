"undefined" == typeof console &&
  ((window.console = {}),
  (console.log =
    console.error =
    console.info =
    console.debug =
    console.warn =
    console.trace =
      function () {}));
