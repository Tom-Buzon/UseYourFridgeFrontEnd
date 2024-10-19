import { Component, OnInit } from '@angular/core';
import { RecetteService } from '../services/recette.service';
import { FrigoService } from '../services/frigo.service';
import { Observable } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { map, switchMap } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';


interface Recette {
  id: number;
  titre: string;
  ingredients: string;
  selected?: boolean;
  type?: string;
  prix?: string;
  temps?: number;
  etapes?: string;
  notes?: string;
  disponibles?: number;
  total?: number;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  recettes: Recette[] = [];
  selectedRecettes: Recette[] = [];
  shoppingList: { ingredient: string; inFrigo: boolean }[] = [];

  constructor(
    private recetteService: RecetteService,
    private frigoService: FrigoService,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    console.log('Tab2 ngOnInit called');
    this.loadRecettesWithAvailability();
  }

  loadRecettesWithAvailability() {
    console.log('Début du chargement des recettes');
    this.recetteService.getTitres().pipe(
      switchMap(recettes => 
        this.frigoService.getCurrentIngredients().pipe(
          map(frigoIngredients => ({ recettes, frigoIngredients }))
        )
      )
    ).subscribe(
      ({ recettes, frigoIngredients }) => {
        console.log('Recettes reçues:', recettes);
        console.log('Ingrédients du frigo reçus:', frigoIngredients);
        
        const recettesWithAvailability = recettes.map(recette => {
          const ingredientsList = recette.ingredients.split(',').map(i => i.trim());
          const disponibles = ingredientsList.filter(ingredient => 
            frigoIngredients.some(frigoItem => 
              frigoItem.toLowerCase() === ingredient.toLowerCase()
            )
          ).length;
          console.log(`Recette ${recette.titre}: ${disponibles}/${ingredientsList.length} ingrédients disponibles`);
          return {
            ...recette,
            selected: false,
            disponibles,
            total: ingredientsList.length
          };
        });
  
        console.log('Recettes avec disponibilité:', recettesWithAvailability);
        this.recettes = recettesWithAvailability;
        console.log('this.recettes mis à jour:', this.recettes);
        this.cdr.detectChanges();
      },
      error => console.error('Erreur lors du chargement des recettes', error)
    );
  }

  updateSelectedRecettes() {
    this.selectedRecettes = this.recettes.filter(recette => recette.selected);
    console.log('Recettes sélectionnées:', this.selectedRecettes);
  }

  createShoppingList() {
    console.log('Création de la liste de courses');
    this.shoppingList = [];
    this.selectedRecettes.forEach(recette => {
      const ingredients = recette.ingredients.split(',').map(i => i.trim());
      ingredients.forEach(ingredient => {
        if (!this.shoppingList.some(item => item.ingredient === ingredient)) {
          this.shoppingList.push({ ingredient, inFrigo: false });
        }
      });
    });

    // Vérifier quels ingrédients sont dans le frigo
    this.frigoService.getCurrentIngredients().subscribe(frigoIngredients => {
      this.shoppingList.forEach(item => {
        item.inFrigo = frigoIngredients.some(frigoItem => 
          frigoItem.toLowerCase() === item.ingredient.toLowerCase()
        );
      });
    });
  }

  async showRecetteDetails(recette: Recette) {
    console.log('full card affichage');

    const fullRecette = await this.recetteService.getRecetteDetails(recette.id).toPromise();
    const alert = await this.alertController.create({
      header: fullRecette.titre,
      message: `
        Type: ${fullRecette.type}<br>
        Prix: ${fullRecette.prix}<br>
        Temps: ${fullRecette.temps} minutes<br>
        Ingrédients: ${fullRecette.ingredients}<br>
        Étapes: ${fullRecette.etapes}<br>
        Notes: ${fullRecette.notes || 'Aucune'}
      `,
      buttons: ['OK']
    });

    await alert.present();
  }

  addToFridge(ingredient: string) {
    this.frigoService.addIngredient(ingredient).subscribe(
      () => {
        console.log(`Ingrédient ${ingredient} ajouté au frigo`);
        this.loadRecettesWithAvailability(); // Recharger les recettes pour mettre à jour la disponibilité
      },
      error => console.error(`Erreur lors de l'ajout de l'ingrédient ${ingredient} au frigo`, error)
    );
  }

  isIngredientInFridge(ingredient: string): boolean {
    return this.shoppingList.some(item => item.ingredient === ingredient && item.inFrigo);
  }
}
