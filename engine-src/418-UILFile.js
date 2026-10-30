Class(function UILFile(_offline, _path) {
  Inherit(this, Component);
  ((this.load = async function () {
    let path = window.UIL_STATIC_PATH || "assets/data/uil.json",
      cmsPath = window.UIL_CMS_STATIC_PATH || "assets/data/cms.json",
      jsonFiles = [path];
    window.ENABLE_UIL_CMS && jsonFiles.push(cmsPath);
    try {
      const allFiles = await Promise.all(jsonFiles.map((jsonFile) => get(jsonFile)));
      let data = Object.assign(...allFiles);
      return "string" == typeof data ? (Hydra.LOCAL ? null : {}) : data;
    } catch (e) {
      return {};
    }
  }),
    (this.save = async function (sessionData, data) {
      if (
        ((data = (function getSortedData(data) {
          return Object.keys(data)
            .sort()
            .reduce((obj, key) => ((obj[key] = data[key]), obj), {});
        })(data)),
        Dev.writeFile(window.UIL_STATIC_PATH || "assets/data/uil.json", data),
        _offline)
      ) {
        let partial = {};
        try {
          partial = await get("assets/data/uil-partial.json", data);
          for (let key in sessionData) partial[key] = sessionData[key];
        } catch (e) {
          partial = sessionData;
        }
        (Dev.writeFile("assets/data/uil-partial.json", partial),
          Storage.set("uil_update_partial", !0));
      }
    }));
});
