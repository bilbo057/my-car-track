import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-cars',
  templateUrl: './cars.page.html',
  styleUrls: ['./cars.page.scss'],
})
export class CarsPage implements OnInit {
  cars: any[] = []; // Array to store user's cars

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    const userId = await this.authService.getUserId(); // Get current user ID
    if (userId) {
      this.loadCars(userId); // Load cars for the current user
    } else {
      console.error("User ID not available.");
    }
  }

  // Function to fetch cars for the given user ID
  async loadCars(userId: string) {
    try {
      const carsRef = this.firestore.collection('Cars', ref =>
        ref.where('UserID', '==', userId) // Query to get cars for the specific user
      );
      const carsSnapshot = await carsRef.get().toPromise();
      if (carsSnapshot) {
        this.cars = carsSnapshot.docs.map(doc => doc.data());
      } else {
        console.log('No cars found for this user.');
      }
    } catch (error) {
      console.error('Error loading cars:', error);
    }
  }
}
