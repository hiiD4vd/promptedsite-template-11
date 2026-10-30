Class(function Initialization() {
  ((this.initSync = async function (obj) {
    await Initializer3D.uploadAll(obj);
  }),
    (this.initAsync = async function (obj) {
      await Initializer3D.uploadAllAsync(obj);
    }));
});
