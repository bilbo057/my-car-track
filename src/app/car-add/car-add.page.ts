// car-add.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getFirestore, collection, addDoc, doc, updateDoc } from 'firebase/firestore';  // Import required Firestore functions
import { AuthService } from '../services/auth.service';
import { carBrands, carModels, chassisTypes, engineTypes, transmissionTypes } from '../../car-options';  // Ensure you're importing the correct structure

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
      if (this.carData.Year) {
        const date = new Date(this.carData.Year);
        // Format the date as DD-MM-YYYY
        this.carData.Year = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
      }
      const carId = await this.addCarToFirestore(userId);  // Add the car to Firestore and get CarID
      await this.createUserCarEntry(userId, carId);  // Create a User_car document with CarID
      await this.createMonthlySpendingEntry(carId); // Create monthly spending collection for the car
      await this.createYearlySpendingEntry(carId); // Create yearly spending collection for the car
      await this.createAllTimeSpendingEntry(carId); // Create all-time spending collection for the car
      this.router.navigate(['/cars']);  // Navigate to the cars page
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
  
    // Use Firestore-compatible timestamp or formatted string for Date_added
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  
    // Add the car to Firestore without CarID
    const carDocRef = await addDoc(carCollectionRef, {
      ...this.carData,
      Date_added: formattedDate, // Use formatted date
      UserID: userId,
    });
  
    // Use the generated document ID as CarID
    const carId = carDocRef.id;
  
    // Update the car document with its CarID
    await updateDoc(doc(this.firestore, 'Cars', carId), {
      CarID: carId,
    });
  
    return carId; // Return the CarID for further use
  }
  
  // Create a document in the "User_car" table with UserID and CarID
  private async createUserCarEntry(userId: string, carId: string): Promise<void> {
    const userCarCollectionRef = collection(this.firestore, 'User_car');
    await addDoc(userCarCollectionRef, {
      UserID: userId,
      CarID: carId,
    });
  }

  // Create a document in the "Monthly_Spending" collection for the car
  private async createMonthlySpendingEntry(carId: string): Promise<void> {
    try {
      const monthlySpendingRef = collection(this.firestore, 'Monthly_Spending');
      const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

      // Add a new document with the car's monthly spending data
      await addDoc(monthlySpendingRef, {
        carID: carId,
        startOfMonth: formattedDate,
        numberOfMonths: 1, // Start with the first month
        spentsThisMonth: 0, // Initialize spending to zero
        lastSpent: null, // Initialize as null (no spending yet)
      });

      console.log('Monthly spending entry created for car:', carId);
    } catch (error) {
      console.error('Error creating monthly spending entry:', error);
    }
  }

  // Create a document in the "Yearly_Spending" collection for the car
  private async createYearlySpendingEntry(carId: string): Promise<void> {
    try {
      const yearlySpendingRef = collection(this.firestore, 'Yearly_Spending');
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

      // Add a new document with the car's yearly spending data
      await addDoc(yearlySpendingRef, {
        carID: carId,
        startOfYear: formattedDate,
        numberOfYears: 1, // Start with the first year
        spentsThisYear: 0, // Initialize spending to zero
        lastSpent: null, // Initialize as null (no spending yet)
      });

      console.log('Yearly spending entry created for car:', carId);
    } catch (error) {
      console.error('Error creating yearly spending entry:', error);
    }
  }

  // Create a document in the "All_Time_Spending" collection for the car
  private async createAllTimeSpendingEntry(carId: string): Promise<void> {
    try {
      const allTimeSpendingRef = collection(this.firestore, 'All_Time_Spending');
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

  
      // Use the Date_added field from carData, which is already formatted
      await addDoc(allTimeSpendingRef, {
        carID: carId,
        dateAdded: formattedDate, // Ensure this is properly set and formatted
        moneySpent: this.carData.Price_of_buying || 0, // Start with the price of buying
        lastSpent: null, // Initialize as null (no spending yet)
      });
  
      console.log('All-time spending entry created for car:', carId);
    } catch (error) {
      console.error('Error creating all-time spending entry:', error);
    }
  }  
}
