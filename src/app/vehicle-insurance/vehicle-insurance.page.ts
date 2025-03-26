// vehicle-insurance.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { SpendingService } from '../services/spending.service'; 

@Component({
  selector: 'app-vehicle-insurance',
  templateUrl: './vehicle-insurance.page.html',
  styleUrls: ['./vehicle-insurance.page.scss'],
})
export class VehicleInsurancePage implements OnInit {
  carId: string = '';
  insuranceDocuments: any[] = [];
  insuranceData: any = { startDate: '', endDate: '', cost: null };
  showInsuranceForm: boolean = false;
  showValidation: boolean = false;

  private firestore = getFirestore();

  constructor(private route: ActivatedRoute, private spendingService: SpendingService) {}

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

  validateForm(): boolean {
    this.showValidation = true;
  
    const { startDate, cost } = this.insuranceData;
    const isDateValid = !!startDate;
    const isCostValid = cost !== null && cost >= 0 && cost <= 10000;
  
    return isDateValid && isCostValid;
  }  

  async deleteInsuranceRecord(recordId: string) {
    try {
      const insuranceDoc = doc(this.firestore, 'VehicleInsurance', recordId);
      const docSnap = await getDoc(insuranceDoc);
  
      if (docSnap.exists()) {
        const data = docSnap.data();  // Capture the document data once
        await deleteDoc(insuranceDoc);
        this.insuranceDocuments = this.insuranceDocuments.filter((record) => record.id !== recordId);
        
        await this.spendingService.subtractExpense(this.carId, data['cost']);
      }
    } catch (error) {
      console.error('Error deleting insurance record:', error);
    }
  }

  async addInsuranceRecord() {
    if (!this.validateForm()) return;
  
    this.insuranceData.startDate = this.formatDate(new Date(this.insuranceData.startDate));
    this.insuranceData.endDate = this.calculateEndDate(this.insuranceData.startDate);
  
    try {
      const insuranceCollection = collection(this.firestore, 'VehicleInsurance');
      await addDoc(insuranceCollection, {
        carId: this.carId,
        ...this.insuranceData,
      });
  
      await this.spendingService.addExpense(this.carId, this.insuranceData.cost);
  
      this.insuranceData = { startDate: '', endDate: '', cost: null };
      this.showInsuranceForm = false;
      this.showValidation = false;
      await this.loadInsuranceDocuments();
    } catch (error) {
      console.error('Error adding insurance record:', error);
    }
  }  

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  private calculateEndDate(startDate: string): string {
    const start = new Date(startDate);
    start.setFullYear(start.getFullYear() + 1);
    start.setDate(start.getDate() - 1);
    return this.formatDate(start);
  }

  toggleInsuranceForm() {
    this.showInsuranceForm = !this.showInsuranceForm;
  }
}