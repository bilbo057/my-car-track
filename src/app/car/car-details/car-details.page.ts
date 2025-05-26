import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController } from '@ionic/angular';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { CarDeleteService } from '../../services/car-delete.service'; // <-- Correct relative path

interface SpendingData {
  spentsThisPeriod?: number;
}

@Component({
  selector: 'app-car-details',
  templateUrl: './car-details.page.html',
  styleUrls: ['./car-details.page.scss'],
})
export class CarDetailsPage implements OnInit {
  carId: string = '';
  carDetails: any;
  spentThisMonth: number = 0;
  spentThisYear: number = 0;
  totalSpent: number = 0;
  averageSpentPerMonth: number = 0;
  carImages: string[] = [];
  currentImageIndex: number = 0;
  showDetails = false;
  showSpendings = false;

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private router: Router,
    private alertController: AlertController,
    private carDeleteService: CarDeleteService
  ) {}

  async ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.carId = params.get('id') || '';
      if (this.carId) {
        this.loadCarDetails();
        this.loadSpendingData();
      }
    });
  }

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  toggleSpendings() {
    this.showSpendings = !this.showSpendings;
  }

  async loadCarDetails() {
    try {
      const carDoc = await this.firestore.collection('Cars').doc(this.carId).get().toPromise();
      if (carDoc && carDoc.exists) {
        this.carDetails = carDoc.data();
        if (this.carDetails.photoNames && this.carDetails.photoNames.length > 0) {
          const firstPhotoName = this.carDetails.photoNames[0];
          this.carDetails.photoUrl = await this.getImageUrl(firstPhotoName);
        } else {
          this.carDetails.photoUrl = 'assets/img/default-car.png'; 
        }
        if (this.carDetails.Date_added) {
          const rawDate = this.carDetails.Date_added;
          const formattedDate = this.formatDate(rawDate);
          this.carDetails.Date_added = formattedDate;
        }
      }
    } catch (error) {
      console.error('Error loading car details:', error);
    }
  }
  
  async updatePhotoUrl() {
    if (this.carDetails.photoNames && this.carDetails.photoNames.length > 0) {
      this.carDetails.photoUrl = await this.getImageUrl(this.carDetails.photoNames[this.currentImageIndex]);
    } else {
      this.carDetails.photoUrl = 'assets/img/default-car.png';
    }
  }

  async getImageUrl(fileName: string): Promise<string> {
    try {
      const imageRef = ref(getStorage(), `car_images/${fileName}`);
      return await getDownloadURL(imageRef);
    } catch (error) {
      console.error('Error fetching image URL:', error);
      return 'assets/img/default-car.png';
    }
  }

  showNextImage() {
    if (this.carDetails.photoNames && this.currentImageIndex < this.carDetails.photoNames.length - 1) {
      this.currentImageIndex++;
      this.updatePhotoUrl();
    }
  }

  showPreviousImage() {
    if (this.carDetails.photoNames && this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.updatePhotoUrl();
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
 
  async loadSpendingData() {
    try {
      await this.loadMonthlySpending();
      await this.loadYearlySpending();
      await this.loadAllTimeSpending();
      this.carDetails.spentThisMonth = this.spentThisMonth;
      this.carDetails.averageSpentThisMonth = this.averageSpentPerMonth;
      this.carDetails.spentThisYear = this.spentThisYear;
      this.carDetails.totalSpent = this.totalSpent;
    } catch (error) {
      console.error('Error loading spending data:', error);
    }
  }
  
  private async loadMonthlySpending() {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const monthlySpendingSnapshot = await this.firestore
        .collection('Monthly_Spending', (ref) => ref.where('carID', '==', this.carId))
        .get()
        .toPromise();
      if (monthlySpendingSnapshot && !monthlySpendingSnapshot.empty) {
        let monthlySpendingValues: number[] = [];
        monthlySpendingSnapshot.docs.forEach((doc) => {
          const data = doc.data() as SpendingData;
          if (data?.spentsThisPeriod !== undefined) {
            monthlySpendingValues.push(data.spentsThisPeriod);
          }
        });
        this.averageSpentPerMonth =
          monthlySpendingValues.length > 0
            ? monthlySpendingValues.reduce((sum, value) => sum + value, 0) / monthlySpendingValues.length
            : 0;
        const currentMonthDoc = monthlySpendingSnapshot.docs.find((doc) =>
          doc.id.includes(`${currentYear}-${currentMonth}`)
        );
        this.spentThisMonth = currentMonthDoc
          ? (currentMonthDoc.data() as SpendingData)?.spentsThisPeriod ?? 0
          : 0;
      } else {
        this.spentThisMonth = 0;
        this.averageSpentPerMonth = 0;
      }
    } catch (error) {
      console.error('Error loading monthly spending:', error);
    }
  }
  
  private async loadYearlySpending() {
    try {
      const currentYear = new Date().getFullYear();
      const yearlyDocSnap = await this.firestore
        .collection('Yearly_Spending')
        .doc(`${this.carId}_${currentYear}`)
        .get()
        .toPromise();
      this.spentThisYear = yearlyDocSnap?.exists
        ? (yearlyDocSnap.data() as SpendingData)?.spentsThisPeriod ?? 0
        : 0;
    } catch (error) {
      console.error('Error loading yearly spending:', error);
    }
  }
  
  private async loadAllTimeSpending() {
    try {
      const allTimeDocSnap = await this.firestore
        .collection('All_Time_Spending')
        .doc(this.carId)
        .get()
        .toPromise();
      this.totalSpent = allTimeDocSnap?.exists
        ? (allTimeDocSnap.data() as SpendingData)?.spentsThisPeriod ?? 0
        : 0;
    } catch (error) {
      console.error('Error loading all-time spending:', error);
    }
  }

  async deleteCar() {
    const alert = await this.alertController.create({
      header: 'Изтриване на кола',
      message: 'Сигурни ли сте, че искате да изтриете тази кола? Това действие е необратимо.',
      cssClass: 'custom-car-delete-alert',
      buttons: [
        {
          text: 'Отказ',
          role: 'cancel',
          cssClass: 'alert-cancel-btn'
        },
        {
          text: 'Изтрий',
          cssClass: 'alert-delete-btn',
          handler: async () => {
            try {
              await this.carDeleteService.deleteCarAndRelated(this.carId, this.carDetails);
              this.router.navigate(['/cars']);
            } catch (err) {
              // Optionally show an error toast or alert here
              console.error('Грешка при изтриване на колата:', err);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  editCar() {
    if (this.carId) {
      this.router.navigate(['/car-edit', this.carId]);
    } else {
      console.error('Car ID is missing. Unable to navigate to edit page.');
    }
  }
  goToRefueling() {
    if (this.carId) {
      this.router.navigate([`/refueling`, { carId: this.carId }]);
    } else {
      console.error('Car ID is missing. Unable to navigate to the refueling page.');
    }
  }
  goToToll() {
    if (this.carId) {
      this.router.navigate([`/toll-tax`, { carId: this.carId }]);
    } else {
      console.error('Car ID is missing. Unable to navigate to the refueling page.');
    }
  }
  goToAnnual() {
    if (this.carId) {
      this.router.navigate([`/annual-tax`, { carId: this.carId }]);
    } else {
      console.error('Car ID is missing. Unable to navigate to the refueling page.');
    }
  }
  goToMaintaining() {
    if (this.carId) {
      this.router.navigate([`/maintaining`, { carId: this.carId }]);
    } else {
      console.error('Car ID is missing. Unable to navigate to the refueling page.');
    }
  }
  goToInsurance() {
    if (this.carId) {
      this.router.navigate([`/vehicle-insurance`, { carId: this.carId }]);
    } else {
      console.error('Car ID is missing. Unable to navigate to the refueling page.');
    }
  }
  goToMechanicalbills() {
    if (this.carId) {
      this.router.navigate([`/mechanical-bills`, { carId: this.carId }]);
    } else {
      console.error('Car ID is missing. Unable to navigate to the refueling page.');
    }
  }
  goToYearlyCheck() {
    if (this.carId) {
      this.router.navigate([`/yearly-vehicle-check`, { carId: this.carId }]);
    } else {
      console.error('Car ID is missing. Unable to navigate to the refueling page.');
    }
  }
  goToAnotherExpenses() {
    if (this.carId) {
      this.router.navigate([`/another-expenses`, { carId: this.carId }]);
    } else {
      console.error('Car ID is missing. Unable to navigate to the refueling page.');
    }
  }
  goToMonthlyExpenses() {
    if (this.carId) {
      this.router.navigate([`/monthly-expenses`, { carId: this.carId }]);
    } else {
      console.error('Car ID is missing. Unable to navigate to the refueling page.');
    }
  }
  goToCarListing() {
    if (this.carId) {
      this.router.navigate([`/car-listing`, { carId: this.carId }]);
    } else {
      console.error('Car ID is missing. Unable to navigate to the refueling page.');
    }
  }

  goToAccessOwnership() {
    if (this.carId) {
      this.router.navigate(['/access-ownership', this.carId]);
    } else {
      console.error('Car ID is missing. Unable to navigate.');
    }
  }
}
