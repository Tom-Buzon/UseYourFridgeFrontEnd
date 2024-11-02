// src/app/tab1/tab1.page.ts

import { Component, OnInit } from '@angular/core';
import { FrigoService } from '../services/frigo.service';
import { RecetteService, Recette } from '../services/recette.service';
import { ShoppingListService, ShoppingList } from '../services/shopping-list.service';
import { LanguageService } from '../services/language.service';
import { AlertController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  // Section 2: Listes de courses
  shoppingLists: ShoppingList[] = [];

  // Section 3: Recettes disponibles
  displayedRecettes: Recette[] = [];
  allRecettes: Recette[] = [];
  currentLang: string = 'fr';

  ingredientsFrigo: string[] = [];

  // Pagination
  recipesPerLoad = 10;
  currentIndex = 0;

  constructor(
    private frigoService: FrigoService,
    private recetteService: RecetteService,
    private shoppingListService: ShoppingListService,
    private languageService: LanguageService,
    private alertController: AlertController,
    private translate: TranslateService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.languageService.getPreferredLanguage().then(lang => {
      this.currentLang = lang || 'fr';
      this.loadShoppingLists();
      this.loadIngredientsFrigo();
    });
  }

  // Section 2: Gestion des listes de courses
  loadShoppingLists() {
    this.shoppingLists = this.shoppingListService.getUserShoppingLists();
  }

  deleteShoppingList(index: number) {
    this.shoppingListService.deleteShoppingList(index);
    this.loadShoppingLists();
  }

  async createShoppingList() {
    const alert = await this.alertController.create({
      header: this.translate.instant('CREATE_NEW_LIST'),
      inputs: [
        {
          name: 'listName',
          type: 'text',
          placeholder: this.translate.instant('LIST_NAME')
        }
      ],
      buttons: [
        {
          text: this.translate.instant('CANCEL'),
          role: 'cancel'
        },
        {
          text: this.translate.instant('CREATE'),
          handler: data => {
            if (data.listName.trim().length > 0) {
              const newList: ShoppingList = {
                name: data.listName.trim(),
                items: []
              };
              this.shoppingListService.addShoppingList(newList);
              this.loadShoppingLists();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  openShoppingList(list: ShoppingList) {
    // Implémentez cette méthode pour ouvrir la liste de courses sélectionnée
    // Vous pouvez ouvrir un modal pour afficher les détails de la liste
  }

  // Section 3: Chargement des recettes disponibles
  loadIngredientsFrigo() {
    this.frigoService.getCurrentIngredients().subscribe(ingredients => {
      this.ingredientsFrigo = ingredients.map(ing => ing.nom.toLowerCase().trim());
      this.loadRecettesDisponibles();
    });
  }

  loadRecettesDisponibles() {
    this.recetteService.getRecettes(this.currentLang).subscribe(
      recettes => {
        this.allRecettes = recettes.map(recette => {
          const totalIngredients = recette.ingredients.length;
          const availableIngredients = recette.ingredients.filter(ing => {
            return this.ingredientsFrigo.includes(ing.ingredient.toLowerCase().trim());
          }).length;

          return {
            ...recette,
            availableIngredients,
            totalIngredients
          };
        });

        // Filtrer les recettes ayant au moins un ingrédient disponible
        this.allRecettes = this.allRecettes.filter(
          recette => (recette.availableIngredients ?? 0) > 0
        );
        
        this.displayedRecettes = [];
        this.currentIndex = 0;
        this.loadMoreRecettes();
      },
      error => {
        console.error('Erreur lors du chargement des recettes', error);
      }
    );
  }

  loadMoreRecettes(event?: any) {
    const nextRecipes = this.allRecettes.slice(
      this.currentIndex,
      this.currentIndex + this.recipesPerLoad
    );

    this.displayedRecettes = [...this.displayedRecettes, ...nextRecipes];

    this.currentIndex += this.recipesPerLoad;

    if (event) {
      event.target.complete();
      if (this.currentIndex >= this.allRecettes.length) {
        event.target.disabled = true;
      }
    }
  }

  onRecetteClick(recette: Recette) {
    // Ouvrir le détail de la recette
    // Vous pouvez réutiliser le modal RecetteDetailsModalComponent
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/fallback-image.jpg';
  }
}
