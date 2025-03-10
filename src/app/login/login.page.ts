import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';

  private firestore = getFirestore(); // Firestore instance

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.refreshPageOnce();
  }

  refreshPageOnce() {
    if (!sessionStorage.getItem('pageRefreshed')) {
      sessionStorage.setItem('pageRefreshed', 'true');
      window.location.reload();
    }
  }

  async login() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      try {
        const userCredential = await this.authService.login(email, password);

        if (userCredential.user) {
          await this.updateLastLogin(userCredential.user.uid);
          this.router.navigate(['/cars']); // Navigate to the cars page
        } else {
          this.errorMessage = 'Invalid user data.';
        }
      } catch (error) {
        this.handleLoginError(error);
      }
    } else {
      this.handleFormErrors();
    }
  }

  private handleLoginError(error: any) {
    // Adjust error handling to distinguish between wrong email and password
    switch (error.code) {
      case 'auth/user-not-found':
        this.errorMessage = 'грешна електронна поща'; // No user with this email
        break;
      case 'auth/wrong-password':
        this.errorMessage = 'грешна парола'; // Incorrect password
        break;
      case 'auth/invalid-email':
        this.errorMessage = 'Моля, въведете валиден имейл адрес.'; // Invalid email format
        break;
      default:
        this.errorMessage = 'Възникна грешка. Моля, опитайте отново.'; // Other errors
        break;
    }
  }

  private handleFormErrors() {
    if (!this.loginForm.get('email')?.valid) {
      this.errorMessage = 'Моля, въведете валиден имейл адрес.';
    } else if (!this.loginForm.get('password')?.valid) {
      this.errorMessage = 'Моля, въведете вашата парола.';
    } else {
      this.errorMessage = 'Моля, попълнете всички полета.';
    }
  }

  private async updateLastLogin(userId: string): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, 'Users', userId);
      await updateDoc(userDocRef, {
        lastLogin: serverTimestamp(),
      });
      console.log('Last login timestamp updated successfully.');
    } catch (error) {
      console.error('Error updating last login timestamp:', error);
    }
  }
}
