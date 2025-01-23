import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-maintaining',
  templateUrl: './maintaining.page.html',
  styleUrls: ['./maintaining.page.scss'],
})
export class MaintainingPage implements OnInit {
  carId: string = '';
  maintainingDocuments: any[] = []; // List of maintenance documents
  maintainingOptions: any[] = []; // List of maintenance options
  selectedMaintainingType: string = ''; // Selected maintaining type
  maintainingData: any = {}; // Form data for adding maintenance
  private firestore = getFirestore();

  constructor(private route: ActivatedRoute, private alertController: AlertController) {}

  async ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('carId') || '';
    if (this.carId) {
      await this.loadMaintainingOptions();
      await this.loadMaintainingDocuments();
    }
  }

  private async loadMaintainingOptions() {
    try {
      const maintainingOptionsCollection = collection(this.firestore, 'Maintaining_options');
      const querySnapshot = await getDocs(maintainingOptionsCollection);
      this.maintainingOptions = querySnapshot.docs.map((doc) => ({
        label: doc.data()['label'],
        value: doc.data()['type'],
      }));
    } catch (error) {
      console.error('Error loading maintaining options:', error);
    }
  }

  private async loadMaintainingDocuments() {
    try {
      const maintainingCollection = collection(this.firestore, 'Maintaining');
      const q = query(maintainingCollection, where('carId', '==', this.carId));
      const querySnapshot = await getDocs(q);
      this.maintainingDocuments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error loading maintaining documents:', error);
    }
  }

  async openAddMaintainingPopup() {
    const alert = await this.alertController.create({
      header: 'Add Maintaining',
      inputs: [
        {
          name: 'cost',
          type: 'number',
          placeholder: 'Enter Cost',
        },
        {
          name: 'date',
          type: 'date',
          placeholder: 'Select Date',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Save',
          handler: async (data) => {
            if (this.selectedMaintainingType && data.cost && data.date) {
              this.maintainingData = {
                carId: this.carId,
                type: this.selectedMaintainingType,
                cost: data.cost,
                date: data.date,
              };
              await this.addMaintainingDocument(this.maintainingData);
            } else {
              console.error('All fields are required');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  private async addMaintainingDocument(maintainingData: any) {
    try {
      const maintainingCollection = collection(this.firestore, 'Maintaining');
      await addDoc(maintainingCollection, maintainingData);
      await this.loadMaintainingDocuments(); // Refresh the list
    } catch (error) {
      console.error('Error adding maintaining document:', error);
    }
  }
}
