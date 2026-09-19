import { afterEach, describe, expect, it, vi } from 'vitest';

interface MockGeneration {
  readonly ScrollToPlugin: object;
  readonly ScrollTrigger: object;
  readonly gsap: { registerPlugin: ReturnType<typeof vi.fn> };
  readonly imports: { gsap: number; scrollTo: number; scrollTrigger: number };
}

function mockGeneration(registerPlugin = vi.fn()): MockGeneration {
  const generation: MockGeneration = {
    ScrollToPlugin: {},
    ScrollTrigger: {},
    gsap: { registerPlugin },
    imports: { gsap: 0, scrollTo: 0, scrollTrigger: 0 },
  };

  vi.doMock('gsap', () => {
    generation.imports.gsap += 1;
    return { gsap: generation.gsap };
  });
  vi.doMock('gsap/ScrollToPlugin', () => {
    generation.imports.scrollTo += 1;
    return { ScrollToPlugin: generation.ScrollToPlugin };
  });
  vi.doMock('gsap/ScrollTrigger', () => {
    generation.imports.scrollTrigger += 1;
    return { ScrollTrigger: generation.ScrollTrigger };
  });

  return generation;
}

afterEach(() => {
  vi.doUnmock('gsap');
  vi.doUnmock('gsap/ScrollToPlugin');
  vi.doUnmock('gsap/ScrollTrigger');
  vi.resetModules();
});

describe('loadGsap', () => {
  it('shares one pending import generation across concurrent callers and registers plugins once', async () => {
    const generation = mockGeneration();
    const { loadGsap } = await import('./gsap-loader');

    const first = loadGsap();
    const second = loadGsap();

    expect(second).toBe(first);
    await expect(first).resolves.toMatchObject({
      gsap: generation.gsap,
      ScrollToPlugin: generation.ScrollToPlugin,
      ScrollTrigger: generation.ScrollTrigger,
    });
    expect(generation.imports).toEqual({ gsap: 1, scrollTo: 1, scrollTrigger: 1 });
    expect(generation.gsap.registerPlugin).toHaveBeenCalledTimes(1);
    expect(generation.gsap.registerPlugin).toHaveBeenCalledWith(generation.ScrollTrigger, generation.ScrollToPlugin);
  });

  it('clears a rejected generation so a later call retries and succeeds', async () => {
    const registrationError = new Error('plugin registration failed');
    const generation = mockGeneration(vi.fn()
      .mockImplementationOnce(() => {
        throw registrationError;
      }));
    const { loadGsap } = await import('./gsap-loader');

    const rejected = loadGsap();
    await expect(rejected).rejects.toBe(registrationError);
    const retried = loadGsap();

    expect(retried).not.toBe(rejected);
    await expect(retried).resolves.toMatchObject({ gsap: generation.gsap });
    expect(generation.imports).toEqual({ gsap: 1, scrollTo: 1, scrollTrigger: 1 });
    expect(generation.gsap.registerPlugin).toHaveBeenCalledTimes(2);
    expect(generation.gsap.registerPlugin).toHaveBeenLastCalledWith(generation.ScrollTrigger, generation.ScrollToPlugin);
  });
});
