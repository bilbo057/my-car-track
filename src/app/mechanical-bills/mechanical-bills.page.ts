import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';

@Component({
  selector: 'app-mechanical-bills',
  templateUrl: './mechanical-bills.page.html',
  styleUrls: ['./mechanical-bills.page.scss'],
})
export class MechanicalBillsPage implements OnInit {
  carId: string = '';
  mechanicalBills: any[] = []; // List of mechanical bill records
  billData: any = { type: '', cost: '', date: '', description: '' }; // Form data
  showBillForm: boolean = false; // Toggle form visibility

  maintainingOptions = [
    { label: 'Двигател', value: 'engine' },
    { label: 'Гуми', value: 'tires' },
    { label: 'Спирачки', value: 'brake' },
    { label: 'Електроника', value: 'electronics' },
    { label: 'Окачване', value: 'suspension' },
    { label: 'Кутия', value: 'transmission' }
  ];

  private firestore = getFirestore();

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('carId') || '';
    if (this.carId) {
      await this.loadMechanicalBills();
    }
  }

  private async loadMechanicalBills() {
    try {
      const billsCollection = collection(this.firestore, 'MechanicalBills');
      const q = query(billsCollection, where('carId', '==', this.carId));
      const querySnapshot = await getDocs(q);
      this.mechanicalBills = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error loading mechanical bills:', error);
    }
  }

  async deleteMechanicalBill(recordId: string) {
    try {
      const billDoc = doc(this.firestore, 'MechanicalBills', recordId);
      await deleteDoc(billDoc);
      this.mechanicalBills = this.mechanicalBills.filter((record) => record.id !== recordId);
      console.log('Mechanical bill deleted:', recordId);
    } catch (error) {
      console.error('Error deleting mechanical bill:', error);
    }
  }

  // Format date as DD-MM-YYYY
  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  async addMechanicalBill() {
    if (this.billData.type && this.billData.cost && this.billData.date) {
      this.billData.date = this.formatDate(new Date(this.billData.date));

      try {
        const billsCollection = collection(this.firestore, 'MechanicalBills');
        await addDoc(billsCollection, {
          carId: this.carId,
          ...this.billData,
        });

        // Reset form and refresh records
        this.billData = { type: '', cost: '', date: '', description: '' };
        this.showBillForm = false;
        await this.loadMechanicalBills();
      } catch (error) {
        console.error('Error adding mechanical bill:', error);
      }
    } else {
      console.error('Type, Cost, and Date are required.');
    }
  }

  toggleBillForm() {
    this.showBillForm = !this.showBillForm;
  }
}
