import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-refueling',
  templateUrl: './refueling.page.html',
  styleUrls: ['./refueling.page.scss'],
})
export class RefuelingPage implements OnInit {
  carId: string = '';
  refuelingDocuments: any[] = []; // List of refueling documents
  engineTypes: { Type: string; Label: string }[] = [];
  refuelingData: any = {}; // Holds the form data
  private firestore = getFirestore();

  constructor(private route: ActivatedRoute, private alertController: AlertController) {}

  async ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('carId') || '';
    if (this.carId) {
      await this.loadEngineTypes();
      await this.loadRefuelingDocuments();
    }
  }

  private async loadEngineTypes() {
    try {
      const engineTypesCollection = collection(this.firestore, 'Engines');
      const engineTypesSnapshot = await getDocs(engineTypesCollection);
      this.engineTypes = engineTypesSnapshot.docs.map((doc: any) => ({
        Type: doc.data()['Engine_type'],
        Label: doc.data()['Label'],
      }));
    } catch (error) {
      console.error(error);
    }
  }

  private async loadRefuelingDocuments() {
    try {
      const refuelingCollection = collection(this.firestore, 'Refueling');
      const q = query(refuelingCollection, where('carId', '==', this.carId));
      const querySnapshot = await getDocs(q);
      this.refuelingDocuments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error loading refueling documents:', error);
    }
  }

  async openAddRefuelingPopup() {
    const alert = await this.alertController.create({
      header: 'Add Refueling',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Save',
          handler: async () => {
            if (this.refuelingData.date && this.refuelingData.fuelType && this.refuelingData.fuelQuantity && this.refuelingData.cost && this.refuelingData.odometer) {
              await this.addRefuelingDocument();
            } else {
              console.error('All fields are required');
            }
          },
        },
      ],
      inputs: [
        {
          name: 'date',
          type: 'date',
          placeholder: 'Select Date',
          handler: (data) => (this.refuelingData.date = data),
        },
        {
          name: 'fuelQuantity',
          type: 'number',
          placeholder: 'Fuel Quantity (liters)',
          handler: (data) => (this.refuelingData.fuelQuantity = data),
        },
        {
          name: 'cost',
          type: 'number',
          placeholder: 'Cost',
          handler: (data) => (this.refuelingData.cost = data),
        },
        {
          name: 'odometer',
          type: 'number',
          placeholder: 'Odometer (KM)',
          handler: (data) => (this.refuelingData.odometer = data),
        },
      ],
    });

    await alert.present();
  }

  private async addRefuelingDocument() {
    try {
      const refuelingCollection = collection(this.firestore, 'Refueling');
      await addDoc(refuelingCollection, {
        carId: this.carId,
        ...this.refuelingData,
      });
      await this.loadRefuelingDocuments(); // Refresh the list
    } catch (error) {
      console.error('Error adding refueling document:', error);
    }
  }
}
