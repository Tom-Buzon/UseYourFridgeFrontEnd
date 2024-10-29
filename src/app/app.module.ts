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

import { FrigoDetailsPage } from './pages/frigo-details/frigo-details.page';

import { TypeaheadComponent } from './components/typeahead/typeahead.component';
import { AuthComponentComponent } from './components/auth-component/auth-component.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { authInterceptorProviders } from './helpers/auth.interceptor';
import { CommonModule } from '@angular/common';


import { BarcodeScanningModalComponent } from './components/barcode-scanning-modal/barcode-scanning-modal.component';
@NgModule({
  declarations: [AppComponent,FrigoDetailsPage,TypeaheadComponent,AuthComponentComponent,BarcodeScanningModalComponent],
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
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },authInterceptorProviders],
  bootstrap: [AppComponent],
})
export class AppModule {}
