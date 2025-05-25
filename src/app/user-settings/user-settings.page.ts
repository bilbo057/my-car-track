import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { getFirestore, doc, updateDoc, deleteDoc } from '@firebase/firestore';
import { AlertController, ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.page.html',
  styleUrls: ['./user-settings.page.scss'],
})
export class UserSettingsPage implements OnInit {
  userId: string = '';
  username: string = '';
  originalUsername: string = '';
  isUpdating: boolean = false;

  private firestore = getFirestore();

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private afAuth: AngularFireAuth
  ) {}

  async ngOnInit() {
    this.userId = await this.authService.getUserId();
    if (this.userId) {
      this.username = (await this.authService.getUsername()) || '';
      this.originalUsername = this.username;
    }
  }

  async updateUsername() {
    if (!this.username.trim() || this.username === this.originalUsername) {
      return;
    }
    this.isUpdating = true;
    try {
      const userDocRef = doc(this.firestore, 'Users', this.userId);
      await updateDoc(userDocRef, { username: this.username });

      setTimeout(() => {
        window.location.reload();
        this.showToast('Потребителското име е обновено успешно.');
      }, 1000);
    } catch (error) {
      this.showToast('Грешка при обновяване на потребителското име.');
      this.isUpdating = false;
    }
  }

  async deleteAccount() {
   const alert = await this.alertController.create({
      header: 'Изтриване на акаунт',
      message: 'Сигурни ли сте, че искате да изтриете акаунта си? Това действие е необратимо.',
      cssClass: 'custom-delete-alert',
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
              await deleteDoc(doc(this.firestore, 'Users', this.userId));
              const user = await this.afAuth.currentUser;
              if (user) {
                await user.delete();
              } else {
                throw new Error('Firebase authentication user not found.');
              }
              await this.authService.logout();
              this.router.navigate(['/login']);
              this.showToast('Акаунтът беше изтрит успешно.');
            } catch (error: any) {
              if (error && error.code === 'auth/requires-recent-login') {
                this.showToast('Моля, влезте отново преди да изтриете акаунта си.');
              } else {
                this.showToast('Грешка при изтриване на акаунта.');
              }
            }
          },
        },
      ],
    });
    await alert.present();
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
    });
    toast.present();
  }
}
