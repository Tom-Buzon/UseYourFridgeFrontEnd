import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { NativeAudio } from '@capacitor-community/native-audio';



@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SigninPage implements OnInit {
  screen: any = 'signin';
  formData: FormGroup;
  isLoading: boolean = false;
  isToastOpen = false;
  isToastOpen2 = false;
  form: any = {
    username: null,
    password: null
  };
  isLoggedIn = false;
  isLoginFailed = false;
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  roles: string[] = [];
  

  constructor(private fb: FormBuilder, private toastCtrl : ToastController, private loadingController: LoadingController, private cdr: ChangeDetectorRef, private router: Router, private authService: AuthService, private tokenStorage: TokenStorageService, @Inject(PLATFORM_ID) private platformId: string,
  ) {

    NativeAudio.preload({
      assetId: "success",
      assetPath: "public/assets/sounds/success.mp3",
      audioChannelNum: 1,
      isUrl: false
    });
    this.formData = this.fb.group({
      name: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }



  destroy(destroyEvent: any): void {
    console.log('destroy -> ', destroyEvent);
  }

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.roles = this.tokenStorage.getUser().roles;
    }
  }


  async present() {
    this.isLoading = true;
    return await this.loadingController.create({
      spinner: "circles",
      translucent: true
      // duration: 5000,
    }).then(a => {
      a.present().then(() => {
        console.log('presented');
        if (!this.isLoading) {
          a.dismiss();
        }
      });
    });
  }

  async dismiss() {
    this.isLoading = false;
    return await this.loadingController.dismiss();
  }

  onSubmit(): void {
    this.present();

    const { username, password } = this.form;
    this.authService.login(username, password).subscribe({
      next: async data => {
        this.tokenStorage.saveToken(data.accessToken);
        this.tokenStorage.saveUser(data);

        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = this.tokenStorage.getUser().roles;
        this.dismiss();
        Haptics.impact({ style: ImpactStyle.Light });
        NativeAudio.play({
          assetId: 'success',
        });
        this.router.navigate(['']);
        const alert = await this.toastCtrl.create({
          message: 'Connexion réussie.',
          duration: 3000      
        });
        alert.present(); 
      },
      error: err => {
        this.errorMessage = "FAil";
        this.isLoginFailed = true;
        this.cdr.detectChanges();
        this.dismiss();
      }
    });
  }

  goToSignUp() {
    this.router.navigate(["register"]);

  }

  change(event: any) {
    this.screen = event;
  }
  reloadPage(): void {
    window.location.reload();
  }



}
