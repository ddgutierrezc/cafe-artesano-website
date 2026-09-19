interface FileSystem {
  readFileSync(path: string, encoding: 'utf8'): string;
  readFileSync(path: string): Uint8Array;
  writeFileSync(path: string, data: string, encoding: 'utf8'): void;
  mkdirSync(path: string, options: { recursive: true }): void;
  mkdtempSync(prefix: string): string;
  existsSync(path: string): boolean;
  rmSync(path: string, options: { force: true; recursive: true }): void;
  symlinkSync(target: string, path: string): void;
}

interface PathModule {
  resolve(...paths: string[]): string;
}

interface OperatingSystem {
  tmpdir(): string;
}

interface UrlModule {
  pathToFileURL(path: string): URL;
}

declare function require(module: 'node:fs'): FileSystem;
declare function require(module: 'node:path'): PathModule;
declare function require(module: 'node:os'): OperatingSystem;
declare function require(module: 'node:url'): UrlModule;

const { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { tmpdir } = require('node:os');
const { pathToFileURL } = require('node:url');

type StructuredData = Record<string, unknown>;

const ORIGIN = 'https://cafeartesanocr.netlify.app/';
const ENGLISH_URL = `${ORIGIN}en/`;
const SOCIAL_IMAGE_URL = `${ORIGIN}cafe-artesano-social.jpg`;
const FACEBOOK_URL = 'https://www.facebook.com/cafeartesanopalmichal';
const HREFLANGS = new Map([
  ['es-CR', ORIGIN],
  ['en', ENGLISH_URL],
  ['x-default', ORIGIN],
]);

function readText(relativePath: string): string {
  return readFileSync(resolve(relativePath), 'utf8');
}

function readBytes(relativePath: string): Uint8Array {
  return new Uint8Array(readFileSync(resolve(relativePath)));
}

function readIndexDocument(): Document {
  return new DOMParser().parseFromString(readText('src/index.html'), 'text/html');
}

function exactlyOneMeta(document: Document, attribute: 'name' | 'property', value: string): string {
  const tags = document.head.querySelectorAll<HTMLMetaElement>(`meta[${attribute}="${value}"]`);
  expect(tags).toHaveLength(1);
  return tags[0]?.getAttribute('content') ?? '';
}

function exactlyOneCanonical(document: Document): string {
  const tags = document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]');
  expect(tags).toHaveLength(1);
  return tags[0]?.getAttribute('href') ?? '';
}

function alternateLinks(document: Document): Map<string, string> {
  const links = Array.from(document.head.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]'));
  expect(links).toHaveLength(3);
  return new Map(links.map((link) => [link.hreflang, link.href]));
}

function readStructuredData(document: Document): StructuredData {
  const scripts = document.head.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"][data-seo-organization]');
  expect(scripts).toHaveLength(1);
  expect(document.head.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(1);
  return JSON.parse(scripts[0]?.textContent ?? '') as StructuredData;
}

function readJpegDimensions(bytes: Uint8Array): { width: number; height: number } {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new Error('Expected a JPEG SOI marker.');
  }

  let offset = 2;
  while (offset < bytes.length) {
    while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset++];
    if (marker === undefined || marker === 0xd9) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    const segmentLength = (bytes[offset] ?? 0) * 256 + (bytes[offset + 1] ?? 0);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) throw new Error('Invalid JPEG segment length.');
    const isStartOfFrame = (marker >= 0xc0 && marker <= 0xc3)
      || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf);
    if (isStartOfFrame) {
      return { height: (bytes[offset + 3] ?? 0) * 256 + (bytes[offset + 4] ?? 0), width: (bytes[offset + 5] ?? 0) * 256 + (bytes[offset + 6] ?? 0) };
    }
    offset += segmentLength;
  }
  throw new Error('JPEG start-of-frame marker not found.');
}

function writePublishedFixture(publishRoot: string, englishHtml: string): void {
  mkdirSync(resolve(publishRoot, 'en'), { recursive: true });
  writeFileSync(resolve(publishRoot, 'index.html'), readText('src/index.html').replace('<html lang="es">', '<html lang="es-CR">'), 'utf8');
  writeFileSync(resolve(publishRoot, 'en/index.html'), englishHtml, 'utf8');
  writeFileSync(resolve(publishRoot, 'cafe-artesano-ca-v1.svg'), readText('public/cafe-artesano-ca-v1.svg'), 'utf8');
  writeFileSync(resolve(publishRoot, 'sitemap.xml'), readText('public/sitemap.xml'), 'utf8');
  writeFileSync(resolve(publishRoot, 'robots.txt'), readText('public/robots.txt'), 'utf8');
}

function readNetlifyBuildSettings(toml: string): Record<string, string> {
  const settings: Record<string, string> = {};
  let inBuildSection = false;
  for (const rawLine of toml.split('\n')) {
    const line = rawLine.trim();
    if (line === '[build]') {
      inBuildSection = true;
      continue;
    }
    if (inBuildSection && line.startsWith('[')) break;
    const setting = inBuildSection ? line.match(/^(\w+)\s*=\s*"([^"]+)"$/) : null;
    if (setting?.[1] && setting[2]) settings[setting[1]] = setting[2];
  }
  return settings;
}

describe('static SEO and deployment artifacts', () => {
  it('keeps one complete Spanish source metadata set with exact locale alternates', () => {
    const document = readIndexDocument();
    expect(document.documentElement.lang).toBe('es');
    expect(document.head.querySelectorAll('title')).toHaveLength(1);
    expect(document.title).toBe('Café Artesano | Tueste natural en Palmichal de Acosta');
    expect(exactlyOneMeta(document, 'name', 'description')).toBe('Café Artesano: café de tueste natural de Palmichal de Acosta.');
    expect(exactlyOneCanonical(document)).toBe(ORIGIN);
    expect(alternateLinks(document)).toEqual(HREFLANGS);
    expect(exactlyOneMeta(document, 'property', 'og:locale')).toBe('es_CR');
    expect(exactlyOneMeta(document, 'property', 'og:locale:alternate')).toBe('en_US');
    expect(exactlyOneMeta(document, 'property', 'og:url')).toBe(ORIGIN);
    expect(exactlyOneMeta(document, 'property', 'og:image')).toBe(SOCIAL_IMAGE_URL);
    expect(exactlyOneMeta(document, 'property', 'og:image:width')).toBe('1200');
    expect(exactlyOneMeta(document, 'property', 'og:image:height')).toBe('630');
    expect(exactlyOneMeta(document, 'name', 'twitter:image')).toBe(SOCIAL_IMAGE_URL);
  });

  it('localizes a simulated English build deterministically and fails closed for missing or duplicate required fields', async () => {
    // @ts-expect-error The Node-only post-build script intentionally has no TypeScript declaration surface.
    const localizer = await import('../../scripts/localize-static-seo.mjs');
    const generatedEnglish = readText('src/index.html')
      .replace('<html lang="es">', '<html lang="en">')
      .replace('<base href="/">', '<base href="/en/">');
    const localized = localizer.localizeEnglishHtml(generatedEnglish);
    const duplicateCanonical = generatedEnglish.replace('</head>', '  <link rel="canonical" href="https://example.test/">\n</head>');
    const duplicateDescription = generatedEnglish.replace('</head>', '  <meta name="description" content="duplicate">\n</head>');

    expect(localized).toContain('<title>Café Artesano | Costa Rican coffee from Palmichal de Acosta</title>');
    expect(localized).toContain('Naturally roasted coffee from Palmichal de Acosta, Costa Rica.');
    expect(localized).toContain('Call 7160-6734');
    expect(localizer.localizeEnglishHtml(localized)).toBe(localized);
    expect(() => localizer.validateLocalizedHtml(localized, 'en')).not.toThrow();
    expect(() => localizer.localizeEnglishHtml('<html lang="en"><head></head></html>')).toThrow(/Static SEO validation failed/);
    expect(() => localizer.localizeEnglishHtml(duplicateCanonical)).toThrow(/expected exactly one canonical link/);
    expect(() => localizer.localizeEnglishHtml(duplicateDescription)).toThrow(/expected exactly one description meta/);
    expect(() => localizer.validateLocalizedHtml(localized.replace('og:locale" content="en_US"', 'og:locale" content="es_CR"'), 'en')).toThrow(/Static SEO validation failed/);
  });

  it('recognizes only canonical direct and symlinked localizer entrypoints', async () => {
    // @ts-expect-error The Node-only post-build script intentionally has no TypeScript declaration surface.
    const localizer = await import('../../scripts/localize-static-seo.mjs');
    const scriptPath = resolve('scripts/localize-static-seo.mjs');
    const scriptUrl = pathToFileURL(scriptPath);
    const symlinkRoot = mkdtempSync(resolve(tmpdir(), 'cafe-artesano-localizer-link-'));
    const symlinkPath = resolve(symlinkRoot, 'localize-static-seo.mjs');

    try {
      symlinkSync(scriptPath, symlinkPath);
      expect(localizer.isDirectExecution(undefined, scriptUrl)).toBe(false);
      expect(localizer.isDirectExecution(resolve(symlinkRoot, 'missing.mjs'), scriptUrl)).toBe(false);
      expect(localizer.isDirectExecution(resolve('src/index.html'), scriptUrl)).toBe(false);
      expect(localizer.isDirectExecution(scriptPath, scriptUrl)).toBe(true);
      expect(localizer.isDirectExecution(symlinkPath, scriptUrl)).toBe(true);
    } finally {
      rmSync(symlinkRoot, { force: true, recursive: true });
    }
  });

  it('keeps localizer checks read-only and writes only the English fixture', async () => {
    // @ts-expect-error The Node-only post-build script intentionally has no TypeScript declaration surface.
    const localizer = await import('../../scripts/localize-static-seo.mjs');
    const generatedEnglish = readText('src/index.html')
      .replace('<html lang="es">', '<html lang="en">')
      .replace('<base href="/">', '<base href="/en/">');
    const publishRoot = mkdtempSync(resolve(tmpdir(), 'cafe-artesano-seo-'));

    try {
      writePublishedFixture(publishRoot, generatedEnglish);
      const rootBefore = readBytes(`${publishRoot}/index.html`);
      const staticArtifactsBefore = [
        readBytes(`${publishRoot}/cafe-artesano-ca-v1.svg`), readBytes(`${publishRoot}/sitemap.xml`), readBytes(`${publishRoot}/robots.txt`),
      ];
      const result = await localizer.localizePublishedSeo(publishRoot);
      const localizedEnglish = readText(`${publishRoot}/en/index.html`);

      expect(result.wroteEnglish).toBe(true);
      expect(readBytes(`${publishRoot}/index.html`)).toEqual(rootBefore);
      expect(readBytes(`${publishRoot}/cafe-artesano-ca-v1.svg`)).toEqual(staticArtifactsBefore[0]);
      expect(readBytes(`${publishRoot}/sitemap.xml`)).toEqual(staticArtifactsBefore[1]);
      expect(readBytes(`${publishRoot}/robots.txt`)).toEqual(staticArtifactsBefore[2]);
      expect(localizedEnglish).toBe(localizer.localizeEnglishHtml(generatedEnglish));

      const checkedEnglish = readBytes(`${publishRoot}/en/index.html`);
      const checkResult = await localizer.localizePublishedSeo(publishRoot, { checkOnly: true });
      expect(checkResult.wroteEnglish).toBe(false);
      expect(readBytes(`${publishRoot}/index.html`)).toEqual(rootBefore);
      expect(readBytes(`${publishRoot}/en/index.html`)).toEqual(checkedEnglish);
    } finally {
      rmSync(publishRoot, { force: true, recursive: true });
    }
  });

  it('rejects legacy favicon candidates and references', async () => {
    // @ts-expect-error The Node-only post-build script intentionally has no TypeScript declaration surface.
    const localizer = await import('../../scripts/localize-static-seo.mjs');
    const legacyIco = ['favicon', 'ico'].join('.');
    const legacySvg = ['favicon', 'svg'].join('.');
    const legacyRelation = ['alternate', 'icon'].join(' ');
    const sourceReferences = [
      readText('src/index.html'), readText('src/app/app.html'), readText('scripts/localize-static-seo.mjs'),
      readText('src/app/seo.spec.ts'), readText('DESIGN.md'),
    ].join('\n');
    const publishRoot = mkdtempSync(resolve(tmpdir(), 'cafe-artesano-seo-'));

    expect(existsSync(`public/${legacyIco}`)).toBe(false);
    expect(existsSync(`public/${legacySvg}`)).toBe(false);
    expect(sourceReferences).not.toContain(legacyIco);
    expect(sourceReferences).not.toContain(legacySvg);
    expect(sourceReferences).not.toContain(legacyRelation);

    try {
      writePublishedFixture(publishRoot, localizer.localizeEnglishHtml(readText('src/index.html')
        .replace('<html lang="es">', '<html lang="en">')
        .replace('<base href="/">', '<base href="/en/">')));
      await expect(localizer.validateNoLegacyFaviconFiles(publishRoot)).resolves.toBeUndefined();
      expect(() => localizer.validateNoLegacyFaviconReferences(`<link rel="icon" href="/${legacyIco}">`)).toThrow(/legacy favicon reference/);
      expect(() => localizer.validateNoLegacyFaviconReferences(`<link rel="${legacyRelation}" href="/${legacySvg}">`)).toThrow(/legacy favicon reference/);
      writeFileSync(resolve(publishRoot, legacyIco), 'obsolete icon', 'utf8');
      await expect(localizer.validateNoLegacyFaviconFiles(publishRoot)).rejects.toThrow(/legacy favicon candidate/);
    } finally {
      rmSync(publishRoot, { force: true, recursive: true });
    }
  });

  it('keeps Organization identity claims stable while exposing the localizable description marker', () => {
    const structuredData = readStructuredData(readIndexDocument());
    expect(structuredData).toMatchObject({
      '@context': 'https://schema.org', '@type': 'Organization', '@id': `${ORIGIN}#organization`, name: 'Café Artesano',
      url: ORIGIN, telephone: '+50671606734', areaServed: { '@type': 'Country', name: 'Costa Rica' },
      logo: `${ORIGIN}logo.jpg`, sameAs: [FACEBOOK_URL], description: 'Café de tueste natural de Palmichal de Acosta, Costa Rica.',
    });
    expect(JSON.stringify(structuredData).toLowerCase()).not.toContain('instagram');
  });

  it('publishes bilingual sitemap alternates while robots continues to point to the root sitemap', () => {
    const robots = readText('public/robots.txt').trim().split('\n');
    const sitemap = new DOMParser().parseFromString(readText('public/sitemap.xml'), 'application/xml');
    const urls = Array.from(sitemap.getElementsByTagNameNS('http://www.sitemaps.org/schemas/sitemap/0.9', 'url'));
    expect(robots).toEqual(['User-agent: *', 'Allow: /', `Sitemap: ${ORIGIN}sitemap.xml`]);
    expect(sitemap.querySelector('parsererror')).toBeNull();
    expect(sitemap.documentElement.namespaceURI).toBe('http://www.sitemaps.org/schemas/sitemap/0.9');
    expect(sitemap.documentElement.getAttribute('xmlns:xhtml')).toBe('http://www.w3.org/1999/xhtml');
    expect(urls).toHaveLength(2);
    expect(urls.map((url) => url.getElementsByTagNameNS('http://www.sitemaps.org/schemas/sitemap/0.9', 'loc')[0]?.textContent)).toEqual([ORIGIN, ENGLISH_URL]);
    for (const url of urls) {
      const alternates = Array.from(url.getElementsByTagNameNS('http://www.w3.org/1999/xhtml', 'link'));
      expect(alternates).toHaveLength(3);
      expect(new Map(alternates.map((link) => [link.getAttribute('hreflang') ?? '', link.getAttribute('href') ?? '']))).toEqual(HREFLANGS);
    }
  });

  it('uses a versioned, path-only CA monogram favicon without stale references', () => {
    const favicon = readText('public/cafe-artesano-ca-v1.svg');
    const references = [readText('src/index.html'), readText('src/app/app.html'), readText('DESIGN.md'), readText('scripts/localize-static-seo.mjs')].join('\n');
    expect(favicon).toContain('viewBox="0 0 64 64"');
    expect(favicon).toContain('#f9f8f6');
    expect(favicon).toContain('#315534');
    expect(favicon).toContain('<path');
    expect(favicon).toContain('<rect');
    expect(favicon).not.toMatch(/<text\b|<image\b|(?:href|xlink:href)="https?:/);
    expect(references).toContain('/cafe-artesano-ca-v1.svg');
    expect(references).not.toContain(['favicon', 'svg'].join('.'));
    expect(readIndexDocument().head.querySelector('link[rel="icon"]')?.getAttribute('href')).toBe('/cafe-artesano-ca-v1.svg');
  });

  it('maps physical localized build artifacts to Netlify without a global SPA fallback', () => {
    const angular = JSON.parse(readText('angular.json')) as { projects: Record<string, { architect: { build: { options: { assets: Array<{ glob: string; input: string }> } } } }> };
    const buildSettings = readNetlifyBuildSettings(readText('../netlify.toml'));
    const packageScripts = JSON.parse(readText('package.json')) as { scripts: Record<string, string> };
    expect(angular.projects['cafe-artesano']?.architect.build.options.assets).toContainEqual({ glob: '**/*', input: 'public' });
    expect(buildSettings).toMatchObject({ base: 'cafe-artesano', command: 'npm run build', publish: 'dist/cafe-artesano/browser' });
    expect(readText('../netlify.toml')).not.toContain('from = "/*"');
    expect(packageScripts.scripts['build']).toBe('ng build && node scripts/localize-static-seo.mjs');
    expect(packageScripts.scripts['verify:locales']).toBe('node scripts/localize-static-seo.mjs --check');
  });

  it('keeps the published social image dimensions aligned with static metadata', () => {
    const document = readIndexDocument();
    expect(readJpegDimensions(readBytes('public/cafe-artesano-social.jpg'))).toEqual({ width: 1200, height: 630 });
    expect(exactlyOneMeta(document, 'property', 'og:image:type')).toBe('image/jpeg');
    expect(exactlyOneMeta(document, 'property', 'og:image:width')).toBe('1200');
    expect(exactlyOneMeta(document, 'property', 'og:image:height')).toBe('630');
  });
});
