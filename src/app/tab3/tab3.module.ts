import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { Tab3Page } from './tab3.page';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Tab3PageRoutingModule } from './tab3-routing.module';
import { HeaderModule } from '../components/header-component/header.module';
import { TranslateModule } from '@ngx-translate/core';
import { LottieModule } from '../components/lottie-component/lottie.module';

export function provideSwal() {
  return import('sweetalert2').then(({ default: swal }) => swal.mixin({
      backdrop: false
  }));
}

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SweetAlert2Module.forChild({ provideSwal }),
    LottieModule,
    HeaderModule,
    TranslateModule,
    Tab3PageRoutingModule
  ],
  declarations: [Tab3Page],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Tab3PageModule {}
