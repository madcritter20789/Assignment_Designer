# Beyblade Arena

A 3D spinning-top battle toy built with Three.js, Rapier, and Paper Shaders.

- [Live arena](https://assignment-designer-theta.vercel.app)
- [Source repository](https://github.com/madcritter20789/Assignment_Designer)
- [App setup, controls, implementation, and verification](beyblade-battle/README.md)

The interface centers the stadium between desktop side panels, with mobile-first arena placement, animated design previews, and compact launch controls.

## Tech stack

| Technology | Version | Purpose |
|---|---|---|
| HTML, CSS, and JavaScript | Native browser features; ES modules | Responsive UI, input handling, launch controls, and battle rules. |
| Three.js | `0.186.1` | 3D stadium and top geometry, lighting, shadows, cameras, toon materials, and custom GLSL shaders. |
| Rapier (`@dimforge/rapier3d-compat`) | `0.21.0` | WebAssembly collision physics, bouncing, damping, and continuous collision detection. |
| Paper Shaders (`@paper-design/shaders`) | `0.0.81` | Dithering background, MeshGradient arena backdrop, and reactive PulsingBorder. |
| Web Audio API | Native browser feature | Synthesized launch, collision, and spin sounds. |
| Vite | `8.3.3` | Development server, production build, and preview. |
| Node.js and npm | Node.js 24.x | Dependency management, build tooling, and assertion-based physics tests. |
| GitHub Actions | CI | Automated tests and production-build verification. |
| Vercel | Hosting | Static deployment configured through `beyblade-battle/vercel.json`. |

Package versions are pinned in `beyblade-battle/package.json` and its lockfile. The game runs entirely in the browser and needs no backend or database.

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

The app includes `beyblade-battle/vercel.json` with its build and output settings. The root GitHub Actions workflow only runs tests and checks the production build; it does not publish the website.

The disc launcher, upstream shader clone, dependencies, build output, local skill files, and credentials are ignored. The shader library is consumed from its pinned npm release. Paper Shaders license notices are included in the app’s `public` directory.

The previous standalone app’s Git metadata is preserved locally under `.git/retired-repositories/spin-arena.git`; it is not published. The old `spin-arena` GitHub repository remains available separately.
