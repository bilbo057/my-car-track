// login.page.ts
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: string;
  password: string;

  constructor(private authService: AuthService, private router: Router) {
    this.email = ''; // Initialize email
    this.password = ''; // Initialize password
  }

  async login() {
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/cars']); // Navigate to the home page after login
    } catch (error) {
      console.error("Login failed", error);
      // Display an error message to the user
    }
  }
}
