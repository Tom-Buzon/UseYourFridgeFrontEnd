// src/app/tab1/tab1.page.ts
import { Component, OnInit } from '@angular/core';
import { FrigoService } from '../services/frigo.service';
import { RecetteService, Recette } from '../services/recette.service';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  matchingRecettes$: Observable<Recette[]>;
  currentLang: string = 'fr';

  constructor(
    private frigoService: FrigoService,
    private recetteService: RecetteService,
    private languageService: LanguageService
  ) {
    this.matchingRecettes$ = new Observable<Recette[]>();
  }

  ngOnInit() {
    this.languageService.getPreferredLanguage().then(lang => {
      this.currentLang = lang || 'fr';
      this.loadMatchingRecettes();
    });
  }

  loadMatchingRecettes() {
    this.frigoService.getCurrentIngredients().subscribe(ingredients => {
      this.recetteService.getRecettes(this.currentLang).subscribe(
        recettes => {
          // Logique de filtrage des recettes en fonction des ingrédients et de la langue
          const filteredRecettes = recettes.filter(recette => {
            return recette.ingredients.every(ing => {
              // Assurez-vous de gérer la logique quantitatives et units ici
              // Par exemple, vérifier si l'ingrédient est présent avec la quantité nécessaire
              // Implémentez la logique selon vos besoins
              return ingredients.includes(ing.ingredient.toLowerCase());
            });
          });
          console.log('Recettes correspondantes:', filteredRecettes);
          this.matchingRecettes$ = new Observable<Recette[]>(observer => {
            observer.next(filteredRecettes);
            observer.complete();
          });
        },
        error => {
          console.error('Erreur lors du chargement des recettes correspondantes', error);
        }
      );
    });
  }

  onRecetteClick(recette: Recette) {
    // Implémentez l'action lorsque l'utilisateur clique sur une recette
    // Par exemple, ouvrir un modal avec les détails
  }
}
