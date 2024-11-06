import { Component, Input, OnInit } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ChangeDetectorRef } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory, FileWriteResult } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Recette } from 'src/app/models/types';

@Component({
  selector: 'app-recette-details-modal',
  templateUrl: './recette-details-modal.component.html',
  styleUrls: ['./recette-details-modal.component.scss'],
})
export class RecetteDetailsModalComponent implements OnInit {
  @Input() recette!: Recette;
  safeUrl!: SafeResourceUrl;
  capturedImage: string = ''; // Initialize property
  private photoDirectory = 'photoSoumission';

  constructor(
    private modalController: ModalController,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private platform: Platform
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

  async addPhoto() {
    try {
      // Capture a photo
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      if (image && image.webPath) {
        // Convert image to base64
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const base64Data = (await this.convertBlobToBase64(blob)) as string;

        // Construct the file name using recette id, title, and date+time
        const recetteId = this.recette.id; // Ensure 'id' exists in your Recette model
        const recetteTitle = this.recette.title.replace(/\s+/g, '_'); // Replace spaces with underscores
        const dateTime = new Date().toISOString().replace(/[:.]/g, '-'); // Format date-time string
        const fileName = `${recetteId}_${recetteTitle}_${dateTime}.jpeg`;

       //// Save the photo
       //const savedFile = await Filesystem.writeFile({
       //  path: `${this.photoDirectory}/${fileName}`,
       //  data: base64Data,
       //  directory: Directory.Data,
       //});

     //   console.log('Photo saved successfully!');
     //   console.log('File saved at:', savedFile.uri);
//
     //   // Optionally, display the photo in your app
     //   this.capturedImage = await this.getImagePath(savedFile);
      }
    } catch (error) {
      console.error('Error capturing photo', error);
    }
  }

  // Helper method to get image path
  async getImagePath(file: FileWriteResult) {
    if (this.platform.is('hybrid')) {
      // For mobile devices
      return Capacitor.convertFileSrc(file.uri);
    } else {
      // For web
      const readFile = await Filesystem.readFile({
        path: file.uri,
      });
      return `data:image/jpeg;base64,${readFile.data}`;
    }
  }

  // Helper function to convert blob to base64
  convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
}
