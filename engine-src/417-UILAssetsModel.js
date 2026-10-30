Class(function UILAssetsModel() {
  Inherit(this, Model);
  const _this = this;
  (Hydra.ready(async () => {
    if (!window.USE_CACHED_FILE) {
      if (
        ((_this.loaded = !1),
        (_this.state = AppState.createLocal()),
        await UILRemote.ready(),
        !UILStorage.ID)
      )
        throw new Error("Missing UIL ID!");
      (console.log("UILAssetsModel", UILStorage.ID), (_this.loaded = !0));
    }
  }),
    (_this.getAssets = async () => {
      try {
        return UILRemote.getAssets(file);
      } catch (err) {
        Hydra.LOCAL && console.error(err);
      }
    }),
    Data.handleRequest("assets", async (_, mockData) => {
      const idToken = await UILRemote.auth.getToken();
      let data = await fetch(`${UILRemote.UIL_SERVER}/uil/${UILStorage.ID}/assets`, {
        method: "GET",
        headers: { "x-authorization": idToken },
      });
      data = await data.json();
      return data.assets.reduce((acc, item) => {
        let type = "other";
        return (
          item.mimeType.startsWith("image") ||
          item.mimeType.startsWith("application/octet-stream") ||
          item.name.includes(".ktx")
            ? (type = "images")
            : item.mimeType.startsWith("video")
              ? (type = "videos")
              : item.mimeType.startsWith("audio")
                ? (type = "audios")
                : item.mimeType.startsWith("application/json") ||
                    item.mimeType.startsWith("application/macbinary") ||
                    item.mimeType.startsWith("model/gltf")
                  ? (type = "geometries")
                  : item.mimeType.startsWith("text/plain")
                    ? (type = "shaders")
                    : console.log(item),
          acc[type] || (acc[type] = []),
          acc[type].push({ ...item, filename: item.name, type: item.mimeType }),
          acc
        );
      }, {});
    }));
}, "static");
