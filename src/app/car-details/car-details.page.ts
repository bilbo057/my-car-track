// car-details.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController } from '@ionic/angular';

interface User {
  UID: string;
  username: string;
}

@Component({
  selector: 'app-car-details',
  templateUrl: './car-details.page.html',
  styleUrls: ['./car-details.page.scss'],
})
export class CarDetailsPage implements OnInit {
  carId: string = '';
  carDetails: any;

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.carId = params.get('id') || '';
      if (this.carId) {
        this.loadCarDetails();
      }
    });
  }

  async loadCarDetails() {
    try {
      const carDoc = await this.firestore.collection('Cars').doc(this.carId).get().toPromise();
      if (carDoc && carDoc.exists) {
        this.carDetails = carDoc.data();
      }
      if (this.carDetails.Date_added) {
        const rawDate = this.carDetails.Date_added;
        const formattedDate = this.formatDate(rawDate);
        this.carDetails.Date_added = formattedDate;
      }
    } catch (error) {
      console.error('Error loading car details:', error);
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

  // Helper method 1: Fetch monthly spending
  private async displayMonthSpents() {
    try {
      const monthlySpendingSnapshot = await this.firestore.collection('Monthly_Spending', (ref) =>
        ref.where('carID', '==', this.carId)
      ).get().toPromise();
  
      if (monthlySpendingSnapshot && !monthlySpendingSnapshot.empty) {
        const monthlyData = monthlySpendingSnapshot.docs[0].data() as { spentsThisMonth: number };
        this.carDetails.spentThisMonth = monthlyData.spentsThisMonth || 0;
      } else {
        this.carDetails.spentThisMonth = 0;
      }
    } catch (error) {
      console.error('Error fetching monthly spending:', error);
    }
  }
  
  // Helper method 2: Fetch average monthly spending
  private async displayAverageMonthSpents() {
    try {
      const monthlySpendingSnapshot = await this.firestore.collection('Monthly_Spending', (ref) =>
        ref.where('carID', '==', this.carId)
      ).get().toPromise();
  
      if (monthlySpendingSnapshot && !monthlySpendingSnapshot.empty) {
        const monthlyData = monthlySpendingSnapshot.docs[0].data() as { spentsThisMonth: number; numberOfMonths: number };
        const numberOfMonths = monthlyData.numberOfMonths || 1;
        this.carDetails.averageSpentThisMonth = numberOfMonths > 1 
          ? monthlyData.spentsThisMonth / (numberOfMonths - 1) 
          : 0;
      } else {
        this.carDetails.averageSpentThisMonth = 0;
      }
    } catch (error) {
      console.error('Error fetching average monthly spending:', error);
    }
  }
  
  // Helper method 3: Fetch yearly spending
  private async displayYearlySpents() {
    try {
      const yearlySpendingSnapshot = await this.firestore.collection('Yearly_Spending', (ref) =>
        ref.where('carID', '==', this.carId)
      ).get().toPromise();
  
      if (yearlySpendingSnapshot && !yearlySpendingSnapshot.empty) {
        const yearlyData = yearlySpendingSnapshot.docs[0].data() as { spentsThisYear: number };
        this.carDetails.spentThisYear = yearlyData.spentsThisYear || 0;
      } else {
        this.carDetails.spentThisYear = 0;
      }
    } catch (error) {
      console.error('Error fetching yearly spending:', error);
    }
  }
  
  // Helper method 4: Fetch average yearly spending
  private async displayAverageYearlySpents() {
    try {
      const yearlySpendingSnapshot = await this.firestore.collection('Yearly_Spending', (ref) =>
        ref.where('carID', '==', this.carId)
      ).get().toPromise();
  
      if (yearlySpendingSnapshot && !yearlySpendingSnapshot.empty) {
        const yearlyData = yearlySpendingSnapshot.docs[0].data() as { spentsThisYear: number; numberOfYears: number };
        const numberOfYears = yearlyData.numberOfYears || 1;
        this.carDetails.averageSpentThisYear = numberOfYears > 1 
          ? yearlyData.spentsThisYear / (numberOfYears - 1) 
          : 0;
      } else {
        this.carDetails.averageSpentThisYear = 0;
      }
    } catch (error) {
      console.error('Error fetching average yearly spending:', error);
    }
  }
  
  // Helper method 5: Fetch total spending
  private async displayTotalSpent() {
    try {
      const allTimeSpendingSnapshot = await this.firestore.collection('All_Time_Spending', (ref) =>
        ref.where('carID', '==', this.carId)
      ).get().toPromise();
  
      if (allTimeSpendingSnapshot && !allTimeSpendingSnapshot.empty) {
        const allTimeData = allTimeSpendingSnapshot.docs[0].data() as { moneySpent: number };
        this.carDetails.totalSpent = allTimeData.moneySpent || 0;
      } else {
        this.carDetails.totalSpent = 0;
      }
    } catch (error) {
      console.error('Error fetching total spending:', error);
    }
  }    

  private formatDate(date: string | Date): string {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return 'Invalid Date'; // Handle invalid dates
    }
  
    // Format the date as DD-MM-YYYY
    const day = parsedDate.getDate().toString().padStart(2, '0');
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const year = parsedDate.getFullYear();
  
    return `${day}-${month}-${year}`;
  }
  

  async showAddUserPopup() {
    const alert = await this.alertController.create({
      header: 'Add User',
      inputs: [
        {
          name: 'username',
          type: 'text',
          placeholder: 'Enter username',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Add',
          handler: async (data) => {
            if (data.username) {
              await this.addUserToCar(data.username);
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async addUserToCar(username: string) {
    try {
      const userSnapshot = await this.firestore.collection('Users', (ref) =>
        ref.where('username', '==', username)
      ).get().toPromise();

      if (userSnapshot && !userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0].data() as User;

        const userCarCollectionRef = this.firestore.collection('User_car');
        await userCarCollectionRef.add({
          UserID: userDoc.UID,
          CarID: this.carId,
        });
        console.log('User added to car successfully');
      } else {
        console.error('User not found');
      }
    } catch (error) {
      console.error('Error adding user to car:', error);
    }
  }

  async transferOwnership() {
    const alert = await this.alertController.create({
      header: 'Transfer Ownership',
      inputs: [
        {
          name: 'username',
          type: 'text',
          placeholder: 'Enter new owner username',
        },
        {
          name: 'licensePlate',
          type: 'text',
          placeholder: 'Confirm car license plate',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Transfer',
          handler: async (data) => {
            if (data.username && data.licensePlate === this.carDetails.License_plate) {
              await this.executeTransferOwnership(data.username);
            } else {
              console.error('License plate verification failed');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async executeTransferOwnership(username: string) {
    try {
      const userSnapshot = await this.firestore.collection('Users', (ref) =>
        ref.where('username', '==', username)
      ).get().toPromise();

      if (userSnapshot && !userSnapshot.empty) {
        const newOwnerDoc = userSnapshot.docs[0].data() as User;

        const userCarSnapshot = await this.firestore.collection('User_car', (ref) =>
          ref.where('CarID', '==', this.carId)
        ).get().toPromise();

        if (userCarSnapshot && !userCarSnapshot.empty) {
          const batch = this.firestore.firestore.batch();

          userCarSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
          });

          const userCarCollectionRef = this.firestore.collection('User_car').ref;
          batch.set(userCarCollectionRef.doc(), {
            UserID: newOwnerDoc.UID,
            CarID: this.carId,
          });

          const carRef = this.firestore.collection('Cars').doc(this.carId).ref;
          batch.update(carRef, { UserID: newOwnerDoc.UID });

          await batch.commit();
          console.log('Ownership transferred successfully');
          this.router.navigate(['/cars']);
        }
      } else {
        console.error('New owner not found');
      }
    } catch (error) {
      console.error('Error transferring ownership:', error);
    }
  }

  async deleteCar() {
    if (this.carId) {
      try {
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

  private async deleteMonthlySpending() {
    try {
      const monthlySpendingSnapshot = await this.firestore.collection('Monthly_Spending', (ref) =>
        ref.where('carID', '==', this.carId)
      ).get().toPromise();

      if (monthlySpendingSnapshot?.empty === false) {
        const batch = this.firestore.firestore.batch();
        monthlySpendingSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log('Monthly_Spending documents deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting Monthly_Spending documents:', error);
    }
  }

  private async deleteYearlySpending() {
    try {
      const yearlySpendingSnapshot = await this.firestore.collection('Yearly_Spending', (ref) =>
        ref.where('carID', '==', this.carId)
      ).get().toPromise();

      if (yearlySpendingSnapshot?.empty === false) {
        const batch = this.firestore.firestore.batch();
        yearlySpendingSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log('Yearly_Spending documents deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting Yearly_Spending documents:', error);
    }
  }

  private async deleteAllTimeSpending() {
    try {
      const allTimeSpendingSnapshot = await this.firestore.collection('All_Time_Spending', (ref) =>
        ref.where('carID', '==', this.carId)
      ).get().toPromise();

      if (allTimeSpendingSnapshot?.empty === false) {
        const batch = this.firestore.firestore.batch();
        allTimeSpendingSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log('All_Time_Spending documents deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting All_Time_Spending documents:', error);
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
