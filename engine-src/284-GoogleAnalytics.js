Class(function GoogleAnalytics() {
  const _this = this,
    DEBUG = Utils.query("debug") && !Config.PROD;
  const idFromPage = (function getGaIdFromPage() {
      const script = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
      if (script && script.src) {
        const m = script.src.match(/[?&]id=(G-[A-Z0-9]+)/i);
        if (m) return m[1];
      }
      if (window.dataLayer && Array.isArray(window.dataLayer))
        for (let i = 0; i < window.dataLayer.length; i++) {
          const row = window.dataLayer[i];
          if (
            Array.isArray(row) &&
            "config" === row[0] &&
            "string" == typeof row[1] &&
            /^G-/.test(row[1])
          )
            return row[1];
        }
      return null;
    })(),
    ID = idFromPage || "G-XXXXXXXXXX";
  function hasConsented() {
    return !0 !== Storage.get("cookies_declined") && !0 === Storage.get("cookies_allow");
  }
  function init() {
    if (!idFromPage && "G-XXXXXXXXXX" === ID)
      return void (
        DEBUG &&
        console.warn("GoogleAnalytics: No GA ID from page and fallback not set; skipping init")
      );
    DEBUG && console.log("GoogleAnalytics: Init");
    const scriptOnPage = (function gtagScriptOnPage() {
      return !!document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    })();
    function gtag() {
      window.dataLayer.push(arguments);
    }
    ((window.dataLayer = window.dataLayer || []), (window.gtag = window.gtag || gtag));
    if (
      (gtag(
        "consent",
        "default",
        (function consentRequiredByDefault() {
          const countryCode = Storage.getCookie("viewer_country");
          return (
            DEBUG && console.log("GoogleAnalytics: Country code", countryCode),
            countryCode &&
            window.CookieNotice &&
            "function" == typeof CookieNotice.isConsentRequired &&
            CookieNotice.isConsentRequired(countryCode)
              ? (DEBUG &&
                  console.log(
                    "GoogleAnalytics: CookieNotice says consent required - denying by default",
                  ),
                !0)
              : (DEBUG &&
                  console.log(
                    "GoogleAnalytics: Non-consent region or no CookieNotice - granting by default",
                  ),
                !1)
          );
        })()
          ? {
              ad_storage: "denied",
              ad_user_data: "denied",
              ad_personalization: "denied",
              analytics_storage: "denied",
              wait_for_update: 500,
            }
          : {
              ad_storage: "denied",
              ad_user_data: "denied",
              ad_personalization: "denied",
              analytics_storage: "granted",
              wait_for_update: 500,
            },
      ),
      !scriptOnPage)
    ) {
      const script = document.createElement("script");
      ((script.id = "ga-script"),
        (script.async = !0),
        (script.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`),
        document.head.appendChild(script));
    }
    (scriptOnPage || gtag("js", new Date()),
      gtag("config", ID, { send_page_view: !1, debug_mode: DEBUG }),
      (function checkConsent() {
        (DEBUG && console.log("GoogleAnalytics: Check consent", hasConsented()),
          hasConsented() && _this.optIn());
      })());
  }
  ((this.optIn = function () {
    (DEBUG && console.log("GoogleAnalytics: Opt-in"),
      window.gtag &&
        window.gtag("consent", "update", {
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
          analytics_storage: "granted",
        }));
  }),
    (this.optOut = function () {
      (DEBUG && console.log("GoogleAnalytics: Opt-out"),
        window.gtag &&
          window.gtag("consent", "update", {
            ad_storage: "denied",
            ad_user_data: "denied",
            ad_personalization: "denied",
            analytics_storage: "denied",
          }));
    }),
    (this.track = function (eventName, params) {
      (DEBUG && console.log("GoogleAnalytics: Track", eventName, params),
        window.gtag && window.gtag("event", eventName, params));
    }),
    (function () {
      if (!ID) return console.warn("GoogleAnalytics: No ID provided");
      init();
    })(),
    (async function () {
      if (window.gtag && ID && window.CookieNotice && "function" == typeof CookieNotice.ready) {
        await CookieNotice.ready();
        const countryCode = CookieNotice.getCountryCode && CookieNotice.getCountryCode();
        countryCode && CookieNotice.isConsentRequired && CookieNotice.isConsentRequired(countryCode)
          ? (DEBUG &&
              console.log(
                "GoogleAnalytics: CookieNotice country",
                countryCode,
                "- consent required, denying",
              ),
            _this.optOut())
          : countryCode &&
            (DEBUG &&
              console.log(
                "GoogleAnalytics: CookieNotice country",
                countryCode,
                "- no consent required, granting",
              ),
            _this.optIn());
      }
    })());
}, "static");
