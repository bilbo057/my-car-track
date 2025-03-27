// mechanical-bills.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { SpendingService } from '../../services/spending.service';

@Component({
  selector: 'app-mechanical-bills',
  templateUrl: './mechanical-bills.page.html',
  styleUrls: ['./mechanical-bills.page.scss'],
})
export class MechanicalBillsPage implements OnInit {
  carId: string = '';
  mechanicalBills: any[] = [];
  billData: any = { type: '', cost: '', date: '', description: '' };
  showBillForm: boolean = false;
  maintainingOptions = [
    { label: 'Двигател', value: 'engine' },
    { label: 'Гуми', value: 'tires' },
    { label: 'Спирачки', value: 'brake' },
    { label: 'Електроника', value: 'electronics' },
    { label: 'Окачване', value: 'suspension' },
    { label: 'Кутия', value: 'transmission' }
  ];
  showValidation: boolean = false;

  private firestore = getFirestore();

  constructor(private route: ActivatedRoute, private spendingService: SpendingService) {}

  ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('carId') || '';
    if (this.carId) {
      this.loadMechanicalBills();
    }
  }

  async loadMechanicalBills() {
    const billsCollection = collection(this.firestore, 'MechanicalBills');
    const q = query(billsCollection, where('carId', '==', this.carId));
    const querySnapshot = await getDocs(q);
    this.mechanicalBills = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
  
  getTypeLabel(value: string): string {
    const selected = this.maintainingOptions.find(option => option.value === value);
    return selected ? selected.label : 'Избери';
  }  

  validateForm(): boolean {
    this.showValidation = true;
  
    const { type, cost, date } = this.billData;
    const isTypeValid = !!type;
    const isDateValid = !!date;
    const isCostValid = cost !== null && cost !== '' && +cost >= 0 && +cost <= 1000000;
  
    return isTypeValid && isDateValid && isCostValid;
  }  

  async addMechanicalBill() {
    if (!this.validateForm()) return;
  
    const formattedDate = this.formatDate(new Date(this.billData.date));
    const billsCollection = collection(this.firestore, 'MechanicalBills');
    await addDoc(billsCollection, {
      carId: this.carId,
      type: this.billData.type,
      cost: +this.billData.cost,
      date: formattedDate,
      description: this.billData.description || ''
    });
  
    await this.spendingService.addExpense(this.carId, +this.billData.cost);
    this.billData = { type: '', cost: '', date: '', description: '' };
    this.showBillForm = false;
    this.showValidation = false;
    await this.loadMechanicalBills();
  }  

  async deleteMechanicalBill(recordId: string) {
    const billDoc = doc(this.firestore, 'MechanicalBills', recordId);
    const docSnap = await getDoc(billDoc);
    if (docSnap.exists()) {
      const data = docSnap.data();
      await deleteDoc(billDoc);
      this.mechanicalBills = this.mechanicalBills.filter(record => record.id !== recordId);
      await this.spendingService.subtractExpense(this.carId, data['cost']);
    }
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  toggleBillForm() {
    this.showBillForm = !this.showBillForm;
  }
}