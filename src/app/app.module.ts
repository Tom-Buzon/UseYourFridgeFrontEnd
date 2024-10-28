// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Importer les modules ngx-translate
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// Importer SharedModule et RecetteDetailsModalModule
import { SharedModule } from './shared/shared.module';
import { RecetteDetailsModalModule } from './recette-details-modal/recette-details-modal.module';
import { IonicStorageModule } from '@ionic/storage-angular';

// Fonction pour créer le TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicStorageModule.forRoot(),
    HttpClientModule, // Nécessaire pour ngx-translate
    IonicModule.forRoot(),
    AppRoutingModule,
    SharedModule,
    RecetteDetailsModalModule, // Importer le module du modal
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
