import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';

@Component({
  selector: 'app-monthly-expenses',
  templateUrl: './monthly-expenses.page.html',
  styleUrls: ['./monthly-expenses.page.scss'],
})
export class MonthlyExpensesPage implements OnInit {
  carId: string = '';
  monthlyExpenses: any[] = []; // List of monthly expenses

  private firestore = getFirestore();

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('carId') || '';
    if (this.carId) {
      await this.loadMonthlyExpenses();
    }
  }

  // Fetch monthly expenses from Firestore
  private async loadMonthlyExpenses() {
    try {
      const expensesCollection = collection(this.firestore, 'Monthly_Spending');
      const q = query(expensesCollection, where('carID', '==', this.carId));
      const querySnapshot = await getDocs(q);
      this.monthlyExpenses = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error loading monthly expenses:', error);
    }
  }

  // Delete a specific monthly expense record
  async deleteExpenseRecord(recordId: string) {
    try {
      const expenseDoc = doc(this.firestore, 'Monthly_Spending', recordId);
      await deleteDoc(expenseDoc);
      this.monthlyExpenses = this.monthlyExpenses.filter((record) => record.id !== recordId);
      console.log('Monthly expense record deleted:', recordId);
    } catch (error) {
      console.error('Error deleting expense record:', error);
    }
  }
}
