import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController, ToastController } from '@ionic/angular';

interface User {
  UID: string;
  username: string;
  email?: string;
}

interface CarAccessUser {
  id: string;
  UserID: string;
  username: string;
  email: string;
}

@Component({
  selector: 'app-access-ownership',
  templateUrl: './access-ownership.page.html',
  styleUrls: ['./access-ownership.page.scss'],
})
export class AccessOwnershipPage implements OnInit {
  carId: string = '';
  carDetails: any = null;
  carUsers: CarAccessUser[] = [];
  loadingUsers = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: AngularFirestore,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.carId = params.get('carId') || '';
      if (this.carId) {
        this.loadCarDetails();
        this.loadCarUsers();
      }
    });
  }

  async loadCarDetails() {
    try {
      const carDoc = await this.firestore.collection('Cars').doc(this.carId).get().toPromise();
      if (carDoc && carDoc.exists) {
        this.carDetails = carDoc.data();
      }
    } catch (error) {
      this.showToast('Грешка при зареждане на данните за автомобила.');
    }
  }

  async loadCarUsers() {
    this.loadingUsers = true;
    try {
      // Get all User_car docs for this car
      const userCarSnapshot = await this.firestore.collection('User_car', ref =>
        ref.where('CarID', '==', this.carId)
      ).get().toPromise();

      const userCarDocs = (userCarSnapshot as any)?.docs ?? [];
      const userIds = userCarDocs.map((doc: any) => doc.data().UserID);

      let users: CarAccessUser[] = [];
      if (userIds.length > 0) {
        const usersSnapshot = await this.firestore.collection('Users', ref =>
          ref.where('UID', 'in', userIds)
        ).get().toPromise();

        const userDocs = (usersSnapshot as any)?.docs ?? [];
        const userMap: { [uid: string]: { username: string; email: string } } = {};
        userDocs.forEach((userDoc: any) => {
          const data = userDoc.data();
          userMap[data.UID] = { username: data.username, email: data.email };
        });

        users = userCarDocs.map((userCarDoc: any) => ({
          id: userCarDoc.id,
          UserID: userCarDoc.data().UserID,
          username: userMap[userCarDoc.data().UserID]?.username || userCarDoc.data().UserID,
          email: userMap[userCarDoc.data().UserID]?.email || ''
        }));
      }

      this.carUsers = users;
    } catch (err) {
      this.carUsers = [];
    }
    this.loadingUsers = false;
  }

  async showAddUserPopup() {
    const alert = await this.alertController.create({
      header: 'Добави потребител',
      cssClass: 'custom-delete-alert',
      inputs: [
        {
          name: 'username',
          type: 'text',
          placeholder: 'Потребителско име',
        }
      ],
      buttons: [
        {
          text: 'ОТКАЗ',
          role: 'cancel',
          cssClass: 'alert-cancel-btn'
        },
        {
          text: 'ДОБАВИ',
          cssClass: 'alert-delete-btn',
          handler: async (data: any) => {
            if (!data.username || !data.username.trim()) {
              const toast = await this.toastController.create({
                message: 'Моля, въведете потребителско име.',
                duration: 2000,
                color: 'danger',
                position: 'top',
              });
              toast.present();
              return false;
            }

            // Check if user exists
            const userSnapshot = await this.firestore.collection('Users', ref =>
              ref.where('username', '==', data.username.trim())
            ).get().toPromise();

            if (!userSnapshot || (userSnapshot as any).empty) {
              const toast = await this.toastController.create({
                message: 'Потребителят не е намерен.',
                duration: 2000,
                color: 'danger',
                position: 'top',
              });
              toast.present();
              return false;
            }

            await this.addUserToCar(data.username.trim());
            this.loadCarUsers();
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async addUserToCar(username: string) {
    try {
      const userSnapshot = await this.firestore.collection('Users', ref =>
        ref.where('username', '==', username)
      ).get().toPromise();

      if (userSnapshot && !(userSnapshot as any).empty) {
        const userDoc = (userSnapshot as any).docs[0].data() as User;

        const userCarCollectionRef = this.firestore.collection('User_car');
        await userCarCollectionRef.add({
          UserID: userDoc.UID,
          CarID: this.carId,
        });
        this.showToast('Потребителят е добавен успешно.');
      } else {
        this.showToast('Потребителят не е намерен.');
      }
    } catch (error) {
      this.showToast('Грешка при добавяне на потребителя.');
    }
    this.loadCarUsers();
  }

  async transferOwnership() {
    const alert = await this.alertController.create({
      header: 'Прехвърли собствеността',
      cssClass: 'custom-delete-alert',
      inputs: [
        {
          name: 'username',
          type: 'text',
          placeholder: 'Въведи потребителско име',
        },
        {
          name: 'licensePlate',
          type: 'text',
          placeholder: 'Потвърдете регистрационен номер',
        }
      ],
      buttons: [
        {
          text: 'ОТКАЗ',
          role: 'cancel',
          cssClass: 'alert-cancel-btn'
        },
        {
          text: 'ПРЕХВЪРЛИ',
          cssClass: 'alert-delete-btn',
          handler: async (data: any) => {
            if (
              !data.username ||
              !data.username.trim() ||
              !data.licensePlate ||
              !data.licensePlate.trim()
            ) {
              const toast = await this.toastController.create({
                message: 'Моля, попълнете всички полета.',
                duration: 2000,
                color: 'danger',
                position: 'top',
              });
              toast.present();
              return false;
            }
            // Check license plate match
            if (data.licensePlate.trim() !== this.carDetails.License_plate) {
              const toast = await this.toastController.create({
                message: 'Грешен регистрационен номер.',
                duration: 2000,
                color: 'danger',
                position: 'top',
              });
              toast.present();
              return false;
            }
            // Check if user exists
            const userSnapshot = await this.firestore.collection('Users', ref =>
              ref.where('username', '==', data.username.trim())
            ).get().toPromise();

            if (!userSnapshot || (userSnapshot as any).empty) {
              const toast = await this.toastController.create({
                message: 'Потребителят не е намерен.',
                duration: 2000,
                color: 'danger',
                position: 'top',
              });
              toast.present();
              return false;
            }

            await this.executeTransferOwnership(data.username.trim());
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async executeTransferOwnership(username: string) {
    try {
      const userSnapshot = await this.firestore.collection('Users', ref =>
        ref.where('username', '==', username)
      ).get().toPromise();

      if (userSnapshot && !(userSnapshot as any).empty) {
        const newOwnerDoc = (userSnapshot as any).docs[0].data() as User;

        // Delete all old User_car documents for this car
        const userCarSnapshot = await this.firestore.collection('User_car', ref =>
          ref.where('CarID', '==', this.carId)
        ).get().toPromise();

        if (userCarSnapshot && !(userCarSnapshot as any).empty) {
          const batch = this.firestore.firestore.batch();

          (userCarSnapshot as any).docs.forEach((doc: any) => {
            batch.delete(doc.ref);
          });

          // USE THE CORRECT FIELD NAME HERE!
          const carRef = this.firestore.collection('Cars').doc(this.carId).ref;
          const ownerField = 'UserID'; // <--- CHANGE THIS if your field is different
          batch.update(carRef, { [ownerField]: newOwnerDoc.UID });

          await batch.commit();

          // Add User_car doc for new owner (outside batch!)
          await this.firestore.collection('User_car').add({
            UserID: newOwnerDoc.UID,
            CarID: this.carId,
          });

          this.showToast('Собствеността беше прехвърлена успешно.');
          this.router.navigate(['/cars']);
        }
      } else {
        this.showToast('Новият собственик не е намерен.');
      }
    } catch (error) {
      this.showToast('Грешка при прехвърлянето на собствеността.');
    }
    this.loadCarUsers();
  }

  async removeUserAccess(userCarDocId: string) {
    try {
      await this.firestore.collection('User_car').doc(userCarDocId).delete();
      this.showToast('Достъпът беше премахнат успешно.');
      this.loadCarUsers();
    } catch (error) {
      this.showToast('Грешка при премахване на достъпа.');
    }
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'dark'
    });
    toast.present();
  }
}
