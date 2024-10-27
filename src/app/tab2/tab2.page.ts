import { Component, OnInit } from '@angular/core';
import { RecetteService, Recette } from '../services/recette.service';
import { FrigoService } from '../services/frigo.service';
import { AlertController, ModalController } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { ShoppingListModalComponent } from './../shopping-list-modal/shopping-list-modal.component';
import { ShoppingListService } from './../services/shopping-list.service';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
})
export class Tab2Page implements OnInit {
  allRecettes: Recette[] = []; // Liste complète sans filtres
  filteredRecettes: Recette[] = []; // Liste filtrée avant pagination
  recettes: Recette[] = []; // Liste paginée à afficher
  selectedRecettes: Recette[] = [];

  shoppingList: { ingredient: string; inFrigo: boolean }[] = [];
  isReducedIconVisible = false;
  savedShoppingList: { ingredient: string; inFrigo: boolean }[] = [];
  searchTerm: string = '';
  selectedTag1: string | null = null;
  selectedTag2: string | null = null;
  selectedTag3: string | null = null;
  tag1Options: string[] = [];
  tag2Options: string[] = [];
  tag3Options: string[] = [];
  pageSize = 20; // Nombre de recettes par page
  currentPage = 1; // Page courante
  totalPages = 1; // Nombre total de pages

  constructor(
    private recetteService: RecetteService,
    private frigoService: FrigoService,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef,
    private modalController: ModalController,
    private shoppingListService: ShoppingListService,
  ) {}

  ngOnInit() {
    this.loadRecettes();
    this.loadTags();
  }

  loadRecettes() {
    this.recetteService.getRecettes().subscribe(
      (recettes) => {
        this.allRecettes = recettes; // Stocke les recettes initiales
        this.filterRecettes(); // Applique les filtres dès le chargement initial
      },
      (error) => {
        console.error('Erreur lors du chargement des recettes', error);
      }
    );
  }

  loadTags() {
    this.recetteService.getTag1Options().subscribe(
      (data) => {
        this.tag1Options = data;
        console.log('Tag1Options chargés :', this.tag1Options);
      },
      (error) => {
        console.error('Erreur lors du chargement des Tag1', error);
      }
    );
    this.recetteService.getTag2Options().subscribe(
      (data) => {
        this.tag2Options = data;
        console.log('Tag2Options chargés :', this.tag2Options);
      },
      (error) => {
        console.error('Erreur lors du chargement des Tag2', error);
      }
    );
    this.recetteService.getTag3Options().subscribe(
      (data) => {
        this.tag3Options = data;
        console.log('Tag3Options chargés :', this.tag3Options);
      },
      (error) => {
        console.error('Erreur lors du chargement des Tag3', error);
      }
    );
  }

  filterRecettes() {
    // Filtrer les recettes selon les critères définis
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

    console.log('Recettes filtrées:', this.filteredRecettes.length);
    this.currentPage = 1; // Réinitialise la page à 1 après le filtrage
    this.totalPages = Math.ceil(this.filteredRecettes.length / this.pageSize) || 1;
    this.updateDisplayedRecettes();
  }

  updateDisplayedRecettes() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.recettes = this.filteredRecettes.slice(start, end); // Actualise les recettes affichées sur la page
    console.log(`Affichage des recettes de ${start} à ${end}`);
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedRecettes();
    }
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedRecettes();
    }
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedTag1 = null;
    this.selectedTag2 = null;
    this.selectedTag3 = null;
    this.filterRecettes();
  }

  updateSelectedRecettes() {
    this.selectedRecettes = this.recettes.filter((recette) => recette.selected);
    console.log('Recettes sélectionnées:', this.selectedRecettes);
  }

  expandShoppingList() {
    this.isReducedIconVisible = false;
    this.openShoppingListModal();
  }

  showRecetteDetails(recette: Recette) {
    console.log('Affichage des détails de la recette', recette);
    // Implémentez ici la logique pour afficher les détails de la recette
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
}
