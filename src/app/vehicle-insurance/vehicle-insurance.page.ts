import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, getDoc, deleteDoc } from 'firebase/firestore';

@Component({
  selector: 'app-vehicle-insurance',
  templateUrl: './vehicle-insurance.page.html',
  styleUrls: ['./vehicle-insurance.page.scss'],
})
export class VehicleInsurancePage implements OnInit {
  carId: string = '';
  insuranceDocuments: any[] = []; // List of insurance records
  insuranceData: any = { startDate: '', endDate: '', cost: '' }; // Insurance form data
  showInsuranceForm: boolean = false; // Toggle form visibility

  private firestore = getFirestore();

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('carId') || '';
    if (this.carId) {
      await this.loadInsuranceDocuments();
    }
  }

  private async loadInsuranceDocuments() {
    try {
      const insuranceCollection = collection(this.firestore, 'VehicleInsurance');
      const q = query(insuranceCollection, where('carId', '==', this.carId));
      const querySnapshot = await getDocs(q);
      this.insuranceDocuments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error loading insurance documents:', error);
    }
  }

  async deleteInsuranceRecord(recordId: string) {
    try {
      const insuranceDoc = doc(this.firestore, 'VehicleInsurance', recordId);
      await deleteDoc(insuranceDoc);
      this.insuranceDocuments = this.insuranceDocuments.filter((record) => record.id !== recordId);
      console.log('Insurance record deleted:', recordId);
    } catch (error) {
      console.error('Error deleting insurance record:', error);
    }
  }

  // Method to calculate the end date (1 year minus 1 day after the start date)
  private calculateEndDate(startDate: string): string {
    const start = new Date(startDate);
    start.setFullYear(start.getFullYear() + 1);
    start.setDate(start.getDate() - 1); // One day before the same date next year
    return this.formatDate(start);
  }

  // Format date to DD-MM-YYYY
  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  async addInsuranceRecord() {
    if (this.insuranceData.startDate && this.insuranceData.cost) {
      this.insuranceData.startDate = this.formatDate(new Date(this.insuranceData.startDate));
      this.insuranceData.endDate = this.calculateEndDate(this.insuranceData.startDate);
      
      try {
        const insuranceCollection = collection(this.firestore, 'VehicleInsurance');
        await addDoc(insuranceCollection, {
          carId: this.carId,
          ...this.insuranceData,
        });

        // Reset form and refresh records
        this.insuranceData = { startDate: '', endDate: '', cost: '' };
        this.showInsuranceForm = false;
        await this.loadInsuranceDocuments();
      } catch (error) {
        console.error('Error adding insurance record:', error);
      }
    } else {
      console.error('Start date and cost are required.');
    }
  }

  toggleInsuranceForm() {
    this.showInsuranceForm = !this.showInsuranceForm;
  }
}
