import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, getDoc, deleteDoc } from 'firebase/firestore';

@Component({
  selector: 'app-refueling',
  templateUrl: './refueling.page.html',
  styleUrls: ['./refueling.page.scss'],
})
export class RefuelingPage implements OnInit {
  carId: string = '';
  carFuelType: string = ''; // Holds the fuel type of the car
  refuelingDocuments: any[] = []; // List of refueling documents
  refuelingData: any = { date: '', fuelQuantity: null, cost: null, odometer: null }; // Holds the form data
  showForm: boolean = false; // Toggle form visibility
  private firestore = getFirestore();

  constructor(private route: ActivatedRoute) {}

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

  async addRefuelingRecord() {
    if (this.refuelingData.date && this.refuelingData.fuelQuantity && this.refuelingData.cost && this.refuelingData.odometer) {
      try {
        const formattedDate = this.formatDate(this.refuelingData.date); // Ensure YYYY-MM-DD format

        const refuelingCollection = collection(this.firestore, 'Refueling');
        await addDoc(refuelingCollection, {
          carId: this.carId,
          fuelType: this.carFuelType, // Automatically set the car's fuel type
          date: formattedDate,
          fuelQuantity: this.refuelingData.fuelQuantity,
          cost: this.refuelingData.cost,
          odometer: this.refuelingData.odometer,
        });

        // Reset form and refresh list
        this.refuelingData = { date: '', fuelQuantity: null, cost: null, odometer: null };
        this.showForm = false;
        await this.loadRefuelingDocuments();
      } catch (error) {
        console.error('Error adding refueling record:', error);
      }
    } else {
      console.error('All fields are required.');
    }
  }

  async deleteRefuelingRecord(recordId: string) {
    try {
      const refuelDoc = doc(this.firestore, 'Refueling', recordId);
      await deleteDoc(refuelDoc);
      this.refuelingDocuments = this.refuelingDocuments.filter((record) => record.id !== recordId);
      console.log('Refueling record deleted:', recordId);
    } catch (error) {
      console.error('Error deleting refueling record:', error);
    }
  }

  private formatDate(date: string): string {
    const parsedDate = new Date(date);
    return `${parsedDate.getFullYear()}-${(parsedDate.getMonth() + 1).toString().padStart(2, '0')}-${parsedDate
      .getDate()
      .toString()
      .padStart(2, '0')}`;
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }
}
