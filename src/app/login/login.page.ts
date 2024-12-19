import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { getFirestore, doc, updateDoc, serverTimestamp, collection, getDocs, query, where, addDoc } from 'firebase/firestore';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: string;
  password: string;

  private firestore = getFirestore(); // Firestore instance

  constructor(private authService: AuthService, private router: Router) {
    this.email = ''; // Initialize email
    this.password = ''; // Initialize password
  }

  async login() {
    try {
      const userCredential = await this.authService.login(this.email, this.password);

      if (userCredential.user) {
        const userId = userCredential.user.uid;

        // Update last login and check/reset spendings
        await this.updateLastLogin(userId);
        await this.checkAndResetSpending();

        // Navigate to the home page after login
        this.router.navigate(['/cars']);
      } else {
        console.error('Login failed: No user returned.');
      }
    } catch (error) {
      console.error('Login failed', error);
      // Display an error message to the user
    }
  }

  // Update the lastLogin property in Firestore
  private async updateLastLogin(userId: string): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, 'Users', userId);
      await updateDoc(userDocRef, {
        lastLogin: serverTimestamp(),
      });
      console.log('Last login timestamp updated successfully.');
    } catch (error) {
      console.error('Error updating last login timestamp:', error);
    }
  }

  // Check and reset monthly and yearly spendings if needed
  private async checkAndResetSpending(): Promise<void> {
    try {
      const carsSnapshot = await getDocs(collection(this.firestore, 'Cars'));
      const currentDate = new Date();

      for (const carDoc of carsSnapshot.docs) {
        const carId = carDoc.id;

        // Check and reset monthly spending
        await this.checkAndResetMonthlySpending(carId, currentDate);

        // Check and reset yearly spending
        await this.checkAndResetYearlySpending(carId, currentDate);
      }
    } catch (error) {
      console.error('Error checking and resetting spendings:', error);
    }
  }

// Check and reset monthly spending
private async checkAndResetMonthlySpending(carId: string, currentDate: Date): Promise<void> {
  try {
    const monthlySpendingRef = collection(this.firestore, 'Monthly_Spending');
    const monthlySpendingQuery = query(monthlySpendingRef, where('carID', '==', carId));
    const monthlySnapshot = await getDocs(monthlySpendingQuery);

    if (!monthlySnapshot.empty) {
      const latestDoc = monthlySnapshot.docs[0].data();
      const lastMonth = new Date(latestDoc['startOfMonth'].toDate()).getMonth(); // Use ['startOfMonth']

      if (currentDate.getMonth() !== lastMonth) {
        await addDoc(monthlySpendingRef, {
          carID: carId,
          startOfMonth: currentDate,
          monthNumber: currentDate.getMonth() + 1,
          spentsThisMonth: 0,
          lastSpent: null,
        });
        console.log(`New monthly spending document created for car ID: ${carId}`);
      }
    }
  } catch (error) {
    console.error('Error checking/resetting monthly spending:', error);
  }
}

// Check and reset yearly spending
private async checkAndResetYearlySpending(carId: string, currentDate: Date): Promise<void> {
  try {
    const yearlySpendingRef = collection(this.firestore, 'Yearly_Spending');
    const yearlySpendingQuery = query(yearlySpendingRef, where('carID', '==', carId));
    const yearlySnapshot = await getDocs(yearlySpendingQuery);

    if (!yearlySnapshot.empty) {
      const latestDoc = yearlySnapshot.docs[0].data();
      const lastYear = new Date(latestDoc['startOfYear'].toDate()).getFullYear(); // Use ['startOfYear']

      if (currentDate.getFullYear() !== lastYear) {
        await addDoc(yearlySpendingRef, {
          carID: carId,
          startOfYear: currentDate,
          yearNumber: currentDate.getFullYear(),
          spentsThisYear: 0,
          lastSpent: null,
        });
        console.log(`New yearly spending document created for car ID: ${carId}`);
      }
    }
  } catch (error) {
    console.error('Error checking/resetting yearly spending:', error);
  }
}

}
