// yearly-vehicle-check.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { SpendingService } from '../services/spending.service';

@Component({
  selector: 'app-yearly-vehicle-check',
  templateUrl: './yearly-vehicle-check.page.html',
  styleUrls: ['./yearly-vehicle-check.page.scss'],
})
export class YearlyVehicleCheckPage implements OnInit {
  carId: string = '';
  vehicleCheckRecords: any[] = [];
  checkData: any = { startDate: '', endDate: '', cost: null };
  showCheckForm: boolean = false;

  private firestore = getFirestore();

  constructor(private route: ActivatedRoute, private spendingService: SpendingService) {}

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
      const checkDocRef = doc(this.firestore, 'YearlyVehicleCheck', recordId);
      const checkDocSnap = await getDoc(checkDocRef);

      if (checkDocSnap.exists()) {
        const checkData = checkDocSnap.data() as { cost?: number };
        const cost = checkData.cost || 0;

        await deleteDoc(checkDocRef);
        this.vehicleCheckRecords = this.vehicleCheckRecords.filter((record) => record.id !== recordId);

        await this.spendingService.subtractExpense(this.carId, cost);

        console.log(`Vehicle check record deleted: ${recordId}, cost subtracted: ${cost}`);
      } else {
        console.error('Vehicle check record not found.');
      }
    } catch (error) {
      console.error('Error deleting vehicle check record:', error);
    }
  }

  private calculateEndDate(startDate: string): string {
    const start = new Date(startDate);
    start.setFullYear(start.getFullYear() + 1);
    start.setDate(start.getDate() - 1);
    return this.formatDate(start);
  }

  private formatDate(date: Date | string): string {
    const parsedDate = new Date(date);
    return `${parsedDate.getFullYear()}-${(parsedDate.getMonth() + 1).toString().padStart(2, '0')}-${parsedDate
      .getDate()
      .toString()
      .padStart(2, '0')}`;
  }

  async addVehicleCheckRecord() {
    if (this.checkData.startDate && this.checkData.cost !== null) {
      this.checkData.startDate = this.formatDate(new Date(this.checkData.startDate));
      this.checkData.endDate = this.calculateEndDate(this.checkData.startDate);
      const cost = this.checkData.cost;

      try {
        const checksCollection = collection(this.firestore, 'YearlyVehicleCheck');
        await addDoc(checksCollection, {
          carId: this.carId,
          ...this.checkData,
        });

        await this.spendingService.addExpense(this.carId, cost);

        this.checkData = { startDate: '', endDate: '', cost: null };
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