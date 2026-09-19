import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { App } from './app';

const THEME_STORAGE_KEY = 'cafe-artesano-theme';

describe('App', () => {
  let systemThemeListener: ((event: MediaQueryListEvent) => void) | undefined;
  let localStorageDescriptor: PropertyDescriptor | undefined;
  let matchMediaDescriptor: PropertyDescriptor | undefined;
  let intersectionObserverDescriptor: PropertyDescriptor | undefined;
  let themeColorMeta: HTMLMetaElement;
  let reducedMotionMatches = false;
  let observerCallback: IntersectionObserverCallback | undefined;
  let observer: Pick<IntersectionObserver, 'observe' | 'disconnect'> | undefined;

  beforeEach(async () => {
    localStorageDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');
    matchMediaDescriptor = Object.getOwnPropertyDescriptor(window, 'matchMedia');
    intersectionObserverDescriptor = Object.getOwnPropertyDescriptor(window, 'IntersectionObserver');
    themeColorMeta = document.querySelector('meta[name="theme-color"]') ?? document.createElement('meta');
    themeColorMeta.setAttribute('name', 'theme-color');
    themeColorMeta.setAttribute('content', '#F7F8F3');
    if (!themeColorMeta.parentElement) {
      document.head.appendChild(themeColorMeta);
    }
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.removeProperty('color-scheme');
    reducedMotionMatches = false;
    observerCallback = undefined;
    observer = undefined;
    setSystemTheme(false);

    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (localStorageDescriptor) {
      Object.defineProperty(window, 'localStorage', localStorageDescriptor);
    } else {
      delete (window as unknown as { localStorage?: Storage }).localStorage;
    }
    if (matchMediaDescriptor) {
      Object.defineProperty(window, 'matchMedia', matchMediaDescriptor);
    } else {
      delete (window as Partial<Window>).matchMedia;
    }
    if (intersectionObserverDescriptor) {
      Object.defineProperty(window, 'IntersectionObserver', intersectionObserverDescriptor);
    } else {
      delete (window as unknown as { IntersectionObserver?: typeof IntersectionObserver }).IntersectionObserver;
    }
  });

  function blockStorage(): void {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get: () => {
        throw new DOMException('Storage is blocked', 'SecurityError');
      },
    });
  }

  function setSystemTheme(matches: boolean): void {
    systemThemeListener = undefined;
    const colorSchemeQuery = {
      matches,
      addEventListener: vi.fn((event: string, listener: (change: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          systemThemeListener = listener;
        }
      }),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList;
    const reducedMotionQuery = {
      get matches() {
        return reducedMotionMatches;
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList;

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn((query: string) => query.includes('prefers-reduced-motion') ? reducedMotionQuery : colorSchemeQuery),
    });
  }

  function mockIntersectionObserver(): ReturnType<typeof vi.fn> {
    const constructor = vi.fn();
    class MockIntersectionObserver {
      readonly observe = vi.fn();
      readonly disconnect = vi.fn();

      constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit) {
        observerCallback = callback;
        observer = this;
        constructor(callback, options);
      }
    }
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      value: MockIntersectionObserver,
    });
    return constructor;
  }

  function createFixture() {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    return fixture;
  }

  function createPage(): HTMLElement {
    return createFixture().nativeElement as HTMLElement;
  }

  async function settleBrowserEnhancements(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve));
  }

  it('creates the Cafe Artesano landing page with one primary heading', () => {
    const page = createPage();

    expect(page.querySelector('h1')?.textContent).toContain('Café Artesano');
    expect(page.querySelectorAll('h1')).toHaveLength(1);
    expect(page.querySelector('main#contenido')).toBeTruthy();
  });

  it('provides skip navigation and landmark sections', () => {
    const page = createPage();

    expect(page.querySelector('a.skip-link')?.getAttribute('href')).toBe('#contenido');
    expect(page.querySelector('header nav[aria-label]')).toBeTruthy();
    expect(page.querySelector('#origen')).toBeTruthy();
    expect(page.querySelector('#proceso')).toBeTruthy();
    expect(page.querySelector('#calidad')).toBeTruthy();
    expect(page.querySelector('#contacto')).toBeTruthy();
    expect(page.querySelector('footer')).toBeTruthy();
  });

  it('exposes corrected Costa Rican contact details without the retired number', () => {
    const page = createPage();
    const phoneLinks = Array.from(page.querySelectorAll<HTMLAnchorElement>('a[href="tel:+50671606734"]'));

    expect(phoneLinks).toHaveLength(3);
    expect(phoneLinks.some((link) => link.textContent?.includes('Hablemos de café'))).toBe(true);
    expect(phoneLinks.some((link) => link.textContent?.includes('Llámenos'))).toBe(true);
    expect(phoneLinks.some((link) => link.textContent?.includes('7160-6734'))).toBe(true);

    const retiredDisplay = ['7160', '6164'].join('-');
    const retiredUri = `tel:+506${['7160', '6164'].join('')}`;

    expect(page.innerHTML).not.toContain(retiredDisplay);
    expect(page.innerHTML).not.toContain(retiredUri);
    expect(page.textContent).toContain('Palmichal de Acosta');
  });

  it('uses explicit primary CTA classes for corrected call labels', () => {
    const page = createPage();
    const primaryCtas = Array.from(page.querySelectorAll<HTMLAnchorElement>('a.cta-primary[href="tel:+50671606734"]'));

    expect(primaryCtas).toHaveLength(2);
    expect(primaryCtas.map((cta) => cta.textContent?.trim())).toEqual(['Llámenos', 'Hablemos de café']);
  });

  it('uses optimized local imagery, a compact header monogram, and the full hero lockup', () => {
    const page = createPage();
    const images = Array.from(page.querySelectorAll<HTMLImageElement>('img[ngsrc]'));
    const heroImage = page.querySelector<HTMLImageElement>('img[ngsrc="hero_cafe_cerezas_fpsb7jo8nhk-768.webp"]');

    expect(images.map((image) => image.getAttribute('ngsrc'))).toEqual([
      'logo.jpg',
      'hero_cafe_cerezas_fpsb7jo8nhk-768.webp',
      'banner_principal.jpg',
      'banner_secundario.jpg',
    ]);
    expect(images.every((image) => (image.alt?.length ?? 0) > 10)).toBe(true);
    expect(heroImage?.parentElement?.tagName).toBe('PICTURE');
    expect(heroImage?.getAttribute('srcset')).toContain('hero_cafe_cerezas_fpsb7jo8nhk.webp 1600w');
    expect(heroImage?.hasAttribute('priority')).toBe(true);
    expect(page.querySelector<HTMLImageElement>('header img[ngsrc="logo.jpg"]')?.alt).toContain('Monograma');
    expect(page.querySelector<HTMLImageElement>('img[src="LOGOTIPO CA.svg"]')?.alt).toContain('Logotipo completo');
  });

  it('offers an accessible, user-controlled muted portrait video', () => {
    const page = createPage();
    const video = page.querySelector('video');

    expect(video?.hasAttribute('controls')).toBe(true);
    expect(video?.hasAttribute('muted')).toBe(true);
    expect(video?.hasAttribute('playsinline')).toBe(true);
    expect(video?.getAttribute('preload')).toBe('metadata');
    expect(video?.hasAttribute('autoplay')).toBe(false);
    expect(video?.getAttribute('aria-describedby')).toBe('video-description');
    expect(page.querySelector('#video-description')?.textContent).toContain('Palmichal de Acosta');
  });

  it('uses an icon-only 44px scroll-top control with a Spanish accessible name', () => {
    const page = createPage();
    const control = page.querySelector<HTMLButtonElement>('button.scroll-top-control');

    expect(control?.getAttribute('aria-label')).toBe('Volver al inicio');
    expect(control?.getAttribute('title')).toBe('Volver al inicio');
    expect(control?.className).toContain('min-h-11');
    expect(control?.className).toContain('min-w-11');
    expect(control?.textContent?.trim()).toBe('');
    expect(control?.querySelector('svg[aria-hidden="true"]')).toBeTruthy();
  });

  it('starts and pauses muted video at the 25% visibility threshold and absorbs rejected playback', async () => {
    const constructor = mockIntersectionObserver();
    const fixture = createFixture();
    const video = (fixture.nativeElement as HTMLElement).querySelector<HTMLVideoElement>('video')!;
    const play = vi.fn(() => Promise.reject(new DOMException('Blocked', 'NotAllowedError')));
    const pause = vi.fn();
    Object.defineProperty(video, 'play', { configurable: true, value: play });
    Object.defineProperty(video, 'pause', { configurable: true, value: pause });
    await settleBrowserEnhancements();

    expect(constructor).toHaveBeenCalledTimes(1);
    expect(constructor.mock.calls[0]?.[1]?.threshold).toBe(0.25);
    observerCallback?.([{ target: video, intersectionRatio: 0.25 } as unknown as IntersectionObserverEntry], {} as IntersectionObserver);
    observerCallback?.([{ target: video, intersectionRatio: 0.24 } as unknown as IntersectionObserverEntry], {} as IntersectionObserver);

    expect(video.muted).toBe(true);
    expect(play).toHaveBeenCalledTimes(1);
    expect(pause).toHaveBeenCalledTimes(1);
  });

  it('does not auto-play under reduced motion and uses immediate scroll fallback', async () => {
    reducedMotionMatches = true;
    const constructor = mockIntersectionObserver();
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const fixture = createFixture();
    await settleBrowserEnhancements();

    fixture.componentInstance.scrollToTop({ preventDefault: vi.fn() } as unknown as Event);

    expect(constructor).not.toHaveBeenCalled();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
  });

  it('disconnects the video observer and reverts GSAP-owned hooks on destruction', async () => {
    mockIntersectionObserver();
    const fixture = createFixture();
    await settleBrowserEnhancements();
    const context = { revert: vi.fn() };
    const media = { add: vi.fn(), revert: vi.fn() };
    Object.assign(fixture.componentInstance as unknown as object, {
      motionContext: context,
      motionMedia: media,
    });

    fixture.destroy();

    expect(observer?.disconnect).toHaveBeenCalledTimes(1);
    expect(media.revert).toHaveBeenCalledTimes(1);
    expect(context.revert).toHaveBeenCalledTimes(1);
  });

  it('initializes from a stored choice before the system preference', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    setSystemTheme(true);
    createFixture();

    expect(document.documentElement.dataset['theme']).toBe('light');
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#F7F8F3');
  });

  it('initializes from the system and follows later system changes without an override', () => {
    setSystemTheme(true);
    createFixture();

    expect(document.documentElement.dataset['theme']).toBe('dark');
    systemThemeListener?.({ matches: false } as MediaQueryListEvent);

    expect(document.documentElement.dataset['theme']).toBe('light');
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#F7F8F3');
  });

  it('keeps a blocked-storage manual selection when the system preference changes', () => {
    setSystemTheme(true);
    blockStorage();
    const fixture = createFixture();
    const toggle = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button.theme-toggle');

    expect(document.documentElement.dataset['theme']).toBe('dark');
    toggle?.click();
    fixture.detectChanges();
    systemThemeListener?.({ matches: true } as MediaQueryListEvent);

    expect(document.documentElement.dataset['theme']).toBe('light');
  });

  it('toggles, persists, and exposes the compact Spanish theme control state', () => {
    const fixture = createFixture();
    const toggle = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button.theme-toggle');

    expect(toggle?.className).toContain('min-h-11');
    expect(toggle?.className).toContain('min-w-11');
    expect(toggle?.getAttribute('aria-pressed')).toBe('false');
    expect(toggle?.getAttribute('aria-label')).toContain('Activar tema oscuro');
    expect((fixture.nativeElement as HTMLElement).querySelector('[aria-live="polite"]')?.textContent).toContain('Tema claro activo');

    toggle?.click();
    fixture.detectChanges();

    expect(document.documentElement.dataset['theme']).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(toggle?.getAttribute('aria-pressed')).toBe('true');
    expect(toggle?.getAttribute('aria-label')).toContain('Activar tema claro');
    expect((fixture.nativeElement as HTMLElement).querySelector('[aria-live="polite"]')?.textContent).toContain('Tema oscuro activo');
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#17110D');
  });
});
