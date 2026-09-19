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
- Add system-aware light/dark themes with an accessible manual selector and persisted user preference; both themes must retain the accepted contrast targets.
- Add production-grade technical SEO, social sharing metadata, structured data, robots/sitemap discovery, and accessible Facebook/WhatsApp links using the temporary Netlify URL.
- Increase GSAP motion to a clearly visible cinematic treatment on eligible desktop/no-reduced-motion contexts, and show the scroll-to-top control only after 10% document progress.
- Eliminate visible animation jumps: retain stable GSAP parallax and scroll-control motion, but remove hero/section entrance reveals if they cannot initialize without snapping already-rendered content.
- Add official Angular compile-time i18n with Spanish (`es-CR`) at `/` and a complete English build at `/en/`, including document navigation, localized static SEO, hreflang, sitemap, tests, and Netlify-safe publication.
- Replace the generic flower favicon/header mark with a cache-busted compact `CA` monogram derived from the supplied brand reference.
- Ensure the static-SEO post-build CLI executes from symlinked CI/Netlify workspace paths so the deployed English document cannot retain Spanish source metadata.
- Place authoritative Netlify configuration beside the Angular package and remove the stale source `_redirects` fallback so monorepo config precedence cannot bypass `npm run build` or return Spanish HTML for missing routes.
- Replace every call-oriented primary invitation with a friendly “Escríbenos” WhatsApp action; retain the telephone only as visible secondary information.

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
| Persistence | Local task document remains authoritative and is mirrored to Engram, which the user re-enabled successfully on 2026-09-19. |
| Contact correction | By explicit user clarification, `71606734` is the Costa Rican phone number; use display `7160-6734` and link `tel:+50671606734` everywhere. |
| AAA scope | By explicit user choice, target WCAG 2.2 AAA contrast rather than claiming full AAA conformance across every success criterion. Every text label—including buttons and links—targets at least 7:1; large text targets at least 4.5:1; non-text borders, icons, focus indicators, and control boundaries retain at least 3:1 under the applicable WCAG criterion. The user explicitly chose this W3C-correct policy over a nonstandard 7:1 requirement for non-text UI. |
| Motion expansion | By explicit user request, add GSAP and parallax as a separate work unit. Motion must progressively enhance the page, avoid layout shifts, preserve content without JavaScript, and fully opt out under `prefers-reduced-motion`. The footer scroll-to-top text must become an icon-based control with an accessible name; GSAP handles the animated scroll while reduced-motion uses immediate navigation. |
| External hero media | The user explicitly authorized downloading and integrating a suitable free asset. Prefer the recommended Unsplash coffee-cherries still for efficient image parallax unless research verifies that the Pexels Costa Rica video is both technically and legally superior. Store the source URL and license provenance in `DESIGN.md`. |
| Video visibility behavior | By explicit user choice, use a 25% visibility threshold: start playback muted, pause below the threshold, keep native controls for audio opt-in, handle blocked `play()` safely, clean up the observer, and skip automatic playback under `prefers-reduced-motion`. |
| Theme behavior | By explicit user choice, initialize from `prefers-color-scheme`, provide an accessible light/dark selector, and persist the user's override. Both themes must independently meet the accepted text and non-text contrast thresholds. |
| Temporary canonical URL | Use `https://cafeartesanocr.netlify.app/` for canonical, Open Graph, sitemap, robots, and structured data until a custom domain is available. Replace all absolute SEO URLs together when migrating domains. |
| Social identity | Facebook is `https://www.facebook.com/cafeartesanopalmichal`; no Instagram profile is claimed. WhatsApp uses `https://wa.me/50671606734`. Structured data describes Café Artesano as an `Organization`/coffee brand, not a physical café. |
| Cinematic motion refinement | By explicit user choice, make GSAP motion visibly cinematic rather than subtle while preserving reduced-motion opt-out, transform/opacity-only performance, content availability, cleanup, and mobile restraint. The scroll-to-top control stays unavailable until vertical document progress reaches 10%, then enters/exits accessibly. |
| Motion stability | User-observed jumps take priority over decorative reveals. Root cause: async GSAP imports leave content visible, then `fromTo` applies a lower-opacity/translated start state after paint or at `onEnter`, producing a visible snap. Remove hero and per-section entrance reveals rather than pre-hiding content; retain parallax and scroll-top animation, which do not alter document layout. |
| Internationalization | Use official Angular 22 compile-time localization. Spanish Costa Rica (`es-CR`) is the source locale at the existing root URL; English (`en`) is emitted under `/en/`. Language switching uses ordinary document links because each locale is a separate compiled application variant. Missing translations fail the build. |
| Localized SEO | Preserve crawlable static metadata in each generated `index.html`. The Spanish source index remains authoritative for `/`; a deterministic post-build step localizes the generated English index and verifies canonical, hreflang, Open Graph locale, JSON-LD, and noscript output. Sitemap lists both locale URLs with alternates. |
| Localized deployment | Netlify serves physical `/index.html` and `/en/index.html` artifacts. Remove the unnecessary global SPA fallback for this anchor-only landing so unknown English URLs cannot silently receive Spanish HTML. |
| Favicon identity | Replace the generic flower with a square, legible CA monogram based on the supplied `Recurso 5.png`; use a new versioned filename to invalidate browser favicon caches and reuse it as the compact header mark. |
| CI CLI identity | The post-build localizer must identify direct execution by canonical real path, not raw `process.argv[1]` equality. Netlify invokes repository commands through symlinked build paths; the raw-path guard silently skipped `main()` while exiting successfully, leaving `/en/` metadata Spanish despite local verification. |
| Netlify monorepo config | Netlify selects `cafe-artesano/netlify.toml` and this site's effective base is the Angular package directory. Netlify CLI resolved current directory/base to `cafe-artesano`, proving package-local values must be app-relative: `npm run build` and `dist/cafe-artesano/browser`. Keep root config as equivalent repository fallback and delete `src/_redirects`. |
| Contact CTA | By explicit user choice, all primary call invitations become “Escríbenos” links to `https://wa.me/50671606734`; phone `7160-6734` remains visible as secondary information but not a call CTA. Spanish/English catalogs, noscript fallbacks, tests, and metadata validation must use message-oriented language. |

## Workload forecast

Estimated cumulative scope: 800–1,250 authored changed lines, excluding existing/generated assets.

| ID | Work unit | Route and trigger | Estimate |
|---|---|---|---:|
| CA-1 | Document the brand system, metadata, palette tokens, typography, layout, accessibility, and motion standards. | Delegated writer: preparation plus 2+ non-trivial files. | 120–200 |
| CA-2 | Implement the responsive landing page and focused tests using the documented system and all approved assets. | Delegated writer: 4+ files and multi-file implementation. | 310–450 |
| CA-3 | Verify build/tests, inspect the result, reconcile documentation, and prepare the work-unit boundary. | Delegated verification according to native assessment; parent performs structural readback. | Evidence-only |
| CA-4 | Correct contact data and harden the palette, documentation, component states, and tests to WCAG 2.2 AAA contrast targets. | Delegated writer: design-system plus multi-file implementation. | 80–140 |
| CA-5 | Download and integrate licensed hero media; add GSAP with restrained parallax/scroll motion, Angular lifecycle-safe cleanup, reduced-motion opt-out, and focused tests. | Research first, then delegated writer: asset, dependency, and multi-file motion integration. | 160–280 |
| CA-6 | Add system-aware light/dark themes, accessible selector, persistence, pre-render theme bootstrap, dual-theme contrast evidence, and tests. | Delegated writer: design tokens plus multi-file behavior. Execute before CA-5 so motion controls inherit final theme tokens. | 140–240 |
| CA-7 | Add canonical/meta/OG/Twitter metadata, Organization JSON-LD, robots.txt, sitemap.xml, social preview media, accessible Facebook/WhatsApp links, and deployment-aware SEO documentation/tests. | Delegated writer: multi-file metadata/public-assets/content integration. | 120–220 |
| CA-8 | Increase desktop GSAP motion to a cinematic but accessible treatment and gate the scroll-to-top control at 10% document progress with tested show/hide/cleanup behavior. | Delegated writer: multi-file motion refinement. | 100–180 |
| CA-9 | Remove snap-prone hero/section reveal animations while preserving stable ±5% parallax, scroll-top animation, video behavior, accessibility, and lifecycle cleanup. | Delegated writer: multi-file motion stabilization. | 50–100 |
| CA-10 | Add Angular localize infrastructure, mark all visible/runtime strings, extract XLIFF 2, translate English, and add accessible locale navigation. | Delegated writer: dependency/config/template/catalog implementation. | 220–360 plus generated XLIFF |
| CA-11 | Localize static SEO/build outputs, add canonical/hreflang/sitemap rules, make Netlify locale-safe, and replace the favicon/header mark with a versioned CA monogram. | Delegated writer: build script, metadata, assets, tests, and deployment config. | 180–300 |
| CA-12 | Verify both locale artifacts, extraction integrity, SEO/discovery output, accessibility regression, and production publication layout. | Independent verifier plus parent Angular MCP/build artifact inspection. | Evidence-only |
| CA-13 | Fix symlink-safe post-build CLI detection and prove the deployed English metadata is actually localized in Netlify CI. | Delegated writer plus local symlink simulation and live deploy verification. | 20–50 |
| CA-14 | Align Netlify package-directory configuration and remove the stale source redirect after live deploy proves the root config/build command is being bypassed. | Delegated writer plus live deploy/API/HTTP verification. | 20–50 |
| CA-15 | Replace call-oriented CTAs and fallbacks with accessible WhatsApp messaging actions while preserving the phone as secondary information in both locales. | Delegated writer plus catalog/artifact verification. | 40–90 |

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
- [x] **CA-4 — Contact and AAA contrast correction**
  - [x] Replace all phone text and `tel:` links with `7160-6734` / `+50671606734`.
  - [x] Calculate and document WCAG contrast ratios for every semantic foreground/background pair used by text and controls.
  - [x] Adjust design tokens and hard-coded component colors where required to meet the chosen AAA contrast scope.
  - [x] Update focused tests for the corrected phone and critical accessibility behavior.
  - [x] Re-run tests, production build, and independent verification.
- [x] **CA-5 — GSAP parallax and motion polish**
  - [x] Research current GSAP and Angular 22 lifecycle integration guidance.
  - [x] Download one verified free hero asset into `cafe-artesano/public/`, record its source/license, dimensions, and purpose, and optimize it for web delivery.
  - [x] Integrate the supplied `public/LOGOTIPO CA.svg` for scalable large-format brand presentation while retaining or deriving a compact mark for small header use.
  - [x] Create a dedicated compact SVG favicon from the supplied vector mark, retain `favicon.ico` as fallback, update metadata, and verify legibility at small sizes.
  - [x] Install a compatible GSAP release and integrate it without a component library.
  - [x] Add restrained parallax/scroll reveals without hiding essential content before JavaScript runs.
  - [x] Replace “Volver al inicio” text with an accessible arrow icon control and GSAP-powered scroll-to-top animation.
  - [x] Auto-play the existing video muted at 25% visibility, pause it below threshold, preserve controls, and cover observer cleanup/behavior with tests.
  - [x] Disable motion and automatic video playback cleanly for `prefers-reduced-motion` and small/low-power contexts where appropriate.
  - [x] Clean up all GSAP contexts/triggers on component destruction and cover behavior with focused tests.
  - [x] Re-run tests, production build, and independent verification.
- [x] **CA-6 — System-aware light/dark themes**
  - [x] Define complete semantic light and dark token sets with measured contrast evidence.
  - [x] Initialize from system preference without a flash of the wrong theme where practical.
  - [x] Add an accessible icon control that announces its current state/action and meets 44px sizing.
  - [x] Persist an explicit user choice and react safely to system changes when no override exists.
  - [x] Cover initialization, toggle, persistence, and contrast-critical markup with focused tests.
  - [x] Re-run tests, production build, and whitespace/component-CSS checks before CA-5.
- [x] **CA-7 — SEO, social sharing, and discoverability**
  - [x] Add canonical, robots, title/description, Open Graph, Twitter Card, locale, image dimensions/alt, and mobile metadata using the temporary Netlify URL.
  - [x] Add valid `Organization` JSON-LD with brand, logo, contact, area, Facebook `sameAs`, and no unverified physical-café claims.
  - [x] Add `public/robots.txt` and absolute `public/sitemap.xml`; ensure both reach the final publish directory.
  - [x] Create/use an optimized social preview image with documented dimensions and absolute URL.
  - [x] Add accessible Facebook and WhatsApp links without inventing Instagram.
  - [x] Add focused metadata/links tests and verify production output contains all discovery files.
- [x] **CA-8 — Cinematic GSAP and 10% scroll control**
  - [x] Add a clearly visible hero entrance sequence and section reveals using only transform/opacity.
  - [x] Increase hero/media parallax range while preventing exposed edges, layout shifts, pinning, or snapping.
  - [x] Keep cinematic motion desktop/no-reduced-motion only and retain safe static/mobile fallbacks.
  - [x] Hide and disable the scroll-to-top control below 10% document progress; show/enable it at or above 10%.
  - [x] Animate control entry/exit with GSAP when available and preserve immediate accessible fallback otherwise.
  - [x] Test exact threshold boundaries, resize/document-height changes, keyboard availability, cleanup, and GSAP options.
  - [x] Re-run tests, production build, independent verification, and Angular MCP spot check.
- [x] **CA-9 — Motion jump stabilization**
  - [x] Remove hero entrance replay that applies transformed/transparent states after first paint.
  - [x] Remove per-section `onEnter` reveals that snap visible content into a starting state.
  - [x] Preserve and test ±5% hero parallax, scroll-top GSAP/fallback behavior, reduced motion, and cleanup.
  - [x] Remove obsolete motion classes/tests/docs without changing layout or content.
  - [x] Re-run tests, production build, independent verification, and Angular MCP spot check.
- [x] **CA-10 — Angular i18n application content**
  - [x] Add `@angular/localize` through Angular CLI and configure `es-CR` source/root plus `en` under `/en/` with missing translations as errors.
  - [x] Mark every visible template string and translatable accessibility attribute with stable, meaningful i18n IDs.
  - [x] Localize runtime theme labels with `$localize` and add accessible document-level language links.
  - [x] Extract XLIFF 2 catalogs and provide complete, reviewed English translations.
  - [x] Prove with a production build that Spanish emits at `browser/index.html` and English at `browser/en/index.html`, with correct `lang` and base href.
  - [x] Preserve motion, theme, contact, accessibility, social, and content behavior with focused tests.
- [x] **CA-11 — Localized SEO, deployment, and favicon**
  - [x] Add deterministic English static-metadata/noscript localization and canonical/hreflang/OG/JSON-LD verification for both generated indices.
  - [x] Publish a bilingual alternate sitemap and keep robots pointing to its root URL.
  - [x] Remove or narrow the global Netlify SPA fallback so physical locale documents are authoritative.
  - [x] Create `cafe-artesano-ca-v1.svg`, update favicon/header references, and verify no generic flower reference remains.
  - [x] Add build-artifact tests for both locales, assets, links, metadata, and discovery files.
- [x] **CA-12 — Bilingual release verification**
  - [x] Run extraction integrity, unit tests, full localized production build, post-build metadata verification, and whitespace checks.
  - [x] Independently verify translated content, locale navigation, SEO outputs, accessibility, favicon, and Netlify publication mapping.
  - [x] Run a final Angular CLI MCP production build and document any post-build step separately.
  - [x] Record remaining live-browser, crawler, and deployment limitations.
- [x] **CA-13 — Netlify symlink-safe post-build execution**
  - [x] Replace raw CLI-path equality with canonical real-path main-module detection.
  - [x] Add a regression test that executes/detects the script through a filesystem symlink.
  - [x] Re-run 35+ tests, localized build, artifact verification, and symlinked CLI simulation.
  - [x] Publish the correction and inspect the subsequent Netlify deployment; this disproved symlink detection as the only live cause and opened CA-14.
- [ ] **CA-14 — Netlify monorepo configuration precedence** *(effective-base correction in progress)*
  - [ ] Configure package-directory `cafe-artesano/netlify.toml` for its observed package base: `npm run build`, publishing `dist/cafe-artesano/browser`.
  - [x] Delete `cafe-artesano/src/_redirects` so Netlify cannot restore the global Spanish SPA fallback.
  - [ ] Test root/package configuration equivalence and run Netlify CLI build offline to validate actual resolved base/command/publish values.
  - [ ] Publish again and verify the latest deploy succeeds, reports no redirects, preserves English `/en/` metadata, and keeps 404 behavior.
- [ ] **CA-15 — WhatsApp-first contact actions** *(pending CA-14 closure)*
  - [ ] Change header and hero primary CTAs to “Escríbenos” and link them to WhatsApp with accessible new-tab labels.
  - [ ] Replace call-oriented contact copy and noscript actions in Spanish and English with WhatsApp messaging language.
  - [ ] Keep `7160-6734` visibly available as secondary contact information without a primary `tel:` action.
  - [ ] Re-extract all 66+ XLIFF units, update complete English targets, focused tests, and localized static artifacts.
  - [ ] Verify both locale builds and live WhatsApp links after deployment.

## Acceptance criteria

- The page presents Cafe Artesano as a credible local coffee brand in Spanish and English on mobile and desktop.
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
- Engram mirroring was initially unavailable due to provider ownership mismatch; the user re-enabled it successfully before CA-10, and current architecture/decisions/bug fixes are persisted.
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
- Independent CA-4 verification confirmed every interactive text label exceeds 7:1, but found the translucent sticky-header border below 3:1 (2.45–2.95:1) and a near-threshold line/hero boundary. User visual feedback also reported that `Llámenos` and `Hablemos de café` text was not reliably visible despite authored ratios; CA-4 remains open for explicit rendered button classes and safer non-text contrast margins.
- The user selected system preference plus an accessible persisted selector for light/dark mode. This is tracked as CA-6 and will execute before CA-5.
- CA-4 remediation replaced critical Tailwind-only CTA colors with explicit `.cta-primary` states: 8.47:1 default/focus, 10.20:1 hover, and 11.94:1 active. The header is now opaque and its weakest documented boundary is 4.29:1.
- Independent CA-4 reverification found no severity findings; 6/6 tests passed, the production build passed without warnings, retired-number checks passed, and component CSS remained 3,975 bytes.
- Parent Angular CLI MCP spot check passed after CA-4 remediation: 229.58 kB initial bundle / 62.44 kB estimated transfer.
- CA-6 added complete `data-theme` token overrides, an early storage/system bootstrap, guarded Angular signal state, and a 44px Spanish-labelled native toggle. The focused Vitest suite passed 9/9 tests; the production build passed with a 236.51 kB initial bundle / 64.33 kB estimated transfer; whitespace validation passed; and `app.css` measured 3,974 bytes (under the 4 KiB warning threshold). No Angular CLI MCP tool was available in this execution environment, so the implementation followed the recorded Angular 22 standalone and accessibility guidance.
- CA-6 incident note: its writer reported editing this parent-owned task document outside the authorized surfaces. The untracked workspace prevents definitive attribution. Read-only diagnosis found CA-6 checklist/evidence consistent with current code and no other semantic unauthorized change; the parent reconciled only the stale next step.
- Independent CA-6 verification initially found MEDIUM dark-theme skip-link contrast at approximately 1.22:1 and LOW blocked-localStorage precedence. The correction introduced theme-safe skip-link tokens and an in-memory manual override.
- Independent CA-6 reverification found no severity findings: skip-link label is 8.47:1 in both themes, all boundaries/focus exceed 3:1, blocked-storage manual choice survives later system events, 10/10 tests pass, the build is clean, and `app.css` is 3,771 bytes.
- Parent Angular CLI MCP spot check passed after CA-6 correction: 236.94 kB initial bundle / 64.43 kB estimated transfer.
- Newly supplied brand assets were inspected. `LOGOTIPO CA.svg` is a true path-based vector with the established green, brown, and off-white palette, so it is preferable for large-format brand display. Its full vertical lockup is too detailed for favicon/header-icon sizes; CA-5 will use or derive a compact vector mark and update the favicon separately.
- CA-5 installed `gsap@3.15.0`, downloaded three verified local WebP hero variants (768×512, 1280×853, 1600×1067), integrated the supplied vector identity/favicon, added progressive parallax/reveals, icon-only ScrollToPlugin navigation, and 25%-visible muted video playback. Writer checks passed with 14/14 tests, clean build, and 111-byte component CSS.
- Independent CA-5 verification found two MEDIUM gaps and two LOW refinements: literal no-JavaScript essential content was absent; tests did not exercise actual GSAP module registration/options/late-import guards; mobile/reduced-motion contexts imported GSAP before declining motion; and compact header/favicon art retained unreadably small text. CA-5 remains open for focused correction.
- Parent verification separately confirmed the Unsplash source redirect, 2000×1335 original, official download filename identifying Juliana Barquero, and current Unsplash license page; the app serves only local derivatives.
- CA-5 correction added a semantic no-script fallback, pre-import mobile/reduced-motion gating, deterministic real GSAP module-mock coverage, and text-free compact header/favicon artwork. Independent reverification found no severity findings; 16/16 tests and production build passed, GSAP resolved at 3.15.0, and `app.css` remained 111 bytes.
- Parent Angular CLI MCP spot check passed after final CA-5 correction: 249.38 kB initial bundle / 67.63 kB estimated transfer, with GSAP retained in lazy chunks.
- CA-7 implemented static canonical/robots/OG/X metadata, constrained Organization JSON-LD, Facebook/WhatsApp links, `robots.txt`, one-page sitemap, and a local 1200×630 social JPEG. Writer checks passed with 17/17 tests and a clean 250.48 kB build.
- Independent CA-7 verification found no functional metadata defect but returned partial with one MEDIUM coverage gap: unit tests covered social links but not metadata uniqueness, canonical consistency, JSON-LD constraints, discovery-file contents, image-dimension agreement, or publication configuration.
- CA-7 correction added six deterministic SEO/discovery tests (37 assertions), including exact-once metadata, canonical consistency, parsed constrained JSON-LD, robots/sitemap semantics, binary JPEG dimension validation, Angular public-copy behavior, and root Netlify base/publish resolution.
- Independent CA-7 reverification found no severity findings: 23/23 tests passed, production discovery artifacts matched source semantics, and no CA-4/5/6 regression was detected.
- Parent Angular CLI MCP final spot check passed: 250.50 kB initial bundle / 67.71 kB estimated transfer; GSAP remained lazy-loaded and no budgets warned.

- The user requested a visibly cinematic motion pass and clarified that the scroll-to-top control must appear only after 10% vertical document progress. CA-8 was added without reopening completed SEO or accessibility work.
- CA-8 first pass added stronger hero/reveal motion and tested 10% gating, but independent verification found two MEDIUM defects: hero parallax remained one-sided (0% to -5%) instead of a true +5% to -5% range, and the fixed scroll control/icon lacked explicit 44×44px/compact SVG dimensions. LOW test gaps covered private late-import manipulation, non-scrollable pages, and RAF coalescing.
- CA-8 correction implemented true `fromTo` +5%→-5% parallax with scale 1.1/scrub 0.6, exact 44×44px control and 20×20px icon sizing, non-scrollable-page suppression, one-RAF coalescing, and public fixture-lifecycle deferred-import coverage.
- Independent CA-8 reverification found no functional severity findings; 28/28 tests and production build passed, cinematic hero/reveal values remained intact, and no CA-4/5/6/7 regression was detected.
- Parent Angular CLI MCP final CA-8 spot check passed: 254.75 kB initial bundle / 68.78 kB estimated transfer; GSAP remains lazy and no budgets warned.

- The user observed visual jumps from animation. Inspection identified the root cause: async `fromTo` hero/section reveals applied translated/lower-opacity initial states after content was already painted.
- CA-9 removed every hero/section reveal hook and retained only stable ±5% image parallax plus fixed scroll-control motion. Independent verification found no HIGH or MEDIUM findings; 28/28 tests and the production build passed at 254.16 kB initial / 68.75 kB estimated transfer.
- Parent Angular CLI MCP CA-9 spot check passed with the same 254.16 kB initial / 68.75 kB estimated transfer bundle; GSAP remains lazy and no budgets warned.
- CA-10 implemented official Angular compile-time localization with 66 stable XLIFF 2 units, es-CR at `/`, English at `/en/`, a document locale link, missing-translation errors, and 31 passing tests. The build experiment proved physical root and `/en/` indices with correct `lang`, base href, and relative assets.
- Independent CA-10 verification found configuration/catalog completeness sound, but flagged literal English phrasing and catalog-test gaps for duplicate IDs/placeholder parity. Focused correction rewrote eight targets into approved natural English and added parser-based duplicate-ID, exact-ID-set, per-unit placeholder-parity, translation-state, completeness, and copy-quality assertions; 32 tests and the bilingual build pass.
- CA-10 final readback confirmed the corrected source-faithful contact line (`From Palmichal de Acosta, let’s connect.`) in the English catalog, assertion, and emitted bundle. Parent Git inventory confirmed no CA-11 file was touched. The Spanish static metadata/noscript in the English physical index moved to CA-11 as an explicit release blocker.
- CA-11 implemented deterministic English generated-index localization/validation, bilingual canonical/hreflang/OG/X/JSON-LD/noscript output, bilingual alternate sitemap, physical-document Netlify publication, and a versioned path-based CA monogram.
- Final CA-11 correction removed both legacy favicon candidates and references, made the localizer reject any reappearance, and added byte-idempotency, duplicate-tag, check-only, English-only mutation, and legacy-candidate tests. Independent reverification found no severity findings; 35/35 tests, localized build, and artifact check pass.
- CA-12 final release verification passed: 66 extracted messages, 35/35 tests, Angular CLI MCP production build at 277.20 kB initial / 76.56 kB estimated transfer, deterministic post-build localization, `verify:locales`, corrected production-surface gates, and full whitespace checks. Independent verification retained the full bilingual/SEO/favicon/motion/accessibility PASS matrix with no actionable findings.
- Remaining limitations initially appeared live-only. A direct production fetch of deploy `e6459da` then found `/en/` had the correct English app/base but still carried Spanish title, canonical, OG, JSON-LD description, and noscript.
- Diagnosis reproduced the CI failure locally: invoking `scripts/localize-static-seo.mjs` through a symlink exited 0 without output because its raw `process.argv[1] === fileURLToPath(import.meta.url)` guard evaluated false. Netlify uses symlinked build workspace paths, so the Angular build deployed successfully while silently skipping post-build localization.
- CA-13 replaced raw comparison with canonical `realpathSync` detection and added genuine filesystem-symlink coverage. Independent verification found no severity findings: 36/36 tests, localized build, normal check, actual symlinked check with validator log, whitespace, and exact changed scope all pass.
- Commit `f71f780` published CA-13 and Netlify deploy `6aaeb038f5ba680008266380` reached ready state, but reported all output files unchanged and still processed one redirect. Live `/en/` metadata/noscript remained Spanish; missing routes and removed legacy favicon URLs returned the Spanish root with HTTP 200.
- The surviving rule was `cafe-artesano/src/_redirects` (`/* /index.html 200`). Netlify monorepo documentation says package/base-directory configuration takes precedence over repository-root config, explaining why the root `npm run build` command was bypassed.
- CA-14 added authoritative `cafe-artesano/netlify.toml`, deleted the stale redirect, and aligned root/package tests. Independent verification found no severity findings; 36/36 tests, localized build, artifact validation, redirect absence, and exact scope passed.
- Commit `8e5e5af` deployed successfully as Netlify deploy `6aaeb25620a53100086fd71d`. The deploy summary reports no redirect rules. Live `/en/` has English title, `/en/` canonical, `en_US` Open Graph locale, English Organization description/noscript; `/` remains Spanish. The CA SVG returns 200, both legacy favicon URLs return 404, and an unknown English route returns 404.
- Documentation-only commit `b8414d1` failed its Netlify build, and attempted root-relative correction `f48b147` also failed. A local `netlify build --offline` then provided decisive resolved-config evidence: Netlify selected `cafe-artesano/netlify.toml`, set current directory/base to `cafe-artesano`, and doubled the root-relative command/publish path (`cafe-artesano/cafe-artesano/...`). Therefore the original package-local app-relative values were correct; CA-14 is reopened to restore them and add Netlify CLI resolved-config validation.

## Next step

Close CA-14 with a successful latest Netlify deploy, then implement and publish CA-15 WhatsApp-first contact actions. Verify both live locales, WhatsApp links, 404 behavior, and favicon; then perform the remaining visual/browser, Rich Results, and Facebook Sharing Debugger checks.
