//app.component.ts
import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Cars', url: '/cars', icon: 'car' },
    { title: 'Profile', url: '/profile', icon: 'person' },
    { title: 'Settings', url: '/settings', icon: 'settings' },
  ];

  public labels = [];
  username: string = 'Loading...'; // Displayed username

  constructor(
    private firestore: AngularFirestore,
    private menuCtrl: MenuController,
    private authService: AuthService,
    private router: Router
  ) {
    this.loadUsername();
  }

  // Toggles the menu
  toggleMenu() {
    this.menuCtrl.toggle('main-menu');
  }

  // Logs the user out
  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  // Loads the username of the logged-in user
  async loadUsername() {
    try {
      const userId = await this.authService.getUserId(); // Fetch the current user's ID
      if (!userId) {
        console.warn('User ID is null or undefined.');
        this.username = 'Unknown User';
        return;
      }
  
      // Fetch username from the Users collection
      const userDoc = await this.firestore.collection('Users').doc(userId).get().toPromise();
      if (userDoc && userDoc.exists) {
        const userData = userDoc.data() as { username?: string };
        this.username = userData?.username || 'Unknown User';
      } else {
        console.warn(`User document does not exist for UserID: ${userId}`);
        this.username = 'Unknown User';
      }
    } catch (error) {
      console.error('Error loading username:', error);
      this.username = 'Unknown User';
    }
  }
}
