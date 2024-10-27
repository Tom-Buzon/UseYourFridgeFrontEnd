import { Component, OnInit } from '@angular/core';
import { RecetteService } from '../../services/recette.service';

@Component({
  selector: 'app-recettes',
  templateUrl: './recettes.page.html',
  styleUrls: ['./recettes.page.scss'],
})
export class RecettesPage implements OnInit {
  titres: string[] = [];

  constructor(private recetteService: RecetteService) { }

  ngOnInit() {
    this.loadTitres();
  }

  loadTitres() {
    this.recetteService.getRecettes().subscribe(
      data => {
        // Traitez les données reçues ici
      },
      (error: any) => {
        console.error('Erreur lors de la récupération des recettes', error);
      }
    );
  }
}