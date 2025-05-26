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
  selector: 'app-yearly-vehicle-check',
  templateUrl: './yearly-vehicle-check.page.html',
  styleUrls: ['./yearly-vehicle-check.page.scss'],
})
export class YearlyVehicleCheckPage implements OnInit {
  carId: string = '';
  vehicleCheckRecords: any[] = [];
  checkData: { startDate: string, endDate: string, cost: any } = { startDate: '', endDate: '', cost: null };
  showCheckForm: boolean = false;
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
      await this.loadVehicleCheckRecords();
    }
    this.initValidation();
  }

  private async loadVehicleCheckRecords() {
    try {
      const checksCollection = collection(this.firestore, 'YearlyVehicleCheck');
      const q = query(checksCollection, where('carId', '==', this.carId));
      const querySnapshot = await getDocs(q);
      this.vehicleCheckRecords = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch {}
  }

  async addVehicleCheckRecord() {
    if (!this.isFormValid()) {
      Object.keys(this.showError).forEach(k => this.showError[k] = true);
      return;
    }
    this.isAdding = true;
    this.disableSaveBtn = true;

    this.checkData.startDate = this.checkData.startDate ? this.checkData.startDate : this.formatDateToInput(new Date());
    this.checkData.endDate = this.calculateEndDate(this.checkData.startDate);

    try {
      const checksCollection = collection(this.firestore, 'YearlyVehicleCheck');
      await addDoc(checksCollection, {
        carId: this.carId,
        ...this.checkData,
      });

      await this.spendingService.addExpense(this.carId, this.checkData.cost);

      this.checkData = { startDate: this.formatDateToInput(new Date()), endDate: '', cost: null };
      this.showCheckForm = false;
      this.initValidation();
      await this.loadVehicleCheckRecords();
    } catch {}
    finally {
      setTimeout(() => {
        this.disableSaveBtn = false;
      }, 1500);
      this.isAdding = false;
    }
  }

  async deleteVehicleCheck(recordId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Потвърди изтриване',
      message: 'Сигурни ли сте, че искате да изтриете този преглед?',
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
              const checkDocRef = doc(this.firestore, 'YearlyVehicleCheck', recordId);
              const checkDocSnap = await getDoc(checkDocRef);

              if (checkDocSnap.exists()) {
                const checkData = checkDocSnap.data() as { cost?: number };
                const cost = checkData.cost || 0;

                await deleteDoc(checkDocRef);
                this.vehicleCheckRecords = this.vehicleCheckRecords.filter((record) => record.id !== recordId);

                await this.spendingService.subtractExpense(this.carId, cost);
              }
            } catch {}
          }
        }
      ]
    });
    await alert.present();
  }

  private calculateEndDate(startDate: string): string {
    const start = new Date(startDate);
    start.setFullYear(start.getFullYear() + 1);
    start.setDate(start.getDate() - 1);
    return this.formatDate(start);
  }

  private formatDate(date: Date | string): string {
    const parsedDate = new Date(date);
    return `${parsedDate.getFullYear()}-${(parsedDate.getMonth() + 1).toString().padStart(2, '0')}-${parsedDate
      .getDate()
      .toString()
      .padStart(2, '0')}`;
  }
  formatDateToInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  toggleCheckForm() {
    this.showCheckForm = !this.showCheckForm;
    if (this.showCheckForm && !this.checkData.startDate) {
      this.checkData.startDate = this.formatDateToInput(new Date());
    }
    this.initValidation();
  }

  onStartDateChange(date: string) {
    this.checkData.startDate = date;
    this.liveValidate();
  }
  onCostChange() {
    this.liveValidate();
  }

  liveValidate() {
    this.showError.startDate = !this.checkData.startDate;
    this.showError.cost =
      this.checkData.cost === null ||
      this.checkData.cost === undefined ||
      isNaN(this.checkData.cost) ||
      +this.checkData.cost < 0 ||
      +this.checkData.cost > 1000;
  }

  isFormValid(): boolean {
    return (
      !!this.checkData.startDate &&
      this.checkData.cost !== null &&
      this.checkData.cost !== undefined &&
      !isNaN(this.checkData.cost) &&
      +this.checkData.cost >= 0 &&
      +this.checkData.cost <= 1000
    );
  }

  initValidation() {
    this.showError = { startDate: false, cost: false };
  }
}
