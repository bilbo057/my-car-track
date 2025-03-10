import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { sendEmailVerification, User } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private firestore = getFirestore(); // Firestore instance

  constructor(private afAuth: AngularFireAuth) {}

  async register(email: string, password: string) {
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user); // Send email verification
        alert('Изпратено Ви е съобщение за потвърждаване. Моля потвърдете регистрацията, преди да взлезете в акаунта.');

        // Save user to Firestore with email verification status
        await this.saveUserToFirestore(userCredential.user as User);

        return userCredential;
      } else {
        throw new Error('User registration failed.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);

      if (userCredential.user && !userCredential.user.emailVerified) {
        throw new Error('Пощата Ви не е проверена. Моля проверете за съобщения и потвърдете регистрацията.');
      }

      return userCredential;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
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

  private async saveUserToFirestore(user: User): Promise<void> {
    const userId = user.uid;
    const username = user.email ? user.email.split('@')[0] : 'Unknown';

    const userDocRef = doc(this.firestore, 'Users', userId);
    await setDoc(userDocRef, {
      UID: userId,
      username: username,
      email: user.email,
      emailVerified: user.emailVerified, // Store email verification status
      lastLogin: serverTimestamp(),
    });
  }
}
