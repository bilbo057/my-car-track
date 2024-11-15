import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getFirestore, collection, addDoc, doc, updateDoc } from 'firebase/firestore';  // Import required Firestore functions
import { AuthService } from '../services/auth.service';
import { carBrands, carModels, chassisTypes, engineTypes, transmissionTypes } from '../app/car-options';  // Ensure you're importing the correct structure

@Component({
  selector: 'app-car-add',
  templateUrl: './car-add.page.html',
  styleUrls: ['./car-add.page.scss'],
})
export class CarAddPage implements OnInit {
  carData: any = {};  // Your car data object
  carBrands = carBrands;  // Brand options
  carModels = [] as { ModelName: string }[];  // Start with an empty array, to be populated based on brand selection
  chassisTypes = chassisTypes;  // Chassis type options
  engineTypes = engineTypes;  // Engine type options
  transmissionTypes = transmissionTypes;  // Transmission type options

  selectedBrand: string = '';  // Selected brand value

  private firestore = getFirestore();  // Initialize Firestore instance using the modular API

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Optionally filter models when a brand is selected
    this.loadModel(this.selectedBrand);
  }

  // Method to load models based on selected brand
  loadModel(brandId: string) {
    if (brandId && carModels[brandId]) {
      this.carModels = carModels[brandId];  // Filter models based on selected brand
    } else {
      this.carModels = [];  // If no brand or invalid brand, clear models
    }
  }

  // Main method to add car
  async addCar() {
    const userId = await this.getUserId();
    if (userId) {
      this.carData.KM_added = this.carData.Current_KM;
      const carId = await this.addCarToFirestore(userId);  // Add the car to Firestore and get CarID
      await this.createUserCarEntry(userId, carId);  // Create a User_car document with CarID
      this.navigateToCarsPage();  // Navigate to the cars page
    } else {
      console.error('User ID is not available.');
    }
  }

  // Fetch the user ID from the AuthService
  private async getUserId(): Promise<string | null> {
    return this.authService.getUserId();  // Get the user ID
  }

  // Add the car to the "Cars" collection in Firestore and update with CarID
  private async addCarToFirestore(userId: string): Promise<string> {
    const carCollectionRef = collection(this.firestore, 'Cars');

    // First, add the car to Firestore without CarID
    const carDocRef = await addDoc(carCollectionRef, {
      ...this.carData,
      Date_added: new Date(),
      UserID: userId,
    });

    // Use the generated document ID as CarID
    const carId = carDocRef.id;

    // Update the car document with its CarID
    await updateDoc(doc(this.firestore, 'Cars', carId), {
      CarID: carId,
    });

    return carId;  // Return the CarID for further use
  }

  // Create a document in the "User_car" table with UserID and CarID
  private async createUserCarEntry(userId: string, carId: string): Promise<void> {
    const userCarCollectionRef = collection(this.firestore, 'User_car');
    await addDoc(userCarCollectionRef, {
      UserID: userId,
      CarID: carId,
    });
  }

  // Navigate to the Cars page
  private navigateToCarsPage(): void {
    this.router.navigate(['/cars']);
  }
  goHome() {
    this.router.navigate(['/cars']);
  }
}
