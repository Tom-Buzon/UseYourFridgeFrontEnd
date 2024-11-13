
// src/app/app.component.ts
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { NavigationBar, NavigationBarPluginEvents } from '@hugotomazi/capacitor-navigation-bar';

import { register } from 'swiper/element/bundle';
import { StatusBar, Style } from '@capacitor/status-bar';
register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
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
    const hideStatusBar = async () => {
      await StatusBar.hide();
    };
    NavigationBar.hide();
    await this.storage.create(); // Initialiser le Storage
   // document.body.classList.add('dark');
  }
}
