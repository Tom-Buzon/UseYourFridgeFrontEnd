// src/app/components/select-shopping-list-modal/select-shopping-list-modal.component.ts

import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { ShoppingList } from 'src/app/models/types';
import { ShoppingListService } from 'src/app/services/shopping-list.service';

@Component({
  selector: 'app-select-shopping-list-modal',
  templateUrl: './select-shopping-list-modal.component.html',
  styleUrls: ['./select-shopping-list-modal.component.scss'],
})
export class SelectShoppingListModalComponent implements OnInit {
  shoppingLists: ShoppingList[] = [];
  selectedListId: number | null = null;

  constructor(
    private modalController: ModalController,
    private shoppingListService: ShoppingListService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.loadShoppingLists();
  }

  async loadShoppingLists() {
    const loading = await this.loadingController.create({
      message: 'Chargement des listes de courses...',
    });
    await loading.present();

    this.shoppingListService.getShoppingLists().subscribe(
      async (lists: ShoppingList[]) => {
        this.shoppingLists = lists;
        await loading.dismiss();
      },
      async (error) => {
        console.error('Erreur lors du chargement des listes de courses', error);
        await loading.dismiss();
        const toast = await this.toastController.create({
          message: 'Erreur lors du chargement des listes de courses.',
          duration: 2000,
          color: 'danger',
        });
        toast.present();
      }
    );
  }

  async confirmSelection() {
    if (this.selectedListId !== null) {
      this.modalController.dismiss({ selectedListId: this.selectedListId });
    } else {
      const toast = await this.toastController.create({
        message: 'Veuillez sélectionner une liste de courses.',
        duration: 2000,
        color: 'warning',
      });
      toast.present();
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
