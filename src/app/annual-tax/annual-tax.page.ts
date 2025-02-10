import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';

@Component({
  selector: 'app-annual-tax',
  templateUrl: './annual-tax.page.html',
  styleUrls: ['./annual-tax.page.scss'],
})
export class AnnualTaxPage implements OnInit {
  carId: string = '';
  licensePlate: string = ''; // Car's license plate
  annualTaxDocuments: any[] = []; // List of annual tax records
  taxYear: number | null = null;
  paymentHalf: string = ''; // Selected half: "First Half", "Second Half", or "Full Year"
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
      // Mock license plate retrieval. Replace with actual Firestore call if needed.
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

        // Reset the form and refresh the list
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
}
