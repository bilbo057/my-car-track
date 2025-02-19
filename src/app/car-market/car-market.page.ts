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
  filteredOffers: any[] = [];
  brands: string[] = [];
  models: string[] = [];
  selectedBrand: string = '';
  selectedModel: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  minYear: number | null = null;
  maxYear: number | null = null;
  minKM: number | null = null;
  maxKM: number | null = null;

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

      this.populateBrands();
      this.filteredOffers = [...this.offers]; // Initially display all offers
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

  populateBrands() {
    this.brands = [...new Set(this.offers.map(offer => offer.Brand))]; // Get unique brands
  }

  updateModels() {
    if (this.selectedBrand) {
      this.models = [...new Set(this.offers
        .filter(offer => offer.Brand === this.selectedBrand)
        .map(offer => offer.Model))];
    } else {
      this.models = [];
    }
    this.selectedModel = ''; // Reset model selection when brand changes
  }

  applyFilters() {
    this.filteredOffers = this.offers.filter(offer => {
      const offerYear = this.extractYear(offer.Year); // Extract year from DD-MM-YYYY
  
      return (
        (!this.selectedBrand || offer.Brand === this.selectedBrand) &&
        (!this.selectedModel || offer.Model === this.selectedModel) &&
        (this.minYear === null || offerYear >= this.minYear) &&
        (this.maxYear === null || offerYear <= this.maxYear) &&
        (this.minPrice === null || offer.Price_of_selling >= this.minPrice) &&
        (this.maxPrice === null || offer.Price_of_selling <= this.maxPrice) &&
        (this.minKM === null || offer.Current_KM >= this.minKM) &&
        (this.maxKM === null || offer.Current_KM <= this.maxKM)
      );
    });
  }  
  
  // Function to extract only the year from "DD-MM-YYYY"
  extractYear(dateString: string): number {
    const parts = dateString.split('-'); // Split "DD-MM-YYYY"
    return parseInt(parts[2], 10); // Extract and return the year
  }
}
