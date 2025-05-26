import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { SpendingService } from '../../services/spending.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-refueling',
  templateUrl: './refueling.page.html',
  styleUrls: ['./refueling.page.scss'],
})
export class RefuelingPage implements OnInit {
  carId: string = '';
  carFuelType: string = '';
  refuelingDocuments: any[] = [];
  refuelingData: { date: string, fuelQuantity: number | null, price: number | null, odometer: number | null } = { date: '', fuelQuantity: null, price: null, odometer: null };
  showForm: boolean = false;
  showError: any = { date: false, fuelQuantity: false, price: false, odometer: false };
  disableSaveBtn = false;
  isAdding = false;
  minOdometer: number = 0;

  private firestore = getFirestore();

  constructor(
    private route: ActivatedRoute,
    private spendingService: SpendingService,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('carId') || '';
    if (this.carId) {
      await this.getCarFuelTypeAndMinOdometer();
      await this.loadRefuelingDocuments();
    }
    this.initValidation();
  }

  private async getCarFuelTypeAndMinOdometer() {
    try {
      const carDocRef = doc(this.firestore, 'Cars', this.carId);
      const carDoc = await getDoc(carDocRef);

      if (carDoc.exists()) {
        const carData = carDoc.data();
        this.carFuelType = carData['Engine_type'];
        this.minOdometer = carData['Current_KM'] || 0;
      } else {
        this.minOdometer = 0;
      }
    } catch {
      this.minOdometer = 0;
    }
  }

  private async loadRefuelingDocuments() {
    try {
      const refuelingCollection = collection(this.firestore, 'Refueling');
      const q = query(refuelingCollection, where('carId', '==', this.carId));
      const querySnapshot = await getDocs(q);
      this.refuelingDocuments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch {}
  }

  async addRefuelingRecord() {
    if (!this.isFormValid()) {
      Object.keys(this.showError).forEach(k => this.showError[k] = true);
      return;
    }

    this.isAdding = true;
    this.disableSaveBtn = true;

    this.refuelingData.date = this.refuelingData.date ? this.refuelingData.date : this.formatDateToInput(new Date());

    // Calculate total cost
    const liters = Number(this.refuelingData.fuelQuantity);
    const pricePerLiter = Number(this.refuelingData.price);
    const totalCost = +(liters * pricePerLiter).toFixed(2);

    try {
      const formattedDate = this.refuelingData.date;
      const refuelingCollection = collection(this.firestore, 'Refueling');
      await addDoc(refuelingCollection, {
        carId: this.carId,
        fuelType: this.carFuelType,
        date: formattedDate,
        fuelQuantity: liters,
        price: pricePerLiter,
        cost: totalCost,
        odometer: this.refuelingData.odometer,
      });

      await this.spendingService.addExpense(this.carId, totalCost);

      // Update Current_KM in Cars document
      const carDocRef = doc(this.firestore, 'Cars', this.carId);
      await updateDoc(carDocRef, { Current_KM: this.refuelingData.odometer });

      this.minOdometer = this.refuelingData.odometer || 0;

      this.refuelingData = { date: this.formatDateToInput(new Date()), fuelQuantity: null, price: null, odometer: null };
      this.showForm = false;
      this.initValidation();
      await this.loadRefuelingDocuments();
    } catch {}
    finally {
      setTimeout(() => {
        this.disableSaveBtn = false;
      }, 1500);
      this.isAdding = false;
    }
  }

  onDateChange(selectedDate: string) {
    this.refuelingData.date = selectedDate;
    this.liveValidate();
  }
  onFuelQuantityChange() {
    this.liveValidate();
  }
  onPriceChange() {
    this.liveValidate();
  }
  onOdometerChange() {
    this.liveValidate();
  }

  async deleteRefuelingRecord(recordId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Потвърди изтриване',
      message: 'Сигурни ли сте, че искате да изтриете това зареждане?',
      cssClass: 'custom-delete-alert',
      buttons: [
        {
          text: 'Отказ',
          role: 'cancel',
          cssClass: 'alert-cancel-btn'
        },
        {
          text: 'Изтрий',
          cssClass: 'alert-delete-btn',
          handler: async () => {
            try {
              const refuelDoc = doc(this.firestore, 'Refueling', recordId);
              const docSnap = await getDoc(refuelDoc);

              if (docSnap.exists()) {
                const data = docSnap.data();
                await deleteDoc(refuelDoc);
                this.refuelingDocuments = this.refuelingDocuments.filter((record) => record.id !== recordId);

                await this.spendingService.subtractExpense(this.carId, data['cost']);
              }
            } catch {}
          }
        }
      ]
    });
    await alert.present();
  }

  isFormValid(): boolean {
    return (
      !!this.refuelingData.date &&
      this.refuelingData.fuelQuantity !== null &&
      this.refuelingData.fuelQuantity !== undefined &&
      !isNaN(this.refuelingData.fuelQuantity) &&
      +this.refuelingData.fuelQuantity > 0 &&
      +this.refuelingData.fuelQuantity <= 200 &&
      this.refuelingData.price !== null &&
      this.refuelingData.price !== undefined &&
      !isNaN(this.refuelingData.price) &&
      +this.refuelingData.price > 0 &&
      +this.refuelingData.price <= 10 &&
      this.refuelingData.odometer !== null &&
      this.refuelingData.odometer !== undefined &&
      !isNaN(this.refuelingData.odometer) &&
      +this.refuelingData.odometer >= this.minOdometer &&
      +this.refuelingData.odometer <= 5000000
    );
  }

  liveValidate() {
    this.showError.fuelQuantity =
      this.refuelingData.fuelQuantity === null ||
      this.refuelingData.fuelQuantity === undefined ||
      isNaN(this.refuelingData.fuelQuantity) ||
      +this.refuelingData.fuelQuantity <= 0 ||
      +this.refuelingData.fuelQuantity > 200;

    this.showError.price =
      this.refuelingData.price === null ||
      this.refuelingData.price === undefined ||
      isNaN(this.refuelingData.price) ||
      +this.refuelingData.price <= 0 ||
      +this.refuelingData.price > 10;

    this.showError.odometer =
      this.refuelingData.odometer === null ||
      this.refuelingData.odometer === undefined ||
      isNaN(this.refuelingData.odometer) ||
      +this.refuelingData.odometer < this.minOdometer ||
      +this.refuelingData.odometer > 5000000;

    this.showError.date = !this.refuelingData.date;
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (this.showForm && !this.refuelingData.date) {
      this.refuelingData.date = this.formatDateToInput(new Date());
    }
    this.initValidation();
  }

  formatDateToInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  initValidation() {
    this.showError = { date: false, fuelQuantity: false, price: false, odometer: false };
  }
}
