# Café Artesano component architecture

Refactor the verified Angular 22 landing into focused standalone components without changing rendered content, localized URLs, SEO, accessibility, motion behavior, or deployment output.

## Reference audit

The Cítricos Santa Fe repository was inspected read-only from committed `main` using `git show main:<path>`; its active `feat/site-modernization-angular22` worktree was not changed or used as the baseline.

Useful organizational ideas from Cítricos `main`:

- A page owns the landing composition.
- Header and footer are explicit semantic component boundaries.
- Shared types belong outside page components.

Patterns from that older application that must not be copied:

- `NgModule` application structure and routing for a one-page anchor site.
- `CommonModule` when only specific imports are needed.
- Decorator queries such as `@ViewChild`.
- Constructor injection, template-facing enum getters, controller classes, or services for local UI state.
- `ngClass`/`*ngIf` and other legacy template patterns.
- Explicit change-detection configuration: Angular 22 already supplies the current default; follow Angular CLI MCP guidance rather than older examples.

## Scope

- Keep `App` as a small document shell and sole owner of the persisted light/dark theme.
- Extract a standalone site header using `input()`, `output()`, signals, and `computed()`.
- Extract a standalone landing page that owns hero parallax and the static marketing sections.
- Extract a standalone story-video component that owns its signal `viewChild()` and `IntersectionObserver` lifecycle.
- Extract a standalone site footer that owns scroll progress, the fixed scroll-top control, GSAP ScrollTo, RAF/resize listeners, and cleanup.
- Add a functional cached GSAP loader shared by landing and footer; do not add an injectable service for module-local loading state.
- Replace decorator `@ViewChild` with signal queries (`viewChild()` / `viewChild.required()`).
- Remove the empty router provider and route file; locale switching remains physical document navigation.
- Preserve all 70 custom i18n units and English targets.
- Redistribute the existing 26 UI tests into focused shell/header/landing/video/footer specs while retaining the 11 SEO tests.

## Non-goals

- No visual redesign, copy change, new route, state library, UI library, form, API, or CMS.
- No component per static section; origin, process, quality, landscape, and contact stay together in the landing page.
- No migration of global CSS into encapsulated component styles in this refactor.
- No changes to static SEO, Netlify, sitemap, favicon, or absolute URLs.
- No edits, branch changes, commits, resets, cleans, or formatting in Cítricos Santa Fe.

## Angular 22 decisions

| Topic | Decision |
|---|---|
| Components | Standalone-by-default components; do not set `standalone: true`. |
| Change detection | Do not add explicit `ChangeDetectionStrategy`; follow Angular 22 CLI MCP guidance. |
| Queries | Use signal `viewChild()` queries. Angular queries do not cross component boundaries, so each behavior lives with its DOM. |
| Injection | Use `inject()` and `DestroyRef`/render callbacks where appropriate. |
| Communication | Header receives `theme = input.required<Theme>()` and emits `themeToggle = output<void>()`; other extracted components need no cross-boundary state. |
| Router | Remove empty `provideRouter(routes)` and `app.routes.ts`; anchors and locale documents remain native links. |
| Motion | `landing-page` owns hero ScrollTrigger; `site-footer` owns ScrollTo/control animation; shared loader only imports/registers GSAP modules. |
| Video | `story-video` owns mute/autoplay observer and reduced-motion behavior. |
| CSS | Retain `src/styles.css` globally so existing cross-component selectors, tokens, contrast, and responsive rules remain unchanged. |
| i18n | Preserve every custom `@@id`; extraction may update source locations/order only. |
| TDD | Strict TDD remains off by prior user choice; each work unit must still pass focused tests, extraction, bilingual build, and artifact validation. |

## Target tree

```text
src/app/
├── app.config.ts
├── app.html
├── app.ts
├── app.css
├── app.spec.ts
├── seo.spec.ts
├── shared/
│   ├── motion/gsap-loader.ts
│   ├── motion/gsap-loader.spec.ts
│   ├── theme/theme.model.ts
│   ├── site-header/
│   │   ├── site-header.ts
│   │   ├── site-header.html
│   │   └── site-header.spec.ts
│   └── site-footer/
│       ├── site-footer.ts
│       ├── site-footer.html
│       └── site-footer.spec.ts
└── pages/landing/
    ├── landing-page.ts
    ├── landing-page.html
    ├── landing-page.spec.ts
    └── components/story-video/
        ├── story-video.ts
        ├── story-video.html
        └── story-video.spec.ts
```

`app.routes.ts` is deleted. `app.css` remains as the explicit empty component stylesheet because global styling is intentional.

## Ownership and contracts

| Owner | Responsibility | Contract |
|---|---|---|
| `App` | Theme initialization, persistence, system changes, `<html>`/theme-color updates | Pass theme to header; handle header toggle event |
| `SiteHeader` | Brand/nav/locale/WhatsApp controls and theme labels | `input.required<Theme>()`, `output<void>()` |
| `LandingPage` | Hero, landscape, origin, process, quality, contact; hero parallax lifecycle | No public inputs/outputs |
| `StoryVideo` | Video markup, 25% observer, mute/play/pause, reduced-motion cleanup | No public inputs/outputs |
| `SiteFooter` | Footer markup, 10% scroll visibility, RAF/resize, ScrollTo/control GSAP, cleanup | No public inputs/outputs |
| `gsap-loader.ts` | One cached dynamic import and one-time plugin registration | Functional Promise API, no DI |

## Workload forecast and delivery

Estimated diff: 900–1,400 lines, mostly template/test movement. Delivery strategy is reviewable sequential slices. The landing extraction may exceed 400 changed lines because Git represents moved localized markup as delete/add; record this as a move-heavy size exception rather than compressing markup or dropping tests.

| ID | Work unit | Estimate | Acceptance |
|---|---|---:|---|
| ARC-1 | Shell, theme model, header, router removal, focused header/shell tests | 220–340 | Theme/locale/WhatsApp behavior unchanged; no router dependency |
| ARC-2 | GSAP loader and footer ownership of scroll control | 220–360 | Exact 10% threshold, fallback, RAF coalescing, dynamic-import teardown preserved |
| ARC-3 | Landing page and story-video extraction with signal queries | 450–700 move-heavy | Exact markup/i18n IDs, ±5% parallax, 25% video observer, cleanup preserved |
| ARC-4 | Test/catalog reconciliation and integrated verification | Evidence plus corrections | 37+ tests, 70 XLIFF units, bilingual build/artifacts, and Netlify CLI offline build when the existing executable is available |

The user explicitly authorized final GitHub synchronization after verification. The implementation was recorded in work-unit commit `dda6d2b` (`refactor(app): extract landing component architecture`); final task evidence is recorded separately so the implementation commit remains immutable.

## Checklist

- [x] **ARC-1 — Shell and header**
  - [x] Add theme model/constants and modern header component.
  - [x] Reduce `App` header responsibilities to theme/document ownership and replace its decorator video query with `viewChild()`.
  - [x] Remove empty router provider/file.
  - [x] Add focused header and shell tests.

### ARC-1 evidence

- `shared/theme/theme.model.ts` exports the `Theme` union, `THEME_STORAGE_KEY`, and a statically immutable `THEME_COLORS` map; `SiteHeader` receives `theme` with `input.required<Theme>()` and emits `themeToggle` without mutating theme state.
- Header markup, CSS classes, custom i18n IDs, anchor URLs, locale document navigation, and WhatsApp new-tab semantics moved unchanged to `shared/site-header/site-header.html`.
- `app.routes.ts`, router imports, and `provideRouter` are removed; locale switching remains physical document navigation.
- Clean verification: `npm test -- --watch=false` passed 42 tests, `npm run build` passed, `npm run verify:locales` passed, and the scoped `git diff --check` passed.
- [x] **ARC-2 — Footer and scroll motion**
  - [x] Add cached functional GSAP loader.
  - [x] Move scroll progress/control behavior to site footer.
  - [x] Replace selector lookup with footer signal query.
  - [x] Preserve cleanup, fallback, threshold, and coalescing tests.

### ARC-2 evidence

- `shared/motion/gsap-loader.ts` lazily caches the three GSAP module imports and centrally registers `ScrollTrigger` and `ScrollToPlugin` once per successful generation; isolated loader tests prove concurrent promise sharing plus rejected-generation retry.
- `SiteFooter` owns the unchanged footer/control markup, exact `>= 0.10` scroll-progress calculation, passive scroll listener, resize and `ResizeObserver` updates, RAF coalescing, native fallback, and component teardown through a signal `viewChild()` control reference.
- `App` now composes `<app-site-footer />`; it no longer owns footer state, listeners, scroll controls, or ScrollTo behavior. Its desktop hero parallax uses the shared lazy loader and retains the existing ±5%, `scrub: 0.6`, no-reveal context/media lifecycle.
- Focused footer coverage proves threshold/non-scrollable behavior, coalescing/observer cleanup, reduced-motion false-transition re-enable, native fallback after late completion, media listener removal, and active visibility/scroll tween kills before style cleanup; the suite has 45 tests including two independent loader tests.
- [x] **ARC-3 — Landing and video**
  - [x] Move static landing markup without changing hierarchy/classes/IDs/i18n IDs.
  - [x] Move hero parallax to landing page with signal query.
  - [x] Move video behavior to story-video with signal query.
  - [x] Add focused landing/video tests and preserve reduced-motion/deferred-import behavior.

### ARC-3 evidence

- `LandingPage` now owns the sole `main#contenido` landmark and the hero, landscape, origin, process, quality, and contact markup. Its only template imports are `NgOptimizedImage` and `StoryVideo`; the static sections remain together with their original IDs, classes, anchors, image attributes, copy, and custom i18n IDs.
- Landing hero enhancement uses a signal `viewChild()` image reference, the shared functional GSAP loader, a live desktop/no-reduced-motion query, late-import guards, and component-scoped GSAP context/matchMedia cleanup. It retains only the clipped/scaled image parallax from `yPercent: 5` to `-5` with `scrub: 0.6`; no reveal or opacity behavior was added.
- `StoryVideo` owns the exact video section, signal query, 25% `IntersectionObserver`, mute-on-first-visible play, rejected-playback handling, pause below threshold, reduced-motion preference changes, unsupported-observer fallback, destruction guards, and cleanup without inputs or outputs.
- Focused ownership tests redistribute shell/theme/catalog coverage to `app.spec.ts`, landing structure/content/image/CTA/contact and hero-motion coverage to `landing-page.spec.ts`, and observer/video lifecycle coverage to `story-video.spec.ts`. Video coverage includes asynchronous rejected playback, synchronous throws at the exact 25% boundary, and active-observer teardown with the exact reduced-motion listener removal. `npm run extract:i18n` reports 70 units and the focused suite reports 46 tests.
- [x] **ARC-4 — Integration**
  - [x] Re-extract catalogs and prove 70 exact IDs/targets/placeholders.
  - [x] Run full tests, bilingual build, `verify:locales`, negative motion/copy gates, and Netlify CLI offline build when the local executable is available.
  - [x] Independently verify behavior, accessibility, i18n, SEO, and exact changed scope.

### ARC-4 evidence

- `npm uninstall @angular/router @angular/forms --ignore-scripts` removed only the direct `@angular/router` and `@angular/forms` dependencies from `package.json` and their lockfile entries. The final `npm --prefix cafe-artesano ls @angular/router @angular/forms --depth=0` result is empty, and the source/package negative-import gate is clean.
- `npm run extract:i18n` completed with 70 messages. Catalog validation found 70 unique source IDs and 70 unique English IDs with matching sets, 70 nonempty English targets, zero `needs-translation` markers, and zero source/target placeholder-parity mismatches. Source-order changes are expected after template extraction and do not change the ID set.
- `npm test -- --watch=false` passed 7 files and 48 tests. `npm run build` produced Spanish and English output, completed static SEO localization, and reported a 198.48 kB initial raw bundle (57.36 kB estimated transfer). `npm run verify:locales` passed, and physical `dist/cafe-artesano/browser/index.html` and `en/index.html` both exist.
- All architecture negative gates passed: no route file, router/forms imports or providers, legacy Angular patterns, static/eager GSAP imports, hero-reveal hooks, telephone links, or retired Comprar/Buy copy. Each localized production bundle contains exactly three WhatsApp URLs and two `cta-primary` actions; the localized static HTML documents each retain their one intentional no-script WhatsApp link.
- The existing local `netlify` executable was unavailable, so `netlify build --offline` was not run and no CLI was fetched or installed. `git diff --check` passed.
- Final independent verification reported no findings after the test suites restored exact regression contracts and symmetric browser/document-global teardown. Work-unit commit `dda6d2b` contains the complete implementation; this task record is the delivery-evidence follow-up.

## Risks

- Signal queries never cross component boundaries; moving behavior without its element would silently break references.
- Deferred GSAP imports must still abort after component destruction and must not register/create contexts late.
- Existing global CSS selectors rely on unchanged classes and DOM hierarchy.
- XLIFF extraction rewrites source locations/order; custom IDs and English targets must remain exact.
- Test movement must not reduce behavioral coverage merely to obtain smaller files.
