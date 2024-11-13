import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.page.html',
  styleUrls: ['./auth-page.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthPagePage implements OnInit {
  screen: any = 'signin';
  formData: FormGroup;
  isLoading: boolean = false;
  isToastOpen = false;
  isToastOpen2 = false;
  form: any = {
    username: null,
    email: null,
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

  onSubmitRegister(): void {
    this.present();
    const { username, password } = this.form;
    console.log(username);

    this.authService.register(username, password).subscribe({
      next: data => {
        this.isSuccessful = true;
        this.isSignUpFailed = false;
        this.dismiss();
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
