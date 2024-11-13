// brandsAndModels.service.ts
import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

interface Brand {
  BrandID: string;
  BrandName: string;
}

interface Model {
  BrandID: string;
  ModelID: string;
  ModelName: string;
}

@Injectable({
  providedIn: 'root',
})
export class CarService {
  constructor(private firestore: Firestore) {}

  getBrands(): Observable<Brand[]> {
    const brandsCollection = collection(this.firestore, 'Brands');
    return collectionData(brandsCollection) as Observable<Brand[]>;
  }

  getModels(brandId: string): Observable<Model[]> {
    const modelsCollection = collection(this.firestore, 'Models');
    const brandQuery = query(modelsCollection, where('BrandID', '==', brandId));
    return collectionData(brandQuery) as Observable<Model[]>;
  }
}
