import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../../services/auth.service';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { delay } from 'rxjs';

@Component({
  selector: 'app-car-listing',
  templateUrl: './car-listing.page.html',
  styleUrls: ['./car-listing.page.scss'],
})
export class CarListingPage implements OnInit {
  carId: string = '';
  carDetails: any = null;
  sellingPrice: number | null = null;
  sellerId: string = '';
  description: string = '';
  photoUrls: string[] = [];
  currentPhotoIndex: number = 0;
  showValidation: boolean = false;
  isPriceValid: boolean = false;
  loading: boolean = false;
  listingError: string = '';

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
            this.photoUrls.push(url);
          }
        } else {
          this.photoUrls.push('assets/img/default-car.png');
        }
      } else {
        this.carDetails = null;
      }
    } catch (error) {
      this.carDetails = null;
    }
  }

  async getImageUrl(fileName: string): Promise<string> {
    try {
      const storage = getStorage();
      const imageRef = ref(storage, `car_images/${fileName}`);
      return await getDownloadURL(imageRef);
    } catch (error) {
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

  validatePrice() {
    if (this.sellingPrice === null || this.sellingPrice === undefined || isNaN(Number(this.sellingPrice))) {
      this.isPriceValid = false;
      return;
    }
    this.isPriceValid = this.sellingPrice >= 0 && this.sellingPrice <= 10000000;
  }

  async confirmListing() {
    this.showValidation = true;
    this.validatePrice();

    if (!this.sellingPrice || !this.isPriceValid) {
      return;
    }

    if (!this.sellerId) {
      this.listingError = 'Неуспешно обявяване – липсва потребителски идентификатор.';
      return;
    }

    this.loading = true;
    this.listingError = '';
    try {
      const offerData = {
        ...this.carDetails,
        Price_of_selling: this.sellingPrice,
        SellerId: this.sellerId,
        Description: this.description,
        photoUrls: this.photoUrls,
      };

      delete offerData.Price_of_buying;

      await this.firestore.collection('Offers').doc(this.carId).set(offerData);

      // Success: redirect to the offer details page (replace '/offer-details' with your route if different)
      delay(5000); // Optional delay for better UX
      this.router.navigate(['/car-offer-details', this.carId]);
    } catch (error) {
      this.listingError = 'Неуспешно обявяване на колата. Моля, опитайте отново.';
    } finally {
      this.loading = false;
    }
  }
}
