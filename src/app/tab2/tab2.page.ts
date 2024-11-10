// src/app/tab2/tab2.page.ts

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonContent, ModalController, ToastController, AlertController, LoadingController  } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ShoppingListModalComponent } from '../components/shopping-list-modal/shopping-list-modal.component';
import { CreateShoppingListModalComponent } from '../components/create-shopping-list-modal/create-shopping-list-modal.component';

import { RecetteDetailsModalComponent } from '../components/recette-details-modal/recette-details-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { RecetteIngredientsModalComponent } from '../components/recette-ingredients-modal/recette-ingredients-modal.component';
import { SelectShoppingListModalComponent } from '../components/select-shopping-list-modal/select-shopping-list-modal.component';
import { Recette, ShoppingItem, ShoppingList } from '../models/types';
import { ShoppingListService } from '../services/shopping-list.service';
import { RecetteService } from '../services/recette.service';
import { TokenStorageService } from '../services/token-storage.service';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
})
export class Tab2Page implements OnInit, OnDestroy {
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  allRecettes: Recette[] = [];
  filteredRecettes: Recette[] = [];
  displayedRecettes: Recette[] = [];
  selectedRecettes: Recette[] = [];

  fallbackImages = [
    'assets/images/repasVierge.jpg',
    'assets/images/imageVierge2.jpg',
    'assets/images/imageVierge3.jpg',
    'assets/images/imageVierge4.jpg',
    'assets/images/imageVierge5.jpg',
    'assets/images/imageVierge6.jpg',
    'assets/images/imageVierge7.jpg',
    'assets/images/imageVierge8.jpg',
    'assets/images/imageVierge9.jpg',
    'assets/images/imageVierge10.jpg',
    'assets/images/imageVierge11.jpg',
    'assets/images/imageVierge12.jpg',
    'assets/images/imageVierge13.jpg',
    'assets/images/imageVierge14.jpg',
    'assets/images/imageVierge15.jpg'
  ];

  searchTerm: string = '';
  selectedTag1: string | null = null;
  selectedTag2: string | null = null;
  selectedTag3: string | null = null;
  tag1Options: string[] = [];
  tag2Options: string[] = [];
  tag3Options: string[] = [];

  recipesPerLoad = 10;
  isReducedIconVisible = false;
  languageSubscription!: Subscription;
  currentLang: string = 'fr';
  isFilterOpen = false;
  hasSearchInput = false;

  isLoading = true; // Défini à true pour afficher le loader initialement

  currentIndex = 0;

  constructor(
    private recetteService: RecetteService,
    private alertController: AlertController,
    private modalController: ModalController,
    private shoppingListService: ShoppingListService,
    private toastController: ToastController,
    private translate: TranslateService,
    private languageService: LanguageService,
    public sanitizer: DomSanitizer,
    private loadingController: LoadingController,
    private tokenStorage: TokenStorageService
  ) {}

  ngOnInit() {
    if (this.tokenStorage.getToken()) {
      this.languageService.getPreferredLanguage().then((lang: string | null) => {
        this.currentLang = lang || 'fr';
        this.loadRecettes();
      });
  
      this.languageSubscription = this.languageService.getLanguageObservable().subscribe((lang: string) => {
        if (lang !== this.currentLang) {
          this.currentLang = lang;
          this.loadRecettes();
        }
      });
    }
    
  }

  ngOnDestroy() {
    if (this.languageSubscription) this.languageSubscription.unsubscribe();
  }

  loadRecettes() {
    this.recetteService.getRecettes(this.currentLang).subscribe(
      (recettes: Recette[]) => {
        // Filter out recipes with images containing "lazyload.png"
        this.allRecettes = recettes.filter(recette => !recette.images?.includes('lazyload.png'));
        this.initializeTagOptions();
        this.filteredRecettes = [...this.allRecettes];
        this.displayedRecettes = [];
        this.loadInitialRecipes();
        this.isLoading = false;
      },
      (error: any) => {
        console.error('Error loading recipes', error);
        this.isLoading = false;
      }
    );
  }

  onScroll(event: any) {
    // Check if the user has scrolled to the top
    if (event.detail.scrollTop <= 0) {
      // Trigger the doRefresh function
      this.doRefresh(event);
    }
  }

  doRefresh(event: any) {
    let attempts = 0;
    let foundValidRecette = false;

    while (!foundValidRecette && attempts < this.filteredRecettes.length) {
      // Select a random starting index
      const randomIndex = Math.floor(Math.random() * (this.filteredRecettes.length - this.recipesPerLoad));
      const potentialRecettes = this.filteredRecettes.slice(randomIndex, randomIndex + this.recipesPerLoad);

      // Verify that none of the images in the selected batch contains "lazyload.png"
      const hasValidImages = potentialRecettes.every(
        recette => recette.images && !recette.images.includes("lazyload.png")
      );

      if (hasValidImages) {
        this.displayedRecettes = potentialRecettes;
        this.currentIndex = randomIndex + this.recipesPerLoad; // Update index for continuous pagination
        foundValidRecette = true;
      } else {
        attempts++;
      }
    }

    // If no valid batch found, use default recipes
    if (!foundValidRecette) {
      this.displayedRecettes = this.filteredRecettes.slice(0, this.recipesPerLoad);
      this.currentIndex = this.recipesPerLoad;
    }

    this.content.scrollToTop(500);
    this.processDisplayedRecettes();

    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  // Méthode de chargement continu lors du défilement
  loadMore(event: any) {
    setTimeout(() => {
      // Load next recipes starting from currentIndex
      const nextRecipes = this.filteredRecettes.slice(
        this.currentIndex,
        this.currentIndex + this.recipesPerLoad
      );

      // Add new recipes to displayedRecettes
      this.displayedRecettes = [...this.displayedRecettes, ...nextRecipes];

      // Update index for next loading
      this.currentIndex += this.recipesPerLoad;

      // Process displayed recipes to handle images
      this.processDisplayedRecettes();

      // Disable infinite scrolling if no more recipes to load
      if (this.currentIndex >= this.filteredRecettes.length) {
        event.target.disabled = true;
      }

      event.target.complete();
    }, 500);
  }

  toggleFilter() {
    this.isFilterOpen = !this.isFilterOpen;
  }

  initializeTagOptions() {
    this.recetteService.getTag1Options(this.currentLang).subscribe((tags: (string | undefined)[]) => {
      this.tag1Options = this.getUniqueTags(tags);
    });

    this.recetteService.getTag2Options(this.currentLang).subscribe((tags: (string | undefined)[]) => {
      this.tag2Options = this.getUniqueTags(tags);
    });

    this.recetteService.getTag3Options(this.currentLang).subscribe((tags: (string | undefined)[]) => {
      this.tag3Options = this.getUniqueTags(tags);
    });
  }

  getUniqueTags(tags: (string | undefined)[]): string[] {
    return Array.from(new Set(tags.filter((tag): tag is string => tag != null))).sort();
  }

  updateTagOptions() {
    if (this.selectedTag1) {
      const filteredByTag1 = this.allRecettes.filter(recette => recette.tag1 === this.selectedTag1);
      this.tag2Options = this.getUniqueTags(filteredByTag1.map(r => r.tag2));
      if (this.selectedTag2 && !this.tag2Options.includes(this.selectedTag2)) {
        this.selectedTag2 = null;
      }
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
      this.recetteService.getTag2Options(this.currentLang).subscribe((tags: (string | undefined)[]) => {
        this.tag2Options = this.getUniqueTags(tags);
      });

      this.recetteService.getTag3Options(this.currentLang).subscribe((tags: (string | undefined)[]) => {
        this.tag3Options = this.getUniqueTags(tags);
      });
    }
  }

  filterRecettes() {
    this.updateTagOptions();
    this.hasSearchInput = this.searchTerm.trim().length > 0;

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

    // Réinitialiser l'index de chargement et afficher les premières recettes
    this.currentIndex = 0;
    this.displayedRecettes = [];
    this.loadInitialRecipes();
  }

  loadInitialRecipes() {
    const initialRecipes = this.filteredRecettes.slice(0, this.recipesPerLoad);
    this.displayedRecettes = [...initialRecipes];
    this.processDisplayedRecettes();

    // Définir currentIndex pour le chargement suivant
    this.currentIndex = this.recipesPerLoad;
  }

  async openIngredientsModal(recette: Recette, event: Event) {
    event.stopPropagation(); // Empêche l'ouverture du détail de la recette
    const modal = await this.modalController.create({
      component: RecetteIngredientsModalComponent,
      componentProps: {
        recette: recette
      }
    });
    return await modal.present();
  }

  processDisplayedRecettes() {
    this.displayedRecettes = this.displayedRecettes.map(recette => {
      const primaryImage = recette.images && recette.images[0];

      if (primaryImage) {
        const img = new Image();
        img.src = primaryImage;

        img.onerror = () => {
          const randomFallbackIndex = Math.floor(Math.random() * this.fallbackImages.length);
          recette.images = [this.fallbackImages[randomFallbackIndex]];
          console.warn(`Image failed to load for recette: ${recette.title}, using fallback.`);
        };
      } else {
        const randomFallbackIndex = Math.floor(Math.random() * this.fallbackImages.length);
        recette.images = [this.fallbackImages[randomFallbackIndex]];
      }

      return recette;
    });
  }

  // Choisir une image de secours aléatoire
  getRandomFallbackImage(): string {
    const randomFallbackIndex = Math.floor(Math.random() * this.fallbackImages.length);
    return this.fallbackImages[randomFallbackIndex];
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    const randomFallbackIndex = Math.floor(Math.random() * this.fallbackImages.length);
    target.src = this.fallbackImages[randomFallbackIndex];
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedTag1 = null;
    this.selectedTag2 = null;
    this.selectedTag3 = null;
    this.hasSearchInput = false;
    this.isFilterOpen = false;
    this.filterRecettes();
  }

  updateSelectedRecettes() {
    this.selectedRecettes = this.displayedRecettes.filter((recette) => recette.selected);
  }

  // Méthode existante pour générer une liste de courses
  async generateShoppingList() {
    if (this.selectedRecettes.length === 0) {
      this.presentToast(this.translate.instant('NO_RECIPES_SELECTED'));
      return;
    }

    const ingredientsMap: { [ingredient: string]: { unit: string; quantite: number } } = {};

    this.selectedRecettes.forEach(recette => {
      recette.ingredients.forEach(ing => {
        const key = ing.ingredient.toLowerCase().trim();
        if (ingredientsMap[key]) {
          if (ingredientsMap[key].unit === ing.unit) {
            ingredientsMap[key].quantite += Number(ing.quantite);
          }
        } else {
          ingredientsMap[key] = { unit: ing.unit, quantite: Number(ing.quantite) };
        }
      });
    });

    const shoppingItems: ShoppingItem[] = Object.keys(ingredientsMap).map(ingredient => ({
      ingredient,
      unit: ingredientsMap[ingredient].unit,
      quantite: ingredientsMap[ingredient].quantite,
      inFrigo: false
    }));

    console.log('Shopping Items à envoyer:', shoppingItems); // Pour déboguer

    // Appeler createShoppingList pour envoyer les données au serveur
    this.shoppingListService.createShoppingList(shoppingItems).subscribe(
      async () => {
        await this.presentToast(this.translate.instant('SHOPPING_LIST_CREATED'));
        this.openShoppingListModal();
      },
      async (error) => {
        console.error('Erreur lors de la création de la liste de courses', error);
        await this.presentToast(this.translate.instant('ERROR_CREATING_SHOPPING_LIST'));
      }
    );
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  // Nouvelle méthode pour ouvrir le modal de création de liste

  async openCreateListModal() {
    // Créer les items à partir des recettes sélectionnées
    const items: ShoppingItem[] = this.selectedRecettes.flatMap(recette => 
      recette.ingredients.map(ing => ({
        ingredient: ing.ingredient,
        unit: ing.unit,
        quantite: ing.quantite,
        inFrigo: false
      }))
    );
  
    const modal = await this.modalController.create({
      component: CreateShoppingListModalComponent,
      componentProps: {
        items: items // Passer les items au modal
      }
    });
  
    modal.onDidDismiss().then(result => {
      if (result.data) {
        console.log('Modal fermé avec données:', result.data);
        // Vous pouvez ajouter ici une logique pour rafraîchir la liste des courses si nécessaire
        this.loadShoppingLists();
      }
    });
  
    return await modal.present();
  }

// Ajouter cette méthode dans la classe Tab2Page
loadShoppingLists() {
  this.shoppingListService.getShoppingLists().subscribe(
    (lists) => {
      console.log('Listes de courses chargées:', lists);
      // Vous pouvez stocker les listes dans une propriété de classe si nécessaire
      // this.shoppingLists = lists;
    },
    (error) => {
      console.error('Erreur lors du chargement des listes de courses:', error);
      this.presentToast('Erreur lors du chargement des listes de courses');
    }
  );
}

  async openAddToShoppingListModal() {
    const modal = await this.modalController.create({
      component: SelectShoppingListModalComponent
    });

    modal.onDidDismiss().then(async (result) => {
      if (result.data && result.data.selectedListId) {
        const selectedListId = result.data.selectedListId;
        // Collect the items to add based on selectedRecettes
        const items: ShoppingItem[] = this.selectedRecettes.flatMap(recette => recette.ingredients.map(ing => ({
          ingredient: ing.ingredient,
          unit: ing.unit,
          quantite: ing.quantite,
          inFrigo: false
        })));
        // Add the items to the selected list
        await this.addItemsToSelectedList(selectedListId, items);
      }
    });

    return await modal.present();
  }

  async addItemsToSelectedList(listId: number, items: ShoppingItem[]) {
    const loading = await this.loadingController.create({
      message: 'Ajout des items à la liste de courses...'
    });
    await loading.present();

    this.shoppingListService.addItemsToList(listId, items).subscribe(
      async (updatedList: ShoppingList) => {
        await loading.dismiss();
        const toast = await this.toastController.create({
          message: 'Items ajoutés avec succès à la liste de courses.',
          duration: 2000,
          color: 'success'
        });
        toast.present();
        // Optionnel : Actualiser les listes locales si nécessaire
        // this.refreshShoppingLists();
      },
      async (error) => {
        console.error('Erreur lors de l\'ajout des items à la liste de courses', error);
        await loading.dismiss();
        const toast = await this.toastController.create({
          message: 'Erreur lors de l\'ajout des items à la liste de courses.',
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      }
    );
  }

  // Nouvelle méthode pour ouvrir le sélecteur de listes existantes
  async openShoppingListSelector() {
    // Vous pouvez réutiliser ShoppingListModalComponent ou créer un nouveau composant
    const modal = await this.modalController.create({
      component: ShoppingListModalComponent
    });

    modal.onDidDismiss().then((result) => {
      if (result.data && result.data.selectedList) {
        // Logique pour mettre à jour la liste sélectionnée
        console.log('Liste sélectionnée pour mise à jour:', result.data.selectedList);
        // Implémenter la mise à jour si nécessaire
      }
    });

    return await modal.present();
  }

  async openShoppingListModal() {
    // Récupérer la liste de courses que vous venez de créer
    this.shoppingListService.getShoppingLists().subscribe(async (lists) => {
      console.log('Lists from API:', lists);
      const latestList = lists[lists.length - 1];
      console.log('Latest List:', latestList);

      const modal = await this.modalController.create({
        component: ShoppingListModalComponent,
        componentProps: {
          shoppingListItems: latestList, // Passer l'objet complet avec 'items'
        },
      });

      modal.onDidDismiss().then((result) => {
        if (result.data && result.data.action === 'reduce') {
          this.isReducedIconVisible = true;
        }
      });

      return await modal.present();
    }, error => {
      console.error('Erreur lors de la récupération des listes de courses:', error);
      this.presentToast('Erreur lors du chargement des listes de courses.');
    });
  }

  async showRecetteDetails(recette: Recette) {
    const modal = await this.modalController.create({
      component: RecetteDetailsModalComponent,
      componentProps: {
        recette: recette
      }
    });

    return await modal.present();
  }
}
