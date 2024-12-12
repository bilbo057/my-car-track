import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../../services/auth.service';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'; // Ensure these imports are correct


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
      const db = getFirestore(); // Initialize Firestore
  
      // Step 1: Fetch User_car documents for the given UserID
      const userCarRef = collection(db, 'User_car');
      const userCarQuery = query(userCarRef, where('UserID', '==', userId));
      const userCarSnapshot = await getDocs(userCarQuery);
  
      if (!userCarSnapshot.empty) {
        // Extract CarIDs from User_car documents
        const carIds = userCarSnapshot.docs.map(userCarDoc => {
          const data = userCarDoc.data();
          return data['CarID'] as string; // Explicitly type as string
        });
  
        // Step 2: Fetch car details for the retrieved CarIDs
        const carPromises = carIds.map(carId => {
          const carDocRef = doc(db, 'Cars', carId);
          return getDoc(carDocRef);
        });
  
        const carSnapshots = await Promise.all(carPromises);
  
        // Filter out non-existent car documents and map to data
        this.cars = carSnapshots
          .filter(carDoc => carDoc.exists())
          .map(carDoc => carDoc.data());
      } else {
        console.warn('No cars found for the user.');
        this.cars = [];
      }
    } catch (error) {
      console.error('Error loading cars:', error);
    }
  }
  

  // Method to navigate to the car details page
  goToCarDetails(carId: string) {
      this.router.navigate([`/car-details/${carId}`]);  // Pass the carId (which is the Firestore document ID)
  }
  goHome() {
    this.router.navigate(['/cars']);
  }
}
