import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonModal, IonRouterOutlet } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Frigo, Ingredient } from 'src/app/services/frigo.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { FrigoService } from '../../services/frigo.service';
import { Item } from '../../types';
@Component({
  selector: 'app-frigo-list',
  templateUrl: './frigo-list.page.html',
  styleUrls: ['./frigo-list.page.scss'],
})
export class FrigoListPage implements OnInit {
  @ViewChild('modal', { static: true }) modal!: IonModal;

  selectedFruitsText = '0 Items';
  selectedFruits: string[] = [];
  frigo: Frigo | undefined;
  newIngredient: string = '';
  isModalOpen: boolean = false;
  scannedProduct: any;
  scanning: boolean = false;
  isLoggedIn = false;
  user: any;
  
  ingredients$: Observable<Ingredient[]> | undefined;



  constructor(
    private http: HttpClient,
    private routerOutlet: IonRouterOutlet,
    private renderer: Renderer2,
    private router : Router,
    private tokenStorage: TokenStorageService,
    private route: ActivatedRoute,
    private frigoService: FrigoService
  ) {}

 

  ngOnInit(): void {
    this.getFrigo();
    this.ingredients$ = this.frigoService.ingredients$;
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.user = this.tokenStorage.getUser();
    }
  }


  
  


  async startScan() {
/*     this.scanning = true;
    document.body.classList.add('scanner-active');
    await BarcodeScanner.hideBackground();
    const result = await BarcodeScanner.startScan();
    if (result.hasContent) {
      console.log(result.content);
      await this.getProductInfo(result.content);
      this.stopScan();
    } */
  }
  
  async stopScan() {
/*     this.scanning = false;
    document.body.classList.remove('scanner-active');
    await BarcodeScanner.showBackground();
    await BarcodeScanner.stopScan(); */
  }


  removeIngredient(id: number) {
    this.frigoService.deleteIngredient(id).subscribe(
      () => {
        console.log(`Ingrédient supprimé`);
      },
      error => console.error(`Erreur lors de la suppression de l'ingrédient du frigo`, error)
    );
  }

  async getProductInfo(barcode: string) {
    try {
      const response: any = await this.http.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`).toPromise();
      if (response && response.status === 1) {
        this.scannedProduct = response.product;
        this.isModalOpen = true;
      } else {
        console.error('Produit non trouvé');
        alert('Produit non trouvé. Veuillez vérifier le code-barres et réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des informations du produit', error);
      alert('Erreur lors de la récupération des informations. Veuillez réessayer.');
    }
  }
  goBack() {   this.router.navigate(['tabs/tab3']); }

  closeModal() {
    this.isModalOpen = false;
    this.scannedProduct = null;
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
  getFrigo(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.frigoService.getFrigoById(id)
      .subscribe(frigo => this.frigo = frigo);
  }
}