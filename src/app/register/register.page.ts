import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  email: string;
  password: string;

  constructor(private authService: AuthService, private router: Router) {
    this.email = ''; // Initialize email
    this.password = ''; // Initialize password
  }

  async register() {
    try {
      await this.authService.register(this.email, this.password);
      this.router.navigate(['/login']); // Navigate to login after successful registration
    } catch (error) {
      console.error("Registration failed", error);
      // Display an error message to the user
    }
  }
}
