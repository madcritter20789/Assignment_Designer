# Beyblade Arena

A 3D spinning-top battle toy built with Three.js, Rapier, and Paper Shaders.

- [Source repository](https://github.com/madcritter20789/Assignment_Designer)
- [App setup, controls, implementation, and verification](beyblade-battle/README.md)

## Develop locally

```powershell
cd beyblade-battle
npm ci
npm run dev
```

## Deploy with Vercel

Import this GitHub repository in Vercel and use:

- Root directory: `beyblade-battle`
- Framework: Vite
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`
- Node.js: 24.x

The app includes `beyblade-battle/vercel.json` with its build and output settings. Add the Vercel live URL here after deployment. The root GitHub Actions workflow only runs tests and checks the production build; it does not publish the website.

The disc launcher, upstream shader clone, dependencies, build output, local skill files, and credentials are ignored. The shader library is consumed from its pinned npm release. Paper Shaders license notices are included in the app’s `public` directory.

The previous standalone app’s Git metadata is preserved locally under `.git/retired-repositories/spin-arena.git`; it is not published. The old `spin-arena` GitHub repository remains available separately.
