# Cafe Artesano landing page

Build a modern, responsive, accessible Angular landing page for the Cafe Artesano coffee business, grounded in the supplied brand assets and documented through a reusable design system.

## Problem and value

The Angular 22 application still shows the generated starter screen. The business needs a polished public presence that communicates origin, natural roasting, product quality, and a clear contact path while preserving the visual identity visible in the supplied imagery.

## Scope

- Replace the generated Angular starter UI with a single-page marketing experience.
- Create `cafe-artesano/DESIGN.md` as the design-system source of truth.
- Derive the palette visually from the supplied logo and banners; record that automated RGB sampling was unavailable locally.
- Reuse `logo.jpg`, both banner images, and the portrait video without modifying them.
- Use Angular 22 standalone patterns, Tailwind CSS v4, semantic HTML, and accessible interaction states.
- Add responsive header, hero, brand story, quality, origin, video, contact, and footer content.
- Update Spanish document metadata and focused component tests.
- Replace every phone display/link with `+506 7160-6734` / `7160-6734`.
- Meet WCAG 2.2 AAA contrast targets for text and interactive states while retaining the existing structural accessibility baseline.
- Add a professional GSAP-powered parallax and scroll-motion layer that is progressive, responsive, and disabled for reduced-motion users.
- Replace the footer's textual “Volver al inicio” treatment with an accessible arrow icon control and animate its scroll-to-top behavior through GSAP, with an immediate reduced-motion fallback.
- Start the existing video muted when at least 25% visible, pause it when it leaves that threshold, preserve user controls/audio opt-in, and disable automatic playback for reduced-motion users.
- Download and locally serve one suitable free/open hero media asset, retaining source and license provenance and optimizing its delivery.

## Non-goals

- No e-commerce, cart, checkout, CMS, backend, analytics, or contact-form submission.
- No new component library unless implementation evidence shows it is necessary.
- No GSAP dependency in the initial implementation; CSS motion is sufficient for this static page and must respect `prefers-reduced-motion`.
- No synthetic SVG logo unless the raster logo proves unusable at rendered sizes.
- No routing or premature component hierarchy for this one-page scope.

## Constraints and decisions

| Topic | Decision |
|---|---|
| Repository | Use the parent `cafe-artesano-website` Git repository; the Angular workspace remains in `cafe-artesano/`. |
| Angular guidance | Angular CLI MCP identified Angular 22 and requires standalone components, `NgOptimizedImage`, strict TypeScript, and WCAG AA behavior. |
| Styling | Tailwind CSS v4 utilities plus concise semantic CSS custom properties. |
| Brand evidence | Logo and supplied banners are the visual source; palette values are carefully matched visual estimates because Python/Pillow, ImageMagick, and ffmpeg are unavailable. |
| Motion | Subtle CSS reveal/hover treatment only; reduced-motion users receive no nonessential animation. |
| TDD | Off by explicit user choice. Use ordinary focused Vitest and production-build checks; strict RED/GREEN evidence is not required. |
| Delivery | `ask-on-risk`; forecast exceeds the ~400 authored-line review heuristic. No commit will be created without explicit user authorization. |
| Persistence | Local task document is authoritative. Engram mirror is pending because the local provider reports an ownership mismatch. |
| Contact correction | By explicit user clarification, `71606734` is the Costa Rican phone number; use display `7160-6734` and link `tel:+50671606734` everywhere. |
| AAA scope | By explicit user choice, target WCAG 2.2 AAA contrast rather than claiming full AAA conformance across every success criterion. Every text label—including buttons and links—targets at least 7:1; large text targets at least 4.5:1; non-text borders, icons, focus indicators, and control boundaries retain at least 3:1 under the applicable WCAG criterion. The user explicitly chose this W3C-correct policy over a nonstandard 7:1 requirement for non-text UI. |
| Motion expansion | By explicit user request, add GSAP and parallax as a separate work unit. Motion must progressively enhance the page, avoid layout shifts, preserve content without JavaScript, and fully opt out under `prefers-reduced-motion`. The footer scroll-to-top text must become an icon-based control with an accessible name; GSAP handles the animated scroll while reduced-motion uses immediate navigation. |
| External hero media | The user explicitly authorized downloading and integrating a suitable free asset. Prefer the recommended Unsplash coffee-cherries still for efficient image parallax unless research verifies that the Pexels Costa Rica video is both technically and legally superior. Store the source URL and license provenance in `DESIGN.md`. |
| Video visibility behavior | By explicit user choice, use a 25% visibility threshold: start playback muted, pause below the threshold, keep native controls for audio opt-in, handle blocked `play()` safely, clean up the observer, and skip automatic playback under `prefers-reduced-motion`. |

## Workload forecast

Estimated total: 430–650 authored changed lines, excluding existing assets.

| ID | Work unit | Route and trigger | Estimate |
|---|---|---|---:|
| CA-1 | Document the brand system, metadata, palette tokens, typography, layout, accessibility, and motion standards. | Delegated writer: preparation plus 2+ non-trivial files. | 120–200 |
| CA-2 | Implement the responsive landing page and focused tests using the documented system and all approved assets. | Delegated writer: 4+ files and multi-file implementation. | 310–450 |
| CA-3 | Verify build/tests, inspect the result, reconcile documentation, and prepare the work-unit boundary. | Delegated verification according to native assessment; parent performs structural readback. | Evidence-only |
| CA-4 | Correct contact data and harden the palette, documentation, component states, and tests to WCAG 2.2 AAA contrast targets. | Delegated writer: design-system plus multi-file implementation. | 80–140 |
| CA-5 | Download and integrate licensed hero media; add GSAP with restrained parallax/scroll motion, Angular lifecycle-safe cleanup, reduced-motion opt-out, and focused tests. | Research first, then delegated writer: asset, dependency, and multi-file motion integration. | 160–280 |

## Checklist

- [x] **CA-1 — Brand foundation**
  - [x] Create `cafe-artesano/DESIGN.md` with palette, typography, spacing, radius, shadow, imagery, motion, accessibility, and responsive rules.
  - [x] Define matching global CSS tokens and baseline behavior.
  - [x] Set Spanish document language, title, description, theme color, and favicon metadata.
  - [x] Check: palette decisions cite the supplied assets and identify estimated values honestly.
- [x] **CA-2 — Landing implementation**
  - [x] Replace the starter component with semantic sections and responsive navigation.
  - [x] Use the supplied logo and images through Angular `NgOptimizedImage` where applicable.
  - [x] Add a bandwidth-conscious, accessible portrait video presentation.
  - [x] Preserve keyboard focus, contrast, reduced-motion, useful alt text, and one primary `h1`.
  - [x] Update tests for core content, landmarks, CTA, images, and video attributes.
- [x] **CA-3 — Verification and handoff**
  - [x] Run the focused Vitest command and production Angular build.
  - [x] Perform structural readback against `DESIGN.md` and acceptance criteria.
  - [x] Record observed verification results and any limitations.
  - [x] Keep commit creation pending unless the user explicitly authorizes it.
- [ ] **CA-4 — Contact and AAA contrast correction** *(in progress)*
  - [ ] Replace all phone text and `tel:` links with `7160-6734` / `+50671606734`.
  - [ ] Calculate and document WCAG contrast ratios for every semantic foreground/background pair used by text and controls.
  - [ ] Adjust design tokens and hard-coded component colors where required to meet the chosen AAA contrast scope.
  - [ ] Update focused tests for the corrected phone and critical accessibility behavior.
  - [ ] Re-run tests, production build, and independent verification.
- [ ] **CA-5 — GSAP parallax and motion polish**
  - [ ] Research current GSAP and Angular 22 lifecycle integration guidance.
  - [ ] Download one verified free hero asset into `cafe-artesano/public/`, record its source/license, dimensions, and purpose, and optimize it for web delivery.
  - [ ] Install a compatible GSAP release and integrate it without a component library.
  - [ ] Add restrained parallax/scroll reveals without hiding essential content before JavaScript runs.
  - [ ] Replace “Volver al inicio” text with an accessible arrow icon control and GSAP-powered scroll-to-top animation.
  - [ ] Auto-play the existing video muted at 25% visibility, pause it below threshold, preserve controls, and cover observer cleanup/behavior with tests.
  - [ ] Disable motion and automatic video playback cleanly for `prefers-reduced-motion` and small/low-power contexts where appropriate.
  - [ ] Clean up all GSAP contexts/triggers on component destruction and cover behavior with focused tests.
  - [ ] Re-run tests, production build, and independent verification.

## Acceptance criteria

- The page presents Cafe Artesano as a credible local coffee brand in Spanish on mobile and desktop.
- Essential claims are available as HTML text rather than only embedded in images.
- The supplied brand imagery is integrated without destructive cropping of embedded text.
- Static images follow Angular 22 image best practices where technically applicable.
- Navigation, focus states, media controls, contrast, headings, and reduced-motion behavior meet the documented accessibility standard.
- `npm run test -- --watch=false` and `npm run build` pass from `cafe-artesano/`.
- `DESIGN.md` is sufficient for future contributors to extend the visual system consistently.

## Progress and evidence

- Repository boundary confirmed: parent repository with untracked `cafe-artesano/` workspace; user selected the parent-repository model.
- Angular CLI MCP confirmed one Angular 22 application named `cafe-artesano` with build, serve, and test targets.
- Supplied assets were visually inspected. The video metadata reports a 640×1280 portrait H.264/AAC asset of about 20 seconds.
- Automated palette extraction is unavailable: `python3` exists without Pillow; `python`, ImageMagick, and ffmpeg are unavailable.
- Engram mirror attempt is pending due to provider ownership mismatch.
- CA-1 changed `DESIGN.md`, `src/styles.css`, and `src/index.html` (about 203 authored lines). The worker build and whitespace check passed; an independent verifier found no severity findings. Its partial status reflected missing changed-file inventory only, which the parent resolved with `git status` and confirmed no package or component changes attributable to CA-1.
- Parent spot check through Angular CLI MCP: production `build` passed with a 225.80 kB initial bundle and output under `dist/cafe-artesano`.
- CA-1 remains uncommitted because the user has not authorized commits.
- CA-2 produced the complete landing and 5 focused tests. The first build emitted an `anyComponentStyle` warning because `app.css` measured 6.22 kB against the 4 kB warning threshold; a focused Tailwind/CSS consolidation reduced source CSS to 3,588 bytes and removed the warning without dropping behavior.
- Native risk assessment was unavailable for the untracked initial project, so an independent verifier ran. It reported no high or medium findings and one low design mismatch: the reveal duration was 500ms versus the documented 160–240ms range. The parent corrected it to 220ms.
- Independent verification: 5/5 Vitest tests passed, production build passed without budget warnings, and the whitespace check passed.
- Parent spot check through Angular CLI MCP after the motion correction: production build passed; initial bundle 228.48 kB raw / 62.33 kB estimated transfer.
- Structural readback confirmed semantic landmarks, one `h1`, matching navigation targets, phone/location content, intrinsic image dimensions, useful Spanish alt text, controlled non-autoplay video, focus visibility, and reduced-motion handling.
- Limitation: no rendered browser viewport, playback, or automated contrast audit was available in the current toolset; responsive and accessibility behavior were verified structurally rather than visually.
- No commit was created because the user did not authorize one. Engram mirroring remains pending due to the provider ownership mismatch.
- The user corrected the business phone to `7160-6734` and selected WCAG 2.2 AAA contrast scope (not full all-criteria AAA conformance). CA-4 was added without reopening unrelated completed work.
- Angular 22 accessibility guidance was refreshed through Angular CLI MCP before CA-4.
- The user added GSAP and parallax as an explicit new scope. It is isolated as CA-5 so the in-flight phone/contrast correction remains reviewable.
- The user also authorized direct download and integration of a suitable free hero image or video. This was added to CA-5; no concurrent source write will occur while CA-4 is active.
- The user reconfirmed that AAA contrast applies to all textual UI, including buttons and links. For non-text UI, the accepted policy is the applicable W3C 3:1 criterion rather than a nonstandard 7:1 extension.
- Screenshot evidence showed the footer scroll-to-top affordance rendered as visible text (`Volver al inicio↑`). The user requested an icon instead and GSAP-powered animation; this correction is included in CA-5.
- The user chose muted visibility-driven video playback: begin at 25% visible, pause below the threshold, retain native controls, and do not auto-play for reduced-motion users.

## Next step

Complete and verify CA-4 while a read-only mapper researches Angular 22 + GSAP lifecycle, cleanup, performance, and reduced-motion practices for CA-5.
