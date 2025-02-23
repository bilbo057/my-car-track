// car-listing.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../services/auth.service';
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
  sellerId: string = '';
  description: string = ''; 
  photoUrls: string[] = [];  
  currentPhotoIndex: number = 0;

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private authService: AuthService, 
    private router: Router
  ) {}

  async ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.carId = params.get('carId') || '';  
      if (this.carId) {
        this.loadCarDetails();
      }
    });

    this.sellerId = await this.authService.getUserId(); 
  }

  async loadCarDetails() {
    try {
      const carDoc = await this.firestore.collection('Cars').doc(this.carId).get().toPromise();
      if (carDoc && carDoc.exists) {
        this.carDetails = carDoc.data();
        this.photoUrls = [];

        if (this.carDetails.photoNames && this.carDetails.photoNames.length > 0) {
          for (const photoName of this.carDetails.photoNames) {
            const url = await this.getImageUrl(photoName);
            this.photoUrls.push(url); // Push each URL into the photoUrls array
          }
        } else {
          this.photoUrls.push('assets/img/default-car.png'); // Default image if no photos exist
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
      return 'assets/img/default-car.png';
    }
  }

  nextPhoto() {
    if (this.photoUrls.length > 1) {
      this.currentPhotoIndex = (this.currentPhotoIndex + 1) % this.photoUrls.length;
    }
  }

  previousPhoto() {
    if (this.photoUrls.length > 1) {
      this.currentPhotoIndex = (this.currentPhotoIndex + this.photoUrls.length - 1) % this.photoUrls.length;
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
        SellerId: this.sellerId,
        Description: this.description,
        photoUrls: this.photoUrls, // Include all photo URLs in the listing
      };

      delete offerData.Price_of_buying;

      await this.firestore.collection('Offers').doc(this.carId).set(offerData);
      console.log('Car listed for sale successfully');

      this.router.navigate(['/car-details', this.carId]);

    } catch (error) {
      console.error('Error listing car for sale:', error);
    }
  }
}