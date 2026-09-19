export interface GsapModules {
  readonly gsap: typeof import('gsap').gsap;
  readonly ScrollToPlugin: typeof import('gsap/ScrollToPlugin').ScrollToPlugin;
  readonly ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
}

let modulesPromise: Promise<GsapModules> | undefined;

/** Lazily loads GSAP motion dependencies and registers shared plugins exactly once. */
export function loadGsap(): Promise<GsapModules> {
  modulesPromise ??= Promise.all([
    import('gsap'),
    import('gsap/ScrollToPlugin'),
    import('gsap/ScrollTrigger'),
  ]).then(([{ gsap }, { ScrollToPlugin }, { ScrollTrigger }]) => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    return { gsap, ScrollToPlugin, ScrollTrigger };
  }).catch((error: unknown) => {
    modulesPromise = undefined;
    throw error;
  });

  return modulesPromise;
}
