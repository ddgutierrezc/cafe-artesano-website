import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { StoryVideo } from './story-video';

describe('StoryVideo', () => {
  let reducedMotionMatches = false;
  let reducedMotionListener: ((event: MediaQueryListEvent) => void) | undefined;
  let reducedMotionQuery: {
    readonly matches: boolean;
    readonly addEventListener: ReturnType<typeof vi.fn>;
    readonly removeEventListener: ReturnType<typeof vi.fn>;
  } | undefined;
  let observerCallback: IntersectionObserverCallback | undefined;
  let observer: { observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> } | undefined;
  let matchMediaDescriptor: PropertyDescriptor | undefined;
  let intersectionObserverDescriptor: PropertyDescriptor | undefined;

  beforeEach(async () => {
    matchMediaDescriptor = Object.getOwnPropertyDescriptor(window, 'matchMedia');
    intersectionObserverDescriptor = Object.getOwnPropertyDescriptor(window, 'IntersectionObserver');
    reducedMotionMatches = false;
    reducedMotionListener = undefined;
    reducedMotionQuery = undefined;
    observerCallback = undefined;
    observer = undefined;
    reducedMotionQuery = {
      get matches() { return reducedMotionMatches; },
      addEventListener: vi.fn((event: string, listener: (change: MediaQueryListEvent) => void) => {
        if (event === 'change') reducedMotionListener = listener;
      }),
      removeEventListener: vi.fn(),
    };
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => reducedMotionQuery as unknown as MediaQueryList),
    });
    await TestBed.configureTestingModule({ imports: [StoryVideo] }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
    Object.defineProperty(window, 'IntersectionObserver', { configurable: true, value: MockIntersectionObserver });
    return constructor;
  }

  function createFixture() {
    const fixture = TestBed.createComponent(StoryVideo);
    fixture.detectChanges();
    return fixture;
  }

  async function settle(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve));
  }

  it('preserves the accessible user-controlled portrait-video markup', () => {
    const page = createFixture().nativeElement as HTMLElement;
    const video = page.querySelector('video');

    expect(video?.hasAttribute('controls')).toBe(true);
    expect(video?.hasAttribute('muted')).toBe(true);
    expect(video?.hasAttribute('playsinline')).toBe(true);
    expect(video?.getAttribute('preload')).toBe('metadata');
    expect(video?.hasAttribute('autoplay')).toBe(false);
    expect(video?.getAttribute('aria-describedby')).toBe('video-description');
    expect(page.querySelector('#video-description')?.textContent).toContain('Palmichal de Acosta');
  });

  it('plays muted video at 25% visibility, pauses below it, and absorbs rejected playback', async () => {
    const constructor = mockIntersectionObserver();
    const fixture = createFixture();
    const video = (fixture.nativeElement as HTMLElement).querySelector<HTMLVideoElement>('video')!;
    const play = vi.fn(() => Promise.reject(new DOMException('Blocked', 'NotAllowedError')));
    const pause = vi.fn();
    Object.defineProperty(video, 'play', { configurable: true, value: play });
    Object.defineProperty(video, 'pause', { configurable: true, value: pause });
    await settle();

    expect(constructor).toHaveBeenCalledWith(expect.any(Function), { threshold: 0.25 });
    video.muted = false;
    observerCallback?.([{ target: video, intersectionRatio: 0.25 } as unknown as IntersectionObserverEntry], observer as unknown as IntersectionObserver);
    observerCallback?.([{ target: video, intersectionRatio: 0.24 } as unknown as IntersectionObserverEntry], observer as unknown as IntersectionObserver);
    await Promise.resolve();

    expect(video.muted).toBe(true);
    expect(play).toHaveBeenCalledOnce();
    expect(pause).toHaveBeenCalledOnce();
  });

  it('absorbs synchronous playback failures at the exact visibility boundary', async () => {
    mockIntersectionObserver();
    const fixture = createFixture();
    const video = (fixture.nativeElement as HTMLElement).querySelector<HTMLVideoElement>('video')!;
    const play = vi.fn(() => { throw new DOMException('Blocked', 'NotAllowedError'); });
    Object.defineProperty(video, 'play', { configurable: true, value: play });
    await settle();

    expect(() => observerCallback?.([
      { target: video, intersectionRatio: 0.25 } as unknown as IntersectionObserverEntry,
    ], observer as unknown as IntersectionObserver)).not.toThrow();
    expect(play).toHaveBeenCalledOnce();
    expect(video.muted).toBe(true);
    expect(video.controls).toBe(true);
    expect(video.getAttribute('preload')).toBe('metadata');
  });

  it('does not observe under reduced motion, and initializes when the preference later becomes false', async () => {
    const constructor = mockIntersectionObserver();
    reducedMotionMatches = true;
    const fixture = createFixture();
    await settle();

    expect(constructor).not.toHaveBeenCalled();
    reducedMotionMatches = false;
    reducedMotionListener?.({ matches: false } as MediaQueryListEvent);
    expect(constructor).toHaveBeenCalledOnce();
    fixture.destroy();
  });

  it('disconnects an active observer and removes the exact reduced-motion listener on destruction', async () => {
    mockIntersectionObserver();
    const fixture = createFixture();
    await settle();

    const listener = reducedMotionListener;
    fixture.destroy();

    expect(observer?.disconnect).toHaveBeenCalledOnce();
    expect(reducedMotionQuery?.removeEventListener).toHaveBeenCalledWith('change', listener);
  });

  it('keeps native controls available when IntersectionObserver is unsupported', async () => {
    if (intersectionObserverDescriptor) {
      delete (window as unknown as { IntersectionObserver?: typeof IntersectionObserver }).IntersectionObserver;
    }
    const fixture = createFixture();
    await settle();

    expect((fixture.nativeElement as HTMLElement).querySelector('video')).toBeTruthy();
    expect(observer).toBeUndefined();
  });

  it('ignores observer callbacks after destruction', async () => {
    mockIntersectionObserver();
    const fixture = createFixture();
    const video = (fixture.nativeElement as HTMLElement).querySelector<HTMLVideoElement>('video')!;
    const play = vi.fn(() => Promise.resolve());
    Object.defineProperty(video, 'play', { configurable: true, value: play });
    await settle();
    fixture.destroy();

    observerCallback?.([{ target: video, intersectionRatio: 1 } as unknown as IntersectionObserverEntry], observer as unknown as IntersectionObserver);
    expect(play).not.toHaveBeenCalled();
  });
});
