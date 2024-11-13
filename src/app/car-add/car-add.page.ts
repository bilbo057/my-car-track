import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-car-add',
  templateUrl: './car-add.page.html',
  styleUrls: ['./car-add.page.scss'],
})
export class CarAddPage implements OnInit {
  carData = {
    Brand: '',
    Model: '',
    Chassis_type: '',
    Year: '',
    Engine_type: '',
    Engine_size: '',
    Transmission_type: '',
    KM_added: null,
    Oil_change: null,
    Price_of_buying: null,
    License_plate: '',
    Current_KM: null,
    Fuel_Consumed: null,
  };

  brand: any[] = [];
  model: any[] = [];
  types: any[] = [];

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBrand();
    this.loadTypes();
  }

  async loadBrand() {
    try {
      const brandRef = this.firestore.collection('Brand');
      const brandSnapshot = await brandRef.get().toPromise();
      if (brandSnapshot) {
        this.brand = brandSnapshot.docs.map(doc => doc.data());
        console.log('Brand loaded:', this.brand); // Debugging log
      } else {
        console.log('No brand data found');
      }
    } catch (error) {
      console.error('Error loading brand:', error);
    }
  }
  
  async loadModel(brandId: string) {
    try {
      const modelRef = this.firestore.collection('Model', ref => ref.where('BrandID', '==', brandId));
      const modelSnapshot = await modelRef.get().toPromise();
      if (modelSnapshot) {
        this.model = modelSnapshot.docs.map(doc => doc.data());
        console.log('Model loaded for brand:', brandId, this.model); // Debugging log
      } else {
        console.log('No model data found');
      }
    } catch (error) {
      console.error('Error loading model:', error);
    }
  }

  async loadTypes() {
    const typesRef = this.firestore.collection('types');
    const typesSnapshot = await typesRef.get().toPromise();
    if (typesSnapshot) {
      this.types = typesSnapshot.docs.map(doc => doc.data());
    }
  }

  async addCar() {
    const userId = await this.authService.getUserId();
    if (userId) {
      await this.firestore.collection('Cars').add({
        ...this.carData,
        UserID: userId,
        Date_added: new Date(),
      });
      this.router.navigate(['/cars']);
    } else {
      console.error("User ID is not available.");
    }
  }
}
