import { Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { Router } from '@angular/router';
import { IonicSlides, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-auth-page',
  templateUrl: './first-time.page.html',
  styleUrls: ['./first-time.page.scss'],
})
export class FirsTimePage  {
  private swiperInstance: any;
  public swiperModules = [IonicSlides];
  constructor(private storage: Storage, private router: Router) {}

  @ViewChild('swiper')
  set swiper(swiperRef: ElementRef) {
    /**
     * This setTimeout waits for Ionic's async initialization to complete.
     * Otherwise, an outdated swiper reference will be used.
     */
    setTimeout(() => {
      this.swiperInstance = swiperRef.nativeElement.swiper;
    }, 0);
  }

  public slideWillChange() {
    console.log('Slide will change');
  }

  public slideDidChange() {
    console.log('Slide did change');

    if (!this.swiperInstance) return;

    console.table({
      isBeginning: this.swiperInstance.isBeginning,
      isEnd: this.swiperInstance.isEnd
    });
  }
   next() {
    console.log("clic");
   this.swiperInstance.slideNext();
  }

   back() {
    this.swiperInstance.slidePrev();
   }

   finish() {
     this.storage.set('tutorialComplete', true);
    this.router.navigateByUrl('/');
  }
}
