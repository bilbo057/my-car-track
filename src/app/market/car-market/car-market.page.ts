import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { IonModal } from '@ionic/angular';

@Component({
  selector: 'app-car-market',
  templateUrl: './car-market.page.html',
  styleUrls: ['./car-market.page.scss'],
})
export class CarMarketPage implements OnInit {
  @ViewChild('brandModal', { static: false }) brandModal!: IonModal;
  @ViewChild('modelModal', { static: false }) modelModal!: IonModal;
  @ViewChild('colorSelect', { static: false }) colorSelect!: any;
  @ViewChild('driveSelect', { static: false }) driveSelect!: any;
  @ViewChild('euroSelect', { static: false }) euroSelect!: any;

  offers: any[] = [];
  filteredOffers: any[] = [];

  // Typeahead structure
  brandOptions: { text: string; value: string; models: string[] }[] = [];
  modelOptions: { text: string; value: string }[] = [];
  selectedBrand: { text: string; value: string; models: string[] } | null = null;
  selectedModel: { text: string; value: string } | null = null;

  colors: string[] = [];
  euroStandards: number[] = [1, 2, 3, 4, 5, 6];
  driveTypes: string[] = ['Front', 'Rear', 'AWD'];
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

  validationErrors: { [key: string]: string } = {};

  private firestore = getFirestore();
  private storage = getStorage();
  private currentYear = new Date().getFullYear();

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
    // Build unique brands/models for typeahead
    const brandSet = new Map();
    this.offers.forEach(offer => {
      if (offer.Brand && !brandSet.has(offer.Brand)) {
        brandSet.set(offer.Brand, []);
      }
      if (offer.Brand && offer.Model && !brandSet.get(offer.Brand).includes(offer.Model)) {
        brandSet.get(offer.Brand).push(offer.Model);
      }
    });
    this.brandOptions = Array.from(brandSet.entries()).map(([brand, models]) => ({
      text: brand,
      value: brand,
      models,
    }));

    this.modelOptions = [];
    this.colors = [...new Set(this.offers.map(offer => offer.Color).filter(Boolean))];
  }

  brandSelectionChanged(selectedValues: string[]) {
    if (selectedValues.length > 0) {
      this.selectedBrand = this.brandOptions.find(b => b.value === selectedValues[0]) || null;
      this.selectedModel = null;
      this.modelOptions = this.selectedBrand?.models?.map((m: string) => ({ text: m, value: m })) || [];
    } else {
      this.selectedBrand = null;
      this.selectedModel = null;
      this.modelOptions = [];
    }
    this.brandModal?.dismiss();
  }

  modelSelectionChanged(selectedValues: string[]) {
    if (selectedValues.length > 0) {
      this.selectedModel = this.modelOptions.find(m => m.value === selectedValues[0]) || null;
    } else {
      this.selectedModel = null;
    }
    this.modelModal?.dismiss();
  }

  validateField(field: string) {
    this.validationErrors[field] = '';

    switch (field) {
      case 'minYear':
        if (this.minYear !== null && (this.minYear < 1900 || this.minYear > this.currentYear)) {
          this.validationErrors['minYear'] = 'Годината трябва да е между 1900 и ' + this.currentYear;
        }
        if (this.minYear && this.minYear.toString().length > 4) {
          this.validationErrors['minYear'] = 'Годината трябва да е до 4 цифри';
        }
        break;
      case 'maxYear':
        if (this.maxYear !== null && (this.maxYear < 1900 || this.maxYear > this.currentYear)) {
          this.validationErrors['maxYear'] = 'Годината трябва да е между 1900 и ' + this.currentYear;
        }
        if (this.maxYear && this.maxYear.toString().length > 4) {
          this.validationErrors['maxYear'] = 'Годината трябва да е до 4 цифри';
        }
        break;
      case 'minPrice':
        if (this.minPrice !== null && (this.minPrice < 0 || this.minPrice > 10000000)) {
          this.validationErrors['minPrice'] = 'Цената трябва да е между 0 и 10 000 000';
        }
        if (this.minPrice && this.minPrice.toString().length > 10) {
          this.validationErrors['minPrice'] = 'Цената трябва да е до 10 цифри';
        }
        break;
      case 'maxPrice':
        if (this.maxPrice !== null && (this.maxPrice < 0 || this.maxPrice > 10000000)) {
          this.validationErrors['maxPrice'] = 'Цената трябва да е между 0 и 10 000 000';
        }
        if (this.maxPrice && this.maxPrice.toString().length > 10) {
          this.validationErrors['maxPrice'] = 'Цената трябва да е до 10 цифри';
        }
        break;
      case 'minKM':
        if (this.minKM !== null && (this.minKM < 0 || this.minKM > 5000000)) {
          this.validationErrors['minKM'] = 'Километрите трябва да са между 0 и 5 000 000';
        }
        break;
      case 'maxKM':
        if (this.maxKM !== null && (this.maxKM < 0 || this.maxKM > 5000000)) {
          this.validationErrors['maxKM'] = 'Километрите трябва да са между 0 и 5 000 000';
        }
        break;
      case 'minVolume':
        if (this.minVolume !== null && (this.minVolume < 250 || this.minVolume > 10000)) {
          this.validationErrors['minVolume'] = 'Обемът трябва да е между 250 и 10 000';
        }
        break;
      case 'maxVolume':
        if (this.maxVolume !== null && (this.maxVolume < 250 || this.maxVolume > 10000)) {
          this.validationErrors['maxVolume'] = 'Обемът трябва да е между 250 и 10 000';
        }
        break;
      case 'minPower':
        if (this.minPower !== null && (this.minPower < 30 || this.minPower > 5000)) {
          this.validationErrors['minPower'] = 'Мощността трябва да е между 30 и 5 000';
        }
        break;
      case 'maxPower':
        if (this.maxPower !== null && (this.maxPower < 30 || this.maxPower > 5000)) {
          this.validationErrors['maxPower'] = 'Мощността трябва да е между 30 и 5 000';
        }
        break;
      default:
        break;
    }
  }

  isFormValid(): boolean {
    for (const errorKey in this.validationErrors) {
      if (this.validationErrors[errorKey]) {
        return false;
      }
    }
    if (
      (this.minYear && this.maxYear && this.minYear > this.maxYear) ||
      (this.minPrice && this.maxPrice && this.minPrice > this.maxPrice) ||
      (this.minKM && this.maxKM && this.minKM > this.maxKM) ||
      (this.minVolume && this.maxVolume && this.minVolume > this.maxVolume) ||
      (this.minPower && this.maxPower && this.minPower > this.maxPower)
    ) {
      return false;
    }
    return true;
  }

  applyFilters() {
    if (!this.isFormValid()) {
      return;
    }
    this.filteredOffers = this.offers.filter(offer => {
      const offerYear = this.extractYear(offer.Year);

      return (
        (!this.selectedBrand || offer.Brand === this.selectedBrand?.value) &&
        (!this.selectedModel || offer.Model === this.selectedModel?.value) &&
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
      return 0;
    }
    const parts = dateString.split('-');
    return parseInt(parts[2], 10) || 0;
  }
}
