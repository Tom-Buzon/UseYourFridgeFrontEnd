import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Recette } from '../../services/recette.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-recette-details-modal',
  templateUrl: './recette-details-modal.component.html',
  styleUrls: ['./recette-details-modal.component.scss'],
})
export class RecetteDetailsModalComponent implements OnInit {
  @Input() recette!: Recette;
  safeUrl!: SafeResourceUrl;

  constructor(
    private modalController: ModalController,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('Recette reçue dans le modal:', this.recette);
    console.log('Ingrédients:', this.recette.ingredients);
    if (this.recette.url) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.recette.url);
    }
    this.cdr.detectChanges();
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
