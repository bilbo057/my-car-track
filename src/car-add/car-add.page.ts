import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getFirestore, collection, addDoc } from '@angular/fire/firestore';
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

  // Add the car to the "Cars" collection in Firestore
  private async addCarToFirestore(userId: string): Promise<string> {
    // Get a reference to the Cars collection using Firestore methods
    const carCollectionRef = collection(this.firestore, 'Cars');

    // Create a new document with the car data, include Date_added and UserID
    const carDocRef = await addDoc(carCollectionRef, {
      ...this.carData,
      Date_added: new Date(),
      UserID: userId,
    });

    // Return the CarID which is the Firestore document ID
    return carDocRef.id;  // Firestore automatically generates the document ID
  }

  // Create a document in the "User_car" table with UserID and CarID
  private async createUserCarEntry(userId: string, carId: string): Promise<void> {
    const userCarCollectionRef = collection(this.firestore, 'User_car');  // Reference to the User_car collection
    await addDoc(userCarCollectionRef, {
      UserID: userId,  // Set the User ID
      CarID: carId,    // Set the Car ID
    });
  }

  // Navigate to the Cars page
  private navigateToCarsPage(): void {
    this.router.navigate(['/cars']);
  }
}
