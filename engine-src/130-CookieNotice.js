Class(function CookieNotice() {
  Inherit(this, Model);
  const _this = this,
    DEBUG = Utils.query("debug"),
    CONSENT_REQUIRED_COUNTRIES = [
      "AT",
      "BE",
      "BG",
      "HR",
      "CY",
      "CZ",
      "DK",
      "EE",
      "FI",
      "FR",
      "DE",
      "GR",
      "HU",
      "IE",
      "IT",
      "LV",
      "LT",
      "LU",
      "MT",
      "NL",
      "PL",
      "PT",
      "RO",
      "SK",
      "SI",
      "ES",
      "SE",
      "GB",
      "NO",
      "IS",
      "LI",
      "CH",
    ];
  let _isInEEA, _allowCookies, _countryCode;
  (!(async function () {
    try {
      await Hydra.ready();
      const forceNotice = !!Utils.query("cookieNotice");
      if (!forceNotice && Storage.get("cookies_allow"))
        return (
          DEBUG && console.log("[CookieNotice] cookies were previously accepted"),
          (_allowCookies = !0),
          window.MixpanelAnalytics &&
            (MixpanelAnalytics.optIn(),
            DEBUG &&
              console.log(
                "%c[CookieNotice] Mixpanel consent restored to granted",
                "color: #7856ff; font-weight: bold;",
              )),
          void (
            window.GoogleAnalytics &&
            (GoogleAnalytics.optIn(),
            DEBUG &&
              console.log(
                "%c[CookieNotice] Google Analytics consent restored to granted",
                "color: #7856ff; font-weight: bold;",
              ))
          )
        );
      if (!forceNotice && Storage.get("cookies_declined"))
        return (
          DEBUG && console.log("[CookieNotice] cookies were previously declined"),
          (_allowCookies = !1),
          window.MixpanelAnalytics &&
            (MixpanelAnalytics.optOut(),
            DEBUG &&
              console.log(
                "%c[CookieNotice] Mixpanel consent restored to denied",
                "color: #7856ff; font-weight: bold;",
              )),
          void (
            window.GoogleAnalytics &&
            (GoogleAnalytics.optOut(),
            DEBUG &&
              console.log(
                "%c[CookieNotice] Google Analytics consent restored to denied",
                "color: #7856ff; font-weight: bold;",
              ))
          )
        );
      // This template does not request a visitor's location from the legacy
      // analytics service. No analytics should be initialized by the product.
      const geo = { location: { countryCode: void 0 } };
      if (
        ((_countryCode = geo.location?.countryCode),
        (_isInEEA = CONSENT_REQUIRED_COUNTRIES.includes(_countryCode) || !!forceNotice),
        DEBUG && console.log("[CookieNotice] geo lookup, country detected: ", _countryCode),
        DEBUG && console.log("[CookieNotice] in user in EEA or UK? ", _isInEEA),
        forceNotice &&
          DEBUG &&
          console.log("[CookieNotice] notice forced on via ?cookieNotice (testing)"),
        !_isInEEA)
      )
        return;
      (window.gtag &&
        gtag("consent", "update", { analytics_storage: "denied", ads_storage: "denied" }),
        DEBUG && console.log("[CookieNotice] gtag consent set to denied"),
        window.MixpanelAnalytics &&
          (MixpanelAnalytics.optOut(),
          DEBUG &&
            console.log(
              "%c[CookieNotice] Mixpanel consent set to denied (EEA/UK default)",
              "color: #7856ff; font-weight: bold;",
            )),
        window.GoogleAnalytics &&
          (GoogleAnalytics.optOut(),
          DEBUG &&
            console.log(
              "%c[CookieNotice] Google Analytics consent set to denied (EEA/UK default)",
              "color: #7856ff; font-weight: bold;",
            )));
    } finally {
      _this.dataReady = !0;
    }
  })(),
    (_this.getCountryCode = function () {
      return _countryCode;
    }),
    (_this.isConsentRequired = function (countryCode) {
      return !!countryCode && CONSENT_REQUIRED_COUNTRIES.includes(countryCode.toUpperCase());
    }),
    (_this.displayNotice = function () {
      return (
        _this.dataReady ||
          console.warn(
            "CookieNotice not ready. wait for `await CookieNotice.ready()` before calling.",
          ),
        !1 !== _allowCookies && !0 !== _allowCookies && !!_isInEEA
      );
    }),
    (_this.accept = function () {
      (window.gtag &&
        gtag("consent", "update", { analytics_storage: "granted", ads_storage: "granted" }),
        DEBUG && console.log("[CookieNotice] gtag consent set to granted"),
        window.MixpanelAnalytics &&
          (MixpanelAnalytics.optIn(),
          DEBUG &&
            console.log(
              "%c[CookieNotice] Mixpanel consent set to granted",
              "color: #7856ff; font-weight: bold;",
            )),
        window.GoogleAnalytics &&
          (GoogleAnalytics.optIn(),
          DEBUG &&
            console.log(
              "%c[CookieNotice] Google Analytics consent set to granted",
              "color: #7856ff; font-weight: bold;",
            )),
        Storage.set("cookies_allow", !0),
        Storage.set("cookies_declined", null));
    }),
    (_this.decline = function () {
      (window.gtag &&
        gtag("consent", "update", { analytics_storage: "denied", ads_storage: "denied" }),
        DEBUG && console.log("[CookieNotice] gtag consent set to denied"),
        window.MixpanelAnalytics &&
          (MixpanelAnalytics.optOut(),
          DEBUG &&
            console.log(
              "%c[CookieNotice] Mixpanel consent set to denied",
              "color: #7856ff; font-weight: bold;",
            )),
        window.GoogleAnalytics &&
          (GoogleAnalytics.optOut(),
          DEBUG &&
            console.log(
              "%c[CookieNotice] Google Analytics consent set to denied",
              "color: #7856ff; font-weight: bold;",
            )),
        Storage.set("cookies_allow", null),
        Storage.set("cookies_declined", !0));
    }),
    (_this.clear = function () {
      (DEBUG && console.log("[CookieNotice] cookie settings cleared"),
        Storage.set("cookies_allow", null),
        Storage.set("cookies_declined", null),
        window.MixpanelAnalytics &&
          (MixpanelAnalytics.optOut(),
          DEBUG &&
            console.log(
              "%c[CookieNotice] Mixpanel consent reset",
              "color: #7856ff; font-weight: bold;",
            )),
        window.GoogleAnalytics &&
          (GoogleAnalytics.optOut(),
          DEBUG &&
            console.log(
              "%c[CookieNotice] Google Analytics consent reset",
              "color: #7856ff; font-weight: bold;",
            )));
    }));
}, "Static");
