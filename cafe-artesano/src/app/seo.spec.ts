interface FileSystem {
  readFileSync(path: string, encoding: 'utf8'): string;
  readFileSync(path: string): Uint8Array;
}

interface PathModule {
  resolve(...paths: string[]): string;
}

declare function require(module: 'node:fs'): FileSystem;
declare function require(module: 'node:path'): PathModule;

const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

type StructuredData = Record<string, unknown>;

const ORIGIN = 'https://cafeartesanocr.netlify.app/';
const SOCIAL_IMAGE_URL = `${ORIGIN}cafe-artesano-social.jpg`;
const FACEBOOK_URL = 'https://www.facebook.com/cafeartesanopalmichal';

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

  const content = tags[0]?.getAttribute('content');
  expect(content).not.toBeNull();
  return content!;
}

function exactlyOneCanonical(document: Document): string {
  const tags = document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]');
  expect(tags).toHaveLength(1);

  const href = tags[0]?.getAttribute('href');
  expect(href).not.toBeNull();
  return href!;
}

function readStructuredData(document: Document): StructuredData {
  const scripts = document.head.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]');
  expect(scripts).toHaveLength(1);
  return JSON.parse(scripts[0]?.textContent ?? '') as StructuredData;
}

function readJpegDimensions(bytes: Uint8Array): { width: number; height: number } {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new Error('Expected a JPEG SOI marker.');
  }

  let offset = 2;
  while (offset < bytes.length) {
    while (offset < bytes.length && bytes[offset] === 0xff) {
      offset += 1;
    }
    const marker = bytes[offset++];
    if (marker === undefined || marker === 0xd9) {
      break;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      continue;
    }

    const segmentLength = (bytes[offset] ?? 0) * 256 + (bytes[offset + 1] ?? 0);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) {
      throw new Error('Invalid JPEG segment length.');
    }

    const isStartOfFrame = (marker >= 0xc0 && marker <= 0xc3)
      || (marker >= 0xc5 && marker <= 0xc7)
      || (marker >= 0xc9 && marker <= 0xcb)
      || (marker >= 0xcd && marker <= 0xcf);
    if (isStartOfFrame) {
      return {
        height: (bytes[offset + 3] ?? 0) * 256 + (bytes[offset + 4] ?? 0),
        width: (bytes[offset + 5] ?? 0) * 256 + (bytes[offset + 6] ?? 0),
      };
    }

    offset += segmentLength;
  }

  throw new Error('JPEG start-of-frame marker not found.');
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
    if (inBuildSection && line.startsWith('[')) {
      break;
    }
    const setting = inBuildSection ? line.match(/^(\w+)\s*=\s*"([^"]+)"$/) : null;
    if (setting?.[1] && setting[2]) {
      settings[setting[1]] = setting[2];
    }
  }

  return settings;
}

describe('static SEO and discovery artifacts', () => {
  it('declares exactly one complete canonical, Open Graph, and X/Twitter metadata set', () => {
    const document = readIndexDocument();
    const titles = document.head.querySelectorAll('title');

    expect(document.documentElement.lang).toBe('es');
    expect(titles).toHaveLength(1);
    expect(titles[0]?.textContent).toBe('Café Artesano | Tueste natural en Palmichal de Acosta');
    expect(exactlyOneMeta(document, 'name', 'description')).toBe('Café Artesano: café de tueste natural de Palmichal de Acosta.');
    expect(exactlyOneCanonical(document)).toBe(ORIGIN);
    expect(exactlyOneMeta(document, 'name', 'robots')).toBe('index,follow,max-image-preview:large');

    const openGraph = {
      'og:locale': 'es_CR',
      'og:site_name': 'Café Artesano',
      'og:title': 'Café Artesano | Tueste natural en Palmichal de Acosta',
      'og:description': 'Café Artesano: café de tueste natural de Palmichal de Acosta.',
      'og:url': ORIGIN,
      'og:image': SOCIAL_IMAGE_URL,
      'og:image:type': 'image/jpeg',
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:alt': 'Cerezas maduras de café en la planta',
      'og:type': 'website',
    };
    for (const [property, content] of Object.entries(openGraph)) {
      expect(exactlyOneMeta(document, 'property', property)).toBe(content);
    }

    const twitter = {
      'twitter:card': 'summary_large_image',
      'twitter:title': openGraph['og:title'],
      'twitter:description': openGraph['og:description'],
      'twitter:image': SOCIAL_IMAGE_URL,
      'twitter:image:alt': openGraph['og:image:alt'],
    };
    for (const [name, content] of Object.entries(twitter)) {
      expect(exactlyOneMeta(document, 'name', name)).toBe(content);
    }
    expect(document.head.querySelector('meta[name="twitter:site"], meta[name="twitter:creator"]')).toBeNull();
  });

  it('keeps every first-party absolute SEO URL on the temporary canonical origin', () => {
    const document = readIndexDocument();
    const structuredData = readStructuredData(document);
    const urls = [
      exactlyOneCanonical(document),
      exactlyOneMeta(document, 'property', 'og:url'),
      exactlyOneMeta(document, 'property', 'og:image'),
      exactlyOneMeta(document, 'name', 'twitter:image'),
      structuredData['@id'],
      structuredData['url'],
      structuredData['logo'],
    ];

    expect(urls).toEqual([
      ORIGIN,
      ORIGIN,
      SOCIAL_IMAGE_URL,
      SOCIAL_IMAGE_URL,
      `${ORIGIN}#organization`,
      ORIGIN,
      `${ORIGIN}logo.jpg`,
    ]);
    for (const url of urls) {
      expect(new URL(String(url)).origin).toBe(new URL(ORIGIN).origin);
    }
  });

  it('publishes only the supported Organization identity claims', () => {
    const structuredData = readStructuredData(readIndexDocument());
    const serialized = JSON.stringify(structuredData).toLowerCase();

    expect(structuredData).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${ORIGIN}#organization`,
      name: 'Café Artesano',
      url: ORIGIN,
      telephone: '+50671606734',
      areaServed: { '@type': 'Country', name: 'Costa Rica' },
      logo: `${ORIGIN}logo.jpg`,
      sameAs: [FACEBOOK_URL],
    });
    expect(structuredData['sameAs']).toEqual([FACEBOOK_URL]);
    for (const unsupportedClaim of [
      'address', 'openingHours', 'aggregateRating', 'rating', 'review', 'offers', 'offer', 'price', 'priceRange',
    ]) {
      expect(structuredData).not.toHaveProperty(unsupportedClaim);
    }
    for (const unsupportedIdentity of ['cafeorcoffeeshop', 'localbusiness', 'instagram', 'twitter.com', 'x.com']) {
      expect(serialized).not.toContain(unsupportedIdentity);
    }
  });

  it('keeps robots and sitemap discovery limited to the canonical root', () => {
    const robots = readText('public/robots.txt').trim().split('\n');
    const sitemap = new DOMParser().parseFromString(readText('public/sitemap.xml'), 'application/xml');
    const urls = Array.from(sitemap.querySelectorAll('url'));

    expect(robots).toEqual([
      'User-agent: *',
      'Allow: /',
      `Sitemap: ${ORIGIN}sitemap.xml`,
    ]);
    expect(sitemap.querySelector('parsererror')).toBeNull();
    expect(sitemap.documentElement.namespaceURI).toBe('http://www.sitemaps.org/schemas/sitemap/0.9');
    expect(urls).toHaveLength(1);
    expect(urls[0]?.querySelector('loc')?.textContent).toBe(ORIGIN);
    expect(urls[0]?.querySelectorAll('lastmod, changefreq, priority')).toHaveLength(0);
    expect(new URL(urls[0]?.querySelector('loc')?.textContent ?? '').hash).toBe('');
  });

  it('stores a nonempty 1200 by 630 JPEG social image that matches metadata', () => {
    const image = readBytes('public/cafe-artesano-social.jpg');
    const document = readIndexDocument();

    expect(image.byteLength).toBeGreaterThan(0);
    expect(image[0]).toBe(0xff);
    expect(image[1]).toBe(0xd8);
    expect(readJpegDimensions(image)).toEqual({ width: 1200, height: 630 });
    expect(exactlyOneMeta(document, 'property', 'og:image:type')).toBe('image/jpeg');
    expect(exactlyOneMeta(document, 'property', 'og:image:width')).toBe('1200');
    expect(exactlyOneMeta(document, 'property', 'og:image:height')).toBe('630');
  });

  it('maps public SEO assets to the Netlify publish directory', () => {
    const angular = JSON.parse(readText('angular.json')) as {
      projects: Record<string, { architect: { build: { options: { assets: Array<{ glob: string; input: string }> } } } }>;
    };
    const buildSettings = readNetlifyBuildSettings(readText('../netlify.toml'));
    const assets = angular.projects['cafe-artesano']?.architect.build.options.assets;

    expect(assets).toContainEqual({ glob: '**/*', input: 'public' });
    expect(buildSettings).toMatchObject({
      base: 'cafe-artesano',
      command: 'npm run build',
      publish: 'dist/cafe-artesano/browser',
    });
    expect(resolve('..', buildSettings['base'] ?? '', buildSettings['publish'] ?? '')).toBe(
      resolve('dist/cafe-artesano/browser'),
    );
  });
});
