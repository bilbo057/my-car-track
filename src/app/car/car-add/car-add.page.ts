import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonModal, IonSelect } from '@ionic/angular';
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { AuthService } from '../../services/auth.service';
import { Item } from '../../typeahead/types';

@Component({
  selector: 'app-car-add',
  templateUrl: './car-add.page.html',
  styleUrls: ['./car-add.page.scss'],
})
export class CarAddPage implements OnInit {
  @ViewChild('brandModal', { static: false }) brandModal!: IonModal;
  @ViewChild('modelModal', { static: false }) modelModal!: IonModal;
  @ViewChild('chassisSelect', { static: false }) chassisSelect!: IonSelect;
  @ViewChild('colorSelect', { static: false }) colorSelect!: IonSelect;
  @ViewChild('engineSelect', { static: false }) engineSelect!: IonSelect;
  @ViewChild('transmissionSelect', { static: false }) transmissionSelect!: IonSelect;
  @ViewChild('driveSelect', { static: false }) driveSelect!: IonSelect;
  @ViewChild('euroSelect', { static: false }) euroSelect!: IonSelect;
  @ViewChild('datePicker', { static: false }) datePicker: any;

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
  colors: string[] = ['Червен', 'Син', 'Черен', 'Бял', 'Сив', 'Зелен', 'Жълт', 'Оранжев', 'Кафяв', 'Лилав', 'Бежов', 'Златист', 'Розов', 'Металик', 'Друг'];
  driveTypes: string[] = ['Предно', 'Задно', '4x4'];
  euroStandards: number[] = [1, 2, 3, 4, 5, 6];

  today: Date = new Date();
  isSubmitting = false;

  errors: any = {};
  showError: any = {};

  private firestore = getFirestore();

  constructor(private authService: AuthService, private router: Router, private alertCtrl: AlertController) {}

  ngOnInit() {
    this.carData.Year = this.formatDateToInput(new Date());
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

  brandSelectionChanged(selectedValues: string[]) {
    if (selectedValues.length > 0) {
      this.selectedBrand = this.carBrands.find(brand => brand.value === selectedValues[0]) || null;
      this.carData.Brand = this.selectedBrand?.text || '';
      this.loadModel(this.selectedBrand?.value || "");
      this.showError.brand = false;
      this.errors.brand = null;
    } else {
      this.showError.brand = true;
      this.errors.brand = "Моля, изберете марка на автомобила.";
    }
    this.brandModal?.dismiss();
  }

  modelSelectionChanged(selectedValues: string[]) {
    if (selectedValues.length > 0) {
      this.selectedModel = this.carModels.find(model => model.value === selectedValues[0]) || null;
      this.carData.Model = this.selectedModel?.text || '';
      this.showError.model = false;
      this.errors.model = null;
    } else {
      this.showError.model = true;
      this.errors.model = "Моля, изберете модел на автомобила.";
    }
    this.modelModal?.dismiss();
  }

  loadModel(brandId?: string) {
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

  onDateChange(event: string) {
    this.carData.Year = event;
    this.showError.year = true;
    this.validateField('year');
    if (!this.errors.year) this.showError.year = false;
  }

  onInputChange(field: string) {
    this.showError[field] = true;
    this.validateField(field);
    if (!this.errors[field]) this.showError[field] = false;
  }
  onTouched(field: string) {
    this.showError[field] = true;
    this.validateField(field);
    if (!this.errors[field]) this.showError[field] = false;
  }

  onSelectChange(field: string) {
    this.validateField(field);
    if (!this.errors[field]) this.showError[field] = false;
    else this.showError[field] = true;
  }

  validateField(field: string) {
    switch (field) {
      case 'brand':
        this.errors.brand = this.selectedBrand ? null : "Моля, изберете марка на автомобила.";
        break;
      case 'model':
        this.errors.model = this.selectedModel ? null : "Моля, изберете модел на автомобила.";
        break;
      case 'chassis':
        this.errors.chassis = this.carData.Chassis_type ? null : "Моля, изберете тип на шасито.";
        break;
      case 'color':
        this.errors.color = this.carData.Color ? null : "Моля, изберете цвят.";
        break;
      case 'engine':
        this.errors.engine = this.carData.Engine_type ? null : "Моля, изберете тип двигател.";
        break;
      case 'transmission':
        this.errors.transmission = this.carData.Transmission_type ? null : "Моля, изберете скоростна кутия.";
        break;
      case 'drive':
        this.errors.drive = this.carData.Drive ? null : "Моля, изберете тип задвижване.";
        break;
      case 'euro':
        this.errors.euro = this.carData.Euro ? null : "Моля, изберете евро стандарт.";
        break;
      case 'volume':
        const v = Number(this.carData.Volume);
        this.errors.volume = (!v || v < 250 || v > 10000) ? "Обемът трябва да е между 250 и 10 000 cc." : null;
        break;
      case 'power':
        const p = Number(this.carData.Power);
        this.errors.power = (!p || p < 30 || p > 5000) ? "Мощността трябва да е между 30 и 5 000 к.с.." : null;
        break;
      case 'current_km':
        const km = Number(this.carData.Current_KM);
        this.errors.current_km = (isNaN(km) || km < 0 || km > 5000000) ? "Километрите трябва да са между 0 и 5 000 000 км." : null;
        break;
      case 'price':
        const pr = Number(this.carData.Price_of_buying);
        this.errors.price = (isNaN(pr) || pr < 0 || pr > 10000000) ? "Цената трябва да бъде между 0 и 10 000 000 лв." : null;
        break;
      case 'plate':
        const platePattern = /^[ABEKMHOPTXCY]{1,2}\d{4}[ABEKMHOPTXCY]{1,2}$/;
        const val = this.carData.License_plate ? this.carData.License_plate.trim() : '';
        if (!val) {
          this.errors.plate = null; // Don't show error when empty (or show 'required' on submit)
        } else if (val.length === 7 || val.length === 8) {
          this.errors.plate = null; // Too early to validate, user still typing
        } else if (!platePattern.test(val)) {
          this.errors.plate = "Невалиден регистрационен номер.";
        } else {
          this.errors.plate = null;
        }
      break;
      case 'year':
        if (!this.carData.Year) {
          this.errors.year = "Моля, изберете дата.";
        } else {
          const selectedDate = this.parseDate(this.carData.Year);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate > today) {
            this.errors.year = "Дата не може да е в бъдещето.";
          } else {
            this.errors.year = null;
          }
        }
      break;
    }
  }

  isFormValid(): boolean {
    for (const key of ['brand', 'model', 'chassis', 'color', 'engine', 'transmission', 'drive', 'euro', 'volume', 'power', 'current_km', 'price', 'plate', 'year']) {
      this.validateField(key);
      if (this.errors[key]) return false;
    }
    return true;
  }

  async addCar() {
    if (!this.isFormValid()) {
      for (const k of Object.keys(this.showError)) this.showError[k] = true;
      return;
    }

    this.isSubmitting = true;
    setTimeout(async () => {
      const userId = await this.getUserId();
      if (!userId) {
        this.isSubmitting = false;
        return;
      }
      this.carData.KM_added = this.carData.Current_KM;
      if (this.carData.Year) {
        const date = this.parseDate(this.carData.Year);
        this.carData.Year = this.formatDate(date);
      }
      const carId = await this.addCarToFirestore(userId);
      await this.createUserCarEntry(userId, carId);
      if (this.selectedFiles.length > 0) await this.uploadImages(carId);
      this.isSubmitting = false;
      this.router.navigate(['/cars']);
    }, 2000);
  }

  // --- Date format helpers ---
  parseDate(str: string): Date {
    // Accept dd-MM-yyyy or ISO
    if (str.includes('-') && str.length === 10) {
      const [dd, mm, yyyy] = str.split('-').map(Number);
      return new Date(yyyy, mm - 1, dd);
    }
    return new Date(str);
  }
  formatDateToInput(date: Date): string {
    // Returns dd-MM-yyyy
    return `${('0'+date.getDate()).slice(-2)}-${('0'+(date.getMonth()+1)).slice(-2)}-${date.getFullYear()}`;
  }
  formatDate(date: Date): string {
    return this.formatDateToInput(date);
  }

  private async getUserId(): Promise<string | null> {
    return this.authService.getUserId();
  }

  private async addCarToFirestore(userId: string): Promise<string> {
    const carCollectionRef = collection(this.firestore, 'Cars');
    const now = new Date();
    const formattedDate = this.formatDateToInput(now);
    const carDocRef = await addDoc(carCollectionRef, {
      ...this.carData,
      Date_added: formattedDate,
      UserID: userId,
      photoNames: [],
    });
    const carId = carDocRef.id;
    await updateDoc(doc(this.firestore, 'Cars', carId), { CarID: carId });
    return carId;
  }

  private async createUserCarEntry(userId: string, carId: string): Promise<void> {
    const userCarCollectionRef = collection(this.firestore, 'User_car');
    await addDoc(userCarCollectionRef, { UserID: userId, CarID: carId });
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
    if (photoNames.length > 0) await updateDoc(doc(this.firestore, 'Cars', carId), { photoNames });
  }

  onFilesSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    files.forEach((file) => {
      this.selectedFiles.push(file);
      const reader = new FileReader();
      reader.onload = () => { this.imagePreviews.push(reader.result as string); };
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
}

}
