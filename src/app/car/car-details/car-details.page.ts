import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController } from '@ionic/angular';
import { getStorage, ref, getDownloadURL, deleteObject } from 'firebase/storage';

interface User {
  UID: string;
  username: string;
}

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
    private alertController: AlertController
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

  async deleteCar() {
    if (this.carId) {
        try {
            await this.deleteCarPhotos(); 
            await this.firestore.collection('Cars').doc(this.carId).delete();
            console.log('Car deleted successfully');
            await this.deleteRelatedDocuments();
            this.router.navigate(['/cars']);
        } catch (error) {
            console.error('Error deleting car:', error);
        }
    }
  }

  private async deleteRelatedDocuments() {
    await Promise.all([
      this.deleteUserCarDocument(),
      this.deleteCarOffers(),
      this.deleteMonthlySpending(),
      this.deleteYearlySpending(),
      this.deleteAllTimeSpending(),
      this.deleteAnnualTaxRecords(), 
      this.deleteAnotherExpensesRecords(),
      this.deleteMaintainingRecords(),
      this.deleteMechanicalBills(),
      this.deleteRefuelingRecords(),
      this.deleteTollTaxRecords(),
      this.deleteVehicleInsuranceRecords(),
      this.deleteYearlyVehicleCheckRecords(),
    ]);
  }

  private async deleteCarOffers() {
    try {
      const offersCollection = this.firestore.collection('Offers');
      const offersQuerySnapshot = await offersCollection.ref.where('CarID', '==', this.carId).get();
      if (!offersQuerySnapshot.empty) {
        const batch = this.firestore.firestore.batch();
        offersQuerySnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log('Offers associated with the car deleted successfully.');
      }
    } catch (error) {
      console.error('Error deleting offers:', error);
    }
  }  

  private async deleteCarPhotos() {
    try {
        if (!this.carDetails.photoNames || this.carDetails.photoNames.length === 0) {
            return;
        }
        const storage = getStorage();
        const deletePromises = this.carDetails.photoNames.map(async (fileName: string) => {
            const imageRef = ref(storage, `car_images/${fileName}`);
            await deleteObject(imageRef);
        });
        await Promise.all(deletePromises);
        console.log('All car images deleted successfully.');
    } catch (error) {
        console.error('Error deleting car images:', error);
    }
  }

  private async deleteMonthlySpending() {
    try {
        const monthlySpendingCollection = this.firestore.collection('Monthly_Spending');
        const querySnapshot = await monthlySpendingCollection.ref.where('carID', '==', this.carId).get();
        if (!querySnapshot.empty) {
            const batch = this.firestore.firestore.batch();
            querySnapshot.docs.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();
            console.log('Monthly spending records deleted successfully.');
        }
    } catch (error) {
        console.error('Error deleting Monthly_Spending records:', error);
    }
  }

  private async deleteYearlySpending() {
      try {
          const yearlySpendingCollection = this.firestore.collection('Yearly_Spending');
          const querySnapshot = await yearlySpendingCollection.ref.where('carID', '==', this.carId).get();
          if (!querySnapshot.empty) {
              const batch = this.firestore.firestore.batch();
              querySnapshot.docs.forEach((doc) => batch.delete(doc.ref));
              await batch.commit();
              console.log('Yearly spending records deleted successfully.');
          }
      } catch (error) {
          console.error('Error deleting Yearly_Spending records:', error);
      }
  }

  private async deleteAllTimeSpending() {
      try {
          const allTimeSpendingCollection = this.firestore.collection('All_Time_Spending');
          const querySnapshot = await allTimeSpendingCollection.ref.where('carID', '==', this.carId).get();
          if (!querySnapshot.empty) {
              const batch = this.firestore.firestore.batch();
              querySnapshot.docs.forEach((doc) => batch.delete(doc.ref));
              await batch.commit();
              console.log('All-time spending records deleted successfully.');
          }
      } catch (error) {
          console.error('Error deleting All_Time_Spending records:', error);
      }
  }

  private async deleteYearlyVehicleCheckRecords() {
    try {
      const checksCollection = this.firestore.collection('YearlyVehicleCheck');
      const checksQuerySnapshot = await checksCollection.ref.where('carId', '==', this.carId).get();
      if (!checksQuerySnapshot.empty) {
        const batch = this.firestore.firestore.batch();
        checksQuerySnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log('Yearly vehicle check records deleted successfully.');
      }
    } catch (error) {
      console.error('Error deleting yearly vehicle check records:', error);
    }
  }  

  private async deleteVehicleInsuranceRecords() {
    try {
      const insuranceCollection = this.firestore.collection('VehicleInsurance');
      const insuranceQuerySnapshot = await insuranceCollection.ref.where('carId', '==', this.carId).get();
      if (!insuranceQuerySnapshot.empty) {
        const batch = this.firestore.firestore.batch();
        insuranceQuerySnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log('Vehicle insurance records deleted successfully.');
      }
    } catch (error) {
      console.error('Error deleting vehicle insurance records:', error);
    }
  }

  private async deleteTollTaxRecords() {
    try {
      const tollTaxCollection = this.firestore.collection('TollTax');
      const tollTaxQuerySnapshot = await tollTaxCollection.ref.where('carId', '==', this.carId).get();
      if (!tollTaxQuerySnapshot.empty) {
        const batch = this.firestore.firestore.batch();
        tollTaxQuerySnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log('Toll tax records deleted successfully.');
      }
    } catch (error) {
      console.error('Error deleting toll tax records:', error);
    }
  }  

  private async deleteAnotherExpensesRecords() {
    try {
      const expensesCollection = this.firestore.collection('AnotherExpenses');
      const expensesQuerySnapshot = await expensesCollection.ref.where('carId', '==', this.carId).get();
      if (!expensesQuerySnapshot.empty) {
        const batch = this.firestore.firestore.batch();
        expensesQuerySnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log('Another Expenses records deleted successfully.');
      }
    } catch (error) {
      console.error('Error deleting Another Expenses records:', error);
    }
  }

  private async deleteRefuelingRecords() {
    try {
      const refuelingCollection = this.firestore.collection('Refueling');
      const refuelingQuerySnapshot = await refuelingCollection.ref.where('carId', '==', this.carId).get();
      if (!refuelingQuerySnapshot.empty) {
        const batch = this.firestore.firestore.batch();
        refuelingQuerySnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log('Refueling records deleted successfully.');
      }
    } catch (error) {
      console.error('Error deleting Refueling records:', error);
    }
  }  

  private async deleteMechanicalBills() {
    try {
      const mechanicalBillsCollection = this.firestore.collection('MechanicalBills');
      const mechanicalBillsQuerySnapshot = await mechanicalBillsCollection.ref.where('carId', '==', this.carId).get();
      if (!mechanicalBillsQuerySnapshot.empty) {
        const batch = this.firestore.firestore.batch();
        mechanicalBillsQuerySnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log('Mechanical bills deleted successfully.');
      }
    } catch (error) {
      console.error('Error deleting Mechanical Bills:', error);
    }
  }  
  
  private async deleteMaintainingRecords() {
    try {
      const maintainingCollection = this.firestore.collection('Maintaining');
      const maintainingQuerySnapshot = await maintainingCollection.ref.where('carId', '==', this.carId).get();
      if (!maintainingQuerySnapshot.empty) {
        const batch = this.firestore.firestore.batch();
        maintainingQuerySnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log('Maintaining records deleted successfully.');
      }
    } catch (error) {
      console.error('Error deleting Maintaining records:', error);
    }
  }  

  private async deleteUserCarDocument() {
    try {
      const userCarSnapshot = await this.firestore.collection('User_car', (ref) =>
        ref.where('CarID', '==', this.carId)
      ).get().toPromise();
      if (userCarSnapshot?.empty === false) {
        const batch = this.firestore.firestore.batch();
        userCarSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log('User_car documents deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting User_car documents:', error);
    }
  }

  private async deleteAnnualTaxRecords() {
    try {
      const taxCollection = this.firestore.collection('AnnualTax');
      const taxQuerySnapshot = await taxCollection.ref.where('carId', '==', this.carId).get();
      if (!taxQuerySnapshot.empty) {
        const batch = this.firestore.firestore.batch();
        taxQuerySnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log('Annual tax records deleted successfully.');
      }
    } catch (error) {
      console.error('Error deleting annual tax records:', error);
    }
  }
}
