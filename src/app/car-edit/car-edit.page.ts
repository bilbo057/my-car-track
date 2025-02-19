// car-edit.page.ts
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
  colorOptions: string[] = ['Red', 'Blue', 'Black', 'White', 'Silver', 'Gray', 'Green', 'Yellow'];
  driveOptions: string[] = ['Rear', 'Front', 'AWD'];
  euroOptions: number[] = [1, 2, 3, 4, 5, 6];
  
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  existingImages: string[] = [];

  private firestore = getFirestore();
  private storage = getStorage();

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.carId = params.get('id') || '';
      if (this.carId) {
        this.loadCarDetails();
      }
    });

    this.loadBrands();
    this.loadChassisTypes();
    this.loadEngineTypes();
    this.loadTransmissionTypes();
  }

  async loadCarDetails() {
    try {
        console.log('Loading car details...');

        const carDoc = doc(this.firestore, 'Cars', this.carId);
        const carSnapshot = await getDoc(carDoc);

        if (!carSnapshot.exists()) {
            console.error('Car not found');
            this.router.navigate(['/cars']);
            return;
        }

        this.carDetails = carSnapshot.data();
        console.log('Car details loaded:', this.carDetails);

        // Ensure photoUrls is properly updated
        this.carDetails.photoUrls = [];
        if (this.carDetails.photoNames) {
            for (const photoName of this.carDetails.photoNames) {
                const photoUrl = await getDownloadURL(ref(this.storage, `car_images/${photoName}`));
                this.carDetails.photoUrls.push(photoUrl);
            }
            this.existingImages = this.carDetails.photoNames;
        }
    } catch (error) {
        console.error('Error loading car details:', error);
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

  async saveCar() {
    try {
      const updatedCarDetails = { ...this.carDetails };

      if (updatedCarDetails.Year) {
        const date = new Date(updatedCarDetails.Year);
        updatedCarDetails.Year = `${('0' + date.getDate()).slice(-2)}-${('0' + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()}`;
      }

      if (this.selectedFiles.length > 0) {
        await this.uploadImages();
      }

      const carDoc = doc(this.firestore, 'Cars', this.carId);
      await updateDoc(carDoc, updatedCarDetails);
      console.log('Car details updated successfully');
      this.router.navigate(['/cars']);
    } catch (error) {
      console.error('Error updating car:', error);
    }
  }

  private async uploadImages() {
    if (this.selectedFiles.length === 0) return;

    const photoNames: string[] = this.existingImages || [];
    
    for (const file of this.selectedFiles) {
      const fileName = `${this.carId}_${new Date().toISOString().replace(/[:.]/g, '_')}.jpg`;
      const imageRef = ref(this.storage, `car_images/${fileName}`);

      try {
        await uploadBytes(imageRef, file);
        photoNames.push(fileName);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    if (photoNames.length > 0) {
      await updateDoc(doc(this.firestore, 'Cars', this.carId), { photoNames });
    }
  }

  async deletePhoto(fileName: string) {
    try {
      const imageRef = ref(this.storage, `car_images/${fileName}`);
      await deleteObject(imageRef);

      this.existingImages = this.existingImages.filter(name => name !== fileName);
      await updateDoc(doc(this.firestore, 'Cars', this.carId), { photoNames: this.existingImages });

      console.log('Photo deleted successfully.');
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  }
}
