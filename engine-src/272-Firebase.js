Class(function Firebase() {
  Inherit(this, Model);
  const _this = this;
  var _app, _auth;
  let _hasInit;
  async function bootAuth() {
    (FirebaseAuth.init(), await FirebaseAuth.ready());
  }
  async function bootFirestore(app) {
    try {
      (await FirebaseFirestore.boot(app),
        await (async function initFirebaseAnonAuth() {
          const prom = Promise.create();
          return (
            await FirebaseAuth.ready(),
            firebase.auth().onAuthStateChanged((user) => {
              user ? prom.resolve() : prom.reject();
            }),
            firebase
              .auth()
              .signInAnonymously()
              .catch((e) => {
                (console.error("Error signing into firebase anon"), console.log(e), prom.reject(e));
              }),
            prom
          );
        })());
    } catch (e) {
      console.log("an error occurred booting firestore", e);
    }
  }
  function init() {
    if (!firebase) return _this.delayedCall(init, 100);
    _this.dataReady = !0;
  }
  ((this.init = async function () {
    if (_hasInit) return _this.ready();
    ((_hasInit = !0),
      await AssetLoader.loadAssets(["~assets/js/lib/firebase-app.js"]),
      await AssetLoader.waitForLib("firebase"),
      init());
  }),
    (this.initApp = function (firebaseConfig, name) {
      return (_app = name
        ? firebase.initializeApp(firebaseConfig, name)
        : firebase.initializeApp(firebaseConfig));
    }),
    (this.boot = async function (firebaseData, loader) {
      let database = !1 !== firebaseData.database,
        firestore = firebaseData.firestore,
        auth = firestore || firebaseData.auth,
        storage = firebaseData.storage;
      loader &&
        (loader.add(1),
        database && loader.add(1),
        firestore && loader.add(1),
        auth && loader.add(1),
        storage && loader.add(1));
      let loaderCallback = () => {
        loader && loader.trigger(1);
      };
      await _this.init().then(loaderCallback);
      let app = _this.initApp(Config.PLATFORM_CONFIG);
      return (
        await Promise.all([
          database && FirebaseDB.boot(app).finally(loaderCallback),
          auth && bootAuth().finally(loaderCallback),
          firestore && bootFirestore(app).finally(loaderCallback),
        ]),
        storage &&
          (await (async function bootStorage(app) {
            return (
              (_auth = app.auth()),
              _auth.onAuthStateChanged((user) => {
                user || _auth.signInAnonymously();
              }),
              AssetLoader.loadAssets(["~assets/js/lib/firebase-storage.js"]),
              _this.wait(() => !!firebase.storage)
            );
          })(app).finally(loaderCallback)),
        app
      );
    }),
    (this.uploadFile = async function (file, options = {}) {
      (await _this.init(), firebase.storage || (await _this.wait(() => !!firebase.storage)));
      const storage = _app.storage(),
        config = {
          ...{
            path: "",
            filename: file.name,
            contentType: file.type,
            metadata: {},
            onProgress: null,
          },
          ...options,
        };
      let storageRef = storage.ref();
      if (config.path) {
        const path = config.path.endsWith("/") ? config.path : `${config.path}/`;
        storageRef = storage.ref(path);
      }
      const fileRef = storageRef.child(config.filename),
        metadata = { contentType: config.contentType, customMetadata: config.metadata },
        uploadTask = fileRef.put(file, metadata);
      ("function" == typeof config.onProgress &&
        uploadTask.on("state_changed", (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          config.onProgress(progress, snapshot);
        }),
        await uploadTask);
      const downloadURL = await fileRef.getDownloadURL();
      return {
        name: config.filename,
        fullPath: fileRef.fullPath,
        url: downloadURL,
        metadata: metadata,
        ref: fileRef,
      };
    }));
}, "Static");
