// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { firstValueFrom } from 'rxjs';

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

  async getUserId(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.afAuth.authState.subscribe(
        (user) => {
          if (user) {
            resolve(user.uid); // Return the user ID
          }
        },
        (error) => {
          console.error('Error fetching user ID:', error);
          reject(error); // Reject on error
        }
      );
    });
  }

}
