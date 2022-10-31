import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { LocalizationService } from '@cg/ng-localization';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dianthus-web';

  constructor(
    private router: Router,
    private matIconRegistry: MatIconRegistry,
    private translate: LocalizationService,
    private domSanitizer: DomSanitizer
  ) {
    this.translate.setDefaultLang('zh-TW');
    this.matIconRegistry.addSvgIconInNamespace(
      'custom-svg',
      'search',
    this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/ic_search_24px.svg'));
    this.matIconRegistry.addSvgIconInNamespace(
      'custom-svg',
      'open',
    this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/ic_open_in_new_24px.svg'));
    this.matIconRegistry.addSvgIconInNamespace(
      'custom-svg',
      'retry',
    this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/ic_autorenew_24px.svg'));
    this.matIconRegistry.addSvgIconInNamespace(
      'custom-svg',
      'finish',
    this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/ic_finish.svg'));
  }
}
