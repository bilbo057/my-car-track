import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import {
  carBrands,
  carModels,
  chassisTypes,
  engineTypes,
  transmissionTypes,
} from '../car-options';

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
    Transmission_type: '',
    KM_added: null,
    Oil_change: null,
    Price_of_buying: null,
    License_plate: '',
    Current_KM: null,
    Fuel_Consumed: null,
  };

  brand = carBrands;
  model: { ModelName: string }[] = [];
  types = chassisTypes;
  engineTypes = engineTypes;
  transmissionTypes = transmissionTypes;

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {}

  loadModel(brandId: string) {
    this.model = carModels[brandId] || [];
  }

  async addCar() {
    const userId = await this.authService.getUserId();
    if (userId) {
      this.carData.KM_added = this.carData.Current_KM;
      await this.firestore.collection('Cars').add({
        ...this.carData,
        UserID: userId,
        Date_added: new Date(),
      });
      this.router.navigate(['/cars']);
    } else {
      console.error('User ID is not available.');
    }
  }
}
