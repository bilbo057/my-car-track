// cars.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../services/auth.service';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

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
  
      const userCarRef = collection(db, 'User_car');
      const userCarQuery = query(userCarRef, where('UserID', '==', userId));
      const userCarSnapshot = await getDocs(userCarQuery);
  
      if (!userCarSnapshot.empty) {
        const carIds = userCarSnapshot.docs.map(userCarDoc => {
          const data = userCarDoc.data();
          return data['CarID'] as string;
        });
  
        const carPromises = carIds.map(carId => {
          const carDocRef = doc(db, 'Cars', carId);
          return getDoc(carDocRef);
        });
  
        const carSnapshots = await Promise.all(carPromises);
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
  
  goToCarDetails(carId: string) {
      this.router.navigate([`/car-details/${carId}`]); 
  }
}