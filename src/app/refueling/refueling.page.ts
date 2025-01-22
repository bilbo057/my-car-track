import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-refueling',
  templateUrl: './refueling.page.html',
  styleUrls: ['./refueling.page.scss'],
})
export class RefuelingPage {
  refuelingData: any = {}; // Stores form data
  private firestore = getFirestore(); // Firestore instance

  constructor(private authService: AuthService, private router: Router) {}

  async addRefueling() {
    try {
      const userId = await this.authService.getUserId();
      if (!userId) {
        console.error('User ID not available');
        return;
      }

      // Add timestamp and user ID to the refueling data
      const refuelingCollection = collection(this.firestore, 'Refueling');
      await addDoc(refuelingCollection, {
        ...this.refuelingData,
        userId,
        timestamp: new Date().toISOString(),
      });

      console.log('Refueling data added successfully');
      this.router.navigate(['/cars']); // Navigate back to the Cars page
    } catch (error) {
      console.error('Error adding refueling data:', error);
    }
  }
}
