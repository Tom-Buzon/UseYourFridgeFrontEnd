import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { RecetteService, Recette } from '../services/recette.service';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { ShoppingListModalComponent } from './../shopping-list-modal/shopping-list-modal.component';
import { ShoppingListService } from './../services/shopping-list.service';
import { RecetteDetailsModalComponent } from './../recette-details-modal/recette-details-modal.component'; // Assurez-vous que ce chemin est correct

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

  shoppingList: { ingredient: string; unit: string; quantite: number; inFrigo: boolean }[] = [];
  isReducedIconVisible = false;
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
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  isFixed: boolean = false;
  scrollSubscription!: Subscription;

  constructor(
    private recetteService: RecetteService,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef,
    private modalController: ModalController,
    private shoppingListService: ShoppingListService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadRecettes();
  }

  ionViewDidEnter() {
    if (this.content) {
      this.scrollSubscription = this.content.ionScroll.subscribe((event) => {
        this.checkScroll(event.detail.scrollTop);
      });
    }
  }

  ionViewWillLeave() {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

  checkScroll(scrollTop: number) {
    if (scrollTop > 25) {
      this.isFixed = true;
    } else {
      this.isFixed = false;
    }
  }


  /**
   * Charger toutes les recettes depuis le backend
   */
  loadRecettes() {
    this.recetteService.getRecettes().subscribe(
      (recettes) => {
        console.log('Recettes reçues du backend:', recettes);
        this.allRecettes = recettes; // Stocke les recettes initiales
        this.initializeTagOptions(); // Initialiser les options de Tag1, Tag2, Tag3
        this.filterRecettes(); // Appliquer les filtres dès le chargement initial
      },
      (error) => {
        console.error('Erreur lors du chargement des recettes', error);
      }
    );
  }

  /**
   * Initialiser les options de Tag1, Tag2, Tag3 à partir de toutes les recettes
   */
  initializeTagOptions() {
    this.tag1Options = this.getUniqueTags(this.allRecettes.map(r => r.tag1));
    this.tag2Options = this.getUniqueTags(this.allRecettes.map(r => r.tag2));
    this.tag3Options = this.getUniqueTags(this.allRecettes.map(r => r.tag3));
  }

  /**
   * Obtenir des valeurs de tags uniques en filtrant les valeurs nulles et les doublons
   * @param tags Array de tags à filtrer
   */
  getUniqueTags(tags: (string | undefined)[]): string[] {
    return Array.from(new Set(tags.filter((tag): tag is string => tag != null))).sort();
  }

  /**
   * Mettre à jour les options de Tag2 et Tag3 en fonction des sélections actuelles de Tag1 et Tag2
   */
  updateTagOptions() {
    if (this.selectedTag1) {
      // Filtrer les recettes où tag1 correspond
      const filteredByTag1 = this.allRecettes.filter(recette => recette.tag1 === this.selectedTag1);
      this.tag2Options = this.getUniqueTags(filteredByTag1.map(r => r.tag2));
      if (this.selectedTag2 && !this.tag2Options.includes(this.selectedTag2)) {
        this.selectedTag2 = null;
      }
      // Mettre à jour Tag3 en fonction de Tag1 et Tag2
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
      // Si aucun Tag1 sélectionné, réinitialiser Tag2 et Tag3
      this.tag2Options = this.getUniqueTags(this.allRecettes.map(r => r.tag2));
      this.tag3Options = this.getUniqueTags(this.allRecettes.map(r => r.tag3));
    }
  }

  /**
   * Filtrer les recettes en fonction des critères de recherche et de sélection des tags
   */
  filterRecettes() {
    // Mettre à jour les options des tags en fonction des sélections actuelles
    this.updateTagOptions();

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

    console.log('Recherche:', this.searchTerm);
    console.log('Tag1 Sélectionné:', this.selectedTag1);
    console.log('Tag2 Sélectionné:', this.selectedTag2);
    console.log('Tag3 Sélectionné:', this.selectedTag3);
    console.log('Recettes filtrées:', this.filteredRecettes.length);

    this.currentPage = 1; // Réinitialiser la page à 1 après le filtrage
    this.totalPages = Math.ceil(this.filteredRecettes.length / this.pageSize) || 1;
    this.updateDisplayedRecettes();
  }

  /**
   * Mettre à jour les recettes affichées en fonction de la pagination
   */
  updateDisplayedRecettes() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.recettes = this.filteredRecettes.slice(start, end); // Actualiser les recettes affichées sur la page
    console.log(`Affichage des recettes de ${start + 1} à ${end}`);
  }

  /**
   * Aller à la page suivante
   */
  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedRecettes();
    }
  }

  /**
   * Retourner à la page précédente
   */
  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedRecettes();
    }
  }

  /**
   * Effacer tous les filtres
   */
  clearFilters() {
    this.searchTerm = '';
    this.selectedTag1 = null;
    this.selectedTag2 = null;
    this.selectedTag3 = null;
    this.filterRecettes();
  }

  /**
   * Mettre à jour les recettes sélectionnées
   */
  updateSelectedRecettes() {
    this.selectedRecettes = this.recettes.filter((recette) => recette.selected);
    console.log('Recettes sélectionnées:', this.selectedRecettes);
  }

  /**
   * Générer la liste de courses à partir des recettes sélectionnées
   */
  generateShoppingList() {
    const ingredientsMap: { [ingredient: string]: { unit: string; quantite: number } } = {};

    this.selectedRecettes.forEach(recette => {
      recette.ingredients.forEach(ing => {
        const key = ing.ingredient.toLowerCase().trim();
        if (ingredientsMap[key]) {
          // Ajouter la quantité si l'unité est la même
          if (ingredientsMap[key].unit === ing.unit) {
            ingredientsMap[key].quantite += ing.quantite;
          } else {
            // Gérer les unités différentes si nécessaire
            // Pour simplifier, on ignore ici
          }
        } else {
          ingredientsMap[key] = { unit: ing.unit, quantite: ing.quantite };
        }
      });
    });

    this.shoppingList = Object.keys(ingredientsMap).map(ingredient => ({
      ingredient,
      unit: ingredientsMap[ingredient].unit,
      quantite: ingredientsMap[ingredient].quantite,
      inFrigo: false // Par défaut, marquer comme non présent
    }));

    // Ajouter les ingrédients manquants à la liste de courses via le service
    this.shoppingListService.addIngredientsToShoppingList(this.shoppingList);

    // Afficher un toast de confirmation
    this.presentToast('Liste de courses générée avec succès !');
  }

  /**
   * Afficher un toast de confirmation
   * @param message Message à afficher dans le toast
   */
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  /**
   * Ouvrir le modal de la liste de courses
   */
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

  /**
   * Afficher les détails d'une recette (à implémenter)
   * @param recette La recette dont afficher les détails
   */
  async showRecetteDetails(recette: Recette) {
    const modal = await this.modalController.create({
      component: RecetteDetailsModalComponent, // Assurez-vous que ce composant existe
      componentProps: {
        recette: recette
      }
    });

    return await modal.present();
  }

  /**
   * Afficher la liste de courses en générant les éléments manquants
   */
  addMissingIngredientsToShoppingList() {
    // Générer la liste de courses basée sur les recettes sélectionnées
    this.generateShoppingList();
    // Ouvrir le modal de la liste de courses
    this.openShoppingListModal();
  }
}
