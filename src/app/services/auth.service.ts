// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth) {}

  async register(email: string, password: string) {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  async login(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  async logout() {
    return this.afAuth.signOut();
  }

  getUserId(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.afAuth.authState.subscribe(user => {
        if (user) {
          resolve(user.uid); // Return the user ID
        } else {
          resolve(null); // No user logged in
        }
      }, error => reject(error)); // Handle any error
    });
  }
}
