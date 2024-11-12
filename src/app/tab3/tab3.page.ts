
// src/app/tab3/tab3.page.ts
import { TranslateService } from '@ngx-translate/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

import { Component, ViewChild, OnInit, inject, NgZone, DestroyRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  Barcode,
  BarcodeFormat,
  BarcodeScanner,
  LensFacing,
} from '@capacitor-mlkit/barcode-scanning';

import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';
import { FormBuilder, FormGroup, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DialogService } from '../services/dialog.service';
import { BarcodeScanningModalComponent } from '../components/barcode-scanning-modal/barcode-scanning-modal.component';
import { UserService } from '../services/user.service';
import { IngredientService } from '../services/ingredient.service';
import { FrigoService } from '../services/frigo.service';
import { MesureService } from '../services/mesure.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class Tab3Page implements OnInit {

  @ViewChild('fabComponent') fabComponent: any;
  @ViewChild('modalAdd') modalAdd: any;
  private destroyRef = inject(DestroyRef);
  newIngredient: string = '';
  isModalOpen: boolean = false;
  scannedProduct: any;
  scanning: boolean = false;
  form: any = {
    ingredient: null,
    quantity: null,
    mesure: null
  };
  toast: any;
  id: any = null;
  isLoggedIn = false;
  user: any;
  isItemAvailable = false;
  allIngredients: any[] = [];
  selectedUsers: any[] = [1];
  isLoading: boolean = false;

  formData: FormGroup;

  public alertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
      handler: () => {
        console.log('Alert canceled');
      },
    },
    {
      text: 'OK',
      role: 'confirm',
      handler: () => {
        console.log('Alert confirmed');
      },
    },
  ];

  public ingredientsObs$ = this.ingredientService.getAllingredients();
  public ingredientsResults: any[] = [];

  public mesuresObs$ = this.mesureService.getAllMesures();
  public mesuresResults: any[] = [];

  public usersObs$ = this.userService.getAllUsernameAndId();
  public usersResults: any[] = [];

  public frigosObs$ = this.frigoService.loadFrigos();
  public frigosResults: any = null;


  public readonly barcodeFormat = BarcodeFormat;
  public readonly lensFacing = LensFacing;
  public formGroup = new UntypedFormGroup({
    formats: new UntypedFormControl([]),
    lensFacing: new UntypedFormControl(LensFacing.Back),
    googleBarcodeScannerModuleInstallState: new UntypedFormControl(0),
    googleBarcodeScannerModuleInstallProgress: new UntypedFormControl(0),
  });
  public barcodes: Barcode[] = [];
  public isSupported = false;
  public isPermissionGranted = false;

  private API = 'https://world.openfoodfacts.org/api/v2/product/';

  constructor(
    private readonly ngZone: NgZone,
    private readonly dialogService: DialogService,
    private frigoService: FrigoService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private alertCtrl: AlertController,
    private ingredientService: IngredientService,
    private loadingController: LoadingController,
    private http: HttpClient,
    private mesureService: MesureService,
    private _route: ActivatedRoute,
    private tokenStorage: TokenStorageService,
    private translate: TranslateService,
    private toastController: ToastController,
    private fb: FormBuilder,
    private router: Router

  ) {

    this.formData = this.fb.group({
      ingredientId: [null, [Validators.required]],
      quantity: [null, [Validators.required]],
      mesure: [null, [Validators.required]]
    });

    this.id = this._route.snapshot.paramMap.get('id');

    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.user = this.tokenStorage.getUser();
    }

  }

  async ngOnInit() {


    this.router.events.subscribe((data: any) => {
      if (data instanceof NavigationStart) {
        this.fabComponent.close();
      }


    });

    this.frigosObs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      if (!this.id) {
        this.frigosResults = data[0]
      }
      else {
        this.frigosResults = data.filter((item: any) => item.id == this.id)[0]
      }
    });

    this.ingredientsObs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {

      this.ingredientsResults = data;
    });

    this.usersObs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      this.usersResults = data.filter((item: any) => item.id !== this.user.id);
    });


    this.mesuresObs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      console.log(data);
      this.mesuresResults = data.filter((item: any) => !item.infinite);
    });

    BarcodeScanner.isSupported().then((result: any) => {

      this.isSupported = result.supported;
    });

    BarcodeScanner.checkPermissions().then((result: any) => {
      this.isPermissionGranted = result.camera === 'granted';
    });

    BarcodeScanner.removeAllListeners().then(() => {
      BarcodeScanner.addListener(
        'googleBarcodeScannerModuleInstallProgress',
        (event) => {
          this.ngZone.run(() => {
            console.log('googleBarcodeScannerModuleInstallProgress', event);
            const { state, progress } = event;
            this.formGroup.patchValue({
              googleBarcodeScannerModuleInstallState: state,
              googleBarcodeScannerModuleInstallProgress: progress,
            });
          });
        },
      );
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
    const { ingredient, quantity, mesure } = this.form;
    console.log(mesure);
    this.frigoService.addIngredientToFridge(ingredient.id, mesure.id, quantity, this.frigosResults?.id).subscribe({
      next: data => {
        this.dismiss();
        this.modalAdd.dismiss();
        this.cdr.detectChanges();
      },
      error: err => {
        this.dismiss();
        this.modalAdd.dismiss();

      }
    });
  }



  goToFrigoList() {
    this.router.navigate(["tabs/frigo-list"]);

  }


  shareFridge() {
    
    this.present();
    this.frigoService.shareFrigoToUser(this.selectedUsers, this.frigosResults.id).subscribe(
      () => {
        console.log(`Frigo partagé`);
        this.dismiss();
      },
      error => console.error(`Erreur lors du partage du frigo`, error)
    );
  }



  async removeIngredient(id: number) {
    let confirm = await this.alertCtrl.create({
      header: 'Supprimer ingrédient',
      message: 'Etes vous sur de supprimer cet ingrédient du frigo ?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Supprimer',
          handler: () => {

            this.present();
            this.frigoService.deleteIngredient(id).subscribe({
              next: () => {
                this.dismiss();
                console.log(`Ingrédient supprimé`);
                this.cdr.detectChanges();
              },
              error: err => {
                this.dismiss();
                console.error(`Erreur lors de la suppression de l'ingrédient du frigo`, err)

              }
            });

          }
        },
        {
          text: 'Annuler',
          handler: () => {
          }
        }
      ]
    });
    confirm.present();

  }



  public async startScan(): Promise<void> {
    const formats = this.formGroup.get('formats')?.value || [];
    const lensFacing =
      this.formGroup.get('lensFacing')?.value || LensFacing.Back;
    const element = await this.dialogService.showModal({
      component: BarcodeScanningModalComponent,
      // Set `visibility` to `visible` to show the modal (see `src/theme/variables.scss`)
      cssClass: 'barcode-scanning-modal',
      showBackdrop: false,
      componentProps: {
        formats: formats,
        lensFacing: lensFacing,
      },
    });
    element.onDidDismiss().then((result) => {
      const barcode: Barcode | undefined = result.data?.barcode;
      if (barcode) {
        this.barcodes = [barcode];
        console.log(barcode);
        this.getProductInfo(barcode.displayValue);
      }
    });
  }





  closeModal() {
    this.isModalOpen = false;
    this.scannedProduct = null;
  }



  async getProductInfo(barcode: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Access-Control-Allow-Origin": "**"
      })
    }
    try {
      const response: any = await this.http.get(this.API + `${barcode}.json`, httpOptions).toPromise();
      if (response && response.status === 1) {
        this.scannedProduct = response.product;
        this.isModalOpen = true;
      } else {
        console.error('Produit non trouvé');
        this.presentToast(this.translate.instant('PRODUCT_NOT_FOUND'));
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des informations du produit', error);
      this.presentToast(this.translate.instant('PRODUCT_INFO_ERROR'));
    }
  }

  async addToFridge() {
    if (this.scannedProduct) {
      this.ingredientService.addIngredient(this.scannedProduct.product_name).subscribe(
        () => {
          console.log(`Ingrédient ${this.scannedProduct.product_name} ajouté au frigo`);
          this.closeModal();
          this.presentToast(this.translate.instant('INGREDIENT_ADDED'));
        },
        error => console.error(`Erreur lors de l'ajout de l'ingrédient ${this.scannedProduct.product_name} au frigo`, error)
      );
    }
  }

  /**
   * Afficher un toast de confirmation ou d'erreur
   * @param message Message à afficher dans le toast
   */
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}
