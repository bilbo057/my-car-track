import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { carBrands } from '../../car-options';
import { AlertController } from '@ionic/angular'; // Import AlertController

interface User {
  UID: string;
  username: string;
}

interface Car {
  Brand: string;
  Model: string;
  License_plate: string;
  [key: string]: any; // Handle any additional properties
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
    private alertController: AlertController // Inject AlertController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
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
        this.carDetails = carDoc.data() as Car; // Type assertion
  
        if (this.carDetails.Brand) {
          const brand = carBrands.find(b => b.BrandID === this.carDetails.Brand);
          if (brand) {
            this.carDetails.Brand = brand.BrandName;
          }
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

  private async deleteUserCarDocument() {
    try {
      const userCarSnapshot = await this.firestore.collection('User_car', ref =>
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

  async addUserToCar(data: { username: string }) {
    try {
      const userSnapshot = await this.firestore
        .collection<User>('Users', ref => ref.where('username', '==', data.username))
        .get()
        .toPromise();
  
      if (userSnapshot && !userSnapshot.empty) {
        const user = userSnapshot.docs[0].data() as User; // Type assertion
        const userId = user.UID;
  
        await this.firestore.collection('User_car').add({
          UserID: userId,
          CarID: this.carId,
        });
  
        console.log(`User "${data.username}" added to car successfully.`);
      } else {
        console.error(`User "${data.username}" not found.`);
      }
    } catch (error) {
      console.error('Error adding user to car:', error);
    }
  }

  async showAddUserPopup() {
    const alert = document.createElement('ion-alert');
    alert.header = 'Add User';
    alert.inputs = [
      {
        name: 'username',
        type: 'text',
        placeholder: 'Enter username',
      },
    ];
    alert.buttons = [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Add user canceled');
        },
      },
      {
        text: 'Add',
        handler: async (data) => {
          if (data.username) {
            await this.addUserToCar(data);
          } else {
            console.error('No username entered');
          }
        },
      },
    ];
  
    document.body.appendChild(alert);
    await alert.present();
  }
  

  goHome() {
    this.router.navigate(['/cars']);
  }
}
