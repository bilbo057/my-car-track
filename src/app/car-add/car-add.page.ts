import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-car-add',
  templateUrl: './car-add.page.html',
  styleUrls: ['./car-add.page.scss'],
})
export class CarAddPage implements OnInit {
  carData: any = {};
  carBrands: { BrandID: string; BrandName: string; Models: string[] }[] = [];
  carModels: string[] = [];
  chassisTypes: { Chassis_type: string; Label: string }[] = [];
  engineTypes: { Engine_type: string; Label: string }[] = [];
  transmissionTypes: { Type: string; Label: string }[] = [];
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];

  // New properties
  colors: string[] = ['Red', 'Blue', 'Black', 'White', 'Silver'];
  driveTypes: string[] = ['Front', 'Rear', 'AWD'];
  euroStandards: number[] = [1, 2, 3, 4, 5, 6];

  private firestore = getFirestore();
  private storage = getStorage();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.loadBrands();
    this.loadChassisTypes();
    this.loadEngineTypes();
    this.loadTransmissionTypes();
  }

  async loadBrands() {
    try {
      const brandsRef = collection(this.firestore, 'Brands');
      const snapshot = await getDocs(brandsRef);
      this.carBrands = snapshot.docs.map((doc) => ({
        BrandID: doc.id,
        BrandName: doc.data()['name'],
        Models: doc.data()['models'],
      }));
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  }

  loadModel(brandId: string) {
    const selectedBrand = this.carBrands.find((brand) => brand.BrandID === brandId);
    this.carModels = selectedBrand ? selectedBrand.Models : [];
  }

  async loadChassisTypes() {
    try {
      const chassisRef = collection(this.firestore, 'Chassies');
      const snapshot = await getDocs(chassisRef);
      this.chassisTypes = snapshot.docs.map((doc) => ({
        Chassis_type: doc.data()['Chassis_type'],
        Label: doc.data()['Label'],
      }));
    } catch (error) {
      console.error('Error fetching chassis types:', error);
    }
  }

  async loadEngineTypes() {
    try {
      const enginesRef = collection(this.firestore, 'Engines');
      const snapshot = await getDocs(enginesRef);
      this.engineTypes = snapshot.docs.map((doc) => ({
        Engine_type: doc.data()['Engine_type'],
        Label: doc.data()['Label'],
      }));
    } catch (error) {
      console.error('Error fetching engine types:', error);
    }
  }

  async loadTransmissionTypes() {
    try {
      const transmissionsRef = collection(this.firestore, 'Transmitions');
      const snapshot = await getDocs(transmissionsRef);
      this.transmissionTypes = snapshot.docs.map((doc) => ({
        Type: doc.data()['Type'],
        Label: doc.data()['Label'],
      }));
    } catch (error) {
      console.error('Error fetching transmission types:', error);
    }
  }

  async addCar() {
    const userId = await this.getUserId();
    if (userId) {
        this.carData.KM_added = this.carData.Current_KM;

        if (this.carData.Year) {
            const date = new Date(this.carData.Year);
            this.carData.Year = `${('0' + date.getDate()).slice(-2)}-${('0' + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()}`;
        }

        const carId = await this.addCarToFirestore(userId);
        await this.createUserCarEntry(userId, carId);

        if (this.selectedFiles.length > 0) {
            await this.uploadImages(carId);
        }

        this.router.navigate(['/cars']);
    } else {
        console.error('User ID is not available.');
    }
  }

  private async getUserId(): Promise<string | null> {
    return this.authService.getUserId();
  }

  private async addCarToFirestore(userId: string): Promise<string> {
    const carCollectionRef = collection(this.firestore, 'Cars');
    const now = new Date();
    const formattedDate = `${('0' + now.getDate()).slice(-2)}-${('0' + (now.getMonth() + 1)).slice(-2)}-${now.getFullYear()}`;

    const carDocRef = await addDoc(carCollectionRef, {
      ...this.carData,
      Date_added: formattedDate,
      UserID: userId,
      photoNames: [],
    });

    const carId = carDocRef.id;

    await updateDoc(doc(this.firestore, 'Cars', carId), {
      CarID: carId,
    });

    return carId;
  }

  private async createUserCarEntry(userId: string, carId: string): Promise<void> {
    const userCarCollectionRef = collection(this.firestore, 'User_car');
    await addDoc(userCarCollectionRef, {
      UserID: userId,
      CarID: carId,
    });
  }

  onFilesSelected(event: any) {
    const files = Array.from(event.target.files) as File[];

    this.selectedFiles = files;
    this.imagePreviews = [];

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
            this.imagePreviews.push(reader.result as string);
        };
        reader.readAsDataURL(file);
    });
  }

  private async uploadImages(carId: string) {
    if (this.selectedFiles.length === 0) {
        return;
    }

    const storage = getStorage();
    const photoNames: string[] = [];

    for (const file of this.selectedFiles) {
        const fileName = `${carId}_${new Date().toISOString().replace(/[:.]/g, '_')}.jpg`;
        const imageRef = ref(storage, `car_images/${fileName}`);

        try {
            await uploadBytes(imageRef, file);
            photoNames.push(fileName);
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    }

    if (photoNames.length > 0) {
        await updateDoc(doc(this.firestore, 'Cars', carId), { photoNames });
    }
  }
}
