import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { NativeAudio } from '@capacitor-community/native-audio';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(public animationCtrl: AnimationController, private translate: TranslateService,
    private router: Router) {

    NativeAudio.preload({
      assetId: "fire",
      assetPath: "public/assets/sounds/click.mp3",
      audioChannelNum: 1,
      isUrl: false
    });

  }

  ionViewDidEnter() {
    document.querySelector('#tab-button-tab3')?.shadowRoot?.querySelector('.button-native')?.setAttribute('style', 'margin-top: -2px');
  }

  playAsset(){
    Haptics.impact({ style: ImpactStyle.Light });
    NativeAudio.play({
      assetId: 'fire',
    });
  }

  goToPictures() {
    Haptics.impact({ style: ImpactStyle.Light });
    NativeAudio.play({
      assetId: 'fire',
    });
    this.router.navigate(["tabs/tab1"]);
  }




}


