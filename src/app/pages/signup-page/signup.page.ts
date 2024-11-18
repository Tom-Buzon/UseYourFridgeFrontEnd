import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { NativeAudio } from '@capacitor-community/native-audio';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupPage implements OnInit {
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

  constructor(private fb: FormBuilder, private loadingController: LoadingController, private cdr: ChangeDetectorRef, private router: Router, private authService: AuthService, private tokenStorage: TokenStorageService, @Inject(PLATFORM_ID) private platformId: string,
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

  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }


  setOpen2(isOpen: boolean) {
    this.isToastOpen2 = isOpen;
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

  goToSignIn() {
    this.router.navigate(["login"]);

  }

  onSubmitRegister(): void {
    this.present();
    const { username, password } = this.form;

    this.authService.register(username, password).subscribe({
      next: data => {
        console.log("yes");
        this.isSuccessful = true;
        this.isSignUpFailed = false;
        this.dismiss();
        Haptics.impact({ style: ImpactStyle.Light });
        NativeAudio.play({
          assetId: 'success',
        });
        this.setOpen2(true);
        this.onSubmit();
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
        this.dismiss();
      }
    });
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
      next: data => {
        this.tokenStorage.saveToken(data.accessToken);
        this.tokenStorage.saveUser(data);

        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = this.tokenStorage.getUser().roles;
        this.dismiss();
        Haptics.vibrate();


        this.router.navigate(['']);
        this.setOpen(true);
      },
      error: err => {
        this.errorMessage = "FAil";
        this.isLoginFailed = true;
        this.cdr.detectChanges();
        this.dismiss();
      }
    });
  }

  change(event: any) {
    this.screen = event;
  }
  reloadPage(): void {
    window.location.reload();
  }



}
