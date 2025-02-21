// car-offer-details.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

@Component({
  selector: 'app-car-offer-details',
  templateUrl: './car-offer-details.page.html',
  styleUrls: ['./car-offer-details.page.scss'],
})
export class CarOfferDetailsPage implements OnInit {
  offerId: string = '';
  carDetails: any = {};

  private firestore = getFirestore();
  private storage = getStorage();

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.offerId = params.get('id') || '';
      if (this.offerId) {
        this.loadOfferDetails();
      }
    });
  }

  async loadOfferDetails() {
    try {
      const offerDoc = doc(this.firestore, 'Offers', this.offerId);
      const offerSnapshot = await getDoc(offerDoc);
      
      if (offerSnapshot.exists()) {
        this.carDetails = offerSnapshot.data();
        
        if (this.carDetails.photoNames && this.carDetails.photoNames.length > 0) {
          const firstPhotoName = this.carDetails.photoNames[0];
          this.carDetails.photoUrl = await this.getImageUrl(firstPhotoName);
        }

        if (this.carDetails.Date_added) {
          this.carDetails.Date_added = this.formatDate(this.carDetails.Date_added);
        }

        if (this.carDetails.UserID) {
          this.carDetails.SellerUsername = await this.getSellerUsername(this.carDetails.UserID);
        } else {
          this.carDetails.SellerUsername = 'Unknown';
        }

      } else {
        console.error('Offer details not found');
      }
    } catch (error) {
      console.error('Error loading offer details:', error);
    }
  }

  async getImageUrl(fileName: string): Promise<string> {
    try {
      const imageRef = ref(this.storage, `car_images/${fileName}`);
      return await getDownloadURL(imageRef);
    } catch (error) {
      console.error('Error fetching image URL:', error);
      return '';
    }
  }

  async getSellerUsername(userId: string): Promise<string> {
    try {
      const userDocRef = doc(this.firestore, 'Users', userId);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        return userSnap.data()['username'] || 'Unknown';
      } else {
        return 'Unknown';
      }
    } catch (error) {
      console.error('Error fetching seller username:', error);
      return 'Unknown';
    }
  }

  startChat() {
    if (!this.carDetails.UserID) {
      console.error('Seller ID is missing.');
      return;
    }
    this.router.navigate(['/chat', this.carDetails.UserID]); 
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
}