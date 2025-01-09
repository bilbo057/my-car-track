import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getFirestore, collection, addDoc, doc, updateDoc, getDocs } from 'firebase/firestore'; // Firestore functions
import { AuthService } from '../services/auth.service';
import { carBrands, carModels } from '../../car-options'; // Static options for brands and models

@Component({
  selector: 'app-car-add',
  templateUrl: './car-add.page.html',
  styleUrls: ['./car-add.page.scss'],
})
export class CarAddPage implements OnInit {
  carData: any = {}; // Car data object
  carBrands = carBrands; // Static brand options
  carModels = [] as { ModelName: string }[]; // Dynamic models based on selected brand
  chassisTypes: { Chassis_type: string; Label: string }[] = []; // Dynamic chassis types with labels
  engineTypes: { Engine_type: string; Label: string }[] = []; // Dynamic engine types with labels
  transmissionTypes: { Type: string; Label: string }[] = []; // Dynamic transmission types with labels

  private firestore = getFirestore(); // Firestore instance

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.loadModel(this.carData.Brand); // Load models dynamically if a brand is selected
    this.loadChassisTypes(); // Fetch chassis types from Firestore
    this.loadEngineTypes(); // Fetch engine types from Firestore
    this.loadTransmissionTypes(); // Fetch transmission types from Firestore
  }

  // Load models based on the selected brand
  loadModel(brandId: string) {
    if (brandId && carModels[brandId]) {
      this.carModels = carModels[brandId];
    } else {
      this.carModels = [];
    }
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
      console.log('Transmission types with labels loaded:', this.transmissionTypes);
    } catch (error) {
      console.error('Error fetching transmission types:', error);
    }
  }

  // Main method to add car
  async addCar() {
    const userId = await this.getUserId();
    if (userId) {
      this.carData.KM_added = this.carData.Current_KM;
      if (this.carData.Year) {
        const date = new Date(this.carData.Year);
        this.carData.Year = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${date.getFullYear()}`;
      }
      const carId = await this.addCarToFirestore(userId);
      await this.createUserCarEntry(userId, carId);
      await this.createMonthlySpendingEntry(carId);
      await this.createYearlySpendingEntry(carId);
      await this.createAllTimeSpendingEntry(carId);
      this.router.navigate(['/cars']);
    } else {
      console.error('User ID is not available.');
    }
  }

  // Fetch the user ID from the AuthService
  private async getUserId(): Promise<string | null> {
    return this.authService.getUserId();
  }

  // Add the car to the "Cars" collection in Firestore and update with CarID
  private async addCarToFirestore(userId: string): Promise<string> {
    const carCollectionRef = collection(this.firestore, 'Cars');
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

    const carDocRef = await addDoc(carCollectionRef, {
      ...this.carData,
      Date_added: formattedDate,
      UserID: userId,
    });

    const carId = carDocRef.id;
    await updateDoc(doc(this.firestore, 'Cars', carId), {
      CarID: carId,
    });

    return carId;
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

      await addDoc(monthlySpendingRef, {
        carID: carId,
        startOfMonth: formattedDate,
        numberOfMonths: 1,
        spentsThisMonth: 0,
        lastSpent: null,
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

      await addDoc(yearlySpendingRef, {
        carID: carId,
        startOfYear: formattedDate,
        numberOfYears: 1,
        spentsThisYear: 0,
        lastSpent: null,
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

      await addDoc(allTimeSpendingRef, {
        carID: carId,
        dateAdded: formattedDate,
        moneySpent: this.carData.Price_of_buying || 0,
        lastSpent: null,
      });

      console.log('All-time spending entry created for car:', carId);
    } catch (error) {
      console.error('Error creating all-time spending entry:', error);
    }
  }
}
