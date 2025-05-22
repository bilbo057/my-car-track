import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getFirestore, collection, doc, getDoc, updateDoc, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

@Component({
  selector: 'app-car-edit',
  templateUrl: './car-edit.page.html',
  styleUrls: ['./car-edit.page.scss'],
})
export class CarEditPage implements OnInit {
  carId: string = '';
  carDetails: any = {};
  brandOptions: { BrandID: string; BrandName: string; Models: string[] }[] = [];
  filteredModels: string[] = [];
  chassisTypes: { Chassis_type: string; Label: string }[] = [];
  engineTypes: { Engine_type: string; Label: string }[] = [];
  transmissionTypes: { Type: string; Label: string }[] = [];
  colorOptions: string[] = ['Red', 'Blue', 'Black', 'White', 'Pink', 'Orange', 'Purple', 'Gray', 'Green', 'Yellow'];
  driveOptions: string[] = ['Rear', 'Front', 'AWD'];
  euroOptions: number[] = [1, 2, 3, 4, 5, 6];
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  existingImages: string[] = [];
  showValidation: boolean = false;

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
        await this.loadCarDetails(); // Move this AFTER types are loaded
      }
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
    } else {
      console.error('Car not found');
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
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  }

  loadModels(brandId: string) {
    const selectedBrand = this.brandOptions.find((brand) => brand.BrandID === brandId);
    this.filteredModels = selectedBrand ? selectedBrand.Models : [];
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

  async saveCar() {
    this.showValidation = true;

    // Validate required fields
    const isValid =
      this.carDetails.Brand &&
      this.carDetails.Model &&
      this.carDetails.License_plate &&
      this.carDetails.Volume >= 250 && this.carDetails.Volume <= 10000 &&
      this.carDetails.Power >= 30 && this.carDetails.Power <= 5000 &&
      this.carDetails.Current_KM >= 0 && this.carDetails.Current_KM <= 5000000;

    if (!isValid) {
      console.warn('Validation failed');
      return;
    }

    if (this.selectedFiles.length > 0) {
      await this.uploadImages();
    }

    const carDocRef = doc(this.firestore, 'Cars', this.carId);
    await updateDoc(carDocRef, {
      ...this.carDetails,
      photoNames: this.existingImages
    });

    console.log('Car details updated successfully');
    this.router.navigate(['/cars']);
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

  async deletePhoto(index: number) {
    const fileName = this.existingImages[index];
    const imageRef = ref(this.storage, `car_images/${fileName}`);

    try {
      await deleteObject(imageRef);
      this.existingImages.splice(index, 1);
      this.imagePreviews.splice(index, 1);
      console.log('Photo deleted successfully.');

      await updateDoc(doc(this.firestore, 'Cars', this.carId), {
        photoNames: this.existingImages
      });
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  }

  onDateChange(event: string) {
    this.carDetails.Date_added = event;
  }
}
