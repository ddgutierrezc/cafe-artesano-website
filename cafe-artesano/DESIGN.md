# Café Artesano design system

Use this foundation to present Café Artesano as a calm, local, natural-roast coffee brand. It is the source of truth for the landing page; preserve the supplied raster assets rather than recreating the mark.

## Brand direction

- **Character:** artisanal, natural, warm, and quietly confident—not rustic clutter or luxury excess.
- **Message:** foreground coffee origin, natural roasting, and Palmichal de Acosta with clear Spanish HTML copy.
- **Visual rhythm:** pair generous pale space with grounded coffee-brown type and restrained forest-green accents.
- **Evidence:** the text-free `public/favicon.svg` provides the compact floral mark for the 52px header and browser chrome; the supplied path-based `public/LOGOTIPO CA.svg` provides the full brown, green, and off-white vertical lockup for large-format presentation. `banner_principal.jpg` adds plantation greens, mountains, coffee fruit, and warm product photography; `banner_secundario.jpg` reinforces pale neutrals, steam, and fine green framing.

## Tokens

Values remain visual estimates from the supplied JPEGs, not sampled values. Automated RGB extraction was unavailable locally. The values below were then adjusted and measured for the selected contrast scope.

| Token | Value | Purpose |
| --- | --- | --- |
| `--ca-canvas` | `#F7F8F3` | Default off-white page surface |
| `--ca-surface` | `#FFFFFF` | Raised content surfaces |
| `--ca-surface-muted` | `#EDF1E7` | Pale green section surface |
| `--ca-surface-hero` | `#EEF0E5` | Hero gradient endpoint |
| `--ca-surface-action-hover` | `#EAF0E5` | Secondary-action hover surface |
| `--ca-header-surface` | `#F7F8F3` | Opaque sticky-header surface |
| `--ca-brand-surface` | `#F9F8F6` | Fixed off-white surface behind supplied fixed-colour brand art in either theme |
| `--ca-ink` | `#3D2C22` | Primary coffee-brown text and dark surface |
| `--ca-ink-muted` | `#5B493D` | Secondary reading text |
| `--ca-forest` | `#365C3A` | Primary brand action |
| `--ca-forest-deep` | `#315534` | Link, hover, and dark green surface |
| `--ca-leaf` | `#C8D3B6` | Text-selection background |
| `--ca-warm` | `#9A6338` | Warm quote marker; never body text |
| `--ca-line` | `#786F63` | Dividers and visible boundaries |
| `--ca-focus` | `#1F5F42` | Visible keyboard focus ring |
| `--ca-cta-default` / `--ca-cta-hover` / `--ca-cta-active` | `#315534` / `#29482D` / `#203D27` | Explicit primary CTA surfaces |
| `--ca-on-action` / `--ca-on-dark` | `#FFFFFF` | Text on actions and dark surfaces |
| `--ca-on-dark-accent` | `#E6F0DB` | Eyebrows on dark surfaces |
| `--ca-on-dark-body` | `#EBE8E2` | Video-section body text |
| `--ca-on-dark-muted` | `#F3F1EC` | Contact-section body text |
| `--ca-on-dark-caption` | `#D7D0C9` | Video caption text |
| `--ca-video-surface` / `--ca-video-line` | `#17110D` / `#A99B90` | Video background and visible boundary |
| `--ca-skip-link-surface` / `--ca-skip-link-foreground` / `--ca-skip-link-border` / `--ca-skip-link-focus` | `#315534` / `#FFFFFF` / `#315534` / `#1F5F42` | Skip-link surface, label, boundary, and focus ring |

Use semantic tokens rather than repeating colour literals. Green and warm accents communicate state or hierarchy, never state alone.

### Dark-theme overrides

The `:root` values above are the light theme. `html[data-theme='dark']` overrides every colour token below; the three context-surface tokens prevent a light foreground token from being reused accidentally on video, contact, or footer surfaces.

| Token | Dark value | Role |
| --- | --- | --- |
| `--ca-canvas` / `--ca-surface` / `--ca-surface-muted` | `#17110D` / `#241A15` / `#2E241C` | Page, raised, and muted surfaces |
| `--ca-surface-hero` / `--ca-surface-action-hover` / `--ca-header-surface` | `#211812` / `#33261D` / `#17110D` | Hero, secondary-action hover, and header surfaces |
| `--ca-brand-surface` | `#F9F8F6` | Stable surface for the supplied fixed-colour vertical logo |
| `--ca-ink` / `--ca-ink-muted` | `#FFFFFF` / `#F3F1EC` | Primary and secondary reading text |
| `--ca-forest` / `--ca-forest-deep` / `--ca-leaf` | `#D7F0D0` / `#D7F0D0` / `#365C3A` | Action text, links, and selection |
| `--ca-warm` / `--ca-line` / `--ca-focus` | `#E5C08E` / `#A99B90` / `#E6F0DB` | Quote marker, boundaries, and focus |
| `--ca-cta-default` / `--ca-cta-hover` / `--ca-cta-active` | `#315534` / `#29482D` / `#203D27` | Primary CTA states |
| `--ca-cta-border` | `#D7F0D0` | CTA boundary against the dark canvas |
| `--ca-on-action` / `--ca-on-dark` / `--ca-on-dark-accent` | `#FFFFFF` / `#FFFFFF` / `#E6F0DB` | CTA and dark-context heading text |
| `--ca-on-dark-body` / `--ca-on-dark-muted` / `--ca-on-dark-caption` | `#EBE8E2` / `#F3F1EC` / `#D7D0C9` | Dark-context supporting text |
| `--ca-video-surface` / `--ca-video-line` | `#080605` / `#A99B90` | Native-video fill and boundary |
| `--ca-dark-surface` / `--ca-contact-surface` / `--ca-footer-surface` | `#17110D` / `#315534` / `#17110D` | Video section, contact card, and footer |
| `--ca-skip-link-surface` / `--ca-skip-link-foreground` / `--ca-skip-link-border` / `--ca-skip-link-focus` | `#315534` / `#FFFFFF` / `#D7F0D0` / `#E6F0DB` | Skip-link surface, label, boundary, and focus ring |
| `--ca-shadow-card` | `0 12px 32px rgb(0 0 0 / 35%)` | Dark raised-surface depth |

## WCAG 2.2 contrast audit

This is a **contrast-only AAA target**, not a claim of full WCAG 2.2 AAA conformance. Ratios use the WCAG relative-luminance formula: convert each sRGB channel to linear light (`c / 12.92` when `c ≤ 0.04045`; otherwise `((c + 0.055) / 1.055)^2.4`), calculate `L = 0.2126R + 0.7152G + 0.0722B`, then divide `(Llighter + 0.05) / (Ldarker + 0.05)`. Values are rounded to two decimal places.

Normal text and text links target **7:1**; the implementation does not rely on the reduced 4.5:1 large-text allowance. Boundaries and focus indicators target **3:1** non-text contrast.

| Foreground | Background | Use | Ratio | Threshold |
| --- | --- | --- | ---: | --- |
| `--ca-ink` | canvas | Default headings and body | 12.44:1 | 7:1 text |
| `--ca-ink` | surface | Card headings and body | 13.28:1 | 7:1 text |
| `--ca-ink` | hero surface | Hero heading | 11.53:1 | 7:1 text |
| `--ca-ink` | muted surface | Section heading | 11.59:1 | 7:1 text |
| `--ca-ink-muted` | canvas | Secondary body text | 7.98:1 | 7:1 text |
| `--ca-ink-muted` | surface | Card secondary text | 8.52:1 | 7:1 text |
| `--ca-ink-muted` | hero surface | Hero lead text | 7.40:1 | 7:1 text |
| `--ca-ink-muted` | muted surface | Section body text | 7.44:1 | 7:1 text |
| `--ca-forest-deep` | canvas | Navigation and text link | 7.94:1 | 7:1 text |
| `--ca-forest-deep` | surface | Text link | 8.47:1 | 7:1 text |
| `--ca-forest-deep` | hero surface | Secondary action text | 7.35:1 | 7:1 text |
| `--ca-forest-deep` | action-hover surface | Secondary action hover text | 7.30:1 | 7:1 text |
| `--ca-on-action` | `--ca-cta-default` | Primary CTA default and focus text | 8.47:1 | 7:1 text |
| `--ca-on-action` | `--ca-cta-hover` | Primary CTA hover text | 10.20:1 | 7:1 text |
| `--ca-on-action` | `--ca-cta-active` | Primary CTA active text | 11.94:1 | 7:1 text |
| `--ca-on-dark` | `--ca-ink` | Dark-section heading, footer text, and link | 13.28:1 | 7:1 text |
| `--ca-on-dark` | `--ca-forest-deep` | Contact heading, phone, and link | 8.47:1 | 7:1 text |
| `--ca-on-dark-accent` | `--ca-ink` | Video eyebrow | 11.29:1 | 7:1 text |
| `--ca-on-dark-accent` | `--ca-forest-deep` | Contact eyebrow | 7.20:1 | 7:1 text |
| `--ca-on-dark-body` | `--ca-ink` | Video body text | 10.86:1 | 7:1 text |
| `--ca-on-dark-muted` | `--ca-forest-deep` | Contact body text | 7.50:1 | 7:1 text |
| `--ca-on-dark-caption` | `--ca-ink` | Video caption | 8.70:1 | 7:1 text |
| `--ca-ink` | `--ca-leaf` | Selected text | 8.50:1 | 7:1 text |
| `--ca-focus` | canvas / header | Default focus ring | 7.09:1 | 3:1 non-text |
| `--ca-focus` | surface | Card focus ring | 7.57:1 | 3:1 non-text |
| `--ca-focus` | hero surface | Hero-action focus ring | 6.57:1 | 3:1 non-text |
| `--ca-focus` | muted surface | Section focus ring | 6.61:1 | 3:1 non-text |
| `--ca-line` | header surface | Sticky-header boundary | 4.63:1 | 3:1 non-text |
| `--ca-line` | hero surface | Sticky-header/hero boundary | 4.29:1 | 3:1 non-text |
| `--ca-line` | surface | Card boundary | 4.94:1 | 3:1 non-text |
| `--ca-line` | muted surface | Process-list boundary | 4.31:1 | 3:1 non-text |
| `--ca-video-line` | `--ca-ink` | Video control boundary | 4.92:1 | 3:1 non-text |
| `--ca-video-line` | `--ca-video-surface` | Video internal boundary | 6.93:1 | 3:1 non-text |
| `--ca-warm` | canvas | Quote marker | 4.67:1 | 3:1 non-text |
| `--ca-skip-link-foreground` | `--ca-skip-link-surface` | Skip-link label | 8.47:1 | 7:1 text |
| `--ca-skip-link-surface` / `--ca-skip-link-border` | canvas | Skip-link visible control boundary | 7.94:1 | 3:1 non-text |
| `--ca-skip-link-focus` | canvas | Skip-link focus ring | 7.09:1 | 3:1 non-text |

The sticky header is opaque `--ca-header-surface`, so the documented header boundary remains independent of content behind it. The primary CTA uses the explicit `.cta-primary` class for its default, hover, focus, and active foreground/background states. White focus rings are used only in the dark video, contact, and footer contexts, where the corresponding `--ca-on-dark` rows exceed 3:1.

### Dark-theme contrast audit

The light-theme rows above remain the exact light ratios. The dark set was independently calculated with the same formula. Normal text, links, and button labels are at least **7:1**; large text has the WCAG threshold of **4.5:1** but still uses the 7:1 policy; controls, borders, icons, and focus indicators are at least **3:1**.

| Foreground | Background | Use | Ratio | Threshold |
| --- | --- | --- | ---: | --- |
| `#FFFFFF` | canvas `#17110D` | Default text, header navigation, footer | 18.71:1 | 7:1 text |
| `#FFFFFF` | surface `#241A15` | Card headings and body | 17.02:1 | 7:1 text |
| `#FFFFFF` | muted `#2E241C` | Muted-section headings | 15.16:1 | 7:1 text |
| `#FFFFFF` | hero `#211812` | Hero heading | 17.44:1 | 7:1 text |
| `#F3F1EC` | canvas / surface / muted / hero / action-hover | Secondary text | 16.58:1 / 15.08:1 / 13.43:1 / 15.45:1 / 12.96:1 | 7:1 text |
| `#D7F0D0` | header / surface / muted / hero / action-hover | Links, secondary-action text, eyebrows | 15.38:1 / 14.00:1 / 12.46:1 / 14.34:1 / 12.03:1 | 7:1 text |
| `#FFFFFF` | CTA default / hover / active | Primary CTA label | 8.47:1 / 10.20:1 / 11.94:1 | 7:1 text |
| `#FFFFFF` | contact `#315534` | Contact heading, phone, location | 8.47:1 | 7:1 text |
| `#E6F0DB` | contact `#315534` | Contact eyebrow | 7.20:1 | 7:1 text |
| `#F3F1EC` | contact `#315534` | Contact supporting text | 7.50:1 | 7:1 text |
| `#EBE8E2` / `#D7D0C9` | dark surface `#17110D` | Video body / caption | 15.30:1 / 12.26:1 | 7:1 text |
| `#FFFFFF` | selection `#365C3A` | Selected text | 7.63:1 | 7:1 text |
| `#E6F0DB` | canvas / surface / muted / hero | Keyboard focus ring | 15.91:1 / 14.47:1 / 12.89:1 / 14.83:1 | 3:1 non-text |
| `#A99B90` | canvas / surface / muted / hero / video | Borders and video boundary | 6.93:1 / 6.31:1 / 5.61:1 / 6.46:1 / 7.49:1 | 3:1 non-text |
| `#D7F0D0` | canvas and CTA default | CTA boundary | 15.38:1 / 6.96:1 | 3:1 non-text |
| `#E5C08E` | canvas | Quote marker | 10.93:1 | 3:1 non-text |
| `#FFFFFF` | skip-link surface `#315534` | Skip-link label | 8.47:1 | 7:1 text |
| `#D7F0D0` | dark canvas `#17110D` / skip-link surface | Skip-link boundary | 15.38:1 / 6.96:1 | 3:1 non-text |
| `#E6F0DB` | dark canvas `#17110D` | Skip-link focus ring | 15.91:1 | 3:1 non-text |

### Theme behavior

1. A minimal script in `index.html` runs before Angular bootstraps. It reads the valid `cafe-artesano-theme` local-storage value first; without one, it reads `prefers-color-scheme`, applies `data-theme`, `color-scheme`, and the matching `theme-color` (`#F7F8F3` light; `#17110D` dark). This avoids a wrong-theme flash where browser storage and media queries are available.
2. The header uses a native, compact sun/moon button with a 44 × 44px minimum target, visible global focus outline, Spanish action-and-state label, and `aria-pressed`. It writes the selected light or dark mode to local storage and updates the root attribute and browser chrome colour immediately.
3. When no valid stored override exists, Angular listens for safe `prefers-color-scheme` changes and follows them. Once the visitor toggles the button, an in-memory session override takes precedence even if local storage is blocked; a persisted override continues to win after a later visit. Browser-only media-query and storage access is guarded so server rendering does not access `window` or local storage.

## Type, space, and depth

| Area | Rule |
| --- | --- |
| Display | `Georgia, 'Times New Roman', serif`; use for headings and short pull quotes. |
| Body | system sans stack; 16px minimum, 1.5–1.7 line height. |
| Hierarchy | Use one `h1`; keep display headings compact with a readable line length. |
| Spacing | 4px base: 8, 12, 16, 24, 32, 48, 64, 96px. Favor 48–96px section rhythm. |
| Radius | 8px for controls, 16px for cards, 999px only for pills. |
| Shadow | One soft, low-contrast card shadow; no stacked or colored shadows. |

## Layout and responsive behavior

Use a centered content container (`max-width: 72rem`) with 20px mobile gutters and 32px gutters from tablet upward. Start with a single-column reading order. At about 48rem, allow balanced two-column story or contact layouts; at about 64rem, increase section breathing room rather than adding dense columns. Keep the header usable without hover, avoid horizontal scrolling, and retain the same semantic order at every width.

## Imagery and motion

Use the text-free, derived floral `favicon.svg` as the compact 52px header mark and browser favicon; it contains no tiny lettering and remains recognizable at 16–48px. Use the supplied path-based `LOGOTIPO CA.svg` only as the prominent full lockup on `--ca-brand-surface`, whose fixed off-white value keeps the fixed-colour art readable in both themes. `favicon.ico` remains a fallback. Keep embedded lettering in `banner_principal.jpg` and `banner_secundario.jpg` uncropped and do not repeat their claims as image-only content. Prefer natural, uncrowded crops; preserve the portrait video’s orientation and provide controls and a text introduction nearby. Images need concise Spanish alt text that describes content, not decorative styling; empty alt text is appropriate only when an adjacent label conveys the same information.

GSAP progressively enhances already-visible content only after Angular renders in a browser. A combined `(min-width: 48rem) and (prefers-reduced-motion: no-preference)` media query gates all dynamic GSAP imports, so mobile and reduced-motion users do not download those chunks. `ScrollTrigger` and `ScrollToPlugin` register once, and component-owned `gsap.context()` plus `gsap.matchMedia()` limit transform/opacity reveals and the hero's `-3%` transform-only parallax to that eligible context. Contexts and media queries revert on destruction; late dynamic imports are ignored after destruction. There is no CSS pre-hide, pinning, snapping, layout-property animation, or smooth-scroll CSS. The footer's native 44px arrow control has the Spanish name `Volver al inicio`; it uses GSAP ScrollToPlugin with `autoKill` when available and immediate native scrolling otherwise. The video starts muted only when at least 25% visible, pauses below that threshold, retains native controls for audio opt-in, safely absorbs rejected playback, disconnects its observer on destruction, and does not auto-play under reduced motion.

### Local hero media provenance

| Topic | Record |
| --- | --- |
| Source | Official Unsplash page: `https://unsplash.com/photos/red-round-fruits-in-tilt-shift-lens-FpsB7Jo8nHk` and official CDN asset `photo-1612668196612-70262cad2ad7` |
| Creator | Juliana Barquero, confirmed by the official download filename |
| Retrieved | 2026-09-19 |
| License | [Unsplash License](https://unsplash.com/license) |
| Original inspected media | 2000 × 1335 pixels |
| Local WebP variants | `hero_cafe_cerezas_fpsb7jo8nhk-768.webp` (768 × 512, 39,594 bytes); `hero_cafe_cerezas_fpsb7jo8nhk-1280.webp` (1280 × 853, 97,626 bytes); `hero_cafe_cerezas_fpsb7jo8nhk.webp` (1600 × 1067, 174,338 bytes) |
| Use | Responsive semantic hero media of ripe coffee cherries, with intrinsic 2000 × 1335 dimensions, Spanish alternative text, responsive `picture`/`srcset`, and Angular `NgOptimizedImage` priority because it is the intended LCP candidate |

All hero variants are served locally; the page does not hotlink Unsplash at runtime.

### Social sharing and search discovery

The temporary canonical origin is `https://cafeartesanocr.netlify.app/`. It is used consistently by the canonical link, Open Graph image and URL, X/Twitter card image, Organization JSON-LD, `robots.txt`, and `sitemap.xml`. When a custom domain is adopted, migrate every absolute SEO URL together rather than mixing origins.

| Topic | Record |
| --- | --- |
| Social preview file | `public/cafe-artesano-social.jpg` |
| Format and dimensions | JPEG, 1200 × 630 pixels |
| Provenance | Local derivative of the official Unsplash CDN crop: `https://images.unsplash.com/photo-1612668196612-70262cad2ad7?ixlib=rb-4.1.0&fm=jpg&fit=crop&crop=entropy&w=1200&h=630&q=85` |
| Published URL | `https://cafeartesanocr.netlify.app/cafe-artesano-social.jpg` |
| Alternative text | `Cerezas maduras de café en la planta` describes the coffee-cherry image without claiming it contains a logo. |
| Delivery rule | Serve this local public asset in metadata; do not hotlink the Unsplash image at runtime. |
| Discovery files | `public/robots.txt` allows crawling and points to the absolute sitemap; `public/sitemap.xml` lists only the canonical root URL. |
| Structured identity | One `Organization` JSON-LD record identifies Café Artesano as a Costa Rican coffee brand with its canonical ID, local logo URL, telephone, Costa Rica service area, and official Facebook profile only. |

## Accessibility and component patterns

- Apply the documented WCAG 2.2 AAA **contrast** targets; this does not certify full AAA conformance across all success criteria. Use semantic landmarks and keep focus visible with `--ca-focus`.
- `index.html` includes a small semantic `noscript` fallback with the business name, Palmichal de Acosta location, corrected telephone link, and a JavaScript notice. It is not SSR and intentionally does not duplicate the landing page; global semantic rules retain documented readable foreground/background pairs in light and dark system schemes.
- Targets should be at least 44 × 44px; every control must work with keyboard and touch.
- **Button:** `.cta-primary` supplies explicit dark-green fill, `--ca-on-action` text, boundary, hover, focus, and active states for critical phone CTAs; outlined forest control is reserved for secondary actions.
- **Card:** white surface, `--ca-line` border, 16px radius, soft shadow, and 24px padding; do not make a whole card clickable unless its purpose is singular.
- **Eyebrow:** small uppercase sans label with generous tracking in forest; never use it as the only heading.
- **Forms:** persistent Spanish labels, helpful error text, and no placeholder-only instructions.

## Implementation checklist

1. Use the semantic tokens in `src/styles.css` and Tailwind utilities before adding one-off colors.
2. Keep critical business claims as HTML text and verify keyboard focus, zoom, and reduced motion.
3. Re-check contrast and image crops in the rendered mobile and desktop page before extending this system.
