import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { filter } from 'rxjs/operators';

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
  showHeader: boolean = true; // Control header visibility
  showMenu: boolean = true; // Control menu visibility

  constructor(
    private firestore: AngularFirestore,
    private menuCtrl: MenuController,
    private authService: AuthService,
    private router: Router
  ) {
    this.loadUsername();
    this.setupRouteWatcher();
  }

  private setupRouteWatcher() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: any) => {
      const menuExcludedRoutes = ['/login', '/register', '/car-details', '/car-add', '/car-edit']; // Menu hidden for these pages
      const headerExcludedRoutes = ['/login', '/register']; // Header hidden only for login/register

      this.showMenu = !menuExcludedRoutes.includes(event.urlAfterRedirects);
      this.showHeader = !headerExcludedRoutes.includes(event.urlAfterRedirects);
    });
  }

  toggleMenu() {
    this.menuCtrl.toggle('main-menu');
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

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
