import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  function createPage(): HTMLElement {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('creates the Cafe Artesano landing page with one primary heading', () => {
    const page = createPage();

    expect(page.querySelector('h1')?.textContent).toContain('Café Artesano');
    expect(page.querySelectorAll('h1')).toHaveLength(1);
    expect(page.querySelector('main#contenido')).toBeTruthy();
  });

  it('provides skip navigation and landmark sections', () => {
    const page = createPage();

    expect(page.querySelector('a.skip-link')?.getAttribute('href')).toBe('#contenido');
    expect(page.querySelector('header nav[aria-label]')).toBeTruthy();
    expect(page.querySelector('#origen')).toBeTruthy();
    expect(page.querySelector('#proceso')).toBeTruthy();
    expect(page.querySelector('#calidad')).toBeTruthy();
    expect(page.querySelector('#contacto')).toBeTruthy();
    expect(page.querySelector('footer')).toBeTruthy();
  });

  it('exposes corrected Costa Rican contact details without the retired number', () => {
    const page = createPage();
    const phoneLinks = Array.from(page.querySelectorAll<HTMLAnchorElement>('a[href="tel:+50671606734"]'));

    expect(phoneLinks).toHaveLength(3);
    expect(phoneLinks.some((link) => link.textContent?.includes('Hablemos de café'))).toBe(true);
    expect(phoneLinks.some((link) => link.textContent?.includes('Llámenos'))).toBe(true);
    expect(phoneLinks.some((link) => link.textContent?.includes('7160-6734'))).toBe(true);

    const retiredDisplay = ['7160', '6164'].join('-');
    const retiredUri = `tel:+506${['7160', '6164'].join('')}`;

    expect(page.innerHTML).not.toContain(retiredDisplay);
    expect(page.innerHTML).not.toContain(retiredUri);
    expect(page.textContent).toContain('Palmichal de Acosta');
  });

  it('uses optimized static imagery with useful Spanish alternatives', () => {
    const page = createPage();
    const images = Array.from(page.querySelectorAll<HTMLImageElement>('img[ngsrc]'));

    expect(images).toHaveLength(3);
    expect(images.map((image) => image.getAttribute('ngsrc'))).toEqual([
      'logo.jpg',
      'banner_principal.jpg',
      'banner_secundario.jpg',
    ]);
    expect(images.every((image) => (image.alt?.length ?? 0) > 10)).toBe(true);
  });

  it('offers an accessible, user-controlled portrait video', () => {
    const page = createPage();
    const video = page.querySelector('video');

    expect(video?.hasAttribute('controls')).toBe(true);
    expect(video?.hasAttribute('playsinline')).toBe(true);
    expect(video?.getAttribute('preload')).toBe('metadata');
    expect(video?.hasAttribute('autoplay')).toBe(false);
    expect(video?.getAttribute('aria-describedby')).toBe('video-description');
    expect(page.querySelector('#video-description')?.textContent).toContain('Palmichal de Acosta');
  });
});
