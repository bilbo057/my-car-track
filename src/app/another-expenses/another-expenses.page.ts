import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';

@Component({
  selector: 'app-another-expenses',
  templateUrl: './another-expenses.page.html',
  styleUrls: ['./another-expenses.page.scss'],
})
export class AnotherExpensesPage implements OnInit {
  carId: string = '';
  expensesRecords: any[] = []; // List of expenses records
  expenseData: any = { date: '', cost: '', description: '' }; // Form data with description
  showExpenseForm: boolean = false; // Toggle form visibility

  private firestore = getFirestore();

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('carId') || '';
    if (this.carId) {
      await this.loadExpensesRecords();
    }
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

  async deleteExpenseRecord(recordId: string) {
    try {
      const expenseDoc = doc(this.firestore, 'AnotherExpenses', recordId);
      await deleteDoc(expenseDoc);
      this.expensesRecords = this.expensesRecords.filter((record) => record.id !== recordId);
      console.log('Expense record deleted:', recordId);
    } catch (error) {
      console.error('Error deleting expense record:', error);
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // ✅ Ensures YYYY-MM-DD format
  }

  async addExpenseRecord() {
    if (this.expenseData.date && this.expenseData.cost && this.expenseData.description) {
      // ✅ Ensure only YYYY-MM-DD is saved
      this.expenseData.date = this.formatDate(new Date(this.expenseData.date));

      try {
        const expensesCollection = collection(this.firestore, 'AnotherExpenses');
        await addDoc(expensesCollection, {
          carId: this.carId,
          ...this.expenseData,
        });

        // Reset form and refresh records
        this.expenseData = { date: '', cost: '', description: '' };
        this.showExpenseForm = false;
        await this.loadExpensesRecords();
      } catch (error) {
        console.error('Error adding expense record:', error);
      }
    } else {
      console.error('Date, cost, and description are required.');
    }
  }

  toggleExpenseForm() {
    this.showExpenseForm = !this.showExpenseForm;
  }
}
