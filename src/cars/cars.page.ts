import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-cars',
  templateUrl: './cars.page.html',
  styleUrls: ['./cars.page.scss'],
})
export class CarsPage implements OnInit {
  cars: any[] = [];

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    const userId = await this.authService.getUserId();
    if (userId) {
      this.loadCars(userId);
    } else {
      console.error("User ID not available.");
    }
  }

  async loadCars(userId: string) {
    try {
      const carsRef = this.firestore.collection('Cars', ref =>
        ref.where('UserID', '==', userId)
      );
      const carsSnapshot = await carsRef.get().toPromise();
      if (carsSnapshot) {
        this.cars = carsSnapshot.docs.map(doc => doc.data());
      }
    } catch (error) {
      console.error('Error loading cars:', error);
    }
  }

  // Method to navigate to the car details page
  goToCarDetails(carId: string) {
      this.router.navigate([`/car-details/${carId}`]);  // Pass the carId (which is the Firestore document ID)
  }
}
