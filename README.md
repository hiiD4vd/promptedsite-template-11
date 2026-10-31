# PromptedSite Template 11

An interactive WebGL2 experience with a React 19 and TypeScript interface. The entry gate and header navigation are React components. The scene, animation, audio, and collection use a recovered JavaScript WebGL engine. Its 636 ordered, formatted source units live in `engine-src/`; `predev` and `prebuild` assemble them into a generated runtime. This is editable source, but the WebGL engine is **not TypeScript or a React component tree**.

## Run

```bash
npm ci
npm run dev
```

Open <http://127.0.0.1:3027/>. A supported WebGL2 GPU is needed for normal playback. The generated runtime and same-origin Worker/helper code stay local; all 316 media files are served from the immutable Cloudflare R2 release in `src/config/assets.json`. That manifest contains public paths, sizes, and SHA-256 hashes, not credentials.

## Browser AI preview

```bash
npm ci
npm run build:artifact
```

`build:artifact` downloads the verified media ZIP from the [Gilbert GitHub media release](https://github.com/gilbertstevenson16-code/promptedsite-template-11-media/releases/tag/artifact-assets-d19880462ac1d4dd), checks its archive hash and all 316 file hashes, then builds `dist/` with same-origin media and an opt-in software WebGL2 mode. The ZIP is a preview fallback; production uses R2. Host **the complete `dist/` directory**, including companion files under `dist/assets/`, in the browser AI's visible preview or Artifact. A running local server alone is not a user-visible Artifact.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
npm test
npm run test:gpu
```

`npm test` checks the unsupported-browser fallback and recovery UI with Playwright's bundled browser. `npm run test:gpu` runs the real scene and Collection interaction in installed Google Chrome; it needs a working WebGL2 GPU.

## Implementation notes

- The WebGL engine is a recovered, imperative JavaScript dependency. It still needs a full TypeScript/component rewrite if that is a product requirement.
- The normal runtime intentionally redirects blocklisted GPUs to `/unsupported.html`. The software renderer override is only enabled for `build:artifact`.
- Browser AI platforms must permit WebGL2, Workers, and multi-file companion assets. The included preview build has been tested locally with software WebGL2 and external requests blocked; hosting platforms can impose additional limits.
