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
  getDoc,
  deleteDoc
} from 'firebase/firestore';
import { SpendingService } from '../../services/spending.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-toll-tax',
  templateUrl: './toll-tax.page.html',
  styleUrls: ['./toll-tax.page.scss'],
})
export class TollTaxPage implements OnInit {
  carId: string = '';
  licensePlate: string = '';
  tollTaxDocuments: any[] = [];
  tollTaxData: { startDate: string, amount: number | null } = { startDate: '', amount: null };
  showForm: boolean = false;
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
      await this.getCarDetails();
      await this.loadTollTaxDocuments();
    }
    this.initValidation();
  }

  private async getCarDetails() {
    try {
      const carDocRef = doc(this.firestore, 'Cars', this.carId);
      const carDoc = await getDoc(carDocRef);
      if (carDoc.exists()) {
        const carData = carDoc.data();
        this.licensePlate = carData['License_plate'];
      } else {
        this.licensePlate = '';
      }
    } catch (error) {
      this.licensePlate = '';
    }
  }

  private async loadTollTaxDocuments() {
    try {
      const tollTaxCollection = collection(this.firestore, 'TollTax');
      const q = query(tollTaxCollection, where('carId', '==', this.carId));
      const querySnapshot = await getDocs(q);
      this.tollTaxDocuments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {}
  }

  async addTollTaxRecord() {
    if (!this.isFormValid()) {
      Object.keys(this.showError).forEach(k => this.showError[k] = true);
      return;
    }
    if (this.tollTaxData.startDate && this.tollTaxData.amount !== null) {
      this.isAdding = true;
      this.disableSaveBtn = true;
      try {
        const formattedStartDate = this.tollTaxData.startDate;
        const formattedEndDate = this.calculateEndDate(new Date(formattedStartDate));
        const tollTaxCollection = collection(this.firestore, 'TollTax');
        await addDoc(tollTaxCollection, {
          carId: this.carId,
          licensePlate: this.licensePlate,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          amount: this.tollTaxData.amount,
        });

        await this.spendingService.addExpense(this.carId, this.tollTaxData.amount);

        this.tollTaxData = {
          startDate: this.formatDateToInput(new Date()),
          amount: null
        };
        this.showForm = false;
        this.initValidation();
        await this.loadTollTaxDocuments();
      } catch (error) {
      } finally {
        setTimeout(() => {
          this.disableSaveBtn = false;
        }, 1500);
        this.isAdding = false;
      }
    }
  }

  async deleteTollTaxRecord(recordId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Потвърди изтриване',
      message: 'Сигурни ли сте, че искате да изтриете тази тол такса?',
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
              const tollDoc = doc(this.firestore, 'TollTax', recordId);
              const docSnap = await getDoc(tollDoc);
              if (docSnap.exists()) {
                const data = docSnap.data();
                await deleteDoc(tollDoc);
                this.tollTaxDocuments = this.tollTaxDocuments.filter((record) => record.id !== recordId);
                await this.spendingService.subtractExpense(this.carId, data['amount']);
              }
            } catch (error) {}
          }
        }
      ]
    });
    await alert.present();
  }

  private calculateEndDate(startDate: Date): string {
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    endDate.setDate(endDate.getDate() - 1);
    return this.formatDate(endDate);
  }

  private formatDate(date: string | Date): string {
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

  toggleForm() {
    this.showForm = !this.showForm;
    if (this.showForm && !this.tollTaxData.startDate) {
      this.tollTaxData.startDate = this.formatDateToInput(new Date());
    }
    this.initValidation();
  }

  onStartDateChange(date: string) {
    this.tollTaxData.startDate = date;
    this.liveValidate();
  }

  onAmountChange() {
    this.liveValidate();
  }

  liveValidate() {
    this.showError.amount =
      this.tollTaxData.amount === null ||
      this.tollTaxData.amount === undefined ||
      isNaN(this.tollTaxData.amount) ||
      +this.tollTaxData.amount < 0 ||
      +this.tollTaxData.amount > 10000;
    this.showError.startDate = !this.tollTaxData.startDate;
  }

  isFormValid(): boolean {
    return (
      this.tollTaxData.amount !== null &&
      this.tollTaxData.amount !== undefined &&
      !isNaN(this.tollTaxData.amount) &&
      +this.tollTaxData.amount >= 0 &&
      +this.tollTaxData.amount <= 10000 &&
      !!this.tollTaxData.startDate
    );
  }

  initValidation() {
    this.showError = { amount: false, startDate: false };
  }
}
