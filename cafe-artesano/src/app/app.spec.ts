interface FileSystem { readFileSync(path: string, encoding: 'utf8'): string; }
interface PathModule { resolve(...paths: string[]): string; }
declare function require(module: 'node:fs'): FileSystem;
declare function require(module: 'node:path'): PathModule;

const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

function readText(relativePath: string): string {
  return readFileSync(resolve(relativePath), 'utf8');
}

import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { App } from './app';

const THEME_STORAGE_KEY = 'cafe-artesano-theme';

describe('App', () => {
  let systemThemeListener: ((event: MediaQueryListEvent) => void) | undefined;
  let localStorageDescriptor: PropertyDescriptor | undefined;
  let matchMediaDescriptor: PropertyDescriptor | undefined;
  let originalThemeColorMeta: HTMLMetaElement | null;
  let originalThemeColorMetaParent: ParentNode | null;
  let originalThemeColorMetaNextSibling: ChildNode | null;
  let originalThemeColorContent: string | null;
  let originalTheme: string | undefined;
  let hadThemeAttribute: boolean;
  let originalColorScheme: string;
  let originalColorSchemePriority: string;
  let hadInlineColorScheme: boolean;
  let themeColorMeta: HTMLMetaElement;

  beforeEach(async () => {
    localStorageDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');
    matchMediaDescriptor = Object.getOwnPropertyDescriptor(window, 'matchMedia');
    originalThemeColorMeta = document.querySelector('meta[name="theme-color"]');
    originalThemeColorMetaParent = originalThemeColorMeta?.parentNode ?? null;
    originalThemeColorMetaNextSibling = originalThemeColorMeta?.nextSibling ?? null;
    originalThemeColorContent = originalThemeColorMeta?.getAttribute('content') ?? null;
    hadThemeAttribute = document.documentElement.hasAttribute('data-theme');
    originalTheme = document.documentElement.dataset['theme'];
    originalColorScheme = document.documentElement.style.getPropertyValue('color-scheme');
    originalColorSchemePriority = document.documentElement.style.getPropertyPriority('color-scheme');
    hadInlineColorScheme = originalColorScheme !== '' || originalColorSchemePriority !== '';
    themeColorMeta = originalThemeColorMeta ?? document.createElement('meta');
    themeColorMeta.setAttribute('name', 'theme-color');
    themeColorMeta.setAttribute('content', '#F7F8F3');
    if (!themeColorMeta.parentElement) document.head.appendChild(themeColorMeta);
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.removeProperty('color-scheme');
    setSystemTheme(false);
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
  });

  afterEach(() => {
    restoreDocumentState();
    vi.restoreAllMocks();
    restoreWindowProperty('localStorage', localStorageDescriptor);
    restoreWindowProperty('matchMedia', matchMediaDescriptor);
  });

  function restoreDocumentState(): void {
    if (originalThemeColorMeta) {
      if (originalThemeColorMetaParent && originalThemeColorMeta.parentNode !== originalThemeColorMetaParent) {
        const nextSibling = originalThemeColorMetaNextSibling?.parentNode === originalThemeColorMetaParent
          ? originalThemeColorMetaNextSibling
          : null;
        originalThemeColorMetaParent.insertBefore(originalThemeColorMeta, nextSibling);
      }
      if (originalThemeColorContent === null) {
        originalThemeColorMeta.removeAttribute('content');
      } else {
        originalThemeColorMeta.setAttribute('content', originalThemeColorContent);
      }
    } else {
      themeColorMeta.remove();
    }

    if (hadThemeAttribute) {
      document.documentElement.dataset['theme'] = originalTheme!;
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    if (hadInlineColorScheme) {
      document.documentElement.style.setProperty('color-scheme', originalColorScheme, originalColorSchemePriority);
    } else {
      document.documentElement.style.removeProperty('color-scheme');
    }
  }

  function restoreWindowProperty(name: keyof Window, descriptor: PropertyDescriptor | undefined): void {
    if (descriptor) {
      Object.defineProperty(window, name, descriptor);
    } else {
      delete (window as Partial<Window>)[name];
    }
  }

  function setSystemTheme(matches: boolean): void {
    systemThemeListener = undefined;
    const colorSchemeQuery = {
      matches,
      addEventListener: vi.fn((event: string, listener: (change: MediaQueryListEvent) => void) => {
        if (event === 'change') systemThemeListener = listener;
      }),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn((query: string) => query.includes('prefers-color-scheme') ? colorSchemeQuery : ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as MediaQueryList)),
    });
  }

  function createFixture() {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    return fixture;
  }

  it('composes only the document shell around the focused site components', () => {
    const page = createFixture().nativeElement as HTMLElement;

    expect(page.querySelector('a.skip-link')?.getAttribute('href')).toBe('#contenido');
    expect(page.querySelector('app-site-header')).toBeTruthy();
    expect(page.querySelector('app-landing-page main#contenido')).toBeTruthy();
    expect(page.querySelector('app-site-footer footer')).toBeTruthy();
  });

  it('keeps landing and header custom i18n IDs in their component templates', () => {
    const appTemplate = readText('src/app/app.html');
    const landingTemplate = readText('src/app/pages/landing/landing-page.html');
    const videoTemplate = readText('src/app/pages/landing/components/story-video/story-video.html');
    const headerTemplate = readText('src/app/shared/site-header/site-header.html');

    expect(appTemplate).toContain('i18n="@@skip-to-content"');
    expect(landingTemplate).toContain('i18n="@@hero-title"');
    expect(landingTemplate).toContain('i18n-aria-label="@@hero-whatsapp-action-label"');
    expect(videoTemplate).toContain('i18n="@@video-fallback"');
    expect(headerTemplate).toContain('i18n-href="@@locale-switch-href"');
  });

  it('keeps source and English catalogs complete, translated, and structurally aligned', () => {
    const parser = new DOMParser();
    const source = parser.parseFromString(readText('src/locale/messages.xlf'), 'application/xml');
    const english = parser.parseFromString(readText('src/locale/messages.en.xlf'), 'application/xml');
    const units = (catalog: XMLDocument) => Array.from(catalog.getElementsByTagName('unit'));
    const sourceUnits = units(source);
    const englishUnits = units(english);
    const sourceIds = sourceUnits.map((unit) => unit.getAttribute('id')).sort();
    const englishIds = englishUnits.map((unit) => unit.getAttribute('id')).sort();
    const duplicates = (ids: Array<string | null>) => ids.filter((id, index) => ids.indexOf(id) !== index);
    const placeholders = (unit: Element, tagName: 'source' | 'target') => Array
      .from(unit.getElementsByTagName(tagName)[0]?.getElementsByTagName('*') ?? [])
      .filter((element) => element.localName === 'pc' || element.localName === 'ph')
      .map((element) => `${element.localName}:${element.getAttribute('id')}`)
      .sort();
    const sourceById = new Map(sourceUnits.map((unit) => [unit.getAttribute('id'), unit]));
    const englishById = new Map(englishUnits.map((unit) => [unit.getAttribute('id'), unit]));

    expect(source.getElementsByTagName('parsererror')).toHaveLength(0);
    expect(english.getElementsByTagName('parsererror')).toHaveLength(0);
    expect(sourceUnits).toHaveLength(70);
    expect(duplicates(sourceIds)).toEqual([]);
    expect(duplicates(englishIds)).toEqual([]);
    expect(englishIds).toEqual(sourceIds);
    expect(englishUnits.every((unit) => (unit.getElementsByTagName('target')[0]?.textContent?.trim().length ?? 0) > 0)).toBe(true);
    expect(englishUnits.every((unit) => !Array
      .from(unit.getElementsByTagName('*'))
      .some((element) => element.getAttribute('state') === 'needs-translation'))).toBe(true);
    for (const [id, sourceUnit] of sourceById) {
      expect(placeholders(englishById.get(id)!, 'target')).toEqual(placeholders(sourceUnit, 'source'));
    }
  });

  it('keeps the approved natural English brand copy in the catalog', () => {
    const english = new DOMParser().parseFromString(readText('src/locale/messages.en.xlf'), 'application/xml');
    const targetsById = new Map(Array.from(english.getElementsByTagName('unit')).map((unit) => [
      unit.getAttribute('id'),
      unit.getElementsByTagName('target')[0]?.textContent?.trim(),
    ]));

    expect(Object.fromEntries(targetsById)).toMatchObject({
      'brand-home-link': 'Café Artesano, home',
      'hero-title': 'Café Artesano: an origin to savor in every cup.',
      'origin-story-first': 'We come from Palmichal de Acosta, a Costa Rican community where the mountains, climate, and coffee growers define our rhythm.',
      'process-step-three-title': 'Real connection',
      'quality-eyebrow': 'A well-crafted pause',
      'contact-title': 'From Palmichal de Acosta, let’s connect.',
      'header-whatsapp-action': 'Message us',
      'header-whatsapp-action-label': 'Message us on WhatsApp (opens in a new tab)',
      'hero-whatsapp-action': 'Message us',
      'hero-whatsapp-action-title': 'Message us on WhatsApp (opens in a new tab)',
      'contact-copy': 'To learn about Café Artesano or ask about availability, message us on WhatsApp. We will be glad to help.',
      'phone-label': 'Phone',
      'scroll-top-label': 'Back to top',
      'scroll-top-title': 'Back to top',
    });
  });

  it('renders complete localized WhatsApp actions with exact new-tab semantics', () => {
    const page = createFixture().nativeElement as HTMLElement;
    const whatsappLinks = Array.from(page.querySelectorAll<HTMLAnchorElement>('a[href="https://wa.me/50671606734"]'));
    const primaryActions = Array.from(page.querySelectorAll<HTMLAnchorElement>('a.cta-primary[href="https://wa.me/50671606734"]'));

    expect(whatsappLinks).toHaveLength(3);
    expect(primaryActions).toHaveLength(2);
    expect(whatsappLinks.map((link) => link.textContent?.trim())).toEqual(['Escríbenos', 'Escríbenos', 'WhatsApp']);
    expect(whatsappLinks.every((link) => link.target === '_blank' && link.rel === 'noopener')).toBe(true);
    expect(primaryActions.map((action) => [action.getAttribute('aria-label'), action.title])).toEqual([
      ['Escríbenos por WhatsApp (se abre en una pestaña nueva)', 'Escríbenos por WhatsApp (se abre en una pestaña nueva)'],
      ['Escríbenos por WhatsApp (se abre en una pestaña nueva)', 'Escríbenos por WhatsApp (se abre en una pestaña nueva)'],
    ]);
    expect(whatsappLinks[2]?.getAttribute('aria-label')).toBe('WhatsApp de Café Artesano (se abre en una pestaña nueva)');
  });

  it('initializes from stored theme before the system preference', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    setSystemTheme(true);
    createFixture();

    expect(document.documentElement.dataset['theme']).toBe('light');
    expect(themeColorMeta.content).toBe('#F7F8F3');
  });

  it('follows system changes until a manual choice is made', () => {
    setSystemTheme(true);
    const fixture = createFixture();
    const toggle = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button.theme-toggle');

    expect(document.documentElement.dataset['theme']).toBe('dark');
    systemThemeListener?.({ matches: false } as MediaQueryListEvent);
    expect(document.documentElement.dataset['theme']).toBe('light');

    toggle?.click();
    fixture.detectChanges();
    systemThemeListener?.({ matches: true } as MediaQueryListEvent);
    expect(document.documentElement.dataset['theme']).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('keeps a blocked-storage manual selection and removes its system listener on teardown', () => {
    setSystemTheme(true);
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get: () => { throw new DOMException('Storage is blocked', 'SecurityError'); },
    });
    const fixture = createFixture();
    const query = window.matchMedia('(prefers-color-scheme: dark)');

    fixture.componentInstance.toggleTheme();
    systemThemeListener?.({ matches: false } as MediaQueryListEvent);
    fixture.destroy();

    expect(document.documentElement.dataset['theme']).toBe('light');
    expect(query.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
