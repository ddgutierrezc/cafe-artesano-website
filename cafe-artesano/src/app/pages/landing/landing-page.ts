import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { afterNextRender, Component, ElementRef, inject, OnDestroy, PLATFORM_ID, viewChild } from '@angular/core';
import { StoryVideo } from './components/story-video/story-video';

const DESKTOP_MOTION_QUERY = '(min-width: 48rem) and (prefers-reduced-motion: no-preference)';

@Component({
  imports: [NgOptimizedImage, StoryVideo],
  selector: 'app-landing-page',
  templateUrl: './landing-page.html',
})
export class LandingPage implements OnDestroy {
  private readonly heroParallaxImage = viewChild<ElementRef<HTMLElement>>('heroParallaxImage');
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private motionQuery?: MediaQueryList;
  private motionQueryListener?: (event: MediaQueryListEvent) => void;
  private motionContext?: { revert: () => void };
  private motionMedia?: { add: (conditions: string, callback: () => void) => void; revert: () => void };
  private isDestroyed = false;

  constructor() {
    if (this.isBrowser) {
      afterNextRender(() => this.initializeBrowserEnhancements());
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.motionQuery && this.motionQueryListener) {
      this.motionQuery.removeEventListener('change', this.motionQueryListener);
    }
    this.disableHeroMotion();
  }

  private initializeBrowserEnhancements(): void {
    if (this.isDestroyed || typeof window.matchMedia !== 'function') {
      return;
    }

    this.motionQuery = window.matchMedia(DESKTOP_MOTION_QUERY);
    this.motionQueryListener = (event) => {
      if (event.matches) {
        void this.initializeHeroGsap();
        return;
      }

      this.disableHeroMotion();
    };
    this.motionQuery.addEventListener('change', this.motionQueryListener);

    if (this.motionQuery.matches) {
      void this.initializeHeroGsap();
    }
  }

  private async initializeHeroGsap(): Promise<void> {
    if (!this.isBrowser || this.isDestroyed || !this.motionQuery?.matches) {
      return;
    }

    try {
      const { loadGsap } = await import('../../shared/motion/gsap-loader');
      if (this.isDestroyed || !this.motionQuery?.matches) {
        return;
      }
      const { gsap } = await loadGsap();
      const heroImage = this.heroParallaxImage()?.nativeElement;
      if (this.isDestroyed || !this.motionQuery?.matches || !heroImage) {
        return;
      }

      this.disableHeroMotion();
      this.motionContext = gsap.context(() => {
        this.motionMedia = gsap.matchMedia();
        this.motionMedia.add(DESKTOP_MOTION_QUERY, () => {
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
        });
      }, heroImage);
    } catch {
      // Static hero media remains available when progressive enhancement cannot load.
    }
  }

  private disableHeroMotion(): void {
    this.motionMedia?.revert();
    this.motionContext?.revert();
    this.motionMedia = undefined;
    this.motionContext = undefined;
  }
}
