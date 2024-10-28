// src/app/tab3/tab3.page.ts
import { Component, OnInit, OnDestroy, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FrigoService, Ingredient } from '../services/frigo.service';
import { Observable, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit, OnDestroy {

  ingredients$: Observable<Ingredient[]>;
  newIngredient: string = '';
  isModalOpen: boolean = false;
  scannedProduct: any;
  scanning: boolean = false;
  currentLang: string = 'fr';
  toast: any;

  constructor(
    private frigoService: FrigoService, 
    private http: HttpClient,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private translate: TranslateService,
    private languageService: LanguageService,
    private toastController: ToastController
  ) {
    this.ingredients$ = this.frigoService.ingredients$;
  }

  async ngOnInit() {
    this.languageService.getPreferredLanguage().then(lang => {
      this.currentLang = lang || 'fr';
    });
    await this.requestCameraPermission();
  }

  ngOnDestroy() {
    this.stopScan();
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

  async requestCameraPermission() {
    try {
      const permission = await BarcodeScanner.checkPermission({ force: true });
      if (permission.granted) {
        console.log('Permission de caméra accordée');
      } else {
        console.error('Permission de caméra non accordée');
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permission', error);
    }
  }

  async startScan() {
    document.body.classList.remove('dark');
    this.scanning = true;
    this.renderer.addClass(this.document.body, 'scanner-active');
    await BarcodeScanner.hideBackground();
    const result = await BarcodeScanner.startScan();
    if (result.hasContent) {
      console.log(result.content);
      await this.getProductInfo(result.content);
      this.stopScan();
    document.body.classList.add('dark');

    }
  }
  
  async stopScan() {
    this.scanning = false;
    this.renderer.removeClass(this.document.body, 'scanner-active');
    await BarcodeScanner.showBackground();
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
