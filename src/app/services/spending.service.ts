// spending.service.ts
import { Injectable } from '@angular/core';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class SpendingService {
  private firestore = getFirestore();

  constructor() {}

  async addExpense(carId: string, amount: number) {
    if (!carId || !amount) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    const monthlyDocRef = doc(this.firestore, 'Monthly_Spending', `${carId}_${year}-${month}`);
    const yearlyDocRef = doc(this.firestore, 'Yearly_Spending', `${carId}_${year}`);
    const allTimeDocRef = doc(this.firestore, 'All_Time_Spending', `${carId}`);

    await this.updateOrCreateSpending(monthlyDocRef, amount);
    await this.updateOrCreateSpending(yearlyDocRef, amount);
    await this.updateOrCreateSpendingAllTime(allTimeDocRef, amount, carId);
  }

  async subtractExpense(carId: string, amount: number) {
    if (!carId || !amount) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    const monthlyDocRef = doc(this.firestore, 'Monthly_Spending', `${carId}_${year}-${month}`);
    const yearlyDocRef = doc(this.firestore, 'Yearly_Spending', `${carId}_${year}`);
    const allTimeDocRef = doc(this.firestore, 'All_Time_Spending', `${carId}`);

    await this.updateOrCreateSpending(monthlyDocRef, -amount);
    await this.updateOrCreateSpending(yearlyDocRef, -amount);
    await this.updateOrCreateSpendingAllTime(allTimeDocRef, -amount, carId);
  }

  private async updateOrCreateSpending(docRef: any, amount: number) {
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const data = docSnapshot.data() as { spentsThisPeriod?: number };
      await updateDoc(docRef, {
        spentsThisPeriod: (data.spentsThisPeriod || 0) + amount,
        lastSpent: new Date().toISOString(),
      });
    } else {
      await setDoc(docRef, {
        carID: docRef.id.split('_')[0],
        spentsThisPeriod: amount,
        lastSpent: new Date().toISOString(),
      });
    }
  }

  private async updateOrCreateSpendingAllTime(docRef: any, amount: number, carId: string) {
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const data = docSnapshot.data() as { spentsThisPeriod?: number };
      await updateDoc(docRef, {
        spentsThisPeriod: (data.spentsThisPeriod || 0) + amount,
        lastSpent: new Date().toISOString(),
      });
    } else {
      // Fetch the car's purchase price
      const carDocRef = doc(this.firestore, 'Cars', carId);
      const carDocSnap = await getDoc(carDocRef);
      const carData = carDocSnap.data() || {};
      const initialCost = carData['Price_of_buying'] || 0;

      await setDoc(docRef, {
        carID: carId,
        spentsThisPeriod: initialCost + amount, 
        lastSpent: new Date().toISOString(),
      });
    }
  }
}