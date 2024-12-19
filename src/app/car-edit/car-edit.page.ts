// car-edit.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { carBrands, carModels, chassisTypes, engineTypes, transmissionTypes } from '../../car-options'; // Adjust the path if needed

interface CarModel {
  ModelName: string;
}

@Component({
  selector: 'app-car-edit',
  templateUrl: './car-edit.page.html',
  styleUrls: ['./car-edit.page.scss'],
})
export class CarEditPage implements OnInit {
  carId: string = '';
  carDetails: any = {};
  brandName: string = '';
  filteredModels: CarModel[] = [];  // Filtered models based on the selected brand
  carBrands = carBrands;  // Expose to the template
  chassisTypes = chassisTypes;  // Expose to the template
  engineTypes = engineTypes;  // Expose to the template
  transmissionTypes = transmissionTypes;  // Expose to the template

  // Explicitly type carModels as Record<string, CarModel[]>
  carModels = carModels;

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.carId = params.get('id') || '';
      if (this.carId) {
        this.loadCarDetails();
      }
    });
  }

  async loadCarDetails() {
    try {
      const carDoc = await this.firestore.collection('Cars').doc(this.carId).get().toPromise();
      if (carDoc && carDoc.exists) {
        this.carDetails = carDoc.data();
  
        // Convert Date from DD-MM-YYYY to ISO format for ion-datetime
        if (this.carDetails.Date) {
          const [day, month, year] = this.carDetails.Date.split('-');
          this.carDetails.Date = `${year}-${month}-${day}`;
        }
      } else {
        console.error('Car not found');
        this.router.navigate(['/cars']);
      }
    } catch (error) {
      console.error('Error loading car details:', error);
    }
  }
  
  private setBrandName() {
    if (this.carDetails && this.carDetails.Brand) {
      const brand = carBrands.find(b => b.BrandID === this.carDetails.Brand);
      this.brandName = brand ? brand.BrandName : 'Unknown';
    }
  }

  // Method to filter models based on the selected brand
  loadModel(brandId: string) {
    if (brandId && this.carModels[brandId]) {
      this.filteredModels = this.carModels[brandId];
      // If the selected model isn't in the filtered list, reset to an empty string
      if (!this.filteredModels.some(model => model.ModelName === this.carDetails.Model)) {
        this.carDetails.Model = '';
      }
    } else {
      this.filteredModels = []; // Clear models if no brand is selected
    }
  }

  async saveCar() {
    try {
      const updatedCarDetails = { ...this.carDetails };
  
      // Convert Date from ISO format to DD-MM-YYYY
      if (updatedCarDetails.Date) {
        const date = new Date(updatedCarDetails.Date);
        updatedCarDetails.Date = `${('0' + date.getDate()).slice(-2)}-${('0' + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()}`;
      }
  
      await this.firestore.collection('Cars').doc(this.carId).update(updatedCarDetails);
      console.log('Car updated successfully');
      this.router.navigate(['/cars']);
    } catch (error) {
      console.error('Error updating car:', error);
    }
  }
}
