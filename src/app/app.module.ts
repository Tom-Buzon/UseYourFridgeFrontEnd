import { NgModule , CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { RecetteDetailsModalComponent } from './recette-details-modal/recette-details-modal.component'; // Vérifiez le chemin
import { RecetteDetailsModalModule } from './recette-details-modal/recette-details-modal.module'; // Importez le module si dédié



@NgModule({
  declarations: [AppComponent],
 // entryComponents: [], // Angular 9+ n'a généralement plus besoin de cela
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    RecetteDetailsModalModule, // Importez le module du modal
    HttpClientModule // 
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}