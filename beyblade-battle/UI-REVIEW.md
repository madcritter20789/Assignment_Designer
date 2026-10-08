# UI review — October 8, 2026

Review completed before changing the interface. Inputs: all 147 elements in the live Vercel DOM, the full page markup/style rules, input/state orchestration, Three.js scene, shader/audio lifecycles, battle rules, and the five supplied screenshots. DOM inventory and before screenshots were captured locally. Browser observation used headless Edge with software WebGL; this is not physical-phone testing.

| Element / state | Finding | Change |
|---|---|---|
| Wordmark, lab label, experiment number | Decorative header consumes early mobile space. | Compact header; keep the name and one clear description. |
| Heading and subtitle | Large header delays entry; “last top spinning” omits ring-outs and timeout. | Smaller heading; concise launch description, complete rules in help. |
| Arena style label/select | Two options are hidden behind a dropdown. | Labeled Premium / Retro segmented buttons. |
| Round progress: coral, CPU/teal, battle | Extra row above the arena; CPU “ready” can imply a second user action. | Compact progress under the arena; CPU step explicitly automatic. |
| Choose-tops section, labels, two selects, note | Large panel before gameplay; long option text clips on phones; no visual comparison. | Preview cards with original silhouettes, selected indicators, slow optional rotation. |
| Battle mode label/select | Another dropdown for two options; buried explanation. | CPU / Launch both segments with state-aware explanation. |
| Round label | “SPIN REMAINING” describes a time value, not energy. | Time left in seconds; distinct spin meters. |
| Angled / Top buttons | Useful but inconsistent padding/size across breakpoints. | One reusable segmented-control treatment and 44 px minimum. |
| Stadium, Paper surface/rim, Three canvas | Mobile arena begins ~597 px down at 390×844; oversized setup comes first. | Arena first on mobile; centered between desktop side panels. Keep shader layers and fixed physics coordinates. |
| Coral/teal cards, percentages, spin meters, versus glyph | HUD competes with the physical objects; tiny text. | Dedicated scoreboard below the arena with explicit ready/staged/spin text. |
| Phase caption and clash count | Duplicates several launch instructions; can be obscured or crowded. | One concise round state and clash count outside the render surface. |
| Loading/error overlay and Retry | Handles failures, but default prose is indirect. | Direct “Loading arena” and recoverable Retry. Preserve real failure paths. |
| Paused overlay and Resume | Two sections repeat pause prose while irrelevant setup controls remain visible. | Clear paused state, Resume action, hide inactive launch fields. |
| Finish overlay and Battle again | Correct outcome but replay needs predictable keyboard focus. | Keep the result explanation and replay; avoid focusing behind overlays. |
| Launch label, title, instructions, mode hint | Four levels of repeated text; CPU hint shown during pause. | One title, one action instruction, one contextual next-step hint. |
| Aim label, output, slider, Left/Center/Right | Oversized visual block; spatial labels may mislead after changing camera/top. | Compact angle control with signed degrees and center reference. Retain a 44 px hit area. |
| Hold button, release hint, filling background | Too tall on phones; full-width stacked content takes excessive space. | Compact 48 px button beside the angle field, immediate charge feedback. |
| Power label/value, power hint, charge bar | Duplicates instructions; irrelevant 0% shown during battles. | Power feedback only in setup; stronger release feedback while charging. |
| Ripcord handle/teeth/track and “or” | Visually large alternative competes with primary button. | Optional expandable ripcord control; opaque foreground handle; preserve capture/cancel behavior. |
| Keyboard help, Reset, Pause, Sound | Utilities are detached far below the arena; symbol/copy inconsistency. | Utilities alongside launch/status, compact keyboard help in expandable rules. Sound remains muted initially. |
| Rules summary and four paragraphs | Rules are useful but one-second claim incorrectly applies to drag input. | Separate hold duration from drag distance; explain staged launches and 20-second tie threshold. |
| Footer and polite status region | Decorative footer is low priority; status must not announce every collision/frame. | Minimal footer and event-only polite announcements. |
| CSS / responsiveness / focus | Repeated overrides conflict; inconsistent borders/insets; setup source/visual order matters. | Replace layered overrides with a single token-based stylesheet, responsive grid, visible focus, no floating overlays over controls. |
| Motion and preview performance | Animated cards need a stop mechanism; extra WebGL renderers would waste resources. | Lightweight SVG previews, pause control, freeze on paused/hidden/battle states and reduced motion. No extra GPU contexts. |

## Flows and screen inventory

One page has loading, coral setup, teal setup, countdown, battle, result, paused, and retry states.

1. CPU: choose designs/mode → aim coral → hold or drag → release → both launch → result → replay.
2. Launch both: choose designs → aim/charge coral → release to save coral → aim/charge teal → release to start both → result → replay.
3. Interrupted input: Escape, focus loss, or pointer cancellation → cancel charge without a shot. Hidden tab → pause → explicit resume.
4. Change a staged design or mode: Reset → choose again. Theme/camera changes preserve the round.

Desktop: setup panel → central arena → launch/status panel. Mobile task order: arena → collapsed settings/previews → compact launch/status → expandable rules.

## Research used

- [W3C dragging alternatives](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements): retain a non-drag launch alternative.
- [W3C target size](https://www.w3.org/WAI/WCAG21/Understanding/target-size): use at least 44 px targets for this web interface, with adequate spacing.
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/): visible/unobscured focus and a way to stop nonessential continuous motion.
- [web.dev responsive design](https://web.dev/articles/responsive-web-design-basics): flexible layouts, viewport-aware composition, and no horizontal overflow.
- UI UX Pro Max: the initial “toy interactive playground” match was unrelated documentation guidance and was rejected; the “arcade game” match supported making gameplay dominant. Preserve the original toy palette rather than adopting its pixel-art aesthetic.
- UI UX Designer mobile/user-flow skills: prioritize the main action, reduce duplicated steps, preserve touch reach and clear feedback.
