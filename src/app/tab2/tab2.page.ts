// src/app/tab2/tab2.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
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
  allRecettes: Recette[] = [];
  filteredRecettes: Recette[] = [];
  displayedRecettes: Recette[] = [];
  selectedRecettes: Recette[] = [];

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
        this.allRecettes = recettes;
        this.initializeTagOptions();
        this.filteredRecettes = [...this.allRecettes];
        this.displayedRecettes = [];
        this.loadInitialRecipes();
      },
      (error: any) => {
        console.error('Error loading recipes', error);
      }
    );
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

    this.displayedRecettes = [];
    this.loadInitialRecipes();
  }

  loadInitialRecipes() {
    const initialRecipes = this.filteredRecettes.slice(0, this.recipesPerLoad);
    this.displayedRecettes = [...initialRecipes];
    this.processDisplayedRecettes();
  }

  loadMore(event: any) {
    setTimeout(() => {
      const currentLength = this.displayedRecettes.length;
      const nextRecipes = this.filteredRecettes.slice(
        currentLength,
        currentLength + this.recipesPerLoad
      );
      this.displayedRecettes = [...this.displayedRecettes, ...nextRecipes];
      this.processDisplayedRecettes();

      if (this.displayedRecettes.length >= this.filteredRecettes.length) {
        event.target.disabled = true;
      }

      event.target.complete();
    }, 500);
  }

  processDisplayedRecettes() {
    this.displayedRecettes = this.displayedRecettes.map(recette => {
      if (!recette.sanitizedImage) {
        let firstImageUrl: string | null = null;
  
        if (Array.isArray(recette.images) && recette.images.length > 0) {
          firstImageUrl = recette.images[0];
          console.log(`Recette ID: ${recette.id}, First image URL: ${firstImageUrl}`);
        } else {
          console.log('No images for recette:', recette.id);
        }
  
        const sanitizedImage = firstImageUrl ? this.sanitizer.bypassSecurityTrustUrl(firstImageUrl) : undefined;
        return {
          ...recette,
          sanitizedImage: sanitizedImage
        };
      } else {
        return recette;
      }
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedTag1 = null;
    this.selectedTag2 = null;
    this.selectedTag3 = null;
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
