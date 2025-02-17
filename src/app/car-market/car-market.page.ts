import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

@Component({
  selector: 'app-car-market',
  templateUrl: './car-market.page.html',
  styleUrls: ['./car-market.page.scss'],
})
export class CarMarketPage implements OnInit {
  offers: any[] = [];

  private firestore = getFirestore();
  private storage = getStorage();

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadOffers();
  }

  async loadOffers() {
    try {
      const offersCollection = collection(this.firestore, 'Offers');
      const snapshot = await getDocs(offersCollection);

      this.offers = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const offer = doc.data();
          offer['offerId'] = doc.id; // Store the document ID
          
          if (offer['photoNames'] && offer['photoNames'].length > 0) {
            offer['photoUrl'] = await this.getImageUrl(offer['photoNames'][0]);
          }

          return offer;
        })
      );
    } catch (error) {
      console.error('Error loading offers:', error);
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

  viewOfferDetails(offerId: string) {
    this.router.navigate(['/car-offer-details', offerId]);
  }
}
