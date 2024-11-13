// car.service.ts
import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class CarService {
  constructor(private firestore: Firestore) {}

  async getBrands() {
    const brandsRef = collection(this.firestore, 'Brands');
    const brandsSnapshot = await getDocs(brandsRef);
    return brandsSnapshot.docs.map(doc => doc.data());
  }

  async getModels(brandId: string) {
    const modelsRef = collection(this.firestore, 'Model');
    const modelsSnapshot = await getDocs(
      query(modelsRef, where('BrandID', '==', brandId))
    );
    return modelsSnapshot.docs.map(doc => doc.data());
  }

  async getTypes() {
    const typesRef = collection(this.firestore, 'types');
    const typesSnapshot = await getDocs(typesRef);
    return typesSnapshot.docs.map(doc => doc.data());
  }
}