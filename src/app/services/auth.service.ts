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
}
