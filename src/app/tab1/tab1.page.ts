import { Component, OnInit } from '@angular/core';
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
}