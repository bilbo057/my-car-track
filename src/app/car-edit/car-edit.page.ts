// car-edit.page.ts
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
  brandOptions: { BrandID: string; BrandName: string; Models: string[] }[] = []; // Fetched dynamically
  filteredModels: string[] = []; // Filtered models for the selected brand
  chassisTypes: { Chassis_type: string; Label: string }[] = []; // Fetched dynamically
  engineTypes: { Engine_type: string; Label: string }[] = []; // Fetched dynamically
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

    this.loadBrands(); // Fetch brands and models from Firestore
    this.loadChassisTypes(); // Fetch chassis types from Firestore
    this.loadEngineTypes(); // Fetch engine types from Firestore
    this.loadTransmissionTypes(); // Fetch transmission types from Firestore
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

        // Ensure filteredModels is updated based on the loaded brand
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

  // Fetch brands and their models from Firestore
  async loadBrands() {
    try {
      const brandsRef = collection(this.firestore, 'Brands');
      const snapshot = await getDocs(brandsRef);
      this.brandOptions = snapshot.docs.map((doc) => ({
        BrandID: doc.id,
        BrandName: doc.data()['name'],
        Models: doc.data()['models'],
      }));
      console.log('Brands with models loaded:', this.brandOptions);

      // Update filteredModels if the carDetails already have a Brand
      if (this.carDetails.Brand) {
        this.loadModels(this.carDetails.Brand);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  }

  // Load models based on the selected brand
  loadModels(brandId: string) {
    const selectedBrand = this.brandOptions.find((brand) => brand.BrandID === brandId);
    this.filteredModels = selectedBrand ? selectedBrand.Models : [];
    console.log('Filtered models for brand:', brandId, this.filteredModels);
  }

  // Fetch chassis types from Firestore
  async loadChassisTypes() {
    try {
      const chassisRef = collection(this.firestore, 'Chassies');
      const snapshot = await getDocs(chassisRef);
      this.chassisTypes = snapshot.docs.map((doc) => ({
        Chassis_type: doc.data()['Chassis_type'], // Chassis type
        Label: doc.data()['Label'], // Chassis label
      }));
      console.log('Chassis types with labels loaded:', this.chassisTypes);
    } catch (error) {
      console.error('Error fetching chassis types:', error);
    }
  }

  // Fetch engine types from Firestore
  async loadEngineTypes() {
    try {
      const enginesRef = collection(this.firestore, 'Engines');
      const snapshot = await getDocs(enginesRef);
      this.engineTypes = snapshot.docs.map((doc) => ({
        Engine_type: doc.data()['Engine_type'], // Engine type
        Label: doc.data()['Label'], // Engine label
      }));
      console.log('Engine types with labels loaded:', this.engineTypes);
    } catch (error) {
      console.error('Error fetching engine types:', error);
    }
  }

  // Fetch transmission types from Firestore
  async loadTransmissionTypes() {
    try {
      const transmissionsRef = collection(this.firestore, 'Transmitions');
      const snapshot = await getDocs(transmissionsRef);
      this.transmissionTypes = snapshot.docs.map((doc) => ({
        Type: doc.data()['Type'], // Transmission type
        Label: doc.data()['Label'], // Transmission label
      }));
      console.log('Transmission types loaded:', this.transmissionTypes);
    } catch (error) {
      console.error('Error fetching transmission types:', error);
    }
  }

  // Save updated car details to Firestore
  async saveCar() {
    try {
      const updatedCarDetails = { ...this.carDetails };
  
      // Convert the date from ISO format (used by ion-datetime) to DD-MM-YYYY and update 'Year'
      if (updatedCarDetails.Year) {
        const date = new Date(updatedCarDetails.Year);
        updatedCarDetails.Year = `${('0' + date.getDate()).slice(-2)}-${('0' + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()}`;
      }
  
      const carDoc = doc(this.firestore, 'Cars', this.carId);
      await updateDoc(carDoc, updatedCarDetails);
      console.log('Year field updated successfully');
      this.router.navigate(['/cars']);
    } catch (error) {
      console.error('Error updating car:', error);
    }
  }      
}
