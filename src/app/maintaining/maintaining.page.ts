//maintaining.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';

@Component({
  selector: 'app-maintaining',
  templateUrl: './maintaining.page.html',
  styleUrls: ['./maintaining.page.scss'],
})
export class MaintainingPage implements OnInit {
  carId: string = '';
  maintainingDocuments: any[] = [];
  maintainingData: any = { type: '', cost: '', date: '', description: '' };
  showForm: boolean = false;
  showValidation: boolean = false;

  private firestore = getFirestore();

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
      await this.loadMaintainingRecords();
    }
  }

  validateForm(): boolean {
    this.showValidation = true;
  
    const { type, cost, date } = this.maintainingData;
  
    const isTypeValid = !!type;
    const isCostValid = cost !== null && cost !== '' && +cost >= 0 && +cost <= 5000;
    const isDateValid = !!date;
  
    return isTypeValid && isCostValid && isDateValid;
  }  

  private async loadMaintainingRecords() {
    try {
      const maintainingCollection = collection(this.firestore, 'Maintaining');
      const q = query(maintainingCollection, where('carId', '==', this.carId));
      const querySnapshot = await getDocs(q);
      this.maintainingDocuments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error loading maintaining records:', error);
    }
  }

  async addMaintainingRecord() {
    if (!this.validateForm()) return;
  
    try {
      const formattedDate = this.formatDate(this.maintainingData.date);
  
      const maintainingCollection = collection(this.firestore, 'Maintaining');
      await addDoc(maintainingCollection, {
        carId: this.carId,
        type: this.maintainingData.type,
        cost: +this.maintainingData.cost,
        date: formattedDate,
        description: this.maintainingData.bonusDescription || ''
      });
  
      await this.updateSpending(+this.maintainingData.cost);
  
      this.maintainingData = { type: '', cost: '', date: '', description: '' };
      this.showForm = false;
      this.showValidation = false;
      await this.loadMaintainingRecords();
    } catch (error) {
      console.error('Error adding maintaining record:', error);
    }
  }  

  async deleteMaintainingRecord(recordId: string) {
    try {
      const record = this.maintainingDocuments.find((r) => r.id === recordId);
      if (record) {
        await this.updateSpending(-record.cost);
      }
  
      const maintainingDoc = doc(this.firestore, 'Maintaining', recordId);
      await deleteDoc(maintainingDoc);
  
      // Remove from the local list
      this.maintainingDocuments = this.maintainingDocuments.filter((record) => record.id !== recordId);
      console.log('Maintaining record deleted:', recordId);
    } catch (error) {
      console.error('Error deleting maintaining record:', error);
    }
  }

  getSelectedTypeLabel(): string {
    const found = this.maintainingOptions.find(option => option.value === this.maintainingData.type);
    return found ? found.label : 'Избери';
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
      const yearlyDocRef = doc(this.firestore, 'Yearly_Spending', `${this.carId}_${year}`);
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