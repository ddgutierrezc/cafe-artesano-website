import { Component, computed, input, output } from '@angular/core';
import { Theme } from '../theme/theme.model';

@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.html',
})
export class SiteHeader {
  readonly theme = input.required<Theme>();
  readonly themeToggle = output<void>();
  readonly themeToggleLabel = computed(() => this.theme() === 'dark'
    ? $localize`:@@theme-toggle-action-light:Activar tema claro (tema oscuro activo)`
    : $localize`:@@theme-toggle-action-dark:Activar tema oscuro (tema claro activo)`);
  readonly themeStatusLabel = computed(() => this.theme() === 'dark'
    ? $localize`:@@theme-status-dark:Tema oscuro activo.`
    : $localize`:@@theme-status-light:Tema claro activo.`);
}
