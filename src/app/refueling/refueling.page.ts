import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-refueling',
  templateUrl: './refueling.page.html',
  styleUrls: ['./refueling.page.scss'],
})
export class RefuelingPage implements OnInit {
  refuelingData: any = {}; // Refueling form data
  carId: string = ''; // CarID from route parameters
  private firestore = getFirestore(); // Firestore instance

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService) {}

  ngOnInit() {
    // Fetch the 'carId' from the route parameters
    this.carId = this.route.snapshot.paramMap.get('carId') || '';
    if (this.carId) {
      this.refuelingData.carId = this.carId; // Attach the carId to refueling data
    } else {
      console.error('CarID is missing. Cannot add refueling for an unspecified car.');
    }
  }

  async addRefueling() {
    try {
      const userId = await this.authService.getUserId();
      if (!userId) {
        console.error('User ID not available');
        return;
      }

      // Add the refueling document with CarID and userId
      const refuelingCollection = collection(this.firestore, 'Refueling');
      await addDoc(refuelingCollection, {
        ...this.refuelingData,
        carId: this.carId,
        userId,
        timestamp: new Date().toISOString(),
      });

      console.log('Refueling data added successfully');
      this.router.navigate(['/cars']); // Navigate back to the Cars page
    } catch (error) {
      console.error('Error adding refueling data:', error);
    }
  }
}
