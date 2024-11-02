// src/app/tab2/tab2.page.ts

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { ModalController, ToastController, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { RecetteService, Recette } from '../services/recette.service';
import { ShoppingListModalComponent } from '../components/shopping-list-modal/shopping-list-modal.component';
import { ShoppingListService, ShoppingItem } from './../services/shopping-list.service';
import { RecetteDetailsModalComponent } from '../components/recette-details-modal/recette-details-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
    public sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
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



  processDisplayedRecettes() {
    this.displayedRecettes = this.displayedRecettes.map(recette => {
      const primaryImage = recette.images;
  
      if (primaryImage) {
        const img = new Image();
        img.src = primaryImage as string;  // Assurez-vous que primaryImage est bien une chaîne
  
        img.onerror = () => {
          // Si l'image échoue, utilisez une image de secours aléatoire
          const randomFallbackIndex = Math.floor(Math.random() * this.fallbackImages.length);
          recette.images = this.fallbackImages[randomFallbackIndex];
          console.warn(`Image failed to load for recette: ${recette.title}, using fallback.`);
        };
      } else {
        // Si aucune image n'est définie, utilisez immédiatement une image de secours
        const randomFallbackIndex = Math.floor(Math.random() * this.fallbackImages.length);
        recette.images = this.fallbackImages[randomFallbackIndex];
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


  async generateShoppingList() {
    if (this.selectedRecettes.length === 0) {
      this.presentToast(this.translate.instant('NO_RECIPES_SELECTED'));
      return;
    }

    await this.shoppingListService.clearShoppingList();

    const ingredientsMap: { [ingredient: string]: { unit: string; quantite: number } } = {};

    this.selectedRecettes.forEach(recette => {
      recette.ingredients.forEach(ing => {
        const key = ing.ingredient.toLowerCase().trim();
        if (ingredientsMap[key]) {
          if (ingredientsMap[key].unit === ing.unit) {
            ingredientsMap[key].quantite += ing.quantite;
          }
        } else {
          ingredientsMap[key] = { unit: ing.unit, quantite: ing.quantite };
        }
      });
    });

    const shoppingList: ShoppingItem[] = Object.keys(ingredientsMap).map(ingredient => ({
      ingredient,
      unit: ingredientsMap[ingredient].unit,
      quantite: ingredientsMap[ingredient].quantite,
      inFrigo: false
    }));

    await this.shoppingListService.addIngredientsToShoppingList(shoppingList);

    this.openShoppingListModal();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

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
