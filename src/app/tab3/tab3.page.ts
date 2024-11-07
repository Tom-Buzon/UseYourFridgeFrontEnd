
// src/app/tab3/tab3.page.ts
import { TranslateService } from '@ngx-translate/core';
import {  ToastController } from '@ionic/angular';

import { Component, ViewChild, OnInit, OnDestroy, Renderer2, inject, NgZone, DestroyRef } from '@angular/core';
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
import { Frigo } from '../models/types';
import { FrigoService } from '../services/frigo.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  @ViewChild('fabComponent') fabComponent: any;
  private destroyRef = inject(DestroyRef);
  newIngredient: string = '';
  isModalOpen: boolean = false;
  scannedProduct: any;
  scanning: boolean = false;
  form: any = {
    name: null,
    category: null,
    quantity: null
  };
  currentFrigo: Frigo | undefined;;
  toast: any;
  id: any = null;
  isLoggedIn = false;
  user: any;
  isItemAvailable = false;
  allIngredients: any[] = [];

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

  public usersObs$ = this.userService.getAllUsernameAndId();
  public usersResults: any[] = [];

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
    private ingredientService: IngredientService,
    private http: HttpClient,
    private _route: ActivatedRoute,
    private tokenStorage: TokenStorageService,
    private translate: TranslateService,
    private toastController: ToastController,
    private fb: FormBuilder,
    private router: Router

  ) {

    this.formData = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    this.id = this._route.snapshot.paramMap.get('id');
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.user = this.tokenStorage.getUser();
    }

  }

  async ngOnInit() {


    this.frigoService.loadFrigos().subscribe(
      (data: any) => {
        if (!this.id) {
          this.currentFrigo = data[0]
        }
        else {
          this.currentFrigo = data.filter((item: any) => item.id == this.id)[0]
        }
      }
    )

    this.router.events.subscribe((data: any) => {
      if (data instanceof NavigationStart) {
        this.fabComponent.close();
      }


    });

    this.ingredientsObs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      this.ingredientsResults = data;
    });

    this.usersObs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      this.usersResults = data;
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

  setResult(ev: any) {
    console.log(`Dismissed with role: ${ev.detail.role}`);
  }


 



  onSubmit(): void {
    const { name, quantity } = this.form;
    this.currentFrigo?.id;
    console.log(name + quantity + this.currentFrigo?.id);
    this.frigoService.addIngredientToFridge(name, quantity, this.currentFrigo?.id).subscribe({
      next: data => {


      },
      error: err => {

      }
    });
  }

  getItems(ev: any) {

    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() !== '') {
      this.isItemAvailable = true;
      this.allIngredients = this.allIngredients.filter((item: any) => {
        return (item.ingredient.toLowerCase().indexOf(val.ingredient.toLowerCase()) > -1);
      })
    } else {
      this.isItemAvailable = false;
    }
  }


  addIngredientToFridge() {
    this.frigoService.addFrigo("").subscribe(
      () => {
        console.log(`Frigo créé avec succes`);
        this.closeModal();
      },
      error => console.error(`Erreur lors de l'ajout de l'ingrédient au frigo`, error)
    );
  }

  goToFrigoList() {
    this.router.navigate(["tabs/frigo-list"]);

  }

  addIngredient() {
    if (this.newIngredient.trim()) {
      this.ingredientService.addIngredient(this.newIngredient.trim()).subscribe(
        () => {
          console.log(`Ingrédient ajouté au frigo`);
          this.newIngredient = '';
        },
        error => console.error(`Erreur lors de l'ajout de l'ingrédient au frigo`, error)
      );
    }
  }

  removeIngredient(id: number) {
    this.frigoService.deleteIngredient(id).subscribe(
      () => {
        console.log(`Ingrédient supprimé`);
      },
      error => console.error(`Erreur lors de la suppression de l'ingrédient du frigo`, error)
    );
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
