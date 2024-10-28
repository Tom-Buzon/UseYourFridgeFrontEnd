// src/app/services/language.service.ts
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private STORAGE_KEY = 'preferred_language';
  private languageSubject: BehaviorSubject<string> = new BehaviorSubject<string>('fr');

  constructor(private storage: Storage, private translate: TranslateService) {}

  async setPreferredLanguage(lang: string) {
    await this.storage.set(this.STORAGE_KEY, lang);
    this.translate.use(lang);
    this.languageSubject.next(lang); // Émettre le changement de langue
  }

  async getPreferredLanguage(): Promise<string | null> {
    const lang = await this.storage.get(this.STORAGE_KEY);
    if (lang) {
      this.translate.use(lang);
      this.languageSubject.next(lang);
    } else {
      const defaultLang = 'fr';
      this.translate.use(defaultLang);
      await this.storage.set(this.STORAGE_KEY, defaultLang);
      this.languageSubject.next(defaultLang);
    }
    return lang;
  }

  getLanguageObservable() {
    return this.languageSubject.asObservable();
  }
}
