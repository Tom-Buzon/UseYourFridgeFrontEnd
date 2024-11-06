// src/app/components/shopping-list-details-modal/shopping-list-details-modal.component.ts

import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ShoppingList, ShoppingItem } from 'src/app/models/types';
import { ShoppingListService } from 'src/app/services/shopping-list.service';

@Component({
  selector: 'app-shopping-list-details-modal',
  templateUrl: './shopping-list-details-modal.component.html',
  styleUrls: ['./shopping-list-details-modal.component.scss'],
})
export class ShoppingListDetailsModalComponent implements OnInit {
  @Input() shoppingList!: ShoppingList;

  // Variables pour ajouter un nouvel item
  newIngredient: string = '';
  newUnit: string = '';
  newQuantite: number | null = null;

  constructor(
    private modalController: ModalController,
    private shoppingListService: ShoppingListService,
    private toastController: ToastController,
    private alertController: AlertController,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    console.log('Détails de la liste reçus:', this.shoppingList)
  }

  // Fermer le modal
  dismiss() {
    this.modalController.dismiss();
  }

  // Ajouter un nouvel item à la liste de courses
  async addItem() {
    if (!this.newIngredient.trim() || this.newQuantite === null) {
      const toast = await this.toastController.create({
        message: this.translate.instant('PLEASE_ENTER_VALID_INGREDIENT_AND_QUANTITY'),
        duration: 2000,
        color: 'warning'
      });
      toast.present();
      return;
    }

    const newItem: ShoppingItem = {
      ingredient: this.newIngredient.trim(),
      unit: this.newUnit.trim() || null,
      quantite: this.newQuantite,
      inFrigo: false
    };

    this.shoppingListService.addItemsToList(this.shoppingList.id!, [newItem]).subscribe(
      async (updatedList: ShoppingList) => {
        this.shoppingList = updatedList;
        this.newIngredient = '';
        this.newUnit = '';
        this.newQuantite = null;

        const toast = await this.toastController.create({
          message: this.translate.instant('ITEM_ADDED_SUCCESSFULLY'),
          duration: 2000,
          color: 'success'
        });
        toast.present();
      },
      async (error) => {
        console.error('Erreur lors de l\'ajout de l\'item', error);
        const toast = await this.toastController.create({
          message: this.translate.instant('ERROR_ADDING_ITEM'),
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      }
    );
  }

  // Supprimer un item de la liste de courses (À implémenter)
  async deleteItem(item: ShoppingItem) {
    const alert = await this.alertController.create({
      header: this.translate.instant('CONFIRM_DELETE_ITEM'),
      message: `${this.translate.instant('ARE_YOU_SURE_DELETE_ITEM')} "${item.ingredient}" ?`,
      buttons: [
        {
          text: this.translate.instant('CANCEL'),
          role: 'cancel'
        },
        {
          text: this.translate.instant('DELETE'),
          handler: () => {
            // Implémentez la suppression de l'item via le service
            // Vous devrez ajouter une méthode dans ShoppingListService pour cela
            this.presentToast(this.translate.instant('FEATURE_NOT_IMPLEMENTED'), 'warning');
          }
        }
      ]
    });

    await alert.present();
  }

  // Supprimer la liste de courses
  async deleteList() {
    const alert = await this.alertController.create({
      header: this.translate.instant('CONFIRM_DELETE'),
      message: this.translate.instant('ARE_YOU_SURE_DELETE_LIST'),
      buttons: [
        {
          text: this.translate.instant('CANCEL'),
          role: 'cancel'
        },
        {
          text: this.translate.instant('DELETE'),
          handler: () => {
            this.shoppingListService.deleteShoppingList(this.shoppingList.id!).subscribe(
              async () => {
                const toast = await this.toastController.create({
                  message: this.translate.instant('SHOPPING_LIST_DELETED'),
                  duration: 2000,
                  color: 'success'
                });
                toast.present();
                this.dismiss();
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
        }
      ]
    });

    await alert.present();
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
