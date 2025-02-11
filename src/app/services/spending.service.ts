import { Injectable } from '@angular/core';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class SpendingService {
  private firestore = getFirestore();

  constructor() {}

  async addExpense(carId: string, amount: number) {
    if (!carId || !amount) {
      console.error('Car ID or amount is missing.');
      return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Format as MM

    const monthlyDocRef = doc(this.firestore, 'Monthly_Spending', `${carId}_${year}-${month}`);
    const yearlyDocRef = doc(this.firestore, 'Yearly_Spending', `${carId}_${year}`);

    try {
      // Update or create monthly spending record
      await this.updateOrCreateSpending(monthlyDocRef, amount, 'month', `${year}-${month}`);

      // Update or create yearly spending record
      await this.updateOrCreateSpending(yearlyDocRef, amount, 'year', `${year}`);

      console.log(`Expense added: ${amount} for CarID ${carId} in ${year}-${month}`);
    } catch (error) {
      console.error('Error updating spending records:', error);
    }
  }

  private async updateOrCreateSpending(
    docRef: any,
    amount: number,
    period: 'month' | 'year',
    startPeriod: string
  ) {
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const data = docSnapshot.data() as { spentsThisPeriod?: number };

      await updateDoc(docRef, {
        spentsThisPeriod: (data.spentsThisPeriod || 0) + amount,
        lastSpent: new Date().toISOString(),
      });
    } else {
      // If no record exists, create a new one
      await setDoc(docRef, {
        carID: docRef.id.split('_')[0], // Extract CarID from the doc name
        startOfPeriod: startPeriod,
        spentsThisPeriod: amount,
        lastSpent: new Date().toISOString(),
      });
    }
  }
}
