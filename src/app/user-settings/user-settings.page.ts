// user-settings.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { getFirestore, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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
    }
  }

  async updateUsername() {
    if (!this.username.trim()) {
      this.showToast('Username cannot be empty');
      return;
    }

    try {
      const userDocRef = doc(this.firestore, 'Users', this.userId);
      await updateDoc(userDocRef, { username: this.username });

      this.showToast('Username updated successfully');
    } catch (error) {
      console.error('Error updating username:', error);
      this.showToast('Error updating username');
    }
  }

  async deleteAccount() {
    const alert = await this.alertController.create({
      header: 'Delete Account',
      message: 'Are you sure you want to delete your account? This action is irreversible.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          handler: async () => {
            try {
              await deleteDoc(doc(this.firestore, 'Users', this.userId));
              const user = await this.afAuth.currentUser;
              if (user) {
                await user.delete();
              }

              await this.authService.logout();
              this.router.navigate(['/login']);

              this.showToast('Account deleted successfully');
            } catch (error) {
              console.error('Error deleting account:', error);
              this.showToast('Error deleting account');
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