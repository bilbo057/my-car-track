import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { carBrands, carModels, chassisTypes, engineTypes, transmissionTypes } from '../car-options'; // Import options

@Component({
  selector: 'app-car-edit',
  templateUrl: './car-edit.page.html',
  styleUrls: ['./car-edit.page.scss'],
})
export class CarEditPage implements OnInit {
  carId: string = '';
  carData: any = {};
  carBrands = carBrands;
  carModels: { ModelName: string }[] = [];
  chassisTypes = chassisTypes;
  engineTypes = engineTypes;
  transmissionTypes = transmissionTypes;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.carId = params.get('id') || '';
      if (this.carId) {
        this.loadCarDetails();
      } else {
        console.error('Car ID is missing');
      }
    });
  }

  // Load car details from Firestore
  async loadCarDetails() {
    try {
      const carDoc = await this.firestore.collection('Cars').doc(this.carId).get().toPromise();
      if (carDoc?.exists) {
        this.carData = carDoc.data();
        this.carData.id = carDoc.id;
        this.loadModel(this.carData.Brand); // Populate models based on brand
      } else {
        console.error('Car not found');
      }
    } catch (error) {
      console.error('Error loading car details:', error);
    }
  }

  // Update the car in Firestore
  async updateCar() {
    try {
      await this.firestore.collection('Cars').doc(this.carId).update(this.carData);
      console.log('Car updated successfully');
      this.router.navigate(['/cars']); // Redirect to cars list
    } catch (error) {
      console.error('Error updating car:', error);
    }
  }

  // Load models based on the selected brand
  loadModel(brandId: string) {
    if (brandId && carModels[brandId]) {
      this.carModels = carModels[brandId];
    } else {
      this.carModels = [];
    }
  }

  // Navigate to the cars list
  goHome() {
    this.router.navigate(['/cars']);
  }
}
