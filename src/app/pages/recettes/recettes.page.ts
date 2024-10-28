// src/app/pages/recettes/recettes.page.ts
import { Component, OnInit } from '@angular/core';
import { RecetteService, Recette } from '../../services/recette.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-recettes',
  templateUrl: './recettes.page.html',
  styleUrls: ['./recettes.page.scss'],
})
export class RecettesPage implements OnInit {
  recettes: Recette[] = [];
  currentLang: string = 'fr';

  constructor(
    private recetteService: RecetteService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.languageService.getPreferredLanguage().then(lang => {
      this.currentLang = lang || 'fr';
      this.loadRecettes();
    });
  }

  loadRecettes() {
    this.recetteService.getRecettes(this.currentLang).subscribe(
      (recettes) => {
        this.recettes = recettes;
      },
      (error) => {
        console.error('Erreur lors du chargement des recettes', error);
      }
    );
  }
}
