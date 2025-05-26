import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getFirestore, collection, doc, getDoc, updateDoc, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { IonSelect } from '@ionic/angular';

@Component({
  selector: 'app-car-edit',
  templateUrl: './car-edit.page.html',
  styleUrls: ['./car-edit.page.scss'],
})
export class CarEditPage implements OnInit {
  @ViewChild('brandSelect', { static: false }) brandSelect!: IonSelect;
  @ViewChild('modelSelect', { static: false }) modelSelect!: IonSelect;
  @ViewChild('chassisSelect', { static: false }) chassisSelect!: IonSelect;
  @ViewChild('engineSelect', { static: false }) engineSelect!: IonSelect;
  @ViewChild('transmissionSelect', { static: false }) transmissionSelect!: IonSelect;
  @ViewChild('colorSelect', { static: false }) colorSelect!: IonSelect;
  @ViewChild('driveSelect', { static: false }) driveSelect!: IonSelect;
  @ViewChild('euroSelect', { static: false }) euroSelect!: IonSelect;

  carId: string = '';
  carDetails: any = {};
  brandOptions: { BrandID: string; BrandName: string; Models: string[] }[] = [];
  filteredModels: string[] = [];
  chassisTypes: { Chassis_type: string; Label: string }[] = [];
  engineTypes: { Engine_type: string; Label: string }[] = [];
  transmissionTypes: { Type: string; Label: string }[] = [];
  colorOptions: string[] = ['Червен', 'Син', 'Черен', 'Бял', 'Сив', 'Зелен', 'Жълт', 'Оранжев', 'Кафяв', 'Лилав', 'Бежов', 'Златист', 'Розов', 'Металик', 'Друг'];
  driveOptions: string[] = ['Предно', 'Задно', '4x4'];
  euroOptions: number[] = [1, 2, 3, 4, 5, 6];
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  existingImages: string[] = [];
  today: Date = new Date();
  isSubmitting = false;

  errors: any = {};
  showError: any = {};

  private firestore = getFirestore();
  private storage = getStorage();

  constructor(private route: ActivatedRoute, private router: Router) {}

  async ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      this.carId = params.get('id') || '';
      await Promise.all([
        this.loadBrands(),
        this.loadChassisTypes(),
        this.loadEngineTypes(),
        this.loadTransmissionTypes()
      ]);
      if (this.carId) {
        await this.loadCarDetails();
      }
      this.initValidation();
    });
  }

  initValidation() {
    this.errors = {};
    this.showError = {};
    [
      'brand', 'model', 'chassis', 'color', 'engine', 'transmission', 'drive', 'euro',
      'volume', 'power', 'current_km', 'price', 'plate', 'year'
    ].forEach(field => {
      this.errors[field] = null;
      this.showError[field] = false;
    });
  }

  getBrandName(brandId: string): string | null {
    const brand = this.brandOptions.find(b => b.BrandID === brandId);
    return brand ? brand.BrandName : null;
  }

  async loadCarDetails() {
    const carDocRef = doc(this.firestore, 'Cars', this.carId);
    const carSnapshot = await getDoc(carDocRef);
    if (carSnapshot.exists()) {
      this.carDetails = carSnapshot.data();
      if (this.carDetails.photoNames) {
        this.existingImages = [];
        for (const name of this.carDetails.photoNames) {
          const url = await getDownloadURL(ref(this.storage, `car_images/${name}`));
          this.imagePreviews.push(url);
          this.existingImages.push(name);
        }
      }
      if (!this.carDetails.Date_added) {
        const now = new Date();
        this.carDetails.Date_added = this.formatDateToInput(now);
      }
      this.loadModels(this.carDetails.Brand);
    } else {
      this.router.navigate(['/cars']);
    }
  }

  async loadBrands() {
    try {
      const brandsRef = collection(this.firestore, 'Brands');
      const snapshot = await getDocs(brandsRef);
      this.brandOptions = snapshot.docs.map((doc) => ({
        BrandID: doc.id,
        BrandName: doc.data()['name'],
        Models: doc.data()['models'],
      }));
    } catch {}
  }

  loadModels(brandId: string) {
    const selectedBrand = this.brandOptions.find((brand) => brand.BrandID === brandId);
    this.filteredModels = selectedBrand ? selectedBrand.Models : [];
    if (!this.filteredModels.includes(this.carDetails.Model)) {
      this.carDetails.Model = '';
    }
    this.onInputChange('brand');
    this.onInputChange('model');
  }

  async loadChassisTypes() {
    try {
      const chassisRef = collection(this.firestore, 'Chassies');
      const snapshot = await getDocs(chassisRef);
      this.chassisTypes = snapshot.docs.map((doc) => ({
        Chassis_type: doc.data()['Chassis_type'],
        Label: doc.data()['Label'],
      }));
    } catch {}
  }

  async loadEngineTypes() {
    try {
      const enginesRef = collection(this.firestore, 'Engines');
      const snapshot = await getDocs(enginesRef);
      this.engineTypes = snapshot.docs.map((doc) => ({
        Engine_type: doc.data()['Engine_type'],
        Label: doc.data()['Label'],
      }));
    } catch {}
  }

  async loadTransmissionTypes() {
    try {
      const transmissionsRef = collection(this.firestore, 'Transmitions');
      const snapshot = await getDocs(transmissionsRef);
      this.transmissionTypes = snapshot.docs.map((doc) => ({
        Type: doc.data()['Type'],
        Label: doc.data()['Label'],
      }));
    } catch {}
  }

  onFilesSelected(event: any) {
    const newFiles = Array.from(event.target.files) as File[];
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviews.push(reader.result as string);
        this.selectedFiles.push(file);
      };
      reader.readAsDataURL(file);
    });
  }

  async deletePhoto(index: number) {
    const fileName = this.existingImages[index];
    const imageRef = ref(this.storage, `car_images/${fileName}`);
    try {
      await deleteObject(imageRef);
      this.existingImages.splice(index, 1);
      this.imagePreviews.splice(index, 1);
      await updateDoc(doc(this.firestore, 'Cars', this.carId), {
        photoNames: this.existingImages
      });
    } catch {}
  }

  onDateChange(event: string) {
    this.carDetails.Date_added = event;
    this.onInputChange('year');
  }

  onInputChange(field: string) {
    this.showError[field] = true;
    this.validateField(field);
    if (!this.errors[field]) this.showError[field] = false;
  }

  validateField(field: string) {
    switch (field) {
      case 'brand':
        this.errors.brand = this.carDetails.Brand ? null : "Полето е задължително.";
        break;
      case 'model':
        this.errors.model = this.carDetails.Model ? null : "Полето е задължително.";
        break;
      case 'chassis':
        this.errors.chassis = this.carDetails.Chassis_type ? null : "Полето е задължително.";
        break;
      case 'color':
        this.errors.color = this.carDetails.Color ? null : "Полето е задължително.";
        break;
      case 'engine':
        this.errors.engine = this.carDetails.Engine_type ? null : "Полето е задължително.";
        break;
      case 'transmission':
        this.errors.transmission = this.carDetails.Transmission_type ? null : "Полето е задължително.";
        break;
      case 'drive':
        this.errors.drive = this.carDetails.Drive ? null : "Полето е задължително.";
        break;
      case 'euro':
        this.errors.euro = this.carDetails.Euro ? null : "Полето е задължително.";
        break;
      case 'volume':
        const v = Number(this.carDetails.Volume);
        this.errors.volume = (!v || v < 250 || v > 10000) ? "Обемът трябва да е между 250 и 10 000 cc." : null;
        break;
      case 'power':
        const p = Number(this.carDetails.Power);
        this.errors.power = (!p || p < 30 || p > 5000) ? "Мощността трябва да е между 30 и 5 000 к.с.." : null;
        break;
      case 'current_km':
        const km = Number(this.carDetails.Current_KM);
        this.errors.current_km = (isNaN(km) || km < 0 || km > 5000000) ? "Километрите трябва да са между 0 и 5 000 000 км." : null;
        break;
      case 'price':
        const pr = Number(this.carDetails.Price_of_buying);
        this.errors.price = (isNaN(pr) || pr < 0 || pr > 10000000) ? "Цената трябва да бъде между 0 и 10 000 000 лв." : null;
        break;
      case 'plate':
        const platePattern = /^[ABEKMHOPTXCY]{1,2}\d{4}[ABEKMHOPTXCY]{1,2}$/;
        const val = this.carDetails.License_plate ? this.carDetails.License_plate.trim() : '';
        if (!val) {
          this.errors.plate = "Полето е задължително.";
        } else if (val.length < 7 || val.length > 8) {
          this.errors.plate = null;
        } else if (!platePattern.test(val)) {
          this.errors.plate = "Невалиден регистрационен номер.";
        } else {
          this.errors.plate = null;
        }
        break;
      case 'year':
        if (!this.carDetails.Date_added) {
          this.errors.year = null;
        } else {
          const selectedDate = this.parseDate(this.carDetails.Date_added);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          this.errors.year = selectedDate > today ? "Дата не може да е в бъдещето." : null;
        }
        break;
    }
  }

  isFormValid(): boolean {
    for (const key of ['brand', 'model', 'chassis', 'color', 'engine', 'transmission', 'drive', 'euro', 'volume', 'power', 'current_km', 'plate', 'year']) {
      this.validateField(key);
      if (this.errors[key]) return false;
    }
    return true;
  }

  async saveCar() {
    this.isSubmitting = true;
    if (!this.isFormValid()) {
      for (const k of Object.keys(this.showError)) this.showError[k] = true;
      this.isSubmitting = false;
      return;
    }
    setTimeout(async () => {
      if (this.selectedFiles.length > 0) {
        await this.uploadImages();
      }
      const carDocRef = doc(this.firestore, 'Cars', this.carId);
      await updateDoc(carDocRef, {
        ...this.carDetails,
        photoNames: this.existingImages
      });
      this.isSubmitting = false;
      this.router.navigate(['/car-details', this.carId]);
    }, 2000);
  }

  private async uploadImages() {
    const storageRef = ref(this.storage, 'car_images');
    for (const file of this.selectedFiles) {
      const fileName = `${this.carId}_${Date.now()}`;
      const fileRef = ref(storageRef, fileName);
      await uploadBytes(fileRef, file);
      this.existingImages.push(fileName);
      this.imagePreviews.push(await getDownloadURL(fileRef));
    }
    await updateDoc(doc(this.firestore, 'Cars', this.carId), { photoNames: this.existingImages });
  }

  // --- Date format helpers ---
  parseDate(str: string): Date {
    if (str.includes('-') && str.length === 10) {
      const [dd, mm, yyyy] = str.split('-').map(Number);
      return new Date(yyyy, mm - 1, dd);
    }
    return new Date(str);
  }
  formatDateToInput(date: Date): string {
    return `${('0'+date.getDate()).slice(-2)}-${('0'+(date.getMonth()+1)).slice(-2)}-${date.getFullYear()}`;
  }
}
