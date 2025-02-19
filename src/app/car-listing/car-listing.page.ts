import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../services/auth.service'; // Import AuthService
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

@Component({
  selector: 'app-car-listing',
  templateUrl: './car-listing.page.html',
  styleUrls: ['./car-listing.page.scss'],
})
export class CarListingPage implements OnInit {
  carId: string = '';
  carDetails: any = null;
  sellingPrice: number = 0;
  sellerId: string = ''; // Store the seller's ID
  description: string = ''; // Description field

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private authService: AuthService, // Inject AuthService
    private router: Router
  ) {}

  async ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.carId = params.get('carId') || '';  
      if (this.carId) {
        this.loadCarDetails();
      }
    });

    this.sellerId = await this.authService.getUserId(); // Get current user ID
  }

  async loadCarDetails() {
    try {
      const carDoc = await this.firestore.collection('Cars').doc(this.carId).get().toPromise();
      if (carDoc && carDoc.exists) {
        this.carDetails = carDoc.data();

        if (this.carDetails.photoNames && this.carDetails.photoNames.length > 0) {
          const firstPhotoName = this.carDetails.photoNames[0];
          this.carDetails.photoUrl = await this.getImageUrl(firstPhotoName);
        }

        if (this.carDetails.Date_added) {
          const rawDate = this.carDetails.Date_added;
          this.carDetails.Date_added = this.formatDate(rawDate);
        }
      } else {
        console.error('Car details not found in Firestore.');
        this.carDetails = null;
      }
    } catch (error) {
      console.error('Error loading car details:', error);
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

  private formatDate(date: string | Date): string {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return 'Invalid Date';
    }

    const day = parsedDate.getDate().toString().padStart(2, '0');
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = parsedDate.getFullYear();

    return `${day}-${month}-${year}`;
  }

  async confirmListing() {
    if (!this.sellingPrice || this.sellingPrice <= 0) {
      console.error('Invalid selling price');
      return;
    }

    if (!this.sellerId) {
      console.error('Seller ID is missing!');
      return;
    }

    try {
      const offerData = {
        ...this.carDetails,
        Price_of_selling: this.sellingPrice,
        SellerId: this.sellerId, // Store seller ID
        Description: this.description, // Store description
      };

      delete offerData.Price_of_buying;

      await this.firestore.collection('Offers').doc(this.carId).set(offerData);
      console.log('Car listed for sale successfully');
      this.router.navigate(['/cars']);
    } catch (error) {
      console.error('Error listing car for sale:', error);
    }
  }
}
