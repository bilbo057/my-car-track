import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';

@Component({
  selector: 'app-yearly-vehicle-check',
  templateUrl: './yearly-vehicle-check.page.html',
  styleUrls: ['./yearly-vehicle-check.page.scss'],
})
export class YearlyVehicleCheckPage implements OnInit {
  carId: string = '';
  vehicleCheckRecords: any[] = []; // List of vehicle check records
  checkData: any = { startDate: '', endDate: '', cost: '' }; // Form data
  showCheckForm: boolean = false; // Toggle form visibility

  private firestore = getFirestore();

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('carId') || '';
    if (this.carId) {
      await this.loadVehicleCheckRecords();
    }
  }

  private async loadVehicleCheckRecords() {
    try {
      const checksCollection = collection(this.firestore, 'YearlyVehicleCheck');
      const q = query(checksCollection, where('carId', '==', this.carId));
      const querySnapshot = await getDocs(q);
      this.vehicleCheckRecords = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error loading vehicle check records:', error);
    }
  }

  async deleteVehicleCheck(recordId: string) {
    try {
      const checkDoc = doc(this.firestore, 'YearlyVehicleCheck', recordId);
      await deleteDoc(checkDoc);
      this.vehicleCheckRecords = this.vehicleCheckRecords.filter((record) => record.id !== recordId);
      console.log('Vehicle check record deleted:', recordId);
    } catch (error) {
      console.error('Error deleting vehicle check record:', error);
    }
  }

  // Method to calculate the end date (1 year minus 1 day after the start date)
  private calculateEndDate(startDate: string): string {
    const start = new Date(startDate);
    start.setFullYear(start.getFullYear() + 1);
    start.setDate(start.getDate() - 1); // One day before the same date next year
    return this.formatDate(start);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // ✅ Ensures YYYY-MM-DD format
  }

  async addVehicleCheckRecord() {
    if (this.checkData.startDate && this.checkData.cost) {
      // ✅ Ensure only YYYY-MM-DD is saved
      const formattedStartDate = this.formatDate(new Date(this.checkData.startDate));
      this.checkData.startDate = formattedStartDate;
      this.checkData.endDate = this.calculateEndDate(formattedStartDate);

      try {
        const checksCollection = collection(this.firestore, 'YearlyVehicleCheck');
        await addDoc(checksCollection, {
          carId: this.carId,
          ...this.checkData,
        });

        // Reset form and refresh records
        this.checkData = { startDate: '', endDate: '', cost: '' };
        this.showCheckForm = false;
        await this.loadVehicleCheckRecords();
      } catch (error) {
        console.error('Error adding vehicle check record:', error);
      }
    } else {
      console.error('Start date and cost are required.');
    }
  }

  toggleCheckForm() {
    this.showCheckForm = !this.showCheckForm;
  }
}
