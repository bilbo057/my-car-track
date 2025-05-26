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
  getDoc
} from 'firebase/firestore';
import { SpendingService } from '../../services/spending.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-vehicle-insurance',
  templateUrl: './vehicle-insurance.page.html',
  styleUrls: ['./vehicle-insurance.page.scss'],
})
export class VehicleInsurancePage implements OnInit {
  carId: string = '';
  insuranceDocuments: any[] = [];
  insuranceData: { startDate: string, endDate: string, cost: any } = { startDate: '', endDate: '', cost: false };
  showInsuranceForm: boolean = false;
  showError: any = {
    cost: false,
    description: false,
  };
  disableSaveBtn = false;
  isAdding = false;

  private firestore = getFirestore();

  constructor(
    private route: ActivatedRoute,
    private spendingService: SpendingService,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('carId') || '';
    if (this.carId) {
      await this.loadInsuranceDocuments();
    }
    this.initValidation();
  }

  private async loadInsuranceDocuments() {
    try {
      const insuranceCollection = collection(this.firestore, 'VehicleInsurance');
      const q = query(insuranceCollection, where('carId', '==', this.carId));
      const querySnapshot = await getDocs(q);
      this.insuranceDocuments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch {}
  }

  async addInsuranceRecord() {
    if (!this.isFormValid()) {
      Object.keys(this.showError).forEach(k => this.showError[k] = true);
      return;
    }

    this.isAdding = true;
    this.disableSaveBtn = true;

    this.insuranceData.startDate = this.insuranceData.startDate ? this.insuranceData.startDate : this.formatDateToInput(new Date());
    this.insuranceData.endDate = this.calculateEndDate(this.insuranceData.startDate);

    try {
      const insuranceCollection = collection(this.firestore, 'VehicleInsurance');
      await addDoc(insuranceCollection, {
        carId: this.carId,
        ...this.insuranceData,
      });

      await this.spendingService.addExpense(this.carId, this.insuranceData.cost);

      this.insuranceData = { startDate: this.formatDateToInput(new Date()), endDate: '', cost: null };
      this.showInsuranceForm = false;
      this.initValidation();
      await this.loadInsuranceDocuments();
    } catch {}
    finally {
      setTimeout(() => {
        this.disableSaveBtn = false;
      }, 1500);
      this.isAdding = false;
    }
  }

  async deleteInsuranceRecord(recordId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Потвърди изтриване',
      message: 'Сигурни ли сте, че искате да изтриете тази застраховка?',
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
              const insuranceDoc = doc(this.firestore, 'VehicleInsurance', recordId);
              const docSnap = await getDoc(insuranceDoc);

              if (docSnap.exists()) {
                const data = docSnap.data();
                await deleteDoc(insuranceDoc);
                this.insuranceDocuments = this.insuranceDocuments.filter((record) => record.id !== recordId);
                await this.spendingService.subtractExpense(this.carId, data['cost']);
              }
            } catch {}
          }
        }
      ]
    });
    await alert.present();
  }

  private formatDate(date: Date | string): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }

  formatDateToInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private calculateEndDate(startDate: string): string {
    const start = new Date(startDate);
    start.setFullYear(start.getFullYear() + 1);
    start.setDate(start.getDate() - 1);
    return this.formatDate(start);
  }

  toggleInsuranceForm() {
    this.showInsuranceForm = !this.showInsuranceForm;
    if (this.showInsuranceForm && !this.insuranceData.startDate) {
      this.insuranceData.startDate = this.formatDateToInput(new Date());
    }
    this.initValidation();
  }

  onStartDateChange(date: string) {
    this.insuranceData.startDate = date;
    this.liveValidate();
  }
  onCostChange() {
    this.liveValidate();
  }

  liveValidate() {
    this.showError.startDate = !this.insuranceData.startDate;
    this.showError.cost =
      this.insuranceData.cost === null ||
      this.insuranceData.cost === undefined ||
      isNaN(this.insuranceData.cost) ||
      +this.insuranceData.cost < 0 ||
      +this.insuranceData.cost > 10000;
  }

  isFormValid(): boolean {
    return (
      !!this.insuranceData.startDate &&
      this.insuranceData.cost !== null &&
      this.insuranceData.cost !== undefined &&
      !isNaN(this.insuranceData.cost) &&
      +this.insuranceData.cost >= 0 &&
      +this.insuranceData.cost <= 10000
    );
  }

  initValidation() {
    this.showError = { startDate: false, cost: false };
  }
}
