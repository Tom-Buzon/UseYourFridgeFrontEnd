import { Component, ElementRef, ViewChild } from '@angular/core';
import {  Router } from '@angular/router';
import { AnimationController } from '@ionic/angular';
import { tabItemsList } from '../models/tabs';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  tab1Root = 'recettes';
  constructor(public animationCtrl: AnimationController,
    private router : Router) {}

  ionViewDidEnter() {
    document.querySelector('#tab-button-tab3')?.shadowRoot?.querySelector('.button-native')?.setAttribute('style', 'margin-top: -2px');
}

goToPictures(){
  this.router.navigate(["tabs/tab2"]);
}

@ViewChild('mainContent', { read: ElementRef }) mainContentRef?: ElementRef;
@ViewChild('menuToggleBtn', { read: ElementRef })
menuToggleBtnRef?: ElementRef;
@ViewChild('sideMenu', { read: ElementRef }) sideMenuRef?: ElementRef;
@ViewChild('bottomTabs', { read: ElementRef }) bottomTabRef?: ElementRef;
@ViewChild('onBoardingBtn', { read: ElementRef })
onBoardingBtnRef?: ElementRef;
@ViewChild('onBoarding', { read: ElementRef }) onBoardingRef?: ElementRef;
@ViewChild('tabWhiteBg', { read: ElementRef }) tabWhiteBgRef?: ElementRef;

selectedTab = tabItemsList[0];
isMenuOpen = true;
tabItems = tabItemsList;
showOnBoarding = false;
showRiveMenuBtn = false; // Temporary
avatarArr = [1, 2, 3];


ngOnInit(): void {
  // Temporary solution to fix the rive asset loading issue causing "Binding Error",
  // which fails for most if rendered together, so This will load them all with a delay,
  setTimeout(() => (this.showRiveMenuBtn = true), 1000);
}

showOnBoardingToggle() {
  this.showOnBoarding = !this.showOnBoarding;

  // calculated space based on screen scale (0.92) + 20px to show home behind modal
  const transformBottom = 'calc(((100vh - (100vh * 0.92)) / 2) + 20px)';
  const onBoardingAnim = this.animationCtrl
    .create()
    .addElement(this.onBoardingRef?.nativeElement)
    .fromTo(
      'transform',
      // Here 40px is extra shadow area to avoid it being shown when modal is closed
      `translateY(calc(-1 * (100vh + ${transformBottom} + 40px)))`,
      `translateY(calc(-1 * ${transformBottom}))`
    );

  const contentViewAnim = this.animationCtrl
    .create()
    .addElement(this.mainContentRef?.nativeElement)
    .fromTo('transform', 'none', 'scale(0.92)');

  const bottomTabAnim = this.animationCtrl
    .create()
    .addElement(this.bottomTabRef?.nativeElement)
    .fromTo('transform', 'none', 'translateY(200px)');

  const tabWhiteBgAnim = this.animationCtrl
    .create()
    .addElement(this.tabWhiteBgRef?.nativeElement)
    .fromTo('opacity', '1', '0');

  const allAnim = this.animationCtrl
    .create()
    .duration(500)
    .easing('ease-in-out')
    .addAnimation([
      onBoardingAnim,
      contentViewAnim,
      bottomTabAnim,
      tabWhiteBgAnim,
    ]);

  if (this.showOnBoarding) {
    allAnim.play();
  } else {
    allAnim.direction('reverse').play();
  }
}

}


