# Café Artesano design system

Use this foundation to present Café Artesano as a calm, local, natural-roast coffee brand. It is the source of truth for the landing page; preserve the supplied raster assets rather than recreating the mark.

## Brand direction

- **Character:** artisanal, natural, warm, and quietly confident—not rustic clutter or luxury excess.
- **Message:** foreground coffee origin, natural roasting, and Palmichal de Acosta with clear Spanish HTML copy.
- **Visual rhythm:** pair generous pale space with grounded coffee-brown type and restrained forest-green accents.
- **Evidence:** `public/logo.jpg` establishes the CA monogram, brown wordmark, green botanical illustration, and off-white field. `banner_principal.jpg` adds plantation greens, mountains, coffee fruit, and warm product photography; `banner_secundario.jpg` reinforces pale neutrals, steam, and fine green framing.

## Tokens

Values remain visual estimates from the supplied JPEGs, not sampled values. Automated RGB extraction was unavailable locally. The values below were then adjusted and measured for the selected contrast scope.

| Token | Value | Purpose |
| --- | --- | --- |
| `--ca-canvas` | `#F7F8F3` | Default off-white page surface |
| `--ca-surface` | `#FFFFFF` | Raised content surfaces |
| `--ca-surface-muted` | `#EDF1E7` | Pale green section surface |
| `--ca-surface-hero` | `#EEF0E5` | Hero gradient endpoint |
| `--ca-surface-action-hover` | `#EAF0E5` | Secondary-action hover surface |
| `--ca-ink` | `#3D2C22` | Primary coffee-brown text and dark surface |
| `--ca-ink-muted` | `#5B493D` | Secondary reading text |
| `--ca-forest` | `#365C3A` | Primary brand action |
| `--ca-forest-deep` | `#315534` | Link, hover, and dark green surface |
| `--ca-leaf` | `#C8D3B6` | Text-selection background |
| `--ca-warm` | `#9A6338` | Warm quote marker; never body text |
| `--ca-line` | `#91897D` | Dividers and visible boundaries |
| `--ca-focus` | `#1F5F42` | Visible keyboard focus ring |
| `--ca-on-action` / `--ca-on-dark` | `#FFFFFF` | Text on actions and dark surfaces |
| `--ca-on-dark-accent` | `#E6F0DB` | Eyebrows on dark surfaces |
| `--ca-on-dark-body` | `#EBE8E2` | Video-section body text |
| `--ca-on-dark-muted` | `#F3F1EC` | Contact-section body text |
| `--ca-on-dark-caption` | `#D7D0C9` | Video caption text |
| `--ca-video-surface` / `--ca-video-line` | `#17110D` / `#A99B90` | Video background and visible boundary |

Use semantic tokens rather than repeating colour literals. Green and warm accents communicate state or hierarchy, never state alone.

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
| `--ca-on-action` | `--ca-forest` | Primary action text | 7.64:1 | 7:1 text |
| `--ca-on-action` | `--ca-forest-deep` | Primary-action hover text | 8.47:1 | 7:1 text |
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
| `--ca-line` | canvas | Header and divider boundary | 3.24:1 | 3:1 non-text |
| `--ca-line` | surface | Card boundary | 3.45:1 | 3:1 non-text |
| `--ca-line` | muted surface | Process-list boundary | 3.02:1 | 3:1 non-text |
| `--ca-video-line` | `--ca-ink` | Video control boundary | 4.92:1 | 3:1 non-text |
| `--ca-video-line` | `--ca-video-surface` | Video internal boundary | 6.93:1 | 3:1 non-text |
| `--ca-warm` | surface | Quote marker | 4.98:1 | 3:1 non-text |

The header's translucent surface sits over `--ca-canvas`, so its text and focus measurements use the canvas pair. White focus rings are used only in the dark video, contact, and footer contexts, where the corresponding `--ca-on-dark` rows exceed 3:1.

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

Treat `logo.jpg` as the only logo source. Keep embedded lettering in `banner_principal.jpg` and `banner_secundario.jpg` uncropped and do not repeat their claims as image-only content. Prefer natural, uncrowded crops; preserve the portrait video’s orientation and provide controls and a text introduction nearby. Images need concise Spanish alt text that describes content, not decorative styling; empty alt text is appropriate only when an adjacent label conveys the same information.

Motion is optional: use a 160–240ms opacity or transform transition for hover and entrance polish. Do not autoplay essential information, animate large backgrounds continuously, or rely on motion to reveal content. Disable nonessential animation and smooth scrolling for `prefers-reduced-motion: reduce`.

## Accessibility and component patterns

- Apply the documented WCAG 2.2 AAA **contrast** targets; this does not certify full AAA conformance across all success criteria. Use semantic landmarks and keep focus visible with `--ca-focus`.
- Targets should be at least 44 × 44px; every control must work with keyboard and touch.
- **Button:** forest fill with `--ca-on-action` text for primary actions; outlined forest control for secondary actions; provide hover, focus, disabled, and active states.
- **Card:** white surface, `--ca-line` border, 16px radius, soft shadow, and 24px padding; do not make a whole card clickable unless its purpose is singular.
- **Eyebrow:** small uppercase sans label with generous tracking in forest; never use it as the only heading.
- **Forms:** persistent Spanish labels, helpful error text, and no placeholder-only instructions.

## Implementation checklist

1. Use the semantic tokens in `src/styles.css` and Tailwind utilities before adding one-off colors.
2. Keep critical business claims as HTML text and verify keyboard focus, zoom, and reduced motion.
3. Re-check contrast and image crops in the rendered mobile and desktop page before extending this system.
