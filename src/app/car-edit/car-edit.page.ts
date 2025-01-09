import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getFirestore, collection, doc, getDoc, updateDoc, getDocs } from 'firebase/firestore';

@Component({
  selector: 'app-car-edit',
  templateUrl: './car-edit.page.html',
  styleUrls: ['./car-edit.page.scss'],
})
export class CarEditPage implements OnInit {
  carId: string = '';
  carDetails: any = {};
  brandOptions: { BrandID: string; BrandName: string }[] = []; // Fetched dynamically
  filteredModels: { ModelName: string }[] = []; // Filtered models for the selected brand
  chassisTypes: { Chassis_type: string }[] = []; // Fetched dynamically
  engineTypes: { Engine_type: string }[] = []; // Fetched dynamically
  transmissionTypes: { Type: string; Label: string }[] = []; // Fetched dynamically

  private firestore = getFirestore(); // Firestore instance

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.carId = params.get('id') || '';
      if (this.carId) {
        this.loadCarDetails();
      }
    });

    this.loadBrandOptions();
    this.loadChassisTypes();
    this.loadEngineTypes();
    this.loadTransmissionTypes();
  }

  // Load car details by ID
  async loadCarDetails() {
    try {
      const carDoc = doc(this.firestore, 'Cars', this.carId);
      const carSnapshot = await getDoc(carDoc);
      if (carSnapshot.exists()) {
        this.carDetails = carSnapshot.data();

        // Convert Date from DD-MM-YYYY to ISO format for ion-datetime
        if (this.carDetails.Date) {
          const [day, month, year] = this.carDetails.Date.split('-');
          this.carDetails.Date = `${year}-${month}-${day}`;
        }

        // Load models for the selected brand
        if (this.carDetails.Brand) {
          this.loadModels(this.carDetails.Brand);
        }
      } else {
        console.error('Car not found');
        this.router.navigate(['/cars']);
      }
    } catch (error) {
      console.error('Error loading car details:', error);
    }
  }

  // Load brand options from Firestore
  async loadBrandOptions() {
    try {
      const brandRef = collection(this.firestore, 'Brands');
      const snapshot = await getDocs(brandRef);
      this.brandOptions = snapshot.docs.map((doc) => ({
        BrandID: doc.id,
        BrandName: doc.data()['BrandName'],
      }));
      console.log('Brand options loaded:', this.brandOptions);
    } catch (error) {
      console.error('Error loading brand options:', error);
    }
  }

  // Load models based on the selected brand
  async loadModels(brandId: string) {
    try {
      const modelRef = collection(this.firestore, `Brands/${brandId}/Models`);
      const snapshot = await getDocs(modelRef);
      this.filteredModels = snapshot.docs.map((doc) => ({
        ModelName: doc.data()['ModelName'],
      }));
      console.log('Models loaded for brand:', brandId, this.filteredModels);

      // If the current model is not in the filtered list, reset it
      if (
        this.carDetails.Model &&
        !this.filteredModels.some((model) => model.ModelName === this.carDetails.Model)
      ) {
        this.carDetails.Model = '';
      }
    } catch (error) {
      console.error('Error loading models:', error);
    }
  }

  // Load chassis types from Firestore
  async loadChassisTypes() {
    try {
      const chassisRef = collection(this.firestore, 'ChassisTypes');
      const snapshot = await getDocs(chassisRef);
      this.chassisTypes = snapshot.docs.map((doc) => ({
        Chassis_type: doc.data()['Chassis_type'],
      }));
      console.log('Chassis types loaded:', this.chassisTypes);
    } catch (error) {
      console.error('Error loading chassis types:', error);
    }
  }

  // Load engine types from Firestore
  async loadEngineTypes() {
    try {
      const engineRef = collection(this.firestore, 'EngineTypes');
      const snapshot = await getDocs(engineRef);
      this.engineTypes = snapshot.docs.map((doc) => ({
        Engine_type: doc.data()['Engine_type'],
      }));
      console.log('Engine types loaded:', this.engineTypes);
    } catch (error) {
      console.error('Error loading engine types:', error);
    }
  }

  // Load transmission types from Firestore
  async loadTransmissionTypes() {
    try {
      const transmissionRef = collection(this.firestore, 'Transmitions');
      const snapshot = await getDocs(transmissionRef);
      this.transmissionTypes = snapshot.docs.map((doc) => ({
        Type: doc.data()['Type'],
        Label: doc.data()['Label'],
      }));
      console.log('Transmission types loaded:', this.transmissionTypes);
    } catch (error) {
      console.error('Error loading transmission types:', error);
    }
  }

  // Save updated car details to Firestore
  async saveCar() {
    try {
      const updatedCarDetails = { ...this.carDetails };

      // Convert Date from ISO format to DD-MM-YYYY
      if (updatedCarDetails.Date) {
        const date = new Date(updatedCarDetails.Date);
        updatedCarDetails.Date = `${('0' + date.getDate()).slice(-2)}-${(
          '0' +
          (date.getMonth() + 1)
        ).slice(-2)}-${date.getFullYear()}`;
      }

      const carDoc = doc(this.firestore, 'Cars', this.carId);
      await updateDoc(carDoc, updatedCarDetails);
      console.log('Car updated successfully');
      this.router.navigate(['/cars']);
    } catch (error) {
      console.error('Error updating car:', error);
    }
  }
}
