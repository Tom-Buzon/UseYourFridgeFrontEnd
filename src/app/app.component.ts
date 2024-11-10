
// src/app/app.component.ts
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

import { register } from 'swiper/element/bundle';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private storage: Storage,
    private translate: TranslateService
  ) {
    // Définir la langue par défaut
    this.translate.setDefaultLang('fr');
    this.initializeApp();

  }


  async initializeApp() {
    await this.platform.ready();
    await this.storage.create(); // Initialiser le Storage
   // document.body.classList.add('dark');
  }
}
