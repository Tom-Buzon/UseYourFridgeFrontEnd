
// src/app/tab3/tab3.page.ts
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';
import { ActionSheetController, ToastController } from '@ionic/angular';

import { Component, ViewChild, ElementRef, OnInit, OnDestroy, Renderer2, Inject, NgZone } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FrigoService, Frigo, Ingredient } from '../services/frigo.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {
  Barcode,
  BarcodeFormat,
  BarcodeScanner,
  LensFacing,
} from '@capacitor-mlkit/barcode-scanning';

import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { DialogService } from '../services/dialog.service';
import { BarcodeScanningModalComponent } from '../components/barcode-scanning-modal/barcode-scanning-modal.component';
import { UserService } from '../services/user.service';
import { IngredientService } from '../services/ingredient.service';
@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit, OnDestroy {

  @ViewChild('fabComponent') fabComponent: any;
  frigos$: Observable<Frigo[]>;
  ingredients$: Observable<Ingredient[]>;
  newIngredient: string = '';
  isModalOpen: boolean = false;
  scannedProduct: any;
  scanning: boolean = false;

  currentFrigo: Frigo | undefined;;
  currentLang: string = 'fr';
  toast: any;
  id: any = null;
  isLoggedIn = false;
  user: any;
  isItemAvailable = false;
  allIngredients: any[] = [];
  users: any[] = [];

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
  public actionSheetButtons = [
    {
      text: 'Delete',
      role: 'destructive',
      data: {
        action: 'delete',
      },
    },
    {
      text: 'Share',
      data: {
        action: 'share',
      },
    },
    {
      text: 'Cancel',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    },
  ];
  private API = 'https://world.openfoodfacts.org/api/v2/product/';

  constructor(
    private readonly ngZone: NgZone,
    private readonly dialogService: DialogService,
    private frigoService: FrigoService,
    private userService: UserService,
    private ingredientService: IngredientService,
    private http: HttpClient,
    private _route: ActivatedRoute,
    private actionsheetCtrl: ActionSheetController,
    private tokenStorage: TokenStorageService,
    private renderer: Renderer2,

    @Inject(DOCUMENT) private document: Document,
    private translate: TranslateService,
    private languageService: LanguageService,
    private toastController: ToastController,

    private router: Router

  ) {

    this.ingredientService.getAllingredients().subscribe(
      (data: any) => {
        console.log(data);
        this.allIngredients = data
      }
    )

    this.frigoService.loadFrigos().subscribe(
      frigos => {
        // Handle the loaded frigos
      },
      error => {
        console.error('Error loading frigos', error);
      }
    );

    this.id = this._route.snapshot.paramMap.get('id');
    if (!this.id) {
      this.frigoService.loadFrigos().subscribe(
        (data: any) => {
          this.currentFrigo = data[0]
        }
      )
    }
    else {
      this.frigoService.loadFrigos().subscribe(
        (data: any) => {
          this.currentFrigo = data.filter((item: any) => item.id == this.id)[0]
        }
      )
    }
    this.frigos$ = this.frigoService.frigos$;
    this.ingredients$ = this.frigoService.ingredients$;


  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    this.languageService.setPreferredLanguage(lang);
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

  ngOnDestroy() {
  }
  async ngOnInit() {
    this.router.events.subscribe((data: any) => {
      if(data instanceof NavigationStart) {
        this.fabComponent.close();
      }


    });
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.user = this.tokenStorage.getUser();
    }

    this.userService.getAllUsernameAndId().subscribe(
      (data: any) => this.users = data.filter((item: any) => item.id != this.user.id)
    );

    this.languageService.getPreferredLanguage().then(lang => {
      this.currentLang = lang || 'fr';
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

  goToFrigoList() {
    this.router.navigate(["tabs/frigo-list"]);

  }

  addIngredient() {
    if (this.newIngredient.trim()) {
      this.frigoService.addIngredient(this.newIngredient.trim()).subscribe(
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
      this.frigoService.addIngredient(this.scannedProduct.product_name).subscribe(
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
