import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { carBrands } from '../car-options';  // Import carBrands array

@Component({
  selector: 'app-car-edit',
  templateUrl: './car-edit.page.html',
  styleUrls: ['./car-edit.page.scss'],
})
export class CarEditPage implements OnInit {
  carId: string = '';
  carDetails: any = {};
  brandName: string = '';  // Variable to hold the human-readable brand name

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
        this.setBrandName();  // Set the brand name after loading the car details
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
      this.brandName = brand ? brand.BrandName : 'Unknown';  // Set to 'Unknown' if brand not found
    }
  }

  goHome() {
    this.router.navigate(['/cars']);
  }
}
