// annual-tax.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';

@Component({
  selector: 'app-annual-tax',
  templateUrl: './annual-tax.page.html',
  styleUrls: ['./annual-tax.page.scss'],
})
export class AnnualTaxPage implements OnInit {
  carId: string = '';
  licensePlate: string = ''; 
  annualTaxDocuments: any[] = []; // List of annual tax records
  taxYear: number | null = null;
  paymentHalf: string = ''; // Selected half
  paymentDate: string = ''; // Payment date in YYYY-MM-DD format
  cost: number | null = null; // Cost of the tax payment
  showForm: boolean = false; // Toggle form visibility

  private firestore = getFirestore();

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('carId') || '';
    if (this.carId) {
      await this.loadCarDetails();
      await this.loadAnnualTaxDocuments();
    }
  }

  private async loadCarDetails() {
    try {
      this.licensePlate = `CAR-${this.carId}`;
    } catch (error) {
      console.error('Error loading car details:', error);
    }
  }

  private async loadAnnualTaxDocuments() {
    try {
      const taxCollection = collection(this.firestore, 'AnnualTax');
      const q = query(taxCollection, where('carId', '==', this.carId));
      const querySnapshot = await getDocs(q);
      this.annualTaxDocuments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error loading annual tax documents:', error);
    }
  }

  async addAnnualTaxRecord() {
    if (this.taxYear && this.paymentHalf && this.paymentDate && this.cost !== null) {
      try {
        const formattedDate = this.formatDate(this.paymentDate); // Ensure YYYY-MM-DD format

        const taxCollection = collection(this.firestore, 'AnnualTax');
        await addDoc(taxCollection, {
          carId: this.carId,
          licensePlate: this.licensePlate,
          taxYear: this.taxYear,
          paymentHalf: this.paymentHalf,
          paymentDate: formattedDate,
          cost: this.cost,
        });

        // Update spending records
        await this.updateSpending(this.cost);
        this.taxYear = null;
        this.paymentHalf = '';
        this.paymentDate = '';
        this.cost = null;
        this.showForm = false;
        await this.loadAnnualTaxDocuments();
      } catch (error) {
        console.error('Error adding annual tax document:', error);
      }
    } else {
      console.error('All fields are required.');
    }
  }

  async deleteAnnualTaxRecord(recordId: string) {
    try {
      const record = this.annualTaxDocuments.find((r) => r.id === recordId);
      if (record) {
        await this.updateSpending(-record.cost);
      }

      const taxDoc = doc(this.firestore, 'AnnualTax', recordId);
      await deleteDoc(taxDoc);
      this.annualTaxDocuments = this.annualTaxDocuments.filter((record) => record.id !== recordId);
      console.log('Annual tax record deleted:', recordId);
    } catch (error) {
      console.error('Error deleting annual tax record:', error);
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

  private async updateSpending(amount: number) {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');

      const monthlyDocRef = doc(this.firestore, 'Monthly_Spending', `${this.carId}_${year}-${month}`);
      const yearlyDocRef = doc(this.firestore, 'Yearly_Spending', `${this.carId}`);
      const allTimeDocRef = doc(this.firestore, 'All_Time_Spending', `${this.carId}`);

      await this.modifySpending(monthlyDocRef, amount);
      await this.modifySpending(yearlyDocRef, amount);
      await this.modifySpending(allTimeDocRef, amount);
    } catch (error) {
      console.error('Error updating spending:', error);
    }
  }

  private async modifySpending(docRef: any, amount: number) {
    try {
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const existingData = docSnapshot.data() as { spentsThisPeriod?: number };
        await updateDoc(docRef, {
          spentsThisPeriod: (existingData['spentsThisPeriod'] || 0) + amount,
          lastSpent: new Date().toISOString(),
        });
      } else {
        await addDoc(collection(this.firestore, docRef.path), {
          carID: this.carId,
          spentsThisPeriod: amount,
          lastSpent: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error modifying spending:', error);
    }
  }
}
