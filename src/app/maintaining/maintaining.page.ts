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
  maintainingData: any = { type: '', cost: '', date: '', bonusDescription: '' }; // Form data with bonus description
  showForm: boolean = false; // Toggle form visibility

  private firestore = getFirestore();

  // Hardcoded maintaining options
  maintainingOptions = [
    { label: 'Двигател редовна', value: 'oil_change' },
    { label: 'Гуми', value: 'tires' },
    { label: 'Спирачки', value: 'brake' },
    { label: 'Акумолатор', value: 'battery' },
    { label: 'Окачване', value: 'suspension' },
    { label: 'Кутия', value: 'transmission' },
    { label: 'Климатик', value: 'AC' },
    { label: 'Двигател разширена', value: 'general_service' }
  ];

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('carId') || '';
    if (this.carId) {
      await this.loadMaintainingDocuments();
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
          bonusDescription: this.maintainingData.bonusDescription || '' // Store optional description
        });

        // Reset the form and refresh the list
        this.maintainingData = { type: '', cost: '', date: '', bonusDescription: '' };
        this.showForm = false;
        await this.loadMaintainingDocuments();
      } catch (error) {
        console.error('Error adding maintaining document:', error);
      }
    } else {
      console.error('All required fields must be filled.');
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }
}
