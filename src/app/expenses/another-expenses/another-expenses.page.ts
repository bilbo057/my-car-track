import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';

@Component({
  selector: 'app-another-expenses',
  templateUrl: './another-expenses.page.html',
  styleUrls: ['./another-expenses.page.scss'],
})
export class AnotherExpensesPage implements OnInit {
  carId: string = '';
  expensesRecords: any[] = [];
  expenseData: any = {
    date: '',
    cost: null,
    description: ''
  };
  showExpenseForm: boolean = false;
  showValidation: boolean = false;

  private firestore = getFirestore();

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('carId') || '';
    if (this.carId) {
      await this.loadExpensesRecords();
    }
  }

  toggleExpenseForm() {
    this.showExpenseForm = !this.showExpenseForm;
    this.showValidation = false;
  }

  private async loadExpensesRecords() {
    try {
      const expensesCollection = collection(this.firestore, 'AnotherExpenses');
      const q = query(expensesCollection, where('carId', '==', this.carId));
      const querySnapshot = await getDocs(q);
      this.expensesRecords = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error loading expenses records:', error);
    }
  }

  async addExpenseRecord() {
    this.showValidation = true;

    const { date, cost, description } = this.expenseData;
    const isValid =
      date &&
      cost != null &&
      cost >= 0 &&
      cost <= 1000000 &&
      description;

    if (!isValid) return;

    this.expenseData.date = this.formatDate(new Date(this.expenseData.date));

    try {
      const expensesCollection = collection(this.firestore, 'AnotherExpenses');
      await addDoc(expensesCollection, {
        carId: this.carId,
        ...this.expenseData,
      });

      await this.updateSpending(this.expenseData.cost);

      this.expenseData = { date: '', cost: null, description: '' };
      this.showExpenseForm = false;
      this.showValidation = false;
      await this.loadExpensesRecords();
    } catch (error) {
      console.error('Error adding expense record:', error);
    }
  }

  async deleteExpenseRecord(recordId: string) {
    try {
      const record = this.expensesRecords.find((r) => r.id === recordId);
      if (record) {
        await this.updateSpending(-record.cost);
      }

      const expenseDoc = doc(this.firestore, 'AnotherExpenses', recordId);
      await deleteDoc(expenseDoc);
      this.expensesRecords = this.expensesRecords.filter((r) => r.id !== recordId);
    } catch (error) {
      console.error('Error deleting expense record:', error);
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
          spentsThisPeriod: (existingData.spentsThisPeriod || 0) + amount,
          lastSpent: new Date().toISOString(),
        });
      } else {
        const docPath = docRef.path;
        const [collectionName] = docPath.split('/');
        await addDoc(collection(this.firestore, collectionName), {
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
