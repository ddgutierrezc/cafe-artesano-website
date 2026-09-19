import { DOCUMENT, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { afterNextRender, Component, computed, ElementRef, inject, OnDestroy, PLATFORM_ID, signal, ViewChild } from '@angular/core';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'cafe-artesano-theme';
const DESKTOP_MOTION_QUERY = '(min-width: 48rem) and (prefers-reduced-motion: no-preference)';
const THEME_COLORS: Record<Theme, string> = {
  light: '#F7F8F3',
  dark: '#17110D',
};
let gsapPluginsRegistered = false;

@Component({
  imports: [NgOptimizedImage],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnDestroy {
  @ViewChild('brandVideo') private brandVideo?: ElementRef<HTMLVideoElement>;

  readonly theme = signal<Theme>('light');
  readonly isScrollTopVisible = signal(false);
  readonly themeToggleLabel = computed(() => this.theme() === 'dark'
    ? $localize`:@@theme-toggle-action-light:Activar tema claro (tema oscuro activo)`
    : $localize`:@@theme-toggle-action-dark:Activar tema oscuro (tema claro activo)`);
  readonly themeStatusLabel = computed(() => this.theme() === 'dark'
    ? $localize`:@@theme-status-dark:Tema oscuro activo.`
    : $localize`:@@theme-status-light:Tema claro activo.`);

  private readonly document = inject(DOCUMENT);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private mediaQuery?: MediaQueryList;
  private mediaQueryListener?: (event: MediaQueryListEvent) => void;
  private reducedMotionQuery?: MediaQueryList;
  private reducedMotionListener?: (event: MediaQueryListEvent) => void;
  private motionQuery?: MediaQueryList;
  private motionQueryListener?: (event: MediaQueryListEvent) => void;
  private videoObserver?: IntersectionObserver;
  private motionContext?: { revert: () => void };
  private motionMedia?: { add: (conditions: string, callback: () => void) => void; revert: () => void };
  private scrollToTopWithGsap?: () => void;
  private scrollToTopVisibilityWithGsap?: (visible: boolean) => void;
  private scrollProgressListener?: () => void;
  private scrollProgressResizeListener?: () => void;
  private scrollProgressResizeObserver?: ResizeObserver;
  private scrollProgressFrame?: number;
  private hasSessionThemeOverride = false;
  private hasInitializedVideoMute = false;
  private isDestroyed = false;

  constructor() {
    if (this.isBrowser) {
      this.initializeTheme();
      afterNextRender(() => this.initializeBrowserEnhancements());
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.mediaQuery && this.mediaQueryListener) {
      this.mediaQuery.removeEventListener('change', this.mediaQueryListener);
    }
    if (this.reducedMotionQuery && this.reducedMotionListener) {
      this.reducedMotionQuery.removeEventListener('change', this.reducedMotionListener);
    }
    if (this.motionQuery && this.motionQueryListener) {
      this.motionQuery.removeEventListener('change', this.motionQueryListener);
    }
    this.videoObserver?.disconnect();
    if (this.scrollProgressListener) {
      window.removeEventListener('scroll', this.scrollProgressListener);
    }
    if (this.scrollProgressResizeListener) {
      window.removeEventListener('resize', this.scrollProgressResizeListener);
    }
    if (this.scrollProgressFrame !== undefined) {
      window.cancelAnimationFrame(this.scrollProgressFrame);
    }
    this.scrollProgressResizeObserver?.disconnect();
    this.resetScrollTopControlMotion();
    this.motionMedia?.revert();
    this.motionContext?.revert();
  }

  toggleTheme(): void {
    const nextTheme: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.hasSessionThemeOverride = true;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // A blocked storage area must not prevent a user from changing the page theme.
    }

    this.applyTheme(nextTheme);
  }

  scrollToTop(event: Event): void {
    event.preventDefault();
    if (!this.isScrollTopVisible()) {
      return;
    }

    if (!this.isBrowser || this.reducedMotionQuery?.matches || !this.scrollToTopWithGsap) {
      this.scrollImmediately();
      return;
    }

    this.scrollToTopWithGsap();
  }

  private initializeBrowserEnhancements(): void {
    if (this.isDestroyed) {
      return;
    }

    this.reducedMotionQuery = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : undefined;
    this.motionQuery = typeof window.matchMedia === 'function'
      ? window.matchMedia(DESKTOP_MOTION_QUERY)
      : undefined;
    this.reducedMotionListener = (event) => {
      if (event.matches) {
        this.videoObserver?.disconnect();
        this.videoObserver = undefined;
        this.brandVideo?.nativeElement.pause();
        return;
      }

      this.initializeVideoObserver();
    };
    this.motionQueryListener = (event) => {
      if (event.matches) {
        void this.initializeGsap();
        return;
      }

      this.scrollToTopWithGsap = undefined;
      this.scrollToTopVisibilityWithGsap = undefined;
      this.resetScrollTopControlMotion();
      this.motionMedia?.revert();
      this.motionContext?.revert();
    };
    this.reducedMotionQuery?.addEventListener('change', this.reducedMotionListener);
    this.motionQuery?.addEventListener('change', this.motionQueryListener);

    this.initializeVideoObserver();
    this.initializeScrollToTopVisibility();
    if (this.motionQuery?.matches) {
      void this.initializeGsap();
    }
  }

  private initializeVideoObserver(): void {
    const video = this.brandVideo?.nativeElement;
    if (!video || this.videoObserver || this.reducedMotionQuery?.matches || !('IntersectionObserver' in window)) {
      return;
    }

    this.videoObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target !== video) {
          continue;
        }

        if (entry.intersectionRatio >= 0.25) {
          if (!this.hasInitializedVideoMute) {
            video.muted = true;
            this.hasInitializedVideoMute = true;
          }
          try {
            void video.play().catch(() => undefined);
          } catch {
            // Playback can be blocked by browser policy; native controls remain available.
          }
        } else {
          video.pause();
        }
      }
    }, { threshold: 0.25 });
    this.videoObserver.observe(video);
  }

  private async initializeGsap(): Promise<void> {
    if (!this.isBrowser || this.isDestroyed || !this.motionQuery?.matches) {
      return;
    }

    try {
      const [{ gsap }, { ScrollToPlugin }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollToPlugin'),
        import('gsap/ScrollTrigger'),
      ]);
      if (this.isDestroyed || !this.motionQuery?.matches) {
        return;
      }

      if (!gsapPluginsRegistered) {
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
        gsapPluginsRegistered = true;
      }

      this.scrollToTopWithGsap = () => {
        gsap.to(window, {
          duration: 0.45,
          ease: 'power2.out',
          scrollTo: { y: 0, autoKill: true },
        });
      };
      this.scrollToTopVisibilityWithGsap = (visible) => {
        const control = this.host.nativeElement.querySelector<HTMLElement>('.scroll-top-control');
        if (control) {
          gsap.to(control, {
            autoAlpha: visible ? 1 : 0,
            duration: 0.24,
            ease: 'power2.out',
            overwrite: 'auto',
            scale: visible ? 1 : 0.96,
            y: visible ? 0 : 12,
          });
        }
      };

      this.motionMedia?.revert();
      this.motionContext?.revert();
      const host = this.host.nativeElement;
      this.motionContext = gsap.context(() => {
        this.motionMedia = gsap.matchMedia();
        this.motionMedia.add(DESKTOP_MOTION_QUERY, () => {
          const heroImage = host.querySelector<HTMLElement>('.hero-parallax-image');
          if (heroImage) {
            gsap.fromTo(heroImage, { yPercent: 5 }, {
              ease: 'none',
              yPercent: -5,
              scrollTrigger: {
                trigger: heroImage,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.6,
              },
            });
          }
        });
      }, host);
    } catch {
      // The page retains native anchors and immediate scrolling when GSAP cannot load.
    }
  }

  private initializeScrollToTopVisibility(): void {
    this.scrollProgressListener = () => this.requestScrollTopVisibilityUpdate();
    this.scrollProgressResizeListener = () => this.requestScrollTopVisibilityUpdate();
    window.addEventListener('scroll', this.scrollProgressListener, { passive: true });
    window.addEventListener('resize', this.scrollProgressResizeListener);

    if ('ResizeObserver' in window) {
      this.scrollProgressResizeObserver = new ResizeObserver(() => this.requestScrollTopVisibilityUpdate());
      this.scrollProgressResizeObserver.observe(this.document.documentElement);
    }

    this.requestScrollTopVisibilityUpdate();
  }

  private requestScrollTopVisibilityUpdate(): void {
    if (this.scrollProgressFrame !== undefined) {
      return;
    }

    this.scrollProgressFrame = window.requestAnimationFrame(() => {
      this.scrollProgressFrame = undefined;
      const scrollableDistance = this.document.documentElement.scrollHeight - window.innerHeight;
      const visible = scrollableDistance > 0 && window.scrollY / scrollableDistance >= 0.10;
      if (visible !== this.isScrollTopVisible()) {
        this.isScrollTopVisible.set(visible);
        this.scrollToTopVisibilityWithGsap?.(visible);
      }
    });
  }

  private resetScrollTopControlMotion(): void {
    const control = this.host.nativeElement.querySelector<HTMLElement>('.scroll-top-control');
    control?.style.removeProperty('opacity');
    control?.style.removeProperty('transform');
    control?.style.removeProperty('visibility');
  }

  private scrollImmediately(): void {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch {
      // Some embedded browsers expose a non-callable scroll API; the anchor remains usable.
    }
  }

  private initializeTheme(): void {
    const storedTheme = this.readStoredTheme();
    this.applyTheme(storedTheme ?? this.getSystemTheme());

    if (storedTheme === null && typeof window.matchMedia === 'function') {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQueryListener = (event) => {
        if (!this.hasSessionThemeOverride && this.readStoredTheme() === null) {
          this.applyTheme(event.matches ? 'dark' : 'light');
        }
      };
      this.mediaQuery.addEventListener('change', this.mediaQueryListener);
    }
  }

  private getSystemTheme(): Theme {
    return typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  private readStoredTheme(): Theme | null {
    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : null;
    } catch {
      return null;
    }
  }

  private applyTheme(theme: Theme): void {
    this.theme.set(theme);
    this.document.documentElement.dataset['theme'] = theme;
    this.document.documentElement.style.colorScheme = theme;
    this.document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
  }
}
