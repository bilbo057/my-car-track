import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

interface Car {
  id?: string;
  Brand: string;
  Model: string;
  License_plate: string;
  Chassis_type: string;
  Engine_type: string;
  Year: string;
  Current_KM: number;
  Oil_change: string;
  Price_of_selling: number;
  photoNames?: string[];
  photoUrl?: string;
}

@Component({
  selector: 'app-car-market',
  templateUrl: './car-market.page.html',
  styleUrls: ['./car-market.page.scss'],
})
export class CarMarketPage implements OnInit {
  cars: Car[] = [];
  pageSize = 20;
  currentPage = 0;
  lastVisible: any = null;
  hasMoreCars = true;

  constructor(private firestore: AngularFirestore, private router: Router) {}

  ngOnInit() {
    this.loadCars();
  }

  async loadCars(reset: boolean = false) {
    if (reset) {
      this.cars = [];
      this.currentPage = 0;
      this.lastVisible = null;
      this.hasMoreCars = true;
    }

    let query = this.firestore.collection('Offers', ref =>
      ref.orderBy('Date_added', 'desc').limit(this.pageSize)
    );

    if (this.lastVisible) {
      query = this.firestore.collection('Offers', ref =>
        ref.orderBy('Date_added', 'desc').startAfter(this.lastVisible).limit(this.pageSize)
      );
    }

    try {
      const snapshot = await query.get().toPromise();
      if (snapshot && !snapshot.empty) {
        const newCars: Car[] = [];

        for (const doc of snapshot.docs) {
          const carData = doc.data() as Car;
          carData.id = doc.id;
          
          if (carData.photoNames && carData.photoNames.length > 0) {
            carData.photoUrl = await this.getImageUrl(carData.photoNames[0]);
          }

          newCars.push(carData);
        }

        this.cars.push(...newCars);
        this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
        this.hasMoreCars = newCars.length === this.pageSize;
      } else {
        this.hasMoreCars = false;
      }
    } catch (error) {
      console.error('Error loading cars for sale:', error);
    }
  }

  async getImageUrl(fileName: string): Promise<string> {
    try {
      const storage = getStorage();
      const imageRef = ref(storage, `car_images/${fileName}`);
      return await getDownloadURL(imageRef);
    } catch (error) {
      console.error('Error fetching image URL:', error);
      return '';
    }
  }

  nextPage() {
    if (this.hasMoreCars) {
      this.currentPage++;
      this.loadCars();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadCars(true);
    }
  }

  viewCarDetails(carId: string) {
    if (!carId) {
      console.error("Car ID is undefined. Cannot navigate.");
      return;
    }
    this.router.navigate([`/car-listing`, { carId }]);
  }
  
}
