import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

const gsapMocks = vi.hoisted(() => {
  const context = { revert: vi.fn() };
  const media = { add: vi.fn((_query: string, setup: () => void) => setup()), revert: vi.fn() };
  const gsap = {
    context: vi.fn((setup: () => void) => { setup(); return context; }),
    fromTo: vi.fn(),
    matchMedia: vi.fn(() => media),
    registerPlugin: vi.fn(),
  };
  let deferred = false;
  let started = Promise.resolve();
  let resolveStarted: (() => void) | undefined;
  let pending: Array<() => void> = [];
  const waitForImport = () => !deferred ? Promise.resolve() : new Promise<void>((resolve) => {
    pending.push(resolve);
    if (pending.length === 3) resolveStarted?.();
  });

  return {
    ScrollToPlugin: {}, ScrollTrigger: {}, context, media, gsap,
    defer: () => {
      deferred = true;
      pending = [];
      started = new Promise((resolve) => { resolveStarted = resolve; });
    },
    started: () => started,
    release: () => pending.splice(0).forEach((resolve) => resolve()),
    waitForImport,
  };
});

vi.mock('gsap', async () => {
  await gsapMocks.waitForImport();
  return { gsap: gsapMocks.gsap };
});
vi.mock('gsap/ScrollToPlugin', async () => {
  await gsapMocks.waitForImport();
  return { ScrollToPlugin: gsapMocks.ScrollToPlugin };
});
vi.mock('gsap/ScrollTrigger', async () => {
  await gsapMocks.waitForImport();
  return { ScrollTrigger: gsapMocks.ScrollTrigger };
});

import { LandingPage } from './landing-page';

const DESKTOP_MOTION_QUERY = '(min-width: 48rem) and (prefers-reduced-motion: no-preference)';

describe('LandingPage', () => {
  let motionListener: ((event: MediaQueryListEvent) => void) | undefined;
  let desktopMotionMatches = false;
  let matchMediaDescriptor: PropertyDescriptor | undefined;

  beforeEach(async () => {
    vi.clearAllMocks();
    matchMediaDescriptor = Object.getOwnPropertyDescriptor(window, 'matchMedia');
    desktopMotionMatches = false;
    motionListener = undefined;
    const desktopQuery = {
      get matches() { return desktopMotionMatches; },
      addEventListener: vi.fn((event: string, listener: (change: MediaQueryListEvent) => void) => {
        if (event === 'change') motionListener = listener;
      }),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn((query: string) => query === DESKTOP_MOTION_QUERY ? desktopQuery : ({
        matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(),
      } as unknown as MediaQueryList)),
    });
    await TestBed.configureTestingModule({ imports: [LandingPage] }).compileComponents();
  });

  afterEach(() => {
    if (matchMediaDescriptor) {
      Object.defineProperty(window, 'matchMedia', matchMediaDescriptor);
    } else {
      delete (window as Partial<Window>).matchMedia;
    }
  });

  function createFixture() {
    const fixture = TestBed.createComponent(LandingPage);
    fixture.detectChanges();
    return fixture;
  }

  async function settle(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve));
    await Promise.resolve();
  }

  it('keeps the complete semantic landing structure, anchors, and one primary heading', () => {
    const page = createFixture().nativeElement as HTMLElement;

    expect(page.querySelector('main#contenido')).toBeTruthy();
    expect(page.querySelectorAll('h1')).toHaveLength(1);
    expect(page.querySelector('h1')?.textContent).toContain('Café Artesano');
    ['inicio', 'origen', 'proceso', 'calidad', 'contacto'].forEach((id) => expect(page.querySelector(`#${id}`)).toBeTruthy());
    expect(page.querySelector('app-story-video section.section-video')).toBeTruthy();
    expect(page.querySelector('a[href="#origen"]')).toBeTruthy();
    expect(page.querySelector('a[href="#contacto"]')).toBeTruthy();
  });

  it('preserves the approved origin, process, quality, and contact copy', () => {
    const page = createFixture().nativeElement as HTMLElement;

    expect(page.querySelector('#origen h2')?.textContent).toContain('El origen es parte del sabor.');
    expect(page.querySelector('#proceso h2')?.textContent).toContain('Tostado natural, carácter propio.');
    expect(page.querySelector('#calidad h2')?.textContent).toContain('Calidad que se nota desde el primer aroma.');
    expect(page.querySelector('#contacto h2')?.textContent).toContain('Conversemos desde Palmichal de Acosta.');
    expect(page.querySelector('.quote')?.textContent).toContain('Café local, natural y hecho con orgullo.');
  });

  it('preserves local optimized images, source sets, clipping classes, and localized alt text', () => {
    const page = createFixture().nativeElement as HTMLElement;
    const optimized = Array.from(page.querySelectorAll<HTMLImageElement>('img[ngsrc]'));
    const hero = page.getElementsByClassName('hero-parallax-image').item(0) as HTMLImageElement | null;

    expect(optimized.map((image) => image.getAttribute('ngsrc'))).toEqual([
      'hero_cafe_cerezas_fpsb7jo8nhk-768.webp', 'banner_principal.jpg', 'banner_secundario.jpg',
    ]);
    expect(optimized.every((image) => (image.alt?.length ?? 0) > 10)).toBe(true);
    expect(hero?.parentElement?.tagName).toBe('PICTURE');
    expect(hero?.className).toContain('scale-[1.1]');
    expect(hero?.getAttribute('srcset')).toContain('hero_cafe_cerezas_fpsb7jo8nhk.webp 1600w');
    expect(hero?.hasAttribute('priority')).toBe(true);
    expect(hero?.alt).toContain('Cerezas de café');
    expect(page.querySelector<HTMLImageElement>('img[src="LOGOTIPO CA.svg"]')).toMatchObject({
      width: 1268,
      height: 1376,
      alt: 'Logotipo completo de Café Artesano',
    });
    expect(page.querySelector('.hero-media')?.className).toContain('overflow-hidden');
  });

  it('preserves contact, messaging, and supported-social contracts', () => {
    const page = createFixture().nativeElement as HTMLElement;
    const primary = Array.from(page.querySelectorAll<HTMLAnchorElement>('a.cta-primary'));
    const socialNavigation = page.querySelector<HTMLElement>('#contacto nav[aria-label="Redes sociales de Café Artesano"]');
    const social = Array.from(socialNavigation?.querySelectorAll<HTMLAnchorElement>('a') ?? []);
    const phone = page.querySelector<HTMLElement>('#contacto .phone-link');

    expect(primary).toHaveLength(1);
    expect(primary[0]?.href).toBe('https://wa.me/50671606734');
    expect(primary[0]?.target).toBe('_blank');
    expect(primary[0]?.rel).toBe('noopener');
    expect(phone?.tagName).toBe('P');
    expect(phone?.textContent?.trim()).toBe('Teléfono7160-6734');
    expect(page.querySelectorAll('a[href^="tel:"]')).toHaveLength(0);
    expect(page.innerHTML).not.toContain(['7160', '6164'].join('-'));
    expect(page.innerHTML).not.toContain(`tel:+506${['7160', '6164'].join('')}`);
    expect(social.map((link) => [link.textContent?.trim(), link.getAttribute('href')])).toEqual([
      ['Facebook', 'https://www.facebook.com/cafeartesanopalmichal'],
      ['WhatsApp', 'https://wa.me/50671606734'],
    ]);
    expect(social.every((link) => link.target === '_blank' && link.rel === 'noopener')).toBe(true);
    expect(social.every((link) => link.getAttribute('aria-label')?.includes('se abre en una pestaña nueva'))).toBe(true);
    expect(social.every((link) => link.className.includes('min-h-11'))).toBe(true);
    expect(page.innerHTML.toLowerCase()).not.toContain('instagram');
  });

  it('does not load hero motion outside the desktop no-preference query', async () => {
    const fixture = createFixture();
    await settle();

    expect(gsapMocks.gsap.context).not.toHaveBeenCalled();
    fixture.destroy();
  });

  it('does not create a GSAP context when deferred loading completes after destruction', async () => {
    gsapMocks.defer();
    desktopMotionMatches = true;
    const fixture = createFixture();
    await settle();
    await gsapMocks.started();
    fixture.destroy();
    gsapMocks.release();
    await Promise.resolve();
    await Promise.resolve();

    expect(gsapMocks.gsap.context).not.toHaveBeenCalled();
  });

  it('creates parallax-only GSAP motion and tears it down when the media query becomes false', async () => {
    desktopMotionMatches = true;
    const fixture = createFixture();
    await settle();

    const hero = (fixture.nativeElement as HTMLElement).getElementsByClassName('hero-parallax-image').item(0);
    expect(gsapMocks.gsap.context).toHaveBeenCalledWith(expect.any(Function), hero);
    expect(gsapMocks.media.add).toHaveBeenCalledWith(DESKTOP_MOTION_QUERY, expect.any(Function));
    expect(gsapMocks.gsap.fromTo).toHaveBeenCalledWith(hero, { yPercent: 5 }, expect.objectContaining({
      ease: 'none', yPercent: -5, scrollTrigger: expect.objectContaining({ scrub: 0.6 }),
    }));
    expect(gsapMocks.gsap.fromTo.mock.calls[0]?.[2]).not.toHaveProperty('opacity');
    desktopMotionMatches = false;
    motionListener?.({ matches: false } as MediaQueryListEvent);
    expect(gsapMocks.media.revert).toHaveBeenCalledTimes(1);
    expect(gsapMocks.context.revert).toHaveBeenCalledTimes(1);
    fixture.destroy();
  });

});
