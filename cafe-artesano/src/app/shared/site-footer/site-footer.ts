import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, ElementRef, inject, OnDestroy, PLATFORM_ID, signal, viewChild } from '@angular/core';

const DESKTOP_MOTION_QUERY = '(min-width: 48rem) and (prefers-reduced-motion: no-preference)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

interface KillableTween {
  kill: () => void;
}

@Component({
  selector: 'app-site-footer',
  templateUrl: './site-footer.html',
})
export class SiteFooter implements OnDestroy {
  private readonly scrollTopControl = viewChild<ElementRef<HTMLButtonElement>>('scrollTopControl');
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly isScrollTopVisible = signal(false);

  private reducedMotionQuery?: MediaQueryList;
  private reducedMotionListener?: (event: MediaQueryListEvent) => void;
  private motionQuery?: MediaQueryList;
  private motionQueryListener?: (event: MediaQueryListEvent) => void;
  private scrollProgressListener?: () => void;
  private scrollProgressResizeListener?: () => void;
  private scrollProgressResizeObserver?: ResizeObserver;
  private scrollProgressFrame?: number;
  private scrollToTopWithGsap?: () => void;
  private scrollToTopVisibilityWithGsap?: (visible: boolean) => void;
  private scrollToTopTween?: KillableTween;
  private scrollToTopVisibilityTween?: KillableTween;
  private isDestroyed = false;

  constructor() {
    if (this.isBrowser) {
      afterNextRender(() => this.initializeBrowserEnhancements());
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.reducedMotionQuery && this.reducedMotionListener) {
      this.reducedMotionQuery.removeEventListener('change', this.reducedMotionListener);
    }
    if (this.motionQuery && this.motionQueryListener) {
      this.motionQuery.removeEventListener('change', this.motionQueryListener);
    }
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
    this.disableGsap();
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

    try {
      this.scrollToTopWithGsap();
    } catch {
      this.scrollImmediately();
    }
  }

  private initializeBrowserEnhancements(): void {
    if (this.isDestroyed) {
      return;
    }

    if (typeof window.matchMedia === 'function') {
      this.reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
      this.motionQuery = window.matchMedia(DESKTOP_MOTION_QUERY);
    }
    this.reducedMotionListener = (event) => {
      if (event.matches) {
        this.disableGsap();
      } else if (this.motionQuery?.matches) {
        void this.initializeGsap();
      }
    };
    this.motionQueryListener = (event) => {
      if (event.matches) {
        void this.initializeGsap();
      } else {
        this.disableGsap();
      }
    };
    this.reducedMotionQuery?.addEventListener('change', this.reducedMotionListener);
    this.motionQuery?.addEventListener('change', this.motionQueryListener);

    this.initializeScrollToTopVisibility();
    if (this.motionQuery?.matches) {
      void this.initializeGsap();
    }
  }

  private async initializeGsap(): Promise<void> {
    if (!this.isBrowser || this.isDestroyed || !this.motionQuery?.matches || this.reducedMotionQuery?.matches) {
      return;
    }

    try {
      const { loadGsap } = await import('../motion/gsap-loader');
      if (this.isDestroyed || !this.motionQuery?.matches || this.reducedMotionQuery?.matches) {
        return;
      }
      const { gsap } = await loadGsap();
      if (this.isDestroyed || !this.motionQuery?.matches || this.reducedMotionQuery?.matches) {
        return;
      }

      this.scrollToTopWithGsap = () => {
        this.scrollToTopTween?.kill();
        this.scrollToTopTween = gsap.to(window, {
          duration: 0.45,
          ease: 'power2.out',
          scrollTo: { y: 0, autoKill: true },
        });
      };
      this.scrollToTopVisibilityWithGsap = (visible) => {
        const control = this.scrollTopControl()?.nativeElement;
        if (control) {
          this.scrollToTopVisibilityTween?.kill();
          this.scrollToTopVisibilityTween = gsap.to(control, {
            autoAlpha: visible ? 1 : 0,
            duration: 0.24,
            ease: 'power2.out',
            overwrite: 'auto',
            scale: visible ? 1 : 0.96,
            y: visible ? 0 : 12,
          });
        }
      };
    } catch {
      // Native scrolling and CSS visibility remain available when GSAP cannot load.
    }
  }

  private initializeScrollToTopVisibility(): void {
    this.scrollProgressListener = () => this.requestScrollTopVisibilityUpdate();
    this.scrollProgressResizeListener = () => this.requestScrollTopVisibilityUpdate();
    window.addEventListener('scroll', this.scrollProgressListener, { passive: true });
    window.addEventListener('resize', this.scrollProgressResizeListener);

    if ('ResizeObserver' in window) {
      try {
        this.scrollProgressResizeObserver = new ResizeObserver(() => this.requestScrollTopVisibilityUpdate());
        this.scrollProgressResizeObserver.observe(this.document.documentElement);
      } catch {
        this.scrollProgressResizeObserver = undefined;
      }
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

  private disableGsap(): void {
    this.scrollToTopTween?.kill();
    this.scrollToTopVisibilityTween?.kill();
    this.scrollToTopTween = undefined;
    this.scrollToTopVisibilityTween = undefined;
    this.scrollToTopWithGsap = undefined;
    this.scrollToTopVisibilityWithGsap = undefined;
    const control = this.scrollTopControl()?.nativeElement;
    control?.style.removeProperty('opacity');
    control?.style.removeProperty('transform');
    control?.style.removeProperty('visibility');
  }

  private scrollImmediately(): void {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch {
      // The native button remains safe in embedded browsers with a partial scroll API.
    }
  }
}
