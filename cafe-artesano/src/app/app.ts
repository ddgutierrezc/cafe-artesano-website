import { DOCUMENT, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, OnDestroy, PLATFORM_ID, signal } from '@angular/core';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'cafe-artesano-theme';
const THEME_COLORS: Record<Theme, string> = {
  light: '#F7F8F3',
  dark: '#17110D',
};

@Component({
  imports: [NgOptimizedImage],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnDestroy {
  readonly theme = signal<Theme>('light');
  readonly themeToggleLabel = computed(() => this.theme() === 'dark'
    ? 'Activar tema claro (tema oscuro activo)'
    : 'Activar tema oscuro (tema claro activo)');

  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private mediaQuery?: MediaQueryList;
  private mediaQueryListener?: (event: MediaQueryListEvent) => void;
  private hasSessionThemeOverride = false;

  constructor() {
    if (this.isBrowser) {
      this.initializeTheme();
    }
  }

  ngOnDestroy(): void {
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
