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
  colors: string[] = [];
  euroStandards: number[] = [1, 2, 3, 4, 5, 6];
  driveTypes: string[] = ['Front', 'Rear', 'AWD'];

  selectedBrand: string = '';
  selectedModel: string = '';
  selectedColor: string = '';
  selectedEuro: number | null = null;
  selectedDrive: string = '';

  minPrice: number | null = null;
  maxPrice: number | null = null;
  minYear: number | null = null;
  maxYear: number | null = null;
  minKM: number | null = null;
  maxKM: number | null = null;
  minVolume: number | null = null;
  maxVolume: number | null = null;
  minPower: number | null = null;
  maxPower: number | null = null;

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
          offer['offerId'] = doc.id; 

          if (offer['photoNames'] && offer['photoNames'].length > 0) {
            offer['photoUrl'] = await this.getImageUrl(offer['photoNames'][0]);
          }

          return offer;
        })
      );

      this.populateFilters();
      this.filteredOffers = [...this.offers];
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

  populateFilters() {
    this.brands = [...new Set(this.offers.map(offer => offer.Brand))];
    this.colors = [...new Set(this.offers.map(offer => offer.Color))];
  }

  updateModels() {
    if (this.selectedBrand) {
      this.models = [...new Set(this.offers
        .filter(offer => offer.Brand === this.selectedBrand)
        .map(offer => offer.Model))];
    } else {
      this.models = [];
    }
    this.selectedModel = '';
  }

  applyFilters() {
    this.filteredOffers = this.offers.filter(offer => {
      const offerYear = this.extractYear(offer.Year);
  
      return (
        (!this.selectedBrand || offer.Brand === this.selectedBrand) &&
        (!this.selectedModel || offer.Model === this.selectedModel) &&
        (!this.selectedColor || offer.Color === this.selectedColor) &&
        (!this.selectedEuro || offer.Euro === this.selectedEuro) &&
        (!this.selectedDrive || offer.Drive === this.selectedDrive) &&
        (this.minYear === null || offerYear >= this.minYear) &&
        (this.maxYear === null || offerYear <= this.maxYear) &&
        (this.minPrice === null || offer.Price_of_selling !== undefined && offer.Price_of_selling >= this.minPrice) &&
        (this.maxPrice === null || offer.Price_of_selling !== undefined && offer.Price_of_selling <= this.maxPrice) &&
        (this.minKM === null || offer.Current_KM !== undefined && offer.Current_KM >= this.minKM) &&
        (this.maxKM === null || offer.Current_KM !== undefined && offer.Current_KM <= this.maxKM) &&
        (this.minVolume === null || offer.Volume !== undefined && offer.Volume >= this.minVolume) &&
        (this.maxVolume === null || offer.Volume !== undefined && offer.Volume <= this.maxVolume) &&
        (this.minPower === null || offer.Power !== undefined && offer.Power >= this.minPower) &&
        (this.maxPower === null || offer.Power !== undefined && offer.Power <= this.maxPower)
      );
    });
  }  

  extractYear(dateString: string | undefined): number {
    if (!dateString || typeof dateString !== 'string' || !dateString.includes('-')) {
      return 0; // Return 0 if the date is missing or incorrectly formatted
    }
    const parts = dateString.split('-'); // Split "DD-MM-YYYY"
    return parseInt(parts[2], 10) || 0; // Extract and return the year, default to 0 if NaN
  }
  
}
