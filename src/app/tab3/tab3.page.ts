import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { FrigoService, Ingredient } from '../services/frigo.service'; // Ensure Ingredient is imported
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
//import { CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHint } from '@capacitor/barcode-scanner';


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})


export class Tab3Page implements OnInit, OnDestroy {
  @ViewChild('video', { static: false }) video!: ElementRef;

  ingredients$: Observable<Ingredient[]>;
  newIngredient: string = '';
  isModalOpen: boolean = false;
  scannedProduct: any;
  scanning: boolean = false;
  currentStream: MediaStream | null = null;
  

  constructor(private frigoService: FrigoService, private http: HttpClient) {
    this.ingredients$ = this.frigoService.ingredients$;
    
  }

  ngOnInit() {
    
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

  async checkCameraPermission() {
    if ('mediaDevices' in navigator && 'getUser Media' in navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            console.error('L\'autorisation de la caméra a été refusée');
          } else {
            console.error('Erreur lors de la vérification de l\'autorisation de la caméra', err);
          }
        } else {
          console.error('Une erreur inconnue s\'est produite', err);
        }
        return false;
      }
    } else {
      console.error('getUser Media n\'est pas supporté sur ce navigateur');
      return false;
    }
  }

  async startScan() {
  //  try {
  //    const result = await CapacitorBarcodeScanner.scanBarcode({
  //      hint: CapacitorBarcodeScannerTypeHint.ALL
  //    });
  //    console.log(result.ScanResult);      
  //  } catch (error) {
  //    console.error('Erreur lors de la numérisation du code-barres', error);
  //  }
  }
  

  stopScan() {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
    }
    if (this.video && this.video.nativeElement) {
      this.video.nativeElement.srcObject = null;
    }
    this.scanning = false;
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
        console .error('Produit non trouvé');
        alert('Produit non trouvé. Veuillez vérifier le code-barres et réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des informations du produit', error);
      alert('Erreur lors de la récupération des informations. Veuillez réessayer.');
    }
  }

  addToFridge() {
    if (this.scannedProduct) {
      this.frigoService.addIngredient(this.scannedProduct.product_name).subscribe(
        () => {
          console.log(`Ingrédient ${this.scannedProduct.product_name} ajouté au frigo`);
          this.closeModal();
        },
        error => console.error(`Erreur lors de l'ajout de l'ingrédient ${this.scannedProduct.product_name} au frigo`, error)
      );
    }
  }
}