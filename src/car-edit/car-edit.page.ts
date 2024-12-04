import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-car-edit',
  templateUrl: './car-edit.page.html',
  styleUrls: ['./car-edit.page.scss'],
})
export class CarEditPage implements OnInit {
  carId: string = '';
  carDetails: any = {};

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
      } else {
        console.error('Car not found');
        this.router.navigate(['/cars']);
      }
    } catch (error) {
      console.error('Error loading car details:', error);
    }
  }

  async saveCar() {
    try {
      await this.firestore.collection('Cars').doc(this.carId).update(this.carDetails);
      console.log('Car updated successfully');
      this.router.navigate(['/cars']);
    } catch (error) {
      console.error('Error updating car:', error);
    }
  }

  goHome() {
    this.router.navigate(['/cars']);
  }
}
