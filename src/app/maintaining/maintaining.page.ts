import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

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
  maintainingData: any = { type: '', cost: '', date: '' }; // Form data for adding maintenance
  showMaintainingForm: boolean = false; // Toggle form visibility

  private firestore = getFirestore();

  constructor(private route: ActivatedRoute) {}

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

  async addMaintainingRecord() {
    if (this.maintainingData.type && this.maintainingData.cost && this.maintainingData.date) {
      try {
        const maintainingCollection = collection(this.firestore, 'Maintaining');
        await addDoc(maintainingCollection, {
          carId: this.carId,
          type: this.maintainingData.type,
          cost: this.maintainingData.cost,
          date: this.maintainingData.date,
        });

        // Reset the form and refresh the list
        this.maintainingData = { type: '', cost: '', date: '' };
        this.showMaintainingForm = false;
        await this.loadMaintainingDocuments();
      } catch (error) {
        console.error('Error adding maintaining document:', error);
      }
    } else {
      console.error('All fields are required.');
    }
  }

  toggleMaintainingForm() {
    this.showMaintainingForm = !this.showMaintainingForm;
  }
}
