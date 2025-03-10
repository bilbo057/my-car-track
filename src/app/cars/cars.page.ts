import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

@Component({
  selector: 'app-cars',
  templateUrl: './cars.page.html',
  styleUrls: ['./cars.page.scss'],
})
export class CarsPage implements OnInit {
  cars: any[] = [];
  displayedCars: any[] = []; // Stores cars for the current page
  currentPage: number = 1;
  carsPerPage: number = 20;
  defaultImage: string = 'assets/img/default-car.jpg'; // Default image for cars with no pictures

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  async ngOnInit() {
    await this.refreshData();
  }

  async ionViewWillEnter() {
    await this.refreshData();
  }

  async refreshData() {
    const userId = await this.authService.getUserId();
    if (!userId) {
      console.error("User ID not available.");
      return;
    }

    try {
      const db = getFirestore();
      const userCarRef = collection(db, 'User_car');
      const userCarQuery = query(userCarRef, where('UserID', '==', userId));
      const userCarSnapshot = await getDocs(userCarQuery);

      if (!userCarSnapshot.empty) {
        const carIds = userCarSnapshot.docs.map(userCarDoc => userCarDoc.data()['CarID'] as string);

        const carPromises = carIds.map(carId => {
          const carDocRef = doc(db, 'Cars', carId);
          return getDoc(carDocRef);
        });

        const carSnapshots = await Promise.all(carPromises);
        this.cars = carSnapshots.filter(carDoc => carDoc.exists()).map(carDoc => carDoc.data());

        await this.updateCarImages();
        this.updateDisplayedCars();
      } else {
        console.warn('No cars found for the user.');
        this.cars = [];
        this.updateDisplayedCars();
      }
    } catch (error) {
      console.error('Error loading cars:', error);
    }
  }

  async updateCarImages() {
    const storage = getStorage();
    const imagePromises = this.cars.map(async (car) => {
      if (car.photoNames && car.photoNames.length > 0) {
        try {
          const imageRef = ref(storage, `car_images/${car.photoNames[0]}`);
          car.photoUrl = await getDownloadURL(imageRef);
        } catch (error) {
          console.error('Error fetching image URL:', error);
          car.photoUrl = this.defaultImage;
        }
      } else {
        car.photoUrl = this.defaultImage;
      }
    });

    await Promise.all(imagePromises);
  }

  updateDisplayedCars() {
    const start = (this.currentPage - 1) * this.carsPerPage;
    const end = start + this.carsPerPage;
    this.displayedCars = this.cars.slice(start, end);
  }

  nextPage() {
    if (this.currentPage * this.carsPerPage < this.cars.length) {
      this.currentPage++;
      this.updateDisplayedCars();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedCars();
    }
  }

  goToCarDetails(carId: string) {
    this.router.navigate([`/car-details/${carId}`]); 
  }

  getLicensePlateImage(char: string): string {
    return char ? `assets/license-plates/${char}.png` : 'assets/img/empty-plate.png';
  }  
}