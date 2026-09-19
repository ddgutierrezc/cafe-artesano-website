import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, ElementRef, inject, OnDestroy, PLATFORM_ID, viewChild } from '@angular/core';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

@Component({
  selector: 'app-story-video',
  templateUrl: './story-video.html',
})
export class StoryVideo implements OnDestroy {
  private readonly brandVideo = viewChild<ElementRef<HTMLVideoElement>>('brandVideo');
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private reducedMotionQuery?: MediaQueryList;
  private reducedMotionListener?: (event: MediaQueryListEvent) => void;
  private videoObserver?: IntersectionObserver;
  private hasInitializedVideoMute = false;
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
    this.videoObserver?.disconnect();
  }

  private initializeBrowserEnhancements(): void {
    if (this.isDestroyed) {
      return;
    }

    this.reducedMotionQuery = typeof window.matchMedia === 'function'
      ? window.matchMedia(REDUCED_MOTION_QUERY)
      : undefined;
    this.reducedMotionListener = (event) => {
      if (event.matches) {
        this.videoObserver?.disconnect();
        this.videoObserver = undefined;
        this.brandVideo()?.nativeElement.pause();
        return;
      }

      this.initializeVideoObserver();
    };
    this.reducedMotionQuery?.addEventListener('change', this.reducedMotionListener);
    this.initializeVideoObserver();
  }

  private initializeVideoObserver(): void {
    const video = this.brandVideo()?.nativeElement;
    if (this.isDestroyed || !video || this.videoObserver || this.reducedMotionQuery?.matches || !('IntersectionObserver' in window)) {
      return;
    }

    this.videoObserver = new IntersectionObserver((entries) => {
      if (this.isDestroyed) {
        return;
      }

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
}
