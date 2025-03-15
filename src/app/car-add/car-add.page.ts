import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonModal } from '@ionic/angular';
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { AuthService } from '../services/auth.service';
import { Item } from '../typeahead/types';

@Component({
  selector: 'app-car-add',
  templateUrl: './car-add.page.html',
  styleUrls: ['./car-add.page.scss'],
})
export class CarAddPage implements OnInit {
  @ViewChild('brandModal', { static: false }) brandModal!: IonModal;
  @ViewChild('modelModal', { static: false }) modelModal!: IonModal;

  carData: any = {};
  carBrands: Item[] = [];
  carModels: Item[] = [];
  selectedBrand: Item | null = null;
  selectedModel: Item | null = null;

  chassisTypes: { Chassis_type: string; Label: string }[] = [];
  engineTypes: { Engine_type: string; Label: string }[] = [];
  transmissionTypes: { Type: string; Label: string }[] = [];
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  colors: string[] = ['Червено', 'Синьо', 'Черно', 'Бяло', 'Сиво', 'Зелено', 'Жълто', 'Оранжево', 'Кафяво', 'Лилаво', 'Бежово', 'Златисто', 'Розово', 'Металик', 'Друг'];
  driveTypes: string[] = ['Предно', 'Задно', '4x4'];
  euroStandards: number[] = [1, 2, 3, 4, 5, 6];

  private firestore = getFirestore();

  constructor(private authService: AuthService, private router: Router, private alertCtrl: AlertController) {}

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
        text: doc.data()['name'],
        value: doc.id,
        models: doc.data()['models'] || []
      }));
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  }

  onDateChange(event: string) {
    this.carData.Year = event;
  }  

  brandSelectionChanged(selectedValues: string[]) {
    if (selectedValues.length > 0) {
      this.selectedBrand = this.carBrands.find(brand => brand.value === selectedValues[0]) || null;
      this.carData.Brand = this.selectedBrand?.text || ''; // ✅ Save brand name
      this.loadModel(this.selectedBrand?.value || ""); 
    }
    this.brandModal?.dismiss();
  }
  
  modelSelectionChanged(selectedValues: string[]) {
    if (selectedValues.length > 0) {
      this.selectedModel = this.carModels.find(model => model.value === selectedValues[0]) || null;
      this.carData.Model = this.selectedModel?.text || ''; // ✅ Save model name
    }
    this.modelModal?.dismiss();
  }  

  loadModel(brandId?: string) { // Now it accepts optional arguments
    if (!brandId) {
      this.carModels = [];
      return;
    }
    
    const selectedBrand = this.carBrands.find((brand) => brand.value === brandId);
    this.carModels = selectedBrand?.models ? selectedBrand.models.map((model: string) => ({ text: model, value: model })) : [];
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

  onBrandSelected(selectedBrand: string) {
    if (!selectedBrand) return; // Ensure valid selection
    this.carData.Brand = selectedBrand;
    this.loadModel(selectedBrand);
  }  
  
  onModelSelected(selectedModel: string) {
    this.carData.Model = selectedModel;
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
    if (!this.validateFields()) return;
    
    const userId = await this.getUserId();
    if (!userId) {
      console.error('User ID is not available.');
      return;
    }

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

  async uploadImages(carId: string) {
    const photoNames: string[] = [];

    for (const file of this.selectedFiles) {
      const fileName = `${carId}_${new Date().toISOString().replace(/[:.]/g, '_')}.jpg`;
      const imageRef = ref(getStorage(), `car_images/${fileName}`);

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

  validateFields(): boolean {
    if (!this.selectedBrand) {
      alert("Моля, изберете марка на автомобила.");
      return false;
    }
    if (!this.selectedModel) {
      alert("Моля, изберете модел на автомобила.");
      return false;
    }
    if (!this.carData.Chassis_type) {
      alert("Моля, изберете тип на шасито.");
      return false;
    }
    if (!this.carData.Color) {
      alert("Моля, изберете цвят.");
      return false;
    }
    if (!this.carData.Engine_type) {
      alert("Моля, изберете тип двигател.");
      return false;
    }
    if (!this.carData.Transmission_type) {
      alert("Моля, изберете тип скоростна кутия.");
      return false;
    }
    if (!this.carData.Drive) {
      alert("Моля, изберете тип задвижване.");
      return false;
    }
    if (!this.carData.Euro) {
      alert("Моля, изберете евро стандарт.");
      return false;
    }
    if (!this.carData.Volume || this.carData.Volume < 250 || this.carData.Volume > 10000) {
      alert("Обемът на двигателя трябва да бъде между 250 и 10000 cc.");
      return false;
    }
    if (!this.carData.Power || this.carData.Power < 30 || this.carData.Power > 5000) {
      alert("Мощността трябва да бъде между 30 и 5000 HP.");
      return false;
    }
    if (!this.carData.Current_KM || this.carData.Current_KM < 0 || this.carData.Current_KM > 5000000) {
      alert("Километрите трябва да са между 0 и 5 000 000.");
      return false;
    }
    if (!this.carData.Price_of_buying || this.carData.Price_of_buying < 0 || this.carData.Price_of_buying > 10000000) {
      alert("Цената трябва да бъде между 0 и 10 000 000.");
      return false;
    }

    if (!this.carData.Year) {
      alert("Моля, изберете дата на регистрация.");
      return false;
    }
  
    const selectedDate = new Date(this.carData.Year);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    if (selectedDate > today) {
      alert("Дата на регистрация не може да бъде в бъдещето.");
      return false;
    }

    const platePattern = /^[ABEKMHOPTXCY]{1,2}\d{4}[ABEKMHOPTXCY]{1,2}$/;
    if (!platePattern.test(this.carData.License_plate)) {
      alert("Регистрационният номер е невалиден.");
      return false;
    }
    return true;
  }

  onFilesSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    files.forEach((file) => {
      this.selectedFiles.push(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviews.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  removePhoto(index: number) {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  formatLicensePlate() {
    if (!this.carData.License_plate) return;
  
    const cyrillicToLatinMap: { [key: string]: string } = {
      'а': 'A', 'в': 'B', 'е': 'E', 'к': 'K', 'м': 'M', 'н': 'H',
      'о': 'O', 'р': 'P', 'т': 'T', 'х': 'X', 'с': 'C', 'у': 'Y'
    };
  
    this.carData.License_plate = this.carData.License_plate
      .toUpperCase()
      .split('')
      .map((char: string) => cyrillicToLatinMap[char.toLowerCase()] || char)
      .join('')
      .replace(/[^ABEKMHOPTXCY0-9]/g, '');

      // **Check if any invalid letters exist after conversion**
      if (!/^[ABEKMHOPTXCY0-9]+$/.test(this.carData.License_plate)) {
        alert("Регистрационният номер съдържа неразрешени символи. Разрешени букви: A, B, E, K, M, H, O, P, T, X, C, Y.");
        this.carData.License_plate = ""; // Clear invalid input
      }
  }

  
}