import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private firestore = getFirestore(); // Firestore instance

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
          } else {
            reject('User not authenticated');
          }
        },
        (error) => {
          console.error('Error fetching user ID:', error);
          reject(error); // Reject on error
        }
      );
    });
  }

  async getUsername(): Promise<string | null> {
    const userId = await this.getUserId();
    if (!userId) return null;

    try {
      const userDocRef = doc(this.firestore, 'Users', userId);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        return userData?.['username'] || null; // FIX: Properly accessing `username`
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching username:', error);
      return null;
    }
  }
}
