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
  readonly themeToggleLabel = computed(() => this.theme() === 'dark'
    ? 'Activar tema claro (tema oscuro activo)'
    : 'Activar tema oscuro (tema claro activo)');

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
      this.motionMedia?.revert();
      this.motionContext?.revert();
    };
    this.reducedMotionQuery?.addEventListener('change', this.reducedMotionListener);
    this.motionQuery?.addEventListener('change', this.motionQueryListener);

    this.initializeVideoObserver();
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

      this.motionMedia?.revert();
      this.motionContext?.revert();
      const host = this.host.nativeElement;
      this.motionContext = gsap.context(() => {
        this.motionMedia = gsap.matchMedia();
        this.motionMedia.add(DESKTOP_MOTION_QUERY, () => {
          const heroMedia = host.querySelector<HTMLElement>('.hero-media');
          if (heroMedia) {
            gsap.to(heroMedia, {
              ease: 'none',
              yPercent: -3,
              scrollTrigger: {
                trigger: heroMedia,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            });
          }

          host.querySelectorAll<HTMLElement>('.gsap-reveal').forEach((element) => {
            ScrollTrigger.create({
              trigger: element,
              start: 'top 88%',
              once: true,
              onEnter: () => {
                gsap.fromTo(element, { opacity: 0.9, yPercent: 2 }, {
                  duration: 0.45,
                  ease: 'power2.out',
                  opacity: 1,
                  overwrite: 'auto',
                  yPercent: 0,
                });
              },
            });
          });
        });
      }, host);
    } catch {
      // The page retains native anchors and immediate scrolling when GSAP cannot load.
    }
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
