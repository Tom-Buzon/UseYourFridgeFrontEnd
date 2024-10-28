# UseYourFridgeFrontEnd

Nous avons une app ionic angular capacitor qui affiche des recette et permet a l'utilisateur d'extraire des liste de course en fonction du contenu du frigot.

En tab1 nous affichons les recettes dispo en fonction des ingredients du frigo (si ingredient necessaire a la recette sont dispo alors on affiche la recette)
Actuelement elle ne marche pas car il faut ajouter la logique quantiote et unit

En tab2 nous affichons toutes les recettes disponibles en base, avec des filtres pour pouvoir rechercher plus vite. Aussi si l'user selectionne une recette , il peut la voir en detail (dans un modal) et ajouter les ingredients necessaires a la liste de course(dans un modal). 

En tab3 nous affichons le contenue du frigo, avec la possibilité d'ajouter des ingredients par input texte ou par scan d'un codebar.

Actuelement recette.servcice inclue :
export interface Recette {
  id: number;
  title: string;
  url: string;
  rate: number;
  tag1?: string;
  tag2?: string;
  tag3?: string;
  difficulty: string;
  budget: string;
  people: number;
  prep_time: number;
  cooking_time: number;
  total_time: number;
  ingredients: { ingredient: string; unit: string; quantite: number }[];
  selected?: boolean; // Propriété pour la sélection des recettes
}

Mais nous avons ajouté en base title_en, tag1_en, tag2_en, tag3_en, difficulty_en, budget_en_, ingredients_en
Attention, ingredients et ingredients_en viennent d'un Left join :
Server.js
app.get('/api/recetteformat', async (req, res) => {
  try {
    const query = `
      SELECT rf.id, rf.title, rf.url, rf.rate, rf.tag1, rf.tag2, rf.tag3, rf.tag4, rf.tag5,
             rf.difficulty, rf.budget, rf.people, rf.prep_time, rf.cooking_time, rf.total_time,
             ri.ingredient, ri.unit, ri.quantite
      FROM recetteformat rf
      LEFT JOIN recetteingredients ri ON rf.id = ri.recetteid
    `;
    const result = await pool.query(query);


Donc la table recetteingredients a aussi de nouvelles colonnes : unit_en, quantite_en et ingredient_en

Je voudrais modifier mon app pour utiliser ngx-translate afin de rendre mon app accessible en anglais.

pour ce faire je voudrais ajouter un drapeau en haut de l'application (fr et anglais)  et changer les traductions en fonction de ce drapeau.
Attention il faut aussi changer le contenu affiché par  les recettes et les ingredients en fonction du drapeau. donc utiliser les colonne "_en" pour l'anglais et les normale pour français. 

Il faut donc, en plus d'instancier ngx-translate, changer la logique d'affichage du contenue dynamique en fonction de la langue.

voici mes fichiers :
tab1
tab1.page.ts ="import { Component, OnInit } from '@angular/core';
import { FrigoService } from '../services/frigo.service';
import { RecetteService } from '../services/recette.service';
import { Observable, BehaviorSubject } from 'rxjs';

interface Recette {
  id: number;
 // type: string;
 // prix: string;
 // temps: number;
 // ingredients: string;
 // etapes: string;
 // notes: string;
 // titre: string;
 // matching: any;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
 // private matchingRecettesSubject = new BehaviorSubject<Recette[]>([]);
 // matchingRecettes$ = this.matchingRecettesSubject.asObservable();
 // selectedRecette: Recette | null = null;
//
  constructor(
//    private frigoService: FrigoService,
//    private recetteService: RecetteService
  ) {}

  ngOnInit() {
 //   this.loadMatchingRecettes();
  }

//  loadMatchingRecettes() {
//    this.frigoService.getCurrentIngredients().subscribe(ingredients => {
//      this.recetteService.getRecettesMatchingIngredients(ingredients).subscribe(
//        recettes => {
//          console.log('Recettes correspondantes:', recettes);
//          this.matchingRecettesSubject.next(recettes);
//        },
//        error => {
//          console.error('Erreur lors du chargement des recettes correspondantes', error);
//        }
//      );
//    });
//  }

//  onRecetteClick(recette: Recette) {
//    this.selectedRecette = recette;
//  }
} "

tab2
tab2.page.ts="import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { RecetteService, Recette } from '../services/recette.service';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { ShoppingListModalComponent } from './../shopping-list-modal/shopping-list-modal.component';
import { ShoppingListService } from './../services/shopping-list.service';
import { RecetteDetailsModalComponent } from './../recette-details-modal/recette-details-modal.component'; // Assurez-vous que ce chemin est correct

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
})
export class Tab2Page implements OnInit {
  allRecettes: Recette[] = []; // Liste complète sans filtres
  filteredRecettes: Recette[] = []; // Liste filtrée avant pagination
  recettes: Recette[] = []; // Liste paginée à afficher
  selectedRecettes: Recette[] = [];

  shoppingList: { ingredient: string; unit: string; quantite: number; inFrigo: boolean }[] = [];
  isReducedIconVisible = false;
  searchTerm: string = '';
  selectedTag1: string | null = null;
  selectedTag2: string | null = null;
  selectedTag3: string | null = null;
  tag1Options: string[] = [];
  tag2Options: string[] = [];
  tag3Options: string[] = [];
  pageSize = 20; // Nombre de recettes par page
  currentPage = 1; // Page courante
  totalPages = 1; // Nombre total de pages
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  isFixed: boolean = false;
  scrollSubscription!: Subscription;

  constructor(
    private recetteService: RecetteService,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef,
    private modalController: ModalController,
    private shoppingListService: ShoppingListService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadRecettes();
  }

  ionViewDidEnter() {
    if (this.content) {
      this.scrollSubscription = this.content.ionScroll.subscribe((event) => {
        this.checkScroll(event.detail.scrollTop);
      });
    }
  }

  ionViewWillLeave() {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

  checkScroll(scrollTop: number) {
    if (scrollTop > 25) {
      this.isFixed = true;
    } else {
      this.isFixed = false;
    }
  }


  /**
   * Charger toutes les recettes depuis le backend
   */
  loadRecettes() {
    this.recetteService.getRecettes().subscribe(
      (recettes) => {
        console.log('Recettes reçues du backend:', recettes);
        this.allRecettes = recettes; // Stocke les recettes initiales
        this.initializeTagOptions(); // Initialiser les options de Tag1, Tag2, Tag3
        this.filterRecettes(); // Appliquer les filtres dès le chargement initial
      },
      (error) => {
        console.error('Erreur lors du chargement des recettes', error);
      }
    );
  }

  /**
   * Initialiser les options de Tag1, Tag2, Tag3 à partir de toutes les recettes
   */
  initializeTagOptions() {
    this.tag1Options = this.getUniqueTags(this.allRecettes.map(r => r.tag1));
    this.tag2Options = this.getUniqueTags(this.allRecettes.map(r => r.tag2));
    this.tag3Options = this.getUniqueTags(this.allRecettes.map(r => r.tag3));
  }

  /**
   * Obtenir des valeurs de tags uniques en filtrant les valeurs nulles et les doublons
   * @param tags Array de tags à filtrer
   */
  getUniqueTags(tags: (string | undefined)[]): string[] {
    return Array.from(new Set(tags.filter((tag): tag is string => tag != null))).sort();
  }

  /**
   * Mettre à jour les options de Tag2 et Tag3 en fonction des sélections actuelles de Tag1 et Tag2
   */
  updateTagOptions() {
    if (this.selectedTag1) {
      // Filtrer les recettes où tag1 correspond
      const filteredByTag1 = this.allRecettes.filter(recette => recette.tag1 === this.selectedTag1);
      this.tag2Options = this.getUniqueTags(filteredByTag1.map(r => r.tag2));
      if (this.selectedTag2 && !this.tag2Options.includes(this.selectedTag2)) {
        this.selectedTag2 = null;
      }
      // Mettre à jour Tag3 en fonction de Tag1 et Tag2
      if (this.selectedTag2) {
        const filteredByTag2 = filteredByTag1.filter(recette => recette.tag2 === this.selectedTag2);
        this.tag3Options = this.getUniqueTags(filteredByTag2.map(r => r.tag3));
        if (this.selectedTag3 && !this.tag3Options.includes(this.selectedTag3)) {
          this.selectedTag3 = null;
        }
      } else {
        this.tag3Options = this.getUniqueTags(filteredByTag1.map(r => r.tag3));
      }
    } else {
      // Si aucun Tag1 sélectionné, réinitialiser Tag2 et Tag3
      this.tag2Options = this.getUniqueTags(this.allRecettes.map(r => r.tag2));
      this.tag3Options = this.getUniqueTags(this.allRecettes.map(r => r.tag3));
    }
  }

  /**
   * Filtrer les recettes en fonction des critères de recherche et de sélection des tags
   */
  filterRecettes() {
    // Mettre à jour les options des tags en fonction des sélections actuelles
    this.updateTagOptions();

    // Filtrer les recettes selon les critères définis
    this.filteredRecettes = this.allRecettes.filter((recette) => {
      const matchesSearch = this.searchTerm
        ? recette.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          recette.ingredients.some((ing) =>
            ing.ingredient.toLowerCase().includes(this.searchTerm.toLowerCase())
          )
        : true;

      const matchesTag1 = this.selectedTag1 ? recette.tag1 === this.selectedTag1 : true;
      const matchesTag2 = this.selectedTag2 ? recette.tag2 === this.selectedTag2 : true;
      const matchesTag3 = this.selectedTag3 ? recette.tag3 === this.selectedTag3 : true;

      return matchesSearch && matchesTag1 && matchesTag2 && matchesTag3;
    });

    console.log('Recherche:', this.searchTerm);
    console.log('Tag1 Sélectionné:', this.selectedTag1);
    console.log('Tag2 Sélectionné:', this.selectedTag2);
    console.log('Tag3 Sélectionné:', this.selectedTag3);
    console.log('Recettes filtrées:', this.filteredRecettes.length);

    this.currentPage = 1; // Réinitialiser la page à 1 après le filtrage
    this.totalPages = Math.ceil(this.filteredRecettes.length / this.pageSize) || 1;
    this.updateDisplayedRecettes();
  }

  /**
   * Mettre à jour les recettes affichées en fonction de la pagination
   */
  updateDisplayedRecettes() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.recettes = this.filteredRecettes.slice(start, end); // Actualiser les recettes affichées sur la page
    console.log(`Affichage des recettes de ${start + 1} à ${end}`);
  }

  /**
   * Aller à la page suivante
   */
  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedRecettes();
    }
  }

  /**
   * Retourner à la page précédente
   */
  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedRecettes();
    }
  }

  /**
   * Effacer tous les filtres
   */
  clearFilters() {
    this.searchTerm = '';
    this.selectedTag1 = null;
    this.selectedTag2 = null;
    this.selectedTag3 = null;
    this.filterRecettes();
  }

  /**
   * Mettre à jour les recettes sélectionnées
   */
  updateSelectedRecettes() {
    this.selectedRecettes = this.recettes.filter((recette) => recette.selected);
    console.log('Recettes sélectionnées:', this.selectedRecettes);
  }

  /**
   * Générer la liste de courses à partir des recettes sélectionnées
   */
  generateShoppingList() {
    const ingredientsMap: { [ingredient: string]: { unit: string; quantite: number } } = {};

    this.selectedRecettes.forEach(recette => {
      recette.ingredients.forEach(ing => {
        const key = ing.ingredient.toLowerCase().trim();
        if (ingredientsMap[key]) {
          // Ajouter la quantité si l'unité est la même
          if (ingredientsMap[key].unit === ing.unit) {
            ingredientsMap[key].quantite += ing.quantite;
          } else {
            // Gérer les unités différentes si nécessaire
            // Pour simplifier, on ignore ici
          }
        } else {
          ingredientsMap[key] = { unit: ing.unit, quantite: ing.quantite };
        }
      });
    });

    this.shoppingList = Object.keys(ingredientsMap).map(ingredient => ({
      ingredient,
      unit: ingredientsMap[ingredient].unit,
      quantite: ingredientsMap[ingredient].quantite,
      inFrigo: false // Par défaut, marquer comme non présent
    }));

    // Ajouter les ingrédients manquants à la liste de courses via le service
    this.shoppingListService.addIngredientsToShoppingList(this.shoppingList);

    // Afficher un toast de confirmation
    this.presentToast('Liste de courses générée avec succès !');
  }

  /**
   * Afficher un toast de confirmation
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

  /**
   * Ouvrir le modal de la liste de courses
   */
  async openShoppingListModal() {
    const modal = await this.modalController.create({
      component: ShoppingListModalComponent,
      componentProps: {
        shoppingList: this.shoppingListService.getUserShoppingList(),
      },
    });

    modal.onDidDismiss().then((result) => {
      if (result.data && result.data.action === 'reduce') {
        this.isReducedIconVisible = true;
      }
    });

    return await modal.present();
  }

  /**
   * Afficher les détails d'une recette (à implémenter)
   * @param recette La recette dont afficher les détails
   */
  async showRecetteDetails(recette: Recette) {
    const modal = await this.modalController.create({
      component: RecetteDetailsModalComponent, // Assurez-vous que ce composant existe
      componentProps: {
        recette: recette
      }
    });

    return await modal.present();
  }

  /**
   * Afficher la liste de courses en générant les éléments manquants
   */
  addMissingIngredientsToShoppingList() {
    // Générer la liste de courses basée sur les recettes sélectionnées
    this.generateShoppingList();
    // Ouvrir le modal de la liste de courses
    this.openShoppingListModal();
  }
}
"

tab2.html = "<ion-header>
  <ion-toolbar>
    <ion-title>Toutes les Recettes</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">
  <!-- Bouton pour afficher la liste de courses réduite -->
  <ion-button [ngClass]="{'fixable-element': true}"  *ngIf="isReducedIconVisible" (click)="openShoppingListModal()" >
    VOIR LA LISTE DE COURSES
  </ion-button>
  <div *ngIf="isReducedIconVisible" class="reduced-icon" (click)="openShoppingListModal()">
    <ion-icon  name="cart"></ion-icon>
  </div>

  <ion-list class="flex-container">
  <!-- Filtrer par recherche + tag1, tag2, tag3 -->
  <ion-item class="item-1">
    <ion-input
      placeholder="Rechercher par titre ou ingrédient"
      [(ngModel)]="searchTerm"
      (ionInput)="filterRecettes()"
    ></ion-input>
  </ion-item>

  

  <ion-item class="item-2">
    <ion-label>Tag1</ion-label>
    <ion-select  [(ngModel)]="selectedTag1" (ionChange)="filterRecettes()">
      <ion-select-option  [value]="null"></ion-select-option>
      <ion-select-option class ="white" *ngFor="let tag of tag1Options" [value]="tag">{{ tag }}</ion-select-option>
    </ion-select>
  </ion-item>

  <ion-item class="item-3" >
    <ion-label>Tag2</ion-label>
    <ion-select [(ngModel)]="selectedTag2" (ionChange)="filterRecettes()">
      <ion-select-option class ="white" [value]="null"></ion-select-option>
      <ion-select-option class ="white" *ngFor="let tag of tag2Options" [value]="tag">{{ tag }}</ion-select-option>
    </ion-select>
  </ion-item>

  <ion-item class="item-4">
    <ion-label>Tag3</ion-label>
    <ion-select [(ngModel)]="selectedTag3" (ionChange)="filterRecettes()">
      <ion-select-option [value]="null"></ion-select-option>
      <ion-select-option class ="white" *ngFor="let tag of tag3Options" [value]="tag">{{ tag }}</ion-select-option>
    </ion-select>
  </ion-item>

  </ion-list>

  <ion-button expand="block" color="danger" (click)="clearFilters()">
    Enlever tous les filtres
  </ion-button>

  <!-- Bouton pour générer et afficher la liste de courses -->
  <ion-button expand="block" color="danger" [disabled]="selectedRecettes.length === 0" (click)="addMissingIngredientsToShoppingList()">
    Générer la Liste de Courses
  </ion-button>

  <!-- Liste des recettes -->
  <ion-list *ngIf="recettes && recettes.length > 0">
    <ion-item *ngFor="let recette of recettes">
      <ion-checkbox [(ngModel)]="recette.selected" (ionChange)="updateSelectedRecettes()"></ion-checkbox>
      <ion-label class="availability">{{ recette.title }} ({{ recette.rate }})</ion-label>
      <ion-label>{{ recette.difficulty }} - {{ recette.budget }}</ion-label>
      <ion-label>Ingrédients: {{ recette.ingredients.length }}</ion-label>
      <ion-button fill="clear" class="detail-button" (click)="showRecetteDetails(recette)">
        <ion-icon name="help-circle-outline"></ion-icon>
      </ion-button>
    </ion-item>
  </ion-list>

  <!-- Pagination -->
  <ion-item *ngIf="totalPages > 1">
    <ion-button (click)="goToPreviousPage()" [disabled]="currentPage === 1">Précédent</ion-button>
    <ion-label>Page {{ currentPage }} sur {{ totalPages }}</ion-label>
    <ion-button (click)="goToNextPage()" [disabled]="currentPage === totalPages">Suivant</ion-button>
  </ion-item>

  <!-- Messages Conditionnels -->
  <ion-item *ngIf="(!recettes || recettes.length === 0) && allRecettes.length > 0">
    Aucune recette correspondante aux filtres sélectionnés.
  </ion-item>

  <ion-item *ngIf="allRecettes.length === 0 && recettes.length === 0">
    Chargement des recettes...
  </ion-item>
</ion-content>
"

tab2.modules.ts ="import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { Tab2PageRoutingModule } from './tab2-routing.module';
import { ShoppingListModalModule } from '../shopping-list-modal/shopping-list-modal.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    Tab2PageRoutingModule,
    ShoppingListModalModule
  ],
  declarations: [Tab2Page]
})
export class Tab2PageModule {}"


Tab3.page.ts ="
import { Component, ViewChild, ElementRef, OnInit, OnDestroy, Renderer2, Inject  } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FrigoService, Ingredient } from '../services/frigo.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { ScanOptions, ScanResult } from '@capacitor-community/barcode-scanner';


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

  constructor(
    private frigoService: FrigoService, 
    private http: HttpClient,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document

  ) {
    this.ingredients$ = this.frigoService.ingredients$;
  }

  ngOnInit() {
    this.requestCameraPermission();
    //BarcodeScanner.prepare();
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
    this.scanning = true;
    document.body.classList.add('scanner-active');
    await BarcodeScanner.hideBackground();
    const result = await BarcodeScanner.startScan();
    if (result.hasContent) {
      console.log(result.content);
      await this.getProductInfo(result.content);
      this.stopScan();
    }
  }
  
  async stopScan() {
    this.scanning = false;
    document.body.classList.remove('scanner-active');
    await BarcodeScanner.showBackground();
    await BarcodeScanner.stopScan();
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
}"

tab3.page.html = "<ion-header>
  <ion-toolbar>
    <ion-title>Frigo</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true" [class.content-hidden]="scanning">
  <ion-list>
    <ion-item *ngFor="let ingredient of ingredients$ | async">
      <ion-label>{{ ingredient.ingredients }}</ion-label>
      <ion-button slot="end" color="danger" (click)="removeIngredient(ingredient.id)">
        <ion-icon name="trash"></ion-icon>
      </ion-button>
    </ion-item>
  </ion-list>
  
  <ion-item *ngIf="(ingredients$ | async)?.length === 0">
    Aucun ingrédient dans le frigo.
  </ion-item>

  <ion-item>
    <ion-input [(ngModel)]="newIngredient" placeholder="Nouvel ingrédient"></ion-input>
    <ion-button (click)="addIngredient()">Ajouter</ion-button>
  </ion-item>

  <ion-button expand="block" (click)="scanning ? stopScan() : startScan()">
    <ion-icon name="barcode-outline"></ion-icon>
    {{ scanning ? 'Arrêter le scan' : 'Commencer le scan' }}
  </ion-button>

  <div class="scan-box" [hidden]="!scanning">
    <!-- Cette div peut être stylisée pour montrer où scanner -->
  </div>

  <ion-modal [isOpen]="isModalOpen">
    <ng-template>
      <ion-header>
        <ion-toolbar>
          <ion-title>Produit scanné</ion-title>
          <ion-buttons slot="end">
            <ion-button (click)="closeModal()">Fermer</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-img *ngIf="scannedProduct?.image_url" [src]="scannedProduct.image_url" alt="Image du produit"></ion-img>
        <h2>{{ scannedProduct?.product_name }}</h2>
        <p>Marque: {{ scannedProduct?.brands }}</p>
        <p>Additives: {{ scannedProduct?.additives }}</p>
        <p>traces: {{ scannedProduct?.traces }}</p>
        <p>nutrition_grades: {{ scannedProduct?.nutrition_grades }}</p>
        <p>contains: {{ scannedProduct?.contains }}</p>
        <p>does_not_contain: {{ scannedProduct?.does_not_contain }}</p>
        <p>states: {{ scannedProduct?.states }}</p>
        <p>quantity: {{ scannedProduct?.quantity }}</p>
        <ion-button expand="block" (click)="addToFridge()">Ajouter au frigo</ion-button>
      </ion-content>
    </ng-template>
  </ion-modal>
</ion-content>

<div [class.active]="scanning" class="scan-overlay" >
  <div  [class.active]="scanning"class="scan-box" ></div>
  <ion-button (click)="stopScan()" *ngIf="scanning">Arrêter le scan</ion-button>
</div>


"
frigo.service.ts ="// src/app/services/frigo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';

export interface Ingredient {
  id: number;
  ingredients: string;
  // ajoutez d'autres propriétés si nécessaire
}

@Injectable({
  providedIn: 'root'
})
export class FrigoService {
  //private apiUrl = 'http://localhost:3000/api/frigo';
  private apiUrl = 'http://192.168.178.53:3000/api/frigo';

  private ingredientsSubject = new ReplaySubject<Ingredient[]>(1);
  ingredients$ = this.ingredientsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadIngredients();
  }

  loadIngredients() {
    this.http.get<Ingredient[]>(`${this.apiUrl}/ingredients`).subscribe(
      ingredients => {
        this.ingredientsSubject.next(ingredients);
      },
      error => console.error('Erreur lors du chargement des ingrédients', error)
    );
  }
  addIngredient(ingredientName: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(`${this.apiUrl}/ingredients`, { ingredients: ingredientName }, { headers, responseType: 'text' })
      .pipe(
        tap(() => this.loadIngredients())
      );
  }

  getCurrentIngredients(): Observable<string[]> {
    console.log('getCurrentIngredients appelé');
    return this.ingredients$.pipe(
     // filter(ingredients => ingredients.length > 0), // Ajoutez cette ligne
      tap(ingredients => console.log('Ingrédients dans getCurrentIngredients:', ingredients)),
      map(ingredients => ingredients.map(ing => ing.ingredients))
    );
  }

  deleteIngredient(id: number): Observable<any> {
    console.log(id);
    return this.http.delete(`${this.apiUrl}/ingredients/${id}`).pipe(
      tap(() => this.loadIngredients())
    );
  }
}"

recette.service.ts = "import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Recette {
  id: number;
  title: string;
  url: string;
  rate: number;
  tag1?: string;
  tag2?: string;
  tag3?: string;
  difficulty: string;
  budget: string;
  people: number;
  prep_time: number;
  cooking_time: number;
  total_time: number;
  ingredients: { ingredient: string; unit: string; quantite: number }[];
  selected?: boolean; // Propriété pour la sélection des recettes
}

@Injectable({
  providedIn: 'root'
})
export class RecetteService {
  private baseUrl = 'http://192.168.178.53:3000/api';

  constructor(private http: HttpClient) {}

  getRecettes(): Observable<Recette[]> {
    return this.http.get<Recette[]>(`${this.baseUrl}/recetteformat`);
  }

  // Récupérer les options de tag1
  getTag1Options(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/recetteformat/tags/tag1`);
  }

  // Récupérer les options de tag2
  getTag2Options(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/recetteformat/tags/tag2`);
  }

  // Récupérer les options de tag3
  getTag3Options(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/recetteformat/tags/tag3`);
  }

  // Optionnel : Si vous souhaitez effectuer le filtrage côté serveur
  // getFilteredRecettes(tag1: string | null, tag2: string | null, tag3: string | null, searchTerm: string): Observable<Recette[]> {
  //   let params = new HttpParams();
    
  //   if (tag1) params = params.set('tag1', tag1);
  //   if (tag2) params = params.set('tag2', tag2);
  //   if (tag3) params = params.set('tag3', tag3);
  //   if (searchTerm) params = params.set('searchTerm', searchTerm);
    
  //   return this.http.get<Recette[]>(`${this.baseUrl}/recetteformat/filter`, { params });
  // }
}
"

shopping-list.service.ts = "import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  private userShoppingList: { ingredient: string; unit: string; quantite: number; inFrigo: boolean }[] = [];

  constructor() {}

  /**
   * Récupérer la liste de courses de l'utilisateur
   */
  getUserShoppingList() {
    return this.userShoppingList;
  }

  /**
   * Ajouter des ingrédients à la liste de courses de l'utilisateur
   * @param ingredients Array d'ingrédients à ajouter
   */
  addIngredientsToShoppingList(ingredients: { ingredient: string; unit: string; quantite: number; inFrigo: boolean }[]) {
    ingredients.forEach(newItem => {
      const existingItem = this.userShoppingList.find(item => 
        item.ingredient.toLowerCase() === newItem.ingredient.toLowerCase() && 
        item.unit === newItem.unit
      );
      if (existingItem) {
        existingItem.quantite += newItem.quantite;
      } else {
        this.userShoppingList.push({ ...newItem });
      }
    });
  }

  /**
   * Mettre à jour un ingrédient dans la liste de courses
   * @param ingredient Nom de l'ingrédient
   * @param inFrigo Statut d'inventaire
   */
  updateIngredientStatus(ingredient: string, inFrigo: boolean) {
    const item = this.userShoppingList.find(i => i.ingredient.toLowerCase() === ingredient.toLowerCase());
    if (item) {
      item.inFrigo = inFrigo;
    }
  }

  /**
   * Vider la liste de courses
   */
  clearShoppingList() {
    this.userShoppingList = [];
  }

  /**
   * Sauvegarder la liste de courses (implémenter selon vos besoins, par exemple avec LocalStorage ou une base de données)
   */
  saveShoppingList() {
    // Implémenter la logique de sauvegarde
  }
}



//export class ShoppingListService {
//  private userShoppingListSource = new BehaviorSubject<{ ingredient: string; inFrigo: boolean }[]>([]);
//  userShoppingList$ = this.userShoppingListSource.asObservable();
//
//  updateUserShoppingList(list: { ingredient: string; inFrigo: boolean }[]) {
//    this.userShoppingListSource.next(list);
//  }
//
//  getUserShoppingList() {
//    return this.userShoppingListSource.value;
//  }
//}

"

shopping-list-modal.component.html="<ion-header>
  <ion-toolbar>
    <ion-title>Liste de courses</ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="closeModal('reduce')">Fermer</ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content>
  <ion-list>
    <ion-item *ngFor="let item of shoppingList" [ngClass]="{'in-frigo': item.inFrigo, 'not-in-frigo': !item.inFrigo}">
      <ion-label>{{ item.ingredient }}</ion-label>
      <ion-button *ngIf="!item.inFrigo" (click)="addToFridge(item.ingredient)">Ajouter au frigo</ion-button>
    </ion-item>
  </ion-list>
</ion-content>

<ion-footer>
  <ion-toolbar>
    <ion-button expand="block" (click)="closeModal('reduce')">Réduire</ion-button>
  </ion-toolbar>
</ion-footer>"


shopping-list-modal.component.ts="import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FrigoService } from '../services/frigo.service';

@Component({
  selector: 'app-shopping-list-modal',
  templateUrl: './shopping-list-modal.component.html',
  styleUrls: ['./shopping-list-modal.component.scss'],
})
export class ShoppingListModalComponent {
  @Input() shoppingList: { ingredient: string; inFrigo: boolean }[] = [];

  constructor(
    private modalController: ModalController,
    private frigoService: FrigoService
  ) {}

  ngOnInit() {
    
    this.updateShoppingListStatus();
  }

  updateShoppingListStatus() {
    this.frigoService.getCurrentIngredients().subscribe(frigoIngredients => {
      this.shoppingList.forEach(item => {
        item.inFrigo = frigoIngredients.some(frigoItem => 
          frigoItem.toLowerCase() === item.ingredient.toLowerCase()
        );
      });
    });
  }

  addToFridge(ingredient: string) {
    this.frigoService.addIngredient(ingredient).subscribe(
      () => {
        console.log(`Ingrédient ${ingredient} ajouté au frigo`);
        this.updateShoppingListStatus();
      },
      error => console.error(`Erreur lors de l'ajout de l'ingrédient ${ingredient} au frigo`, error)
    );
  }

  closeModal(action: string) {
    this.modalController.dismiss({
      action: action
    });
  }
}"



recette-detail-modal.component.html ="<ion-header>
  <ion-toolbar>
    <ion-title>{{ recette.title }}</ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="dismiss()">Fermer</ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content>
  <ion-card>
    <h2>{{ recette.title }}</h2>
    <ion-card-header>
      <ion-card-subtitle>Note: {{ recette.rate }}</ion-card-subtitle>
      <ion-card-title>{{ recette.difficulty }} - {{ recette.budget }}</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <h3>Ingrédients:</h3>
      
        <li *ngFor="let ing of recette.ingredients">
          {{ ing.quantite }} {{ ing.unit }} de {{ ing.ingredient }}
        </li>
      
      <h3>Instructions:</h3>
      <a [href]="recette.url" target="_blank" rel="noopener noreferrer">Voir les instructions détaillées</a>

      
    </ion-card-content>
  </ion-card>
</ion-content>
"

recette-detail-modal.component.ts = "import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Recette } from '../services/recette.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-recette-details-modal',
  templateUrl: './recette-details-modal.component.html',
  styleUrls: ['./recette-details-modal.component.scss'],
})
export class RecetteDetailsModalComponent implements OnInit {
  @Input() recette!: Recette;
  safeUrl!: SafeResourceUrl;

  constructor(
    private modalController: ModalController,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('Recette reçue dans le modal:', this.recette);
    console.log('Ingrédients:', this.recette.ingredients);
    if (this.recette.url) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.recette.url);
    }
    this.cdr.detectChanges();
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
"


et pour finir mon fichier server.js ="const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.listen(3000, function () {
  console.log("server started on port 3000");
});

app.get("/", function (req, res) {
  // console.log(__dirname) ;
  res.sendFile(__dirname + "/index.html");
});

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});


// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database', err);
  } else {
    console.log('Connected to the database');
  }
});

// Routes
app.post('/api/query', async (req, res) => {
  const { text, params } = req.body;
  try {
    const result = await pool.query(text, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while querying the database' });
  }
});


app.get('/api/recettes/titres-et-ingredients', async (req, res) => {
  console.log('Route /api/recettes/titres-et-ingredients appelée');
  try {
    console.log('Exécution de la requête SQL');
    const result = await pool.query('SELECT * FROM recettes');
    console.log('Résultat de la requête:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des recettes:', err);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des recettes' });
  }
});

// Route pour récupérer tous les ingredients du frigo
app.get('/api/frigo/ingredients', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, ingredients FROM frigo');
    //console.log('Données envoyées au front:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching the ingredients' });
  }
});


// Nouvelle route pour ajouter un ingrédient
app.post('/api/frigo/ingredients', (req, res) => {
  const { ingredients } = req.body;
  if (!ingredients) {
    return res.status(400).json({ message: 'L\'ingrédient est requis' });
  }

  const query = 'INSERT INTO frigo (ingredients) VALUES ($1)';
  pool.query(query, [ingredients], (err, result) => {
    if (err) {
      console.error('Erreur SQL:', err);
      res.status(500).json({ message: `Erreur lors de l'ajout de l'ingrédient: ${err.message}` });
    } else {
      res.status(201).json({ message: 'Ingrédient ajouté avec succès' });
    }
  });
});

// Route pour supprimer un ingrédient
app.delete('/api/frigo/ingredients/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'ID de l\'ingrédient non fourni' });
  }
  try {
    const query = 'DELETE FROM frigo WHERE id = $1';
    const result = await pool.query(query, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Ingrédient non trouvé' });
    }
    res.status(200).json({ message: 'Ingrédient supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'ingrédient:', err);
    res.status(500).json({ error: 'Une erreur est survenue lors de la suppression de l\'ingrédient' });
  }
});

// Route pour récupérer tous les titres de la table recettes
app.get('/api/recettes/title', async (req, res) => {
  try {
    const result = await pool.query('SELECT title FROM recettes');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching the titres' });
  }
});

app.post('/api/recettes/matching', async (req, res) => {
  const { ingredients } = req.body;
  try {
    const query = `
      SELECT * FROM recettes
      WHERE $1::text[] @> string_to_array(ingredients, ', ')::text[]
    `;
    const result = await pool.query(query, [ingredients]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des recettes correspondantes', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/recettes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM recettes WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Recette non trouvée' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération de la recette' });
  }
});

//RECETTEFORMAT
app.get('/api/recetteformat', async (req, res) => {
  try {
    const query = `
      SELECT rf.id, rf.title, rf.url, rf.rate, rf.tag1, rf.tag2, rf.tag3, rf.tag4, rf.tag5,
             rf.difficulty, rf.budget, rf.people, rf.prep_time, rf.cooking_time, rf.total_time,
             ri.ingredient, ri.unit, ri.quantite
      FROM recetteformat rf
      LEFT JOIN recetteingredients ri ON rf.id = ri.recetteid
    `;
    const result = await pool.query(query);
    
    // Regrouper les ingrédients sous forme de tableau pour chaque recette
    const recettes = result.rows.reduce((acc, row) => {
      let recette = acc.find(r => r.id === row.id);
      if (recette) {
        // Ajouter l'ingrédient à la recette existante
        if (row.ingredient) {
          recette.ingredients.push({
            ingredient: row.ingredient,
            unit: row.unit,
            quantite: row.quantite,
          });
        }
      } else {
        // Créer une nouvelle recette
        recette = {
          id: row.id,
          title: row.title,
          url: row.url,
          rate: row.rate,
          tag1: row.tag1,
          tag2: row.tag2,
          tag3: row.tag3,
          difficulty: row.difficulty,
          budget: row.budget,
          people: row.people,
          prep_time: row.prep_time,
          cooking_time: row.cooking_time,
          total_time: row.total_time,
          ingredients: row.ingredient ? [{
            ingredient: row.ingredient,
            unit: row.unit,
            quantite: row.quantite
          }] : []
        };
        acc.push(recette);
      }
      return acc;
    }, []);
    
    res.json(recettes);
  } catch (err) {
    console.error('Erreur lors de la récupération des recettes:', err);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des recettes' });
  }
});

app.get('/api/recetteformat/filter', async (req, res) => {
  const { tag1, tag2, tag3, searchTerm } = req.query;
  let query = `SELECT rf.*, ARRAY_AGG(ri.ingredient) as ingredients 
               FROM recetteformat rf 
               LEFT JOIN recetteingredients ri ON rf.id = ri.recetteid 
               WHERE 1=1`;
  const params = [];

  // Appliquer les filtres de tags
  if (tag1) {
    query += ` AND rf.tag1 = $${params.length + 1}`;
    params.push(tag1);
  }
  if (tag2) {
    query += ` AND rf.tag2 = $${params.length + 1}`;
    params.push(tag2);
  }
  if (tag3) {
    query += ` AND rf.tag3 = $${params.length + 1}`;
    params.push(tag3);
  }

  // Appliquer le filtre de recherche (titre ou ingrédient)
  if (searchTerm) {
    query += ` AND (rf.title ILIKE $${params.length + 1} OR EXISTS (SELECT 1 FROM recetteingredients ri WHERE ri.recetteid = rf.id AND ri.ingredient ILIKE $${params.length + 1}))`;
    params.push(`%${searchTerm}%`);
  }

  // Ajouter un GROUP BY pour éviter les doublons d’ingrédients par recette
  query += ` GROUP BY rf.id`;

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des recettes filtrées:', err);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des recettes filtrées' });
  }
});

// Route pour récupérer les valeurs distinctes de tag1
app.get('/api/recetteformat/tags/tag1', async (req, res) => {
  try {
    const result = await pool.query(`SELECT DISTINCT tag1 FROM recetteformat WHERE tag1 IS NOT NULL`);
    const tag1Options = result.rows.map(row => row.tag1);
    console.log('Tag1 Options:', tag1Options);
    res.json(tag1Options);
  } catch (err) {
    console.error('Erreur lors de la récupération des tags (tag1):', err);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des tags (tag1)' });
  }
});

// Route pour récupérer les valeurs distinctes de tag2
app.get('/api/recetteformat/tags/tag2', async (req, res) => {
  try {
    const result = await pool.query(`SELECT DISTINCT tag2 FROM recetteformat WHERE tag2 IS NOT NULL`);
    const tag2Options = result.rows.map(row => row.tag2);
    console.log('Tag2 Options:', tag2Options);
    res.json(tag2Options);
  } catch (err) {
    console.error('Erreur lors de la récupération des tags (tag2):', err);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des tags (tag2)' });
  }
});

// Route pour récupérer les valeurs distinctes de tag3
app.get('/api/recetteformat/tags/tag3', async (req, res) => {
  try {
    const result = await pool.query(`SELECT DISTINCT tag3 FROM recetteformat WHERE tag3 IS NOT NULL`);
    const tag3Options = result.rows.map(row => row.tag3);
    console.log('Tag3 Options:', tag3Options);
    res.json(tag3Options);
  } catch (err) {
    console.error('Erreur lors de la récupération des tags (tag3):', err);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des tags (tag3)' });
  }
});




"

