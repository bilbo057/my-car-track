import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-car-details',
  templateUrl: './car-details.page.html',
  styleUrls: ['./car-details.page.scss'],
})
export class CarDetailsPage implements OnInit {
  carId: string = '';  // Initialize carId as an empty string
  carDetails: any;

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    // Get the carId from the route parameters
    this.route.paramMap.subscribe(params => {
      this.carId = params.get('id') || '';  // Retrieve the carId from URL
      if (this.carId) {
        this.loadCarDetails();
      } else {
        console.error('Car ID is missing');
      }
    });
  }

  // Function to load car details from Firestore
  async loadCarDetails() {
    try {
      const carDoc = await this.firestore.collection('Cars').doc(this.carId).get().toPromise();
      
      // Check if the document exists
      if (carDoc && carDoc.exists) {
        this.carDetails = carDoc.data();
      } else {
        console.error('Car not found');
      }
    } catch (error) {
      console.error('Error loading car details:', error);
    }
  }
}
