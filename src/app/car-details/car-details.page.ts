// car-details.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController } from '@ionic/angular';
import { carBrands } from '../../car-options';

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
  
        // Map the Brand ID to the Brand Name
        if (this.carDetails && this.carDetails.Brand) {
          const brand = carBrands.find((b) => b.BrandID === this.carDetails.Brand);
          if (brand) {
            this.carDetails.Brand = brand.BrandName;
          }
        }
  
        // Fetch spending data from Monthly_Spending collection
        const monthlySpendingSnapshot = await this.firestore.collection('Monthly_Spending', (ref) =>
          ref.where('carID', '==', this.carId)
        ).get().toPromise();
  
        if (monthlySpendingSnapshot && !monthlySpendingSnapshot.empty) {
          const monthlyData = monthlySpendingSnapshot.docs[0].data() as { spentsThisMonth: number };
          this.carDetails.spentThisMonth = monthlyData.spentsThisMonth || 0;
        } else {
          this.carDetails.spentThisMonth = 0;
        }
  
        // Fetch spending data from Yearly_Spending collection
        const yearlySpendingSnapshot = await this.firestore.collection('Yearly_Spending', (ref) =>
          ref.where('carID', '==', this.carId)
        ).get().toPromise();
  
        if (yearlySpendingSnapshot && !yearlySpendingSnapshot.empty) {
          const yearlyData = yearlySpendingSnapshot.docs[0].data() as { spentsThisYear: number };
          this.carDetails.spentThisYear = yearlyData.spentsThisYear || 0;
        } else {
          this.carDetails.spentThisYear = 0;
        }
  
        // Fetch spending data from All_Time_Spending collection
        const allTimeSpendingSnapshot = await this.firestore.collection('All_Time_Spending', (ref) =>
          ref.where('carID', '==', this.carId)
        ).get().toPromise();
  
        if (allTimeSpendingSnapshot && !allTimeSpendingSnapshot.empty) {
          const allTimeData = allTimeSpendingSnapshot.docs[0].data() as { moneySpent: number };
          this.carDetails.totalSpent = allTimeData.moneySpent || 0;
        } else {
          this.carDetails.totalSpent = 0;
        }
      }
    } catch (error) {
      console.error('Error loading car details:', error);
    }
  }
  
  
  async deleteCar() {
    if (this.carId) {
      try {
        await this.firestore.collection('Cars').doc(this.carId).delete();
        console.log('Car deleted successfully');
        await this.deleteUserCarDocument();
        this.router.navigate(['/cars']);
      } catch (error) {
        console.error('Error deleting car:', error);
      }
    }
  }

  editCar() {
    if (this.carId) {
      this.router.navigate(['/car-edit', this.carId]);
    } else {
      console.error('Car ID is missing. Unable to navigate to edit page.');
    }
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

  async deleteUserCarDocument() {
    try {
      const userCarSnapshot = await this.firestore.collection('User_car', (ref) =>
        ref.where('CarID', '==', this.carId)
      ).get().toPromise();

      if (userCarSnapshot && !userCarSnapshot.empty) {
        const userCarDocId = userCarSnapshot.docs[0].id;
        await this.firestore.collection('User_car').doc(userCarDocId).delete();
        console.log('User_car document deleted successfully');
      } else {
        console.log('No User_car document found for this car.');
      }
    } catch (error) {
      console.error('Error deleting User_car document:', error);
    }
  }
}
