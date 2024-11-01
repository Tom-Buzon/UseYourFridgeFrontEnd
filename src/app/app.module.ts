// src/app/app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';

// Importer les modules ngx-translate
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { RecetteDetailsModalModule } from './components/recette-details-modal/recette-details-modal.module';
import { IonicStorageModule } from '@ionic/storage-angular';

// Fonction pour créer le TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


import { TypeaheadComponent } from './components/typeahead/typeahead.component';
import { AuthComponentComponent } from './components/auth-component/auth-component.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { authInterceptorProviders } from './helpers/auth.interceptor';
import { CommonModule } from '@angular/common';

import { register } from 'swiper/element/bundle';

import { BarcodeScanningModalComponent } from './components/barcode-scanning-modal/barcode-scanning-modal.component';
import { FrigoListPage } from './pages/frigo-list/frigo-list.page';
import { HeaderComponent } from './components/header/header.component';

import { SharedModule } from './shared/shared.module';
import { HeaderModule } from './components/header/header.module';

register();

@NgModule({
  declarations: [AppComponent,FrigoListPage,TypeaheadComponent,AuthComponentComponent,BarcodeScanningModalComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    IonicStorageModule.forRoot(),
    SharedModule,
    HttpClientModule, // Nécessaire pour ngx-translate
    IonicModule.forRoot(),
    AppRoutingModule,
    RecetteDetailsModalModule, // Importer le module du modal
    HeaderModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },authInterceptorProviders],
  bootstrap: [AppComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  exports: [ TranslateModule]
})
export class AppModule {}
