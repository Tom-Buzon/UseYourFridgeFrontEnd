// src/app/app.component.ts
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './services/language.service';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private storage: Storage,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {
    // Définir la langue par défaut
    this.translate.setDefaultLang('fr');
    this.initializeApp();

   // // Utiliser la langue préférée si définie, sinon la langue du navigateur
   // this.languageService.getPreferredLanguage().then(lang => {
   //   const browserLang = this.translate.getBrowserLang();
   //   const selectedLang = lang || (browserLang.match(/en|fr/) ? browserLang : 'fr');
   //   this.translate.use(selectedLang);
   //   this.languageService.setPreferredLanguage(selectedLang); // Assurez-vous que cela stocke la langue préférée
   // });
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    this.languageService.setPreferredLanguage(lang);
  }

  async initializeApp() {
    await this.platform.ready();
    await this.storage.create(); // Initialiser le Storage
    document.body.classList.add('dark');
  }
}
