# Beyblade Arena

A 3D spinning-top battle toy built with Three.js, Rapier, and Paper Shaders.

- [Live app](https://madcritter20789.github.io/Assignment_Designer/)
- [Source repository](https://github.com/madcritter20789/Assignment_Designer)
- [App setup, controls, implementation, and verification](beyblade-battle/README.md)

## Develop locally

```powershell
cd beyblade-battle
npm ci
npm run dev
```

## Publish

From the repository root, commit changes and push `main`:

```powershell
git add .
git commit -m "Update Beyblade Arena"
git push origin main
```

The root GitHub Actions workflow installs dependencies in `beyblade-battle`, runs the Rapier assertions, builds the app, and publishes `beyblade-battle/dist` to GitHub Pages. Pages uses GitHub Actions as its publishing source. The app uses relative asset URLs, so the repository name is supported without changing the build command.

The disc launcher, upstream shader clone, dependencies, build output, local skill files, and credentials are ignored. The shader library is consumed from its pinned npm release. Paper Shaders license notices are included in the app’s `public` directory.

The previous standalone app’s Git metadata is preserved locally under `.git/retired-repositories/spin-arena.git`; it is not published. The old `spin-arena` GitHub repository remains available separately.
