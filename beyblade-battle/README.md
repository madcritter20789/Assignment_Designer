# Beyblade Arena

[Source](https://github.com/madcritter20789/Assignment_Designer) · [Live arena](https://assignment-designer-theta.vercel.app).

Two original sculpted tops, one stadium, and a tactile ripcord. Aim in the arena or use the direction slider. Pull right and release, or hold the launch button and release. Play versus the CPU or stage both launches yourself. Coral and teal share the same simulation. Choose Premium Toy or Retro Plastic, angled or top camera, and optional synthesized sound (off initially).

## Technologies used

| Technology | Version | What it does in this project |
|---|---|---|
| HTML and CSS | Native browser features | Page structure, responsive layout, mobile controls, focus styles, spin meters, and theme colors. |
| JavaScript | ES modules | Connects input, game rules, rendering, sound, and the user interface. No React or UI framework is required. |
| Three.js | `0.186.1` | Renders the 3D stadium and tops, lights, shadows, camera views, particles, and custom materials. Raycasting converts a tap or pointer position into a launch direction. |
| `@dimforge/rapier3d-compat` | `0.21.0` | Runs the collision simulation using its bundled WebAssembly module. Handles top-to-top contact, stadium walls, bouncing, damping, and continuous collision detection. |
| `@paper-design/shaders` | `0.0.81` | Renders the dithered page background, gradient arena backdrop, and reactive arena border using WebGL shaders. The cloned repository supplied the integration reference. |
| Vite | `8.3.3` | Provides the development server, hot reload, production bundling, and local production preview. |
| Web Audio API | Native browser feature | Generates launch sounds, collision ticks, and a quiet spin hum without downloaded audio files. Sound starts muted. |
| Node.js | `24` in CI | Runs development tooling and the assertion-based physics checks. |
| GitHub Actions | Verification workflow | Installs dependencies, runs tests, and checks the production build. |

Exact package versions are recorded in `package.json` and `package-lock.json`. The application runs entirely in the browser: no backend, database, login, or external game API is needed.

## Run

Node 24 is used for development and CI. Dependencies and lockfile are pinned.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Run these commands from the `beyblade-battle` directory. `npm ci` installs the locked dependencies. The development server is at `http://127.0.0.1:5174/`; the production preview is at `http://127.0.0.1:4174/`. The build creates the static website in `dist/`. `npm test` runs the real Rapier physics and battle-rule checks.

## How to play

1. Open **Tops & settings** on mobile. Choose a preview card for each top and select **Versus CPU** or **Launch both**.
2. Tap the arena, move the pointer, or adjust the **Direction** slider to aim.
3. Hold **Hold to launch** and release. One second reaches full power. For the drag alternative, open **Prefer the ripcord?**, pull right and release; distance determines power.
4. In **Launch both**, configure coral first, then teal. Both tops launch together after the second launch is staged. In CPU mode, the opponent chooses its launch settings automatically.
5. The round ends when a top loses its spin, exits through a pocket, or the 20-second limit is reached. Select **Battle again** to replay.

Arrow keys aim while the arena, ripcord, or hold button is focused. Hold Space to pull; release to commit. The hold button also supports Enter. Escape, returning the ripcord to its start, pointer cancellation, and losing focus cancel. Pause preserves the round; Reset resumes with fresh tops. Hiding the tab pauses and cancels an unfinished pull.

## Implementation

Vanilla JavaScript, Three.js 0.186.1, Rapier 0.21.0, Paper Shaders 0.0.81, and Vite 8.3.3. Geometry is procedural; no downloaded models or image assets. `src/battle.js` owns rules and Rapier collisions, `src/scene.js` owns geometry/rendering, and `src/main.js` owns input and UI. Native Web Audio supplies quiet synthetic effects.

### 3D models and materials

The tops are built in code from cylinders, cones, torus rings, and repeated extruded blade shapes. Both use shared geometry, with coral and teal accents. The stadium combines a circular floor, molded rails, and two exit pockets. A hemisphere light and a directional light provide lighting and shadows.

Premium Toy and Retro Plastic reuse the same scene. Switching themes updates material colors, lighting, CSS, and shader palettes without restarting the round. Camera buttons choose an angled or top-down view.

### Battle physics

This is an arcade toy: upright cylinder bodies, separate spin energy, and center/orbit forces. It does not simulate gyroscopic motion. Tuning constants are together in `SETTINGS`. Physics runs at 120 Hz with a 50 ms accumulator cap and interpolated display transforms. Contact starts drain bounded spin energy. Both eliminations are resolved together; rounds end by spin-out, pocket ring-out, or remaining spin at 20 seconds.

The CPU selects its initial aim and power only. After launch, both tops use the same simulation. Physical body rotation is locked; the visible spinning and low-energy wobble are driven separately by the remaining spin energy.

### Shader effects

The custom Three.js floor shader draws radial markings, charge feedback, top halos, and four bounded collision rings. Tops use `MeshToonMaterial` with a generated three-band nearest-filtered gradient and shared edge outlines. The stadium uses clear-coated `MeshPhysicalMaterial` for molded plastic highlights.

| Effect | How it is made | Visible purpose |
|---|---|---|
| Dithered background | Paper **Dithering** | Gives the page a subtle printed, retro texture. |
| Arena backdrop | Paper **MeshGradient** | Adds soft blended colors behind the stadium and responds to interaction. |
| Reactive border | Paper **PulsingBorder** | Responds to launch power, collisions, and the winner's color. |
| Stadium markings and energy | Three.js `ShaderMaterial` with custom GLSL | Draws radial lines, power feedback, energy halos, and expanding impact rings. |
| Toon-shaded tops | Three.js `MeshToonMaterial` with a generated gradient texture | Produces distinct light/shadow bands for a stylized toy appearance. |
| Glossy plastic stadium | Three.js `MeshPhysicalMaterial` | Adds clear-coat highlights to the molded housing and floor. |

Paper's separate renderers now provide three effects: a static **Dithering** page background (300,000 pixels), a reactive **MeshGradient** arena backdrop (250,000 pixels), and **PulsingBorder** feedback (400,000 pixels). Uniforms and sizing follow the cloned library's presets. The rim uses decoded noise. Updates are limited to 30 Hz; decorative animation stops at rest, pause, and reduced motion. Three.js caps DPR at 1.5 and resolution at 1.5 million pixels; particles are pooled at 32. Reduced motion also removes decorative wobble, rings, particles, and camera animation. Resource disposal covers renderers, gradient textures, meshes, observers, listeners, audio, and physics.

### Responsive controls and fallback

Desktop has settings and animated top previews on the left, a prominent arena in the center, and launch/status controls on the right. Tablets put the arena above two panels. Phones show the arena first, followed by a collapsed **Tops & settings** disclosure and a compact launch panel. Mode and arena style use explicit segmented buttons instead of dropdowns. The 48 px mobile hold button sits beside the angle control; the secondary ripcord is expandable. Utility controls remain in the document without covering focus.

Choose original **Strike** (six angular blades), **Guard** (eight rounded blades), or **Glide** (three curved wings) separately for coral and teal. Lightweight SVG preview cards rotate slowly without additional WebGL contexts. Selection updates the 3D top immediately, persists through Reset/replay and theme changes, and locks once staged. These are cosmetic choices with identical battle rules. Preview motion can be paused and stops during battles, pause, tab hiding, and reduced motion.

Instructions follow the actual state: save coral first in Launch both, then release teal to start both. Inactive launch controls disappear during countdown, battle, pause, and results. Separate scoreboard labels distinguish ready, staged, automatic CPU setup, and remaining spin; the timer reports seconds left. Results explain the finish and provide immediate replay.

The refresh follows UI UX Pro Max and UI UX Designer mobile/user-flow guidance and the research recorded in [UI-REVIEW.md](UI-REVIEW.md). All visible controls have at least 44 px targets, visible focus, and responsive spacing. No runtime dependency was added.

Paper failure uses CSS feedback while retaining the floor shader. Custom shader compilation failure is reported and uses basic materials; that fallback does not satisfy the full shader criterion. WebGL/physics initialization failure or 3D context loss displays Retry.

## Project files

| File | Responsibility |
|---|---|
| `index.html` | Page structure, labels, controls, and accessible status/result elements. |
| `src/main.js` | Input handling, UI state, launch flow, pause/reset, and the main animation loop. |
| `src/battle.js` | Rapier world, colliders, launch parameters, spin energy, collisions, and finish rules. |
| `src/scene.js` | Three.js renderer, procedural geometry, materials, lighting, cameras, and particles. |
| `src/effects.js` | Theme palettes, custom floor GLSL, and the three Paper shader integrations. |
| `src/sound.js` | Synthesized sound effects, audio activation, muting, and cleanup. |
| `src/top-previews.js` | Original SVG silhouettes and accessible design-selection cards. |
| `src/style.css` | Desktop/mobile layouts, visual styling, focus states, and reduced-motion styles. |
| `test.mjs` | Runnable Node assertions using the real Rapier module. |
| `checks/browser.html` | Browser interaction, responsive layout, shader, fallback, and timing checks. |
| `../.github/workflows/verify.yml` | Root workflow: tests and builds this app, without deployment. |
| `vercel.json` | Vercel configuration: Vite, `npm run build`, and `dist`. |
| `../.gitignore` and `../.gitattributes` | Root configuration: excludes local/generated files, disc launcher, and shader clone; standardizes text line endings. |
| `public/` | Preserved Paper Shaders license and attribution notices. |

## Verification — October 8, 2026

Run the repeatable browser harness at `http://127.0.0.1:5174/checks/browser.html` after `npm run dev`. Append `?width=320&reduced&fallback` for the smallest layout, injected reduced motion, and forced Paper texture failure. The harness is not bundled in production.

- Real-Rapier Node assertions and the production build pass. Rules cover launch/aim bounds, staging, collision response, bounded damage, spin-out, ring-out, simultaneous elimination, timeout, pause, and reset.
- Headless Microsoft Edge with software WebGL passed the browser harness at desktop, 390 px, and 320 px reduced-motion/fallback. Checks cover both modes, six selectable previews, all design choices, hold/drag cancellation and outside release, keyboard input, synthetic touch input, stage locks, theme/camera preservation, muted audio, repeated reset, bounded canvas count, hidden-tab pause, and context-loss Retry.
- Actual Playwright keyboard input staged both tops, completed a spin-out battle, and replayed. Preview rotation, user-controlled preview pause, reduced motion, and paused-state messaging were checked separately.
- Layouts at 320×740, 375×812, 390×844, 768×1024, 1024×768, 1100×800, 1440×900, 1920×1080, and 844×390 had no horizontal overflow and visible controls at least 44 px high. Doubling root text exposed a 320 px camera-toolbar overflow; allowing that toolbar to wrap fixed the issue. Mobile arena begins approximately 165 px down instead of the previous 597 px at 390×844.
- Measured software-rendered RAF intervals over 90 samples: desktop median 66.7 ms / p95 175.1 ms; 390 px median 33.4 ms / p95 75.0 ms; 320 px reduced-motion/fallback median 25.0 ms / p95 33.4 ms. These validate behavior, not hardware performance. Physical phones, Safari, screen readers, and audible sound balance remain untested.
- Rapier's bundled WASM makes the main bundle approximately 5 MB / 1.85 MB gzip; Vite reports a size advisory.

GitHub Actions checks tests/build without publishing. Vercel uses root directory `beyblade-battle`, framework Vite, Node.js 24.x, install `npm ci`, build `npm run build`, and output `dist`. The included `vercel.json` supplies build/output settings; the owner manages deployment settings.

## Submission note

Beyblade Arena turns a familiar spinning-top battle into a small tactile web toy. The ripcord makes launch power tangible, while Paper presentation shaders and Three.js material effects make the arena responsive and expressive. Shared original geometry, two considered material palettes, and a bounded arcade simulation keep the scope compact. The source and live build are reproducible without a backend. The suggested six-hour budget is a target, not a claim of measured completion time; the assignment's 72-hour start time was unspecified.

## Next explorations

A longer polish pass (approximately 10–12 hours total effort) can refine molded seams, pockets, lighting, contact effects, sound balance, restrained trails, and a separate inspection view using OrbitControls. First test physical phones and Safari, then tune quality from measurements. Keep two modes and the existing rules.

Experimental realistic physics belongs on a separate branch, starting with one top: unlocked translation/rotation, gravity, a concave stadium, compound tip/body colliders, calibrated mass/inertia/center of mass, real angular velocity, contact friction, and damping. Compare tilted launches, precession, wobble, slowdown, and settling with recorded physical references. Sweep timestep and solver/contact settings before adding the second top. Promote it only after repeatable stability and collision validation; this arcade version remains the submission.

## Licenses

Paper Shaders license and attribution notices are preserved in `public/PAPER-SHADERS-LICENSE.txt` and `public/PAPER-SHADERS-NOTICE.txt`. Three.js and Rapier retain their MIT/Apache-2.0 dependency notices in their installed packages. Original designs use the public name Beyblade Arena and no branded assets.
