// register.page.ts
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { getFirestore, collection, addDoc } from 'firebase/firestore'; // Import Firestore functions

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  email: string;
  password: string;

  private firestore = getFirestore(); // Firestore instance

  constructor(private authService: AuthService, private router: Router) {
    this.email = ''; // Initialize email
    this.password = ''; // Initialize password
  }

  async register() {
    try {
      const userCredential = await this.authService.register(this.email, this.password);
      
      if (userCredential.user) {
        const userId = userCredential.user.uid;
        const username = this.email.split('@')[0];
        const email = this.email;
  
        // Call the saveUserToFirestore method in this component
        await this.saveUserToFirestore(userId, username, email);
        
        this.router.navigate(['/login']); // Navigate to login after successful registration
      } else {
        console.error("User registration failed: No user returned.");
      }
    } catch (error) {
      console.error("Registration failed", error);
    }
  }
  

  // Save user data to Firestore
  private async saveUserToFirestore(userId: string, username: string, email: string): Promise<void> {
    const usersCollectionRef = collection(this.firestore, 'Users'); // Reference to the Users collection

    await addDoc(usersCollectionRef, {
      UID: userId,
      username: username,
      email: email,
    });
  }
}
