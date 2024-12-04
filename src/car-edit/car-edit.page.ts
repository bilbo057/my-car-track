import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-car-edit',
  templateUrl: './car-edit.page.html',
  styleUrls: ['./car-edit.page.scss'],
})
export class CarEditPage implements OnInit {
  carData: any = null; // The car object to display
  carId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore
  ) {}

  ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('id')!;
    this.loadCarData();
  }

  async loadCarData() {
    try {
      const carDocRef = doc(this.firestore, `cars/${this.carId}`);
      const carDoc = await getDoc(carDocRef);

      if (carDoc.exists()) {
        this.carData = carDoc.data();
      } else {
        console.error(`Car with ID ${this.carId} not found.`);
        this.router.navigate(['/cars']);
      }
    } catch (error) {
      console.error('Error loading car data:', error);
      this.router.navigate(['/cars']);
    }
  }

  goBack() {
    this.router.navigate(['/cars']);
  }
}
