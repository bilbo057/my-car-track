import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { SpendingService } from '../services/spending.service';

@Component({
  selector: 'app-refueling',
  templateUrl: './refueling.page.html',
  styleUrls: ['./refueling.page.scss'],
})
export class RefuelingPage implements OnInit {
  carId: string = '';
  carFuelType: string = '';
  refuelingDocuments: any[] = [];
  refuelingData: any = { date: '', fuelQuantity: null, cost: null, odometer: null };
  showForm: boolean = false;
  showValidation: boolean = false;
  private firestore = getFirestore();

  constructor(private route: ActivatedRoute, private spendingService: SpendingService) {}

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
        this.carFuelType = carData['Engine_type'];
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
    if (!this.validateForm()) return;

    if (this.refuelingData.date && this.refuelingData.fuelQuantity && this.refuelingData.cost && this.refuelingData.odometer) {
      try {
        const formattedDate = this.formatDate(this.refuelingData.date);

        const refuelingCollection = collection(this.firestore, 'Refueling');
        await addDoc(refuelingCollection, {
          carId: this.carId,
          fuelType: this.carFuelType,
          date: formattedDate,
          fuelQuantity: this.refuelingData.fuelQuantity,
          cost: this.refuelingData.cost,
          odometer: this.refuelingData.odometer,
        });

        await this.spendingService.addExpense(this.carId, this.refuelingData.cost);

        this.refuelingData = { date: '', fuelQuantity: null, cost: null, odometer: null };
        this.showForm = false;
        this.showValidation = false;
        await this.loadRefuelingDocuments();
      } catch (error) {
        console.error('Error adding refueling record:', error);
      }
    } else {
      console.error('All fields are required.');
    }
  }

  onDateChange(selectedDate: string) {
    this.refuelingData.date = selectedDate;
  }

  async deleteRefuelingRecord(recordId: string) {
    try {
      const refuelDoc = doc(this.firestore, 'Refueling', recordId);
      const docSnap = await getDoc(refuelDoc);

      if (docSnap.exists()) {
        const data = docSnap.data();
        await deleteDoc(refuelDoc);
        this.refuelingDocuments = this.refuelingDocuments.filter((record) => record.id !== recordId);

        await this.spendingService.subtractExpense(this.carId, data['cost']);
      }
    } catch (error) {
      console.error('Error deleting refueling record:', error);
    }
  }

  validateForm(): boolean {
    this.showValidation = true;
  
    const { fuelQuantity, cost, odometer, date } = this.refuelingData;
  
    const isQuantityValid = fuelQuantity !== null && fuelQuantity >= 0 && fuelQuantity <= 200;
    const isCostValid = cost !== null && cost >= 0 && cost <= 600;
    const isOdometerValid = odometer !== null && odometer >= 0 && odometer <= 10000000;
    const isDateValid = !!date;
  
    return isQuantityValid && isCostValid && isOdometerValid && isDateValid;
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
