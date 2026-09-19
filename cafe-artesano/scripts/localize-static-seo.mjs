import { realpathSync } from 'node:fs';
import { access, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

export const ORIGIN = 'https://cafeartesanocr.netlify.app/';
export const ENGLISH_URL = `${ORIGIN}en/`;
export const SOCIAL_IMAGE_URL = `${ORIGIN}cafe-artesano-social.jpg`;

const PUBLISH_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../dist/cafe-artesano/browser');
const LEGACY_FAVICON_NAMES = ['ico', 'svg'].map((extension) => `favicon.${extension}`);

const SPANISH = {
  locale: 'es_CR',
  localeAlternate: 'en_US',
  url: ORIGIN,
  title: 'Café Artesano | Tueste natural en Palmichal de Acosta',
  description: 'Café Artesano: café de tueste natural de Palmichal de Acosta.',
  imageAlt: 'Cerezas maduras de café en la planta',
  organizationDescription: 'Café de tueste natural de Palmichal de Acosta, Costa Rica.',
  noscript: [
    'Café de altura · Costa Rica',
    'Café Artesano',
    'Café de tueste natural de Palmichal de Acosta, Costa Rica.',
    'Teléfono: 7160-6734',
    'Escríbanos por WhatsApp',
  ],
};

const ENGLISH = {
  locale: 'en_US',
  localeAlternate: 'es_CR',
  url: ENGLISH_URL,
  title: 'Café Artesano | Costa Rican coffee from Palmichal de Acosta',
  description: 'Café Artesano is naturally roasted coffee from Palmichal de Acosta, Costa Rica.',
  imageAlt: 'Ripe coffee cherries on the plant',
  organizationDescription: 'Naturally roasted coffee from Palmichal de Acosta, Costa Rica.',
  noscript: [
    'Coffee from Costa Rica',
    'Café Artesano',
    'Naturally roasted coffee from Palmichal de Acosta, Costa Rica.',
    'Phone: 7160-6734',
    'Message us on WhatsApp',
  ],
};

const HREFLANG_LINKS = [
  ['es-CR', ORIGIN],
  ['en', ENGLISH_URL],
  ['x-default', ORIGIN],
];

function fail(message) {
  throw new Error(`Static SEO validation failed: ${message}`);
}

function attributes(tag) {
  return Object.fromEntries(Array.from(tag.matchAll(/([:\w-]+)="([^"]*)"/g), ([, name, value]) => [name, value]));
}

function tags(html, name) {
  return Array.from(html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi')), (match) => ({
    text: match[0],
    index: match.index ?? -1,
    attributes: attributes(match[0]),
  }));
}

function exactlyOne(items, label) {
  if (items.length !== 1) {
    fail(`expected exactly one ${label}, found ${items.length}`);
  }
  return items[0];
}

function replaceExactlyOneTag(html, name, predicate, update, label) {
  const match = exactlyOne(tags(html, name).filter(predicate), label);
  return `${html.slice(0, match.index)}${update(match.text)}${html.slice(match.index + match.text.length)}`;
}

function setAttribute(tag, name, value) {
  const pattern = new RegExp(`(${name.replace(':', '\\:')}=")[^"]*(")`);
  if (!pattern.test(tag)) {
    fail(`missing ${name} attribute`);
  }
  return tag.replace(pattern, `$1${value}$2`);
}

function replaceTitle(html, title) {
  const matches = Array.from(html.matchAll(/<title>([\s\S]*?)<\/title>/gi));
  const match = exactlyOne(matches, 'title');
  return `${html.slice(0, match.index)}<title>${title}</title>${html.slice((match.index ?? 0) + match[0].length)}`;
}

function replaceMarkedBlock(html, marker, replacement, label) {
  const pattern = new RegExp(`<${marker}\\b(?=[^>]*\\bdata-seo-noscript\\b)[^>]*>[\\s\\S]*?<\\/${marker}>`, 'gi');
  const matches = Array.from(html.matchAll(pattern));
  const match = exactlyOne(matches, label);
  return `${html.slice(0, match.index)}${replacement}${html.slice((match.index ?? 0) + match[0].length)}`;
}

function replaceOrganization(html, description) {
  const pattern = /<script\b(?=[^>]*\btype="application\/ld\+json")(?=[^>]*\bdata-seo-organization\b)[^>]*>([\s\S]*?)<\/script>/gi;
  const matches = Array.from(html.matchAll(pattern));
  const match = exactlyOne(matches, 'marked Organization JSON-LD script');
  let organization;
  try {
    organization = JSON.parse(match[1]);
  } catch {
    fail('marked Organization JSON-LD is invalid JSON');
  }
  organization.description = description;
  const replacement = `<script type="application/ld+json" data-seo-organization>\n    ${JSON.stringify(organization, null, 2).replace(/\n/g, '\n    ')}\n  </script>`;
  return `${html.slice(0, match.index)}${replacement}${html.slice((match.index ?? 0) + match[0].length)}`;
}

function englishNoscript() {
  return `<noscript data-seo-noscript>\n    <main class="noscript-fallback" aria-labelledby="noscript-title">\n      <section>\n        <p class="noscript-fallback__eyebrow">Coffee from Costa Rica</p>\n        <h1 id="noscript-title">Café Artesano</h1>\n        <p>Naturally roasted coffee from Palmichal de Acosta, Costa Rica.</p>\n        <p>Phone: 7160-6734</p>\n        <p><a href="https://wa.me/50671606734" target="_blank" rel="noopener" aria-label="Message us on WhatsApp (opens in a new tab)" title="Message us on WhatsApp (opens in a new tab)">Message us on WhatsApp</a> to ask about availability.</p>\n        <p class="noscript-fallback__note">Interactive content and animations require JavaScript; this essential information remains available.</p>\n      </section>\n    </main>\n  </noscript>`;
}

export function localizeEnglishHtml(html) {
  let localized = replaceTitle(html, ENGLISH.title);
  localized = replaceExactlyOneTag(
    localized,
    'link',
    (tag) => tag.attributes.rel === 'canonical',
    (tag) => setAttribute(tag, 'href', ENGLISH.url),
    'canonical link',
  );
  localized = replaceExactlyOneTag(
    localized,
    'meta',
    (tag) => tag.attributes.name === 'description',
    (tag) => setAttribute(tag, 'content', ENGLISH.description),
    'description meta',
  );
  for (const [property, content] of [
    ['og:locale', ENGLISH.locale],
    ['og:locale:alternate', ENGLISH.localeAlternate],
    ['og:title', ENGLISH.title],
    ['og:description', ENGLISH.description],
    ['og:url', ENGLISH.url],
    ['og:image:alt', ENGLISH.imageAlt],
  ]) {
    localized = replaceExactlyOneTag(
      localized,
      'meta',
      (tag) => tag.attributes.property === property,
      (tag) => setAttribute(tag, 'content', content),
      `${property} meta`,
    );
  }
  for (const [name, content] of [
    ['twitter:title', ENGLISH.title],
    ['twitter:description', ENGLISH.description],
    ['twitter:image:alt', ENGLISH.imageAlt],
  ]) {
    localized = replaceExactlyOneTag(
      localized,
      'meta',
      (tag) => tag.attributes.name === name,
      (tag) => setAttribute(tag, 'content', content),
      `${name} meta`,
    );
  }
  localized = replaceOrganization(localized, ENGLISH.organizationDescription);
  return replaceMarkedBlock(localized, 'noscript', englishNoscript(), 'marked noscript fallback');
}

function valueOfExactlyOneTag(html, name, selector, attribute, label) {
  const tag = exactlyOne(tags(html, name).filter(selector), label);
  const value = tag.attributes[attribute];
  if (value === undefined) {
    fail(`${label} has no ${attribute} attribute`);
  }
  return value;
}

function validateOrganization(html, expected) {
  const scripts = Array.from(html.matchAll(/<script\b(?=[^>]*\btype="application\/ld\+json")(?=[^>]*\bdata-seo-organization\b)[^>]*>([\s\S]*?)<\/script>/gi));
  const script = exactlyOne(scripts, 'marked Organization JSON-LD script');
  let organization;
  try {
    organization = JSON.parse(script[1]);
  } catch {
    fail('marked Organization JSON-LD is invalid JSON');
  }
  if (organization['@type'] !== 'Organization' || organization['@id'] !== `${ORIGIN}#organization`
    || organization.url !== ORIGIN || organization.telephone !== '+50671606734'
    || organization.logo !== `${ORIGIN}logo.jpg`
    || JSON.stringify(organization.sameAs) !== JSON.stringify(['https://www.facebook.com/cafeartesanopalmichal'])
    || organization.description !== expected.organizationDescription) {
    fail('Organization identity or localized description is incorrect');
  }
}

export function validateLocalizedHtml(html, locale) {
  const expected = locale === 'en' ? ENGLISH : locale === 'es-CR' ? SPANISH : null;
  if (!expected) {
    fail(`unsupported locale ${locale}`);
  }

  const htmlTag = exactlyOne(tags(html, 'html'), 'html element');
  if (htmlTag.attributes.lang !== locale) {
    fail(`expected html lang ${locale}, found ${htmlTag.attributes.lang ?? 'none'}`);
  }
  const expectedBase = locale === 'en' ? '/en/' : '/';
  if (valueOfExactlyOneTag(html, 'base', () => true, 'href', 'base href') !== expectedBase) {
    fail(`expected base href ${expectedBase}`);
  }
  const title = exactlyOne(Array.from(html.matchAll(/<title>([\s\S]*?)<\/title>/gi)), 'title')[1];
  if (title !== expected.title) {
    fail(`expected title ${expected.title}`);
  }
  if (valueOfExactlyOneTag(html, 'meta', (tag) => tag.attributes.name === 'description', 'content', 'description meta') !== expected.description
    || valueOfExactlyOneTag(html, 'link', (tag) => tag.attributes.rel === 'canonical', 'href', 'canonical link') !== expected.url) {
    fail('canonical or description does not match its locale');
  }

  const alternateLinks = tags(html, 'link').filter((tag) => tag.attributes.rel === 'alternate' && tag.attributes.hreflang);
  if (alternateLinks.length !== HREFLANG_LINKS.length) {
    fail(`expected ${HREFLANG_LINKS.length} hreflang links, found ${alternateLinks.length}`);
  }
  for (const [hreflang, href] of HREFLANG_LINKS) {
    const link = exactlyOne(alternateLinks.filter((tag) => tag.attributes.hreflang === hreflang), `hreflang ${hreflang}`);
    if (link.attributes.href !== href) {
      fail(`hreflang ${hreflang} has wrong URL`);
    }
  }

  for (const [property, content] of [
    ['og:locale', expected.locale],
    ['og:locale:alternate', expected.localeAlternate],
    ['og:title', expected.title],
    ['og:description', expected.description],
    ['og:url', expected.url],
    ['og:image', SOCIAL_IMAGE_URL],
    ['og:image:type', 'image/jpeg'],
    ['og:image:width', '1200'],
    ['og:image:height', '630'],
    ['og:image:alt', expected.imageAlt],
  ]) {
    if (valueOfExactlyOneTag(html, 'meta', (tag) => tag.attributes.property === property, 'content', `${property} meta`) !== content) {
      fail(`${property} does not match its locale`);
    }
  }
  for (const [name, content] of [
    ['twitter:title', expected.title],
    ['twitter:description', expected.description],
    ['twitter:image', SOCIAL_IMAGE_URL],
    ['twitter:image:alt', expected.imageAlt],
  ]) {
    if (valueOfExactlyOneTag(html, 'meta', (tag) => tag.attributes.name === name, 'content', `${name} meta`) !== content) {
      fail(`${name} does not match its locale`);
    }
  }
  if (valueOfExactlyOneTag(html, 'link', (tag) => tag.attributes.rel === 'icon' && tag.attributes.type === 'image/svg+xml', 'href', 'SVG favicon link') !== '/cafe-artesano-ca-v1.svg') {
    fail('SVG favicon does not use the versioned absolute asset URL');
  }
  const noscript = exactlyOne(Array.from(html.matchAll(/<noscript\b(?=[^>]*\bdata-seo-noscript\b)[^>]*>([\s\S]*?)<\/noscript>/gi)), 'marked noscript fallback')[1];
  for (const phrase of expected.noscript) {
    if (!noscript.includes(phrase)) {
      fail(`noscript fallback lacks ${phrase}`);
    }
  }
  validateOrganization(html, expected);
}

export function validateNoLegacyFaviconReferences(html) {
  if (LEGACY_FAVICON_NAMES.some((name) => html.includes(name))
    || tags(html, 'link').some((tag) => tag.attributes.rel === ['alternate', 'icon'].join(' '))) {
    fail('legacy favicon reference detected');
  }
}

export async function validateNoLegacyFaviconFiles(publishRoot) {
  const publishedLegacyCandidates = await Promise.all(LEGACY_FAVICON_NAMES.map(async (name) => {
    try {
      await access(resolve(publishRoot, name));
      return name;
    } catch (error) {
      if (error?.code === 'ENOENT') return null;
      throw error;
    }
  }));
  if (publishedLegacyCandidates.some(Boolean)) {
    fail('legacy favicon candidate is published');
  }
}

function validatePublishedDiscoveryArtifacts(favicon, sitemap, robots) {
  if (!favicon.includes('viewBox="0 0 64 64"') || !favicon.includes('<path') || !favicon.includes('<rect')
    || /<text\b|<image\b|(?:href|xlink:href)="https?:/.test(favicon)) {
    fail('published CA favicon is missing, not path-based, or references external content');
  }
  if (!sitemap.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
    || (sitemap.match(/<loc>/g) ?? []).length !== 2) {
    fail('published sitemap is not bilingual XHTML discovery output');
  }
  for (const [hreflang, href] of HREFLANG_LINKS) {
    const expectedLink = `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}"/>`;
    if ((sitemap.match(new RegExp(expectedLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length !== 2) {
      fail(`published sitemap does not contain both ${hreflang} alternates`);
    }
  }
  if (robots.trim() !== `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}sitemap.xml`) {
    fail('published robots.txt does not point to the root sitemap');
  }
}

export function publishedPaths(publishRoot) {
  return {
    rootIndex: resolve(publishRoot, 'index.html'),
    englishIndex: resolve(publishRoot, 'en/index.html'),
    favicon: resolve(publishRoot, 'cafe-artesano-ca-v1.svg'),
    sitemap: resolve(publishRoot, 'sitemap.xml'),
    robots: resolve(publishRoot, 'robots.txt'),
  };
}

export async function localizePublishedSeo(publishRoot = PUBLISH_ROOT, { checkOnly = false } = {}) {
  const paths = publishedPaths(publishRoot);
  const [rootHtml, englishHtml, favicon, sitemap, robots] = await Promise.all([
    readFile(paths.rootIndex, 'utf8'),
    readFile(paths.englishIndex, 'utf8'),
    readFile(paths.favicon, 'utf8'),
    readFile(paths.sitemap, 'utf8'),
    readFile(paths.robots, 'utf8'),
  ]);
  await validateNoLegacyFaviconFiles(publishRoot);
  validateNoLegacyFaviconReferences(rootHtml);
  validateNoLegacyFaviconReferences(englishHtml);
  const localizedEnglish = localizeEnglishHtml(englishHtml);
  const wroteEnglish = !checkOnly && localizedEnglish !== englishHtml;
  if (wroteEnglish) {
    await writeFile(paths.englishIndex, localizedEnglish, 'utf8');
  }
  validateLocalizedHtml(rootHtml, 'es-CR');
  validateLocalizedHtml(checkOnly ? englishHtml : localizedEnglish, 'en');
  validatePublishedDiscoveryArtifacts(favicon, sitemap, robots);
  return { localizedEnglish, wroteEnglish };
}

export function isDirectExecution(argvPath, moduleUrl) {
  if (!argvPath) return false;
  try {
    return realpathSync(argvPath) === realpathSync(fileURLToPath(moduleUrl));
  } catch {
    return false;
  }
}

async function main() {
  const argumentsAfterScript = process.argv.slice(2);
  const checkOnly = argumentsAfterScript.length === 1 && argumentsAfterScript[0] === '--check';
  if (argumentsAfterScript.length > 1 || (argumentsAfterScript.length === 1 && !checkOnly)) {
    fail('only --check is supported');
  }
  await localizePublishedSeo(PUBLISH_ROOT, { checkOnly });
  console.log(`Validated localized static SEO and discovery artifacts (${checkOnly ? 'check' : 'localized'} mode).`);
}

if (isDirectExecution(process.argv[1], import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
