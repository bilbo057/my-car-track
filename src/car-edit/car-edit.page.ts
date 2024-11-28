// car-edit.page.ts
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
  carEdit: any;

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.carId = params.get('id') || '';
      if (this.carId) {
        this.loadCarEdit();
      }
    });
  }

  async loadCarEdit() {
    try {
      const carDoc = await this.firestore.collection('Cars').doc(this.carId).get().toPromise();
      if (carDoc && carDoc.exists) {
        this.carEdit = carDoc.data();
      }
    } catch (error) {
      console.error('Error loading car Edit:', error);
    }
  }
  async deleteCar() {
    if (this.carId) {
      try {
        await this.firestore.collection('Cars').doc(this.carId).delete();  // Delete the car document
        console.log('Car deleted successfully');

        await this.deleteUserCarDocument();

        this.router.navigate(['/cars']);  // Navigate back to the car listing page
      } catch (error) {
        console.error('Error deleting car:', error);
      }
    }
  }

  // Method to navigate to the edit car page
editCar() {
  if (this.carId) {
    this.router.navigate([`/edit-car/${this.carId}`]);
  } else {
    console.error('Car ID is missing. Unable to navigate to edit page.');
  }
}

  private async deleteUserCarDocument() {
    try {
      // Query to find the User_car document associated with the car ID
      const userCarSnapshot = await this.firestore.collection('User_car', ref =>
        ref.where('CarID', '==', this.carId)
      ).get().toPromise();
  
      // Check if the snapshot exists and is not empty
      if (userCarSnapshot && !userCarSnapshot.empty) {
        const userCarDocId = userCarSnapshot.docs[0].id; // Get the ID of the User_car document
        await this.firestore.collection('User_car').doc(userCarDocId).delete();
        console.log('User_car document deleted successfully');
      } else {
        console.log('No User_car document found for this car.');
      }
    } catch (error) {
      console.error('Error deleting User_car document:', error);
    }
  }
  goHome() {
    this.router.navigate(['/cars']);
  }
}
