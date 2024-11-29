import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-car-edit',
  templateUrl: './car-edit.page.html',
  styleUrls: ['./car-edit.page.scss'],
})
export class CarEditPage implements OnInit {
  carEdit: any = null; // The car object being edited
  carId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore
  ) {}

  async ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('id')!;
    await this.loadCarData();
  }

  async loadCarData() {
    try {
      const carDocRef = doc(this.firestore, `cars/${this.carId}`);
      const carDoc = await getDoc(carDocRef);
      if (carDoc.exists()) {
        this.carEdit = carDoc.data();
      } else {
        console.error('Car not found');
        this.router.navigate(['/cars']);
      }
    } catch (error) {
      console.error('Error loading car:', error);
      this.router.navigate(['/cars']);
    }
  }

  async saveCar() {
    try {
      const carDocRef = doc(this.firestore, `cars/${this.carId}`);
      await updateDoc(carDocRef, this.carEdit);
      console.log('Car updated successfully');
      this.router.navigate(['/cars']);
    } catch (error) {
      console.error('Error updating car:', error);
    }
  }

  goBack() {
    this.router.navigate(['/cars']);
  }
}
