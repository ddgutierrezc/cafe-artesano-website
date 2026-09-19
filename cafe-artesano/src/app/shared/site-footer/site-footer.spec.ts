import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

const gsapMocks = vi.hoisted(() => {
  const tweens: Array<{ kill: ReturnType<typeof vi.fn> }> = [];
  const gsap = {
    registerPlugin: vi.fn(),
    to: vi.fn(() => {
      const tween = { kill: vi.fn() };
      tweens.push(tween);
      return tween;
    }),
  };
  let deferModuleImports = false;
  let moduleImportsStarted: Promise<void> = Promise.resolve();
  let resolveModuleImportsStarted: (() => void) | undefined;
  let pendingModuleImportResolvers: Array<() => void> = [];

  const resetDeferredModuleImports = () => {
    deferModuleImports = false;
    pendingModuleImportResolvers = [];
    moduleImportsStarted = new Promise((resolve) => {
      resolveModuleImportsStarted = resolve;
    });
  };
  const waitForModuleImport = async () => {
    if (!deferModuleImports) {
      return;
    }
    await new Promise<void>((resolve) => {
      pendingModuleImportResolvers.push(resolve);
      if (pendingModuleImportResolvers.length === 3) {
        resolveModuleImportsStarted?.();
      }
    });
  };

  return {
    ScrollToPlugin: {},
    ScrollTrigger: {},
    defer: () => {
      deferModuleImports = true;
    },
    gsap,
    moduleImportsStarted: () => moduleImportsStarted,
    moduleLoads: { gsap: 0, scrollTo: 0, scrollTrigger: 0 },
    releaseDeferredModuleImports: () => pendingModuleImportResolvers.splice(0).forEach((resolve) => resolve()),
    resetDeferredModuleImports,
    tweens,
    waitForModuleImport,
  };
});

vi.mock('gsap', async () => {
  gsapMocks.moduleLoads.gsap += 1;
  await gsapMocks.waitForModuleImport();
  return { gsap: gsapMocks.gsap };
});
vi.mock('gsap/ScrollToPlugin', async () => {
  gsapMocks.moduleLoads.scrollTo += 1;
  await gsapMocks.waitForModuleImport();
  return { ScrollToPlugin: gsapMocks.ScrollToPlugin };
});
vi.mock('gsap/ScrollTrigger', async () => {
  gsapMocks.moduleLoads.scrollTrigger += 1;
  await gsapMocks.waitForModuleImport();
  return { ScrollTrigger: gsapMocks.ScrollTrigger };
});

import { SiteFooter } from './site-footer';

const DESKTOP_MOTION_QUERY = '(min-width: 48rem) and (prefers-reduced-motion: no-preference)';

describe('SiteFooter', () => {
  let motionQueryListener: ((event: MediaQueryListEvent) => void) | undefined;
  let reducedMotionListener: ((event: MediaQueryListEvent) => void) | undefined;
  let desktopMotionQuery: MediaQueryList | undefined;
  let reducedMotionQuery: MediaQueryList | undefined;
  let matchMediaDescriptor: PropertyDescriptor | undefined;
  let resizeObserverDescriptor: PropertyDescriptor | undefined;
  let requestAnimationFrameDescriptor: PropertyDescriptor | undefined;
  let cancelAnimationFrameDescriptor: PropertyDescriptor | undefined;
  let scrollYDescriptor: PropertyDescriptor | undefined;
  let innerHeightDescriptor: PropertyDescriptor | undefined;
  let scrollHeightDescriptor: PropertyDescriptor | undefined;
  let desktopMotionMatches = false;
  let reducedMotionMatches = false;
  let nextAnimationFrame = 0;
  const animationFrames = new Map<number, FrameRequestCallback>();

  beforeEach(async () => {
    vi.resetModules();
    gsapMocks.gsap.to.mockClear();
    gsapMocks.tweens.splice(0);
    gsapMocks.resetDeferredModuleImports();
    matchMediaDescriptor = Object.getOwnPropertyDescriptor(window, 'matchMedia');
    resizeObserverDescriptor = Object.getOwnPropertyDescriptor(window, 'ResizeObserver');
    requestAnimationFrameDescriptor = Object.getOwnPropertyDescriptor(window, 'requestAnimationFrame');
    cancelAnimationFrameDescriptor = Object.getOwnPropertyDescriptor(window, 'cancelAnimationFrame');
    scrollYDescriptor = Object.getOwnPropertyDescriptor(window, 'scrollY');
    innerHeightDescriptor = Object.getOwnPropertyDescriptor(window, 'innerHeight');
    scrollHeightDescriptor = Object.getOwnPropertyDescriptor(document.documentElement, 'scrollHeight');
    desktopMotionMatches = false;
    reducedMotionMatches = false;
    motionQueryListener = undefined;
    reducedMotionListener = undefined;
    desktopMotionQuery = undefined;
    reducedMotionQuery = undefined;
    nextAnimationFrame = 0;
    animationFrames.clear();
    Object.defineProperty(window, 'requestAnimationFrame', {
      configurable: true,
      value: vi.fn((callback: FrameRequestCallback) => {
        const frame = ++nextAnimationFrame;
        animationFrames.set(frame, callback);
        return frame;
      }),
    });
    Object.defineProperty(window, 'cancelAnimationFrame', {
      configurable: true,
      value: vi.fn((frame: number) => animationFrames.delete(frame)),
    });
    setScrollMetrics(0);
    setMotionQueries();
    await TestBed.configureTestingModule({ imports: [SiteFooter] }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    restoreWindowProperty('matchMedia', matchMediaDescriptor);
    restoreWindowProperty('requestAnimationFrame', requestAnimationFrameDescriptor);
    restoreWindowProperty('cancelAnimationFrame', cancelAnimationFrameDescriptor);
    restoreWindowProperty('scrollY', scrollYDescriptor);
    restoreWindowProperty('innerHeight', innerHeightDescriptor);
    if (scrollHeightDescriptor) {
      Object.defineProperty(document.documentElement, 'scrollHeight', scrollHeightDescriptor);
    } else {
      delete (document.documentElement as { scrollHeight?: number }).scrollHeight;
    }
    if (resizeObserverDescriptor) {
      Object.defineProperty(window, 'ResizeObserver', resizeObserverDescriptor);
    } else {
      delete (window as unknown as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;
    }
    TestBed.resetTestingModule();
  });

  function restoreWindowProperty(name: keyof Window, descriptor: PropertyDescriptor | undefined): void {
    if (descriptor) {
      Object.defineProperty(window, name, descriptor);
    } else {
      delete (window as Partial<Window>)[name];
    }
  }

  function setScrollMetrics(scrollY: number, scrollHeight = 10_000, innerHeight = 1_000): void {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: scrollY });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: innerHeight });
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: scrollHeight });
  }

  function setMotionQueries(): void {
    reducedMotionQuery = {
      get matches() {
        return reducedMotionMatches;
      },
      addEventListener: vi.fn((event: string, listener: (change: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          reducedMotionListener = listener;
        }
      }),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList;
    desktopMotionQuery = {
      get matches() {
        return desktopMotionMatches;
      },
      addEventListener: vi.fn((event: string, listener: (change: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          motionQueryListener = listener;
        }
      }),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn((query: string) => query === DESKTOP_MOTION_QUERY ? desktopMotionQuery! : reducedMotionQuery!),
    });
  }

  function flushAnimationFrames(): void {
    const frames = Array.from(animationFrames.entries());
    animationFrames.clear();
    frames.forEach(([, callback]) => callback(0));
  }

  function createFixture() {
    const fixture = TestBed.createComponent(SiteFooter);
    fixture.detectChanges();
    return fixture;
  }

  async function settleBrowserEnhancements(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve));
  }

  function controlOf(fixture: ReturnType<typeof createFixture>): HTMLButtonElement {
    return (fixture.nativeElement as HTMLElement).getElementsByClassName('scroll-top-control').item(0) as HTMLButtonElement;
  }

  it('falls back safely when motion enhancement is unavailable', async () => {
    setScrollMetrics(900);
    const failedFixture = createFixture();
    await settleBrowserEnhancements();
    flushAnimationFrames();
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    failedFixture.componentInstance.scrollToTop({ preventDefault: vi.fn() } as unknown as Event);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
    expect(gsapMocks.gsap.to).not.toHaveBeenCalled();
    failedFixture.destroy();
  });

  it('uses the native path after a deferred GSAP import completes following destruction', async () => {
    gsapMocks.defer();
    desktopMotionMatches = true;
    setScrollMetrics(900);
    const fixture = createFixture();
    await settleBrowserEnhancements();
    flushAnimationFrames();
    await gsapMocks.moduleImportsStarted();
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    fixture.destroy();
    gsapMocks.releaseDeferredModuleImports();
    await Promise.resolve();
    await Promise.resolve();
    fixture.componentInstance.scrollToTop({ preventDefault: vi.fn() } as unknown as Event);

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
    expect(gsapMocks.gsap.to).not.toHaveBeenCalled();
  });

  it('uses eligible desktop GSAP motion and replaces same-purpose tweens', async () => {
    desktopMotionMatches = true;
    setScrollMetrics(900);
    const fixture = createFixture();
    await settleBrowserEnhancements();
    flushAnimationFrames();
    fixture.detectChanges();
    const control = controlOf(fixture);

    expect(control.disabled).toBe(false);

    setScrollMetrics(899);
    window.dispatchEvent(new Event('scroll'));
    flushAnimationFrames();
    expect(gsapMocks.gsap.to).toHaveBeenCalledWith(control, expect.objectContaining({
      autoAlpha: 0, duration: 0.24, overwrite: 'auto', scale: 0.96, y: 12,
    }));
    const hiddenTween = gsapMocks.tweens.at(-1)!;

    setScrollMetrics(900);
    window.dispatchEvent(new Event('scroll'));
    flushAnimationFrames();
    expect(gsapMocks.gsap.to).toHaveBeenCalledWith(control, expect.objectContaining({
      autoAlpha: 1, duration: 0.24, overwrite: 'auto', scale: 1, y: 0,
    }));
    expect(hiddenTween.kill).toHaveBeenCalledOnce();

    fixture.componentInstance.scrollToTop({ preventDefault: vi.fn() } as unknown as Event);
    expect(gsapMocks.gsap.to).toHaveBeenCalledWith(window, expect.objectContaining({
      scrollTo: { y: 0, autoKill: true },
    }));
    const firstScrollTween = gsapMocks.tweens.at(-1)!;
    fixture.componentInstance.scrollToTop({ preventDefault: vi.fn() } as unknown as Event);
    expect(firstScrollTween.kill).toHaveBeenCalledOnce();
    fixture.destroy();
  });

  it('uses the exact 10% boundary and hides the control on non-scrollable documents', async () => {
    setScrollMetrics(891);
    const fixture = createFixture();
    await settleBrowserEnhancements();
    flushAnimationFrames();
    fixture.detectChanges();
    const control = controlOf(fixture);

    expect(control.disabled).toBe(true);
    expect(control.getAttribute('aria-hidden')).toBe('true');
    expect(control.getAttribute('tabindex')).toBe('-1');
    expect(control.classList.contains('scroll-top-control--visible')).toBe(false);

    setScrollMetrics(900);
    window.dispatchEvent(new Event('scroll'));
    flushAnimationFrames();
    fixture.detectChanges();
    expect(control.disabled).toBe(false);
    expect(control.getAttribute('aria-hidden')).toBeNull();
    expect(control.getAttribute('tabindex')).toBeNull();
    expect(control.classList.contains('scroll-top-control--visible')).toBe(true);

    setScrollMetrics(120, 1_000, 1_000);
    window.dispatchEvent(new Event('scroll'));
    flushAnimationFrames();
    fixture.detectChanges();
    expect(control.disabled).toBe(true);
    expect(control.getAttribute('aria-hidden')).toBe('true');
    fixture.destroy();
  });

  it('coalesces scroll and resize updates, observes document height, and cleans up every browser resource', async () => {
    let resizeObserverCallback: ResizeObserverCallback | undefined;
    const observe = vi.fn();
    const disconnect = vi.fn();
    class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resizeObserverCallback = callback;
      }

      readonly observe = observe;
      readonly disconnect = disconnect;
    }
    Object.defineProperty(window, 'ResizeObserver', { configurable: true, value: MockResizeObserver });
    const addEventListener = vi.spyOn(window, 'addEventListener');
    const removeEventListener = vi.spyOn(window, 'removeEventListener');
    setScrollMetrics(900);
    const fixture = createFixture();
    await settleBrowserEnhancements();
    flushAnimationFrames();
    const frameBeforeEvents = nextAnimationFrame;

    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('resize'));
    expect(nextAnimationFrame).toBe(frameBeforeEvents + 1);
    expect(addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
    expect(observe).toHaveBeenCalledWith(document.documentElement);

    setScrollMetrics(900, 10_100);
    window.dispatchEvent(new Event('resize'));
    flushAnimationFrames();
    fixture.detectChanges();
    expect(controlOf(fixture).disabled).toBe(true);

    setScrollMetrics(900);
    resizeObserverCallback?.([], {} as ResizeObserver);
    flushAnimationFrames();
    fixture.detectChanges();
    expect(controlOf(fixture).disabled).toBe(false);

    window.dispatchEvent(new Event('scroll'));
    const pendingFrame = nextAnimationFrame;
    fixture.destroy();
    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(pendingFrame);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('kills active tweens for reduced motion, falls back natively, and re-enables through the reduced-motion listener', async () => {
    desktopMotionMatches = true;
    setScrollMetrics(900);
    const fixture = createFixture();
    await settleBrowserEnhancements();
    flushAnimationFrames();
    const control = controlOf(fixture);

    setScrollMetrics(899);
    window.dispatchEvent(new Event('scroll'));
    flushAnimationFrames();
    setScrollMetrics(900);
    window.dispatchEvent(new Event('scroll'));
    flushAnimationFrames();
    const visibilityTween = gsapMocks.tweens.at(-1)!;
    fixture.componentInstance.scrollToTop({ preventDefault: vi.fn() } as unknown as Event);
    const scrollTween = gsapMocks.tweens.at(-1)!;
    control.style.setProperty('opacity', '0.5');
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    reducedMotionMatches = true;
    desktopMotionMatches = false;
    reducedMotionListener?.({ matches: true } as MediaQueryListEvent);
    expect(visibilityTween.kill).toHaveBeenCalledOnce();
    expect(scrollTween.kill).toHaveBeenCalledOnce();
    expect(control.style.opacity).toBe('');
    fixture.componentInstance.scrollToTop({ preventDefault: vi.fn() } as unknown as Event);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });

    reducedMotionMatches = false;
    desktopMotionMatches = true;
    reducedMotionListener?.({ matches: false } as MediaQueryListEvent);
    await settleBrowserEnhancements();
    fixture.componentInstance.scrollToTop({ preventDefault: vi.fn() } as unknown as Event);
    expect(gsapMocks.gsap.to).toHaveBeenCalledWith(window, expect.objectContaining({ scrollTo: { y: 0, autoKill: true } }));
    fixture.destroy();
  });

  it('kills active tweens and removes both media listeners on destruction', async () => {
    desktopMotionMatches = true;
    setScrollMetrics(900);
    const fixture = createFixture();
    await settleBrowserEnhancements();
    flushAnimationFrames();

    setScrollMetrics(899);
    window.dispatchEvent(new Event('scroll'));
    flushAnimationFrames();
    const visibilityTween = gsapMocks.tweens.at(-1)!;
    fixture.componentInstance.scrollToTop({ preventDefault: vi.fn() } as unknown as Event);
    const scrollTween = gsapMocks.tweens.at(-1)!;
    fixture.destroy();

    expect(visibilityTween.kill).toHaveBeenCalledOnce();
    expect(scrollTween.kill).toHaveBeenCalledOnce();
    expect(reducedMotionQuery?.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    expect(desktopMotionQuery?.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('keeps the exact localized icon-only control contract', () => {
    const fixture = createFixture();
    const control = controlOf(fixture);

    expect(control.getAttribute('aria-label')).toBe('Volver al inicio');
    expect(control.getAttribute('title')).toBe('Volver al inicio');
    expect(control.className).toContain('h-11');
    expect(control.className).toContain('w-11');
    expect(control.textContent?.trim()).toBe('');
    expect(control.querySelector('svg[aria-hidden="true"]')?.classList.contains('h-5')).toBe(true);
    fixture.destroy();
  });

});
