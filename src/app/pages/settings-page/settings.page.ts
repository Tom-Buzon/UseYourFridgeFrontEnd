import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { AuthService } from 'src/app/services/auth.service';
import { ToastController } from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { NativeAudio } from '@capacitor-community/native-audio';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingstPage implements OnInit {

  isLoggedIn = false;
  user: any;


  constructor(
    private http: HttpClient,
    private renderer: Renderer2,
    private router: Router,
    private toastCtrl: ToastController,
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private route: ActivatedRoute
  ) {

    NativeAudio.preload({
      assetId: "success",
      assetPath: "public/assets/sounds/success.mp3",
      audioChannelNum: 1,
      isUrl: false
    });

    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.user = this.tokenStorage.getUser();
    }

  }



  ngOnInit(): void {

  }
  async signOut() {
    Haptics.impact({ style: ImpactStyle.Light });
    NativeAudio.play({
      assetId: 'success',
    });
    this.authService.signOut();
    window.location.reload();
    const alert = await this.toastCtrl.create({
      message: 'Déconnexion réussie.',
      duration: 3000
    });
    alert.present();
  }







}