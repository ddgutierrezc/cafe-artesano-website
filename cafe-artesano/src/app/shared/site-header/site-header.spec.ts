import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { SiteHeader } from './site-header';

describe('SiteHeader', () => {
  async function createFixture(theme: 'light' | 'dark' = 'light') {
    await TestBed.configureTestingModule({
      imports: [SiteHeader],
    }).compileComponents();
    const fixture = TestBed.createComponent(SiteHeader);
    fixture.componentRef.setInput('theme', theme);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  it('renders the localized brand and structural navigation links', async () => {
    const fixture = await createFixture();
    const header = fixture.nativeElement as HTMLElement;
    const links = Array.from(header.querySelectorAll<HTMLAnchorElement>('nav.site-nav a'));
    const brand = header.querySelector<HTMLAnchorElement>('a.brand-link');
    const brandMark = header.querySelector<HTMLImageElement>('img[src="/cafe-artesano-ca-v1.svg"]');

    expect(brand?.getAttribute('href')).toBe('#inicio');
    expect(brand?.getAttribute('aria-label')).toBe('Café Artesano, ir al inicio');
    expect(brandMark).toMatchObject({
      width: 64,
      height: 64,
      alt: 'Monograma floral de Café Artesano',
    });
    expect(links.map((link) => [link.getAttribute('href'), link.textContent?.trim()])).toEqual([
      ['#origen', 'Origen'],
      ['#proceso', 'Proceso'],
      ['#calidad', 'Calidad'],
      ['#contacto', 'Contacto'],
    ]);
  });

  it('keeps the locale link as physical localized document navigation', async () => {
    const fixture = await createFixture();
    const localeLink = (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>('a[href="/en/"]');

    expect(localeLink?.textContent?.trim()).toBe('English');
    expect(localeLink?.hreflang).toBe('en');
    expect(localeLink?.lang).toBe('en');
    expect(localeLink?.getAttribute('aria-label')).toBe('Cambiar el idioma a inglés');
    expect(localeLink?.title).toBe('Ver esta página en inglés');
  });

  it('keeps the header WhatsApp CTA URL and accessible new-tab semantics exact', async () => {
    const fixture = await createFixture();
    const cta = (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>('a.cta-primary');

    expect(cta?.href).toBe('https://wa.me/50671606734');
    expect(cta?.target).toBe('_blank');
    expect(cta?.rel).toBe('noopener');
    expect(cta?.getAttribute('aria-label')).toBe('Escríbenos por WhatsApp (se abre en una pestaña nueva)');
    expect(cta?.title).toBe('Escríbenos por WhatsApp (se abre en una pestaña nueva)');
  });

  it('derives the theme action, pressed state, icon, and live status from its input', async () => {
    const fixture = await createFixture('light');
    const header = fixture.nativeElement as HTMLElement;
    const toggle = header.querySelector<HTMLButtonElement>('button.theme-toggle');

    expect(toggle?.getAttribute('aria-pressed')).toBe('false');
    expect(toggle?.getAttribute('aria-label')).toContain('Activar tema oscuro');
    expect(toggle?.textContent?.trim()).toBe('☾');
    expect(header.querySelector('[aria-live="polite"]')?.textContent).toContain('Tema claro activo');

    fixture.componentRef.setInput('theme', 'dark');
    fixture.detectChanges();

    expect(toggle?.getAttribute('aria-pressed')).toBe('true');
    expect(toggle?.getAttribute('aria-label')).toContain('Activar tema claro');
    expect(toggle?.textContent?.trim()).toBe('☀');
    expect(header.querySelector('[aria-live="polite"]')?.textContent).toContain('Tema oscuro activo');
  });

  it('emits only the theme toggle event when its button is clicked', async () => {
    const fixture = await createFixture();
    const emit = vi.fn();
    fixture.componentInstance.themeToggle.subscribe(emit);

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button.theme-toggle')?.click();

    expect(emit).toHaveBeenCalledOnce();
    expect(emit).toHaveBeenCalledWith(undefined);
  });
});
