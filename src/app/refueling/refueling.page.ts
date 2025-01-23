import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-refueling',
  templateUrl: './refueling.page.html',
  styleUrls: ['./refueling.page.scss'],
})
export class RefuelingPage implements OnInit {
  carId: string = '';
  carFuelType: string = ''; // Holds the fuel type of the car
  refuelingDocuments: any[] = []; // List of refueling documents
  refuelingData: any = {}; // Holds the form data
  private firestore = getFirestore();

  constructor(private route: ActivatedRoute, private alertController: AlertController) {}

  async ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('carId') || '';
    if (this.carId) {
      await this.getCarFuelType();
      await this.loadRefuelingDocuments();
    }
  }

  private async getCarFuelType() {
    try {
      const carDocRef = doc(this.firestore, 'Cars', this.carId);
      const carDoc = await getDoc(carDocRef);

      if (carDoc.exists()) {
        const carData = carDoc.data();
        this.carFuelType = carData['Engine_type']; // Get the engine type as the fuel type
      } else {
        console.error('Car document not found');
      }
    } catch (error) {
      console.error('Error fetching car fuel type:', error);
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
          handler: async (data) => {
            if (data.date && data.fuelQuantity && data.cost && data.odometer) {
              this.refuelingData = {
                ...data,
                fuelType: this.carFuelType, // Automatically set the car's fuel type
              };
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
        },
        {
          name: 'fuelQuantity',
          type: 'number',
          placeholder: 'Fuel Quantity (liters)',
        },
        {
          name: 'cost',
          type: 'number',
          placeholder: 'Cost',
        },
        {
          name: 'odometer',
          type: 'number',
          placeholder: 'Odometer (KM)',
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
