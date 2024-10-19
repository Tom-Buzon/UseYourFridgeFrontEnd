import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FrigoService, Ingredient } from '../services/frigo.service';



@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
  newIngredient: string = '';
  ingredients$: Observable<Ingredient[]>;

  constructor(private frigoService: FrigoService) {
    this.ingredients$ = this.frigoService.ingredients$;
  }

  ngOnInit() {
    this.frigoService.loadIngredients();
    this.ingredients$.subscribe(ingredients => {
     // console.log('Ingrédients dans le composant:', ingredients);
    });
  }

  addIngredient() {
    if (this.newIngredient) {
      this.frigoService.addIngredient(this.newIngredient).subscribe(
        () => {
          console.log('Ingrédient ajouté avec succès');
          this.newIngredient = '';
        },
        error => console.error('Erreur lors de l\'ajout de l\'ingrédient', error)
      );
    }
  }

  deleteIngredient(id: number) {
    if (id !== undefined) {
      this.frigoService.deleteIngredient(id).subscribe(
        () => {
          console.log('Ingrédient supprimé avec succès');
        },
        error => console.error('Erreur lors de la suppression de l\'ingrédient', error)
      );
    } else {
      console.error('Tentative de suppression d\'un ingrédient sans ID');
    }
  }
}