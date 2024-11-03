// src/app/tab1/tab1.page.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FrigoService } from '../services/frigo.service';
import { RecetteService, Recette } from '../services/recette.service';
import { ShoppingListService, ShoppingList, ShoppingItem  } from '../services/shopping-list.service';
import { LanguageService } from '../services/language.service';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ShoppingListDetailsModalComponent } from '../components/shopping-list-details-modal/shopping-list-details-modal.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, OnDestroy {
  // Section 2: Listes de courses
  shoppingLists: ShoppingList[] = [];
  shoppingListsSubscription!: Subscription;
  isLoading: boolean = true; // Indicateur de chargement

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
    private modalController: ModalController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.languageService.getPreferredLanguage().then(lang => {
      this.currentLang = lang || 'fr';
      this.loadShoppingLists();
      this.loadIngredientsFrigo();
    });
  }

  ngOnDestroy() {
    if (this.shoppingListsSubscription) {
      this.shoppingListsSubscription.unsubscribe();
    }
  }

  // Section 2: Gestion des listes de courses
  loadShoppingLists() {
    this.shoppingListsSubscription = this.shoppingListService.getShoppingLists().subscribe(
      (lists: ShoppingList[]) => {
        console.log('Listes de courses récupérées:', lists); // Log ajouté
        this.shoppingLists = lists;
        this.isLoading = false; // Mettre à jour l'état de chargement
      },
      async (error) => {
        console.error('Erreur lors du chargement des listes de courses', error);
        const toast = await this.toastController.create({
          message: this.translate.instant('ERROR_LOADING_SHOPPING_LISTS'),
          duration: 2000,
          color: 'danger'
        });
        toast.present();
        this.isLoading = false; // Mettre à jour l'état de chargement même en cas d'erreur
      }
    );
  }

  deleteShoppingList(listId: number | undefined) {
    if (listId === undefined) {
      this.presentToast(this.translate.instant('INVALID_LIST_ID'), 'danger');
      return;
    }

  

    this.shoppingListService.deleteShoppingList(listId).subscribe(
      async () => {
        this.shoppingLists = this.shoppingLists.filter(list => list.id !== listId);
        const toast = await this.toastController.create({
          message: this.translate.instant('SHOPPING_LIST_DELETED'),
          duration: 2000,
          color: 'success'
        });
        toast.present();
      },
      async (error) => {
        console.error('Erreur lors de la suppression de la liste de courses', error);
        const toast = await this.toastController.create({
          message: this.translate.instant('ERROR_DELETING_SHOPPING_LIST'),
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      }
    );
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
              this.shoppingListService.createShoppingListWithName(data.listName.trim()).subscribe(
                (newList: ShoppingList) => {
                  this.shoppingLists.push(newList);
                  this.presentToast(this.translate.instant('SHOPPING_LIST_CREATED'), 'success');
                },
                async (error) => {
                  console.error('Erreur lors de la création de la liste de courses', error);
                  const toast = await this.toastController.create({
                    message: this.translate.instant('ERROR_CREATING_SHOPPING_LIST'),
                    duration: 2000,
                    color: 'danger'
                  });
                  toast.present();
                }
              );
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Ouvrir le modal des détails de la liste de courses
  openShoppingList(list: ShoppingList) {
    console.log('Ouverture de la liste de courses:', list); // Log ajouté
    this.modalController.create({
      component: ShoppingListDetailsModalComponent,
      componentProps: {
        shoppingList: list
      }
    }).then(modal => {
      modal.present();
      return modal.onDidDismiss();
    }).then(result => {
      // Rafraîchir les listes si nécessaire après la fermeture du modal
      this.loadShoppingLists();
    });
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
      async error => {
        console.error('Erreur lors du chargement des recettes', error);
        const toast = await this.toastController.create({
          message: this.translate.instant('ERROR_LOADING_RECIPES'),
          duration: 2000,
          color: 'danger'
        });
        toast.present();
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
    // Implémentez l'ouverture du détail de la recette, par exemple via un modal
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/fallback-image.jpg';
  }

  // Méthode pour afficher un toast
  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    toast.present();
  }
}
