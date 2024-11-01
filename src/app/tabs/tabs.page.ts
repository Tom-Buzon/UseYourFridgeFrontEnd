import { Component, ElementRef, ViewChild } from '@angular/core';
import {  Router } from '@angular/router';
import { AnimationController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(public animationCtrl: AnimationController, private translate: TranslateService,
    private router : Router) {

      
    }

  ionViewDidEnter() {
    document.querySelector('#tab-button-tab3')?.shadowRoot?.querySelector('.button-native')?.setAttribute('style', 'margin-top: -2px');
}

goToPictures(){
  this.router.navigate(["tabs/tab2"]);
}




}


