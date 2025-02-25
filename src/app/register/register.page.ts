import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, sendEmailVerification } from 'firebase/auth'; // Import verification function

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  email: string;
  password: string;
  confirmPassword: string;
  errorMessage: string;

  private firestore = getFirestore();
  private auth = getAuth(); // Firebase Authentication instance

  constructor(private authService: AuthService, private router: Router) {
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.errorMessage = '';
  }

  async register() {
    if (!this.validateEmail(this.email)) {
      this.errorMessage = 'Моля, въведете валиден имейл адрес.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Паролите не съвпадат.';
      return;
    }

    try {
      const userCredential = await this.authService.register(this.email, this.password);

      if (userCredential.user) {
        const user = userCredential.user;
        const userId = user.uid;
        const username = this.email.split('@')[0];
        const email = this.email;

        // Send verification email
        await sendEmailVerification(user);
        alert('Моля, потвърдете своя имейл чрез връзката, изпратена до вашия пощенски адрес.');

        // Save user data to Firestore
        await this.saveUserToFirestore(userId, username, email);

        // Navigate to login page after sending verification email
        this.router.navigate(['/login']);
      } else {
        this.errorMessage = 'Регистрацията не бе успешна. Моля, опитайте отново.';
      }
    } catch (error) {
      this.errorMessage = 'Регистрацията не бе успешна. Моля, опитайте отново.';
      console.error("Registration failed", error);
    }
  }

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private async saveUserToFirestore(userId: string, username: string, email: string): Promise<void> {
    const userDocRef = doc(this.firestore, 'Users', userId);

    await setDoc(userDocRef, {
      UID: userId,
      username: username,
      email: email,
      emailVerified: false, // Track verification status
      lastLogin: serverTimestamp(),
    });
  }
}
