import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { LandingPage } from './pages/landing/landing-page';
import { SiteFooter } from './shared/site-footer/site-footer';
import { SiteHeader } from './shared/site-header/site-header';
import { Theme, THEME_COLORS, THEME_STORAGE_KEY } from './shared/theme/theme.model';

@Component({
  imports: [LandingPage, SiteFooter, SiteHeader],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  readonly theme = signal<Theme>('light');

  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private mediaQuery?: MediaQueryList;
  private mediaQueryListener?: (event: MediaQueryListEvent) => void;
  private hasSessionThemeOverride = false;

  constructor() {
    if (this.isBrowser) {
      this.initializeTheme();
      this.destroyRef.onDestroy(() => this.cleanupSystemThemeListener());
    }
  }

  private cleanupSystemThemeListener(): void {
    if (this.mediaQuery && this.mediaQueryListener) {
      this.mediaQuery.removeEventListener('change', this.mediaQueryListener);
    }
  }

  toggleTheme(): void {
    const nextTheme: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.hasSessionThemeOverride = true;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // A blocked storage area must not prevent a user from changing the page theme.
    }

    this.applyTheme(nextTheme);
  }

  private initializeTheme(): void {
    const storedTheme = this.readStoredTheme();
    this.applyTheme(storedTheme ?? this.getSystemTheme());

    if (storedTheme === null && typeof window.matchMedia === 'function') {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQueryListener = (event) => {
        if (!this.hasSessionThemeOverride && this.readStoredTheme() === null) {
          this.applyTheme(event.matches ? 'dark' : 'light');
        }
      };
      this.mediaQuery.addEventListener('change', this.mediaQueryListener);
    }
  }

  private getSystemTheme(): Theme {
    return typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  private readStoredTheme(): Theme | null {
    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : null;
    } catch {
      return null;
    }
  }

  private applyTheme(theme: Theme): void {
    this.theme.set(theme);
    this.document.documentElement.dataset['theme'] = theme;
    this.document.documentElement.style.colorScheme = theme;
    this.document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
  }
}
