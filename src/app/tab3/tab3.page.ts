
// src/app/tab3/tab3.page.ts
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';
import { ToastController } from '@ionic/angular';

import { Component, ViewChild, ElementRef, OnInit, OnDestroy, Renderer2, Inject, NgZone } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FrigoService, Frigo } from '../services/frigo.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import {
  Barcode,
  BarcodeFormat,
  BarcodeScanner,
  LensFacing,
} from '@capacitor-mlkit/barcode-scanning';

import { Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { DialogService } from '../services/dialog.service';
import { BarcodeScanningModalComponent } from '../components/barcode-scanning-modal/barcode-scanning-modal.component';
@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  frigos$: Observable<Frigo[]>;
  newIngredient: string = '';
  isModalOpen: boolean = false;
  scannedProduct: any;
  scanning: boolean = false;

  currentLang: string = 'fr';
  toast: any;

  isLoggedIn = false;
  user: any;
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

  constructor(
    private readonly ngZone: NgZone,
    private readonly dialogService: DialogService,
    private frigoService: FrigoService,
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
    private renderer: Renderer2,

    @Inject(DOCUMENT) private document: Document,
    private translate: TranslateService,
    private languageService: LanguageService,
    private toastController: ToastController,

    private router: Router

  ) {
    this.frigos$ = this.frigoService.frigos$;
    console.log(this.frigos$);

  }



      async ngOnInit() {
        this.languageService.getPreferredLanguage().then(lang => {
          this.currentLang = lang || 'fr';
        });
    BarcodeScanner.isSupported().then((result : any) => {

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

    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.user = this.tokenStorage.getUser();
    }


  }

  goToFrigoDetails() {
    this.router.navigate(["tabs/tab3/frigo-details", 1]);

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

  public async requestPermissions(): Promise<void> {
    await BarcodeScanner.requestPermissions();
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
      }
    });
  }


  
  async stopScan() {
    this.scanning = false;
    this.renderer.removeClass(this.document.body, 'scanner-active');
   // await BarcodeScanner.showBackground();
    await BarcodeScanner.stopScan();
    document.body.classList.add('dark');

  }

  closeModal() {
    this.isModalOpen = false;
    this.scannedProduct = null;
  }

  async getProductInfo(barcode: string) {
    try {
      const response: any = await this.http.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`).toPromise();
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
