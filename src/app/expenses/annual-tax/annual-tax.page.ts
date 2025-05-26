import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-annual-tax',
  templateUrl: './annual-tax.page.html',
  styleUrls: ['./annual-tax.page.scss'],
})
export class AnnualTaxPage implements OnInit {
  carId: string = '';
  licensePlate: string = ''; 
  annualTaxDocuments: any[] = [];

  taxYear: number | null = null;
  paymentHalf: string = '';
  paymentDate: string = '';
  cost: number | null = null;
  showForm: boolean = false;

  errors: any = {};
  showError: any = {};

  today: Date = new Date();

  isAdding: boolean = false;
  disableSaveBtn: boolean = false;

  private firestore = getFirestore();

  constructor(
    private route: ActivatedRoute,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('carId') || '';
    this.paymentDate = this.formatDateToInput(new Date());
    this.initValidation();
    if (this.carId) {
      await this.loadCarDetails();
      await this.loadAnnualTaxDocuments();
    }
  }

  private async loadCarDetails() {
    try {
      this.licensePlate = `CAR-${this.carId}`;
    } catch (error) {
      console.error('Error loading car details:', error);
    }
  }

  private async loadAnnualTaxDocuments() {
    try {
      const taxCollection = collection(this.firestore, 'AnnualTax');
      const q = query(taxCollection, where('carId', '==', this.carId));
      const querySnapshot = await getDocs(q);
      this.annualTaxDocuments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error loading annual tax documents:', error);
    }
  }

  initValidation() {
    this.errors = {};
    this.showError = {};
    ['taxYear', 'paymentHalf', 'cost', 'paymentDate'].forEach(f => {
      this.errors[f] = null;
      this.showError[f] = false;
    });
  }

  onInputChange(field: string) {
    this.showError[field] = true;
    this.validateField(field);
    if (!this.errors[field]) this.showError[field] = false;
  }

  validateField(field: string) {
    switch (field) {
      case 'taxYear':
        this.errors.taxYear = (!this.taxYear) ? 'Полето е задължително.' :
          (this.taxYear < 1900 || this.taxYear > 2100) ? 'Стойността трябва да е между 1900 и 2100.' : null;
        break;
      case 'paymentHalf':
        this.errors.paymentHalf = this.paymentHalf ? null : 'Моля, избери период.';
        break;
      case 'cost':
        this.errors.cost = (this.cost === null) ? 'Полето е задължително.' :
          (this.cost < 0 || this.cost > 10000) ? 'Стойността трябва да е между 0 и 10000 лв.' : null;
        break;
      case 'paymentDate':
        this.errors.paymentDate = this.paymentDate ? null : 'Полето е задължително.';
        break;
    }
  }

  isFormValid(): boolean {
    this.validateField('taxYear');
    this.validateField('paymentHalf');
    this.validateField('cost');
    return !this.errors.taxYear && !this.errors.paymentHalf && !this.errors.cost;
  }

  async addAnnualTaxRecord() {
    if (!this.isFormValid()) {
      Object.keys(this.showError).forEach(k => this.showError[k] = true);
      return;
    }
    if (this.taxYear && this.paymentHalf && this.cost !== null) {
      this.isAdding = true;
      this.disableSaveBtn = true;
      try {
        const formattedDate = this.paymentDate ? this.paymentDate : this.formatDateToInput(new Date());

        const taxCollection = collection(this.firestore, 'AnnualTax');
        await addDoc(taxCollection, {
          carId: this.carId,
          licensePlate: this.licensePlate,
          taxYear: this.taxYear,
          paymentHalf: this.paymentHalf,
          paymentDate: formattedDate,
          cost: this.cost,
        });

        await this.updateSpending(this.cost);
        this.taxYear = null;
        this.paymentHalf = '';
        this.paymentDate = this.formatDateToInput(new Date());
        this.cost = null;
        this.showForm = false;
        this.initValidation();
        await this.loadAnnualTaxDocuments();
      } catch (error) {
        console.error('Error adding annual tax document:', error);
      } finally {
        setTimeout(async () => {
          this.disableSaveBtn = false;
        }, 1500);
        this.isAdding = false;
      }
    }
  }

  async confirmDeleteAnnualTaxRecord(recordId: string) {
    const alert = await this.alertController.create({
      header: 'Изтриване на запис',
      message: 'Сигурни ли сте, че искате да изтриете този запис? Това действие е необратимо.',
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
          handler: () => this.deleteAnnualTaxRecord(recordId)
        }
      ]
    });
    await alert.present();
  }

  async deleteAnnualTaxRecord(recordId: string) {
    try {
      const record = this.annualTaxDocuments.find((r) => r.id === recordId);
      if (record) {
        await this.updateSpending(-record.cost);
      }

      const taxDoc = doc(this.firestore, 'AnnualTax', recordId);
      await deleteDoc(taxDoc);
      this.annualTaxDocuments = this.annualTaxDocuments.filter((record) => record.id !== recordId);
      console.log('Annual tax record deleted:', recordId);
    } catch (error) {
      console.error('Error deleting annual tax record:', error);
    }
  }

  formatDateToInput(date: Date): string {
    return `${('0'+date.getDate()).slice(-2)}-${('0'+(date.getMonth()+1)).slice(-2)}-${date.getFullYear()}`;
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (this.showForm && !this.paymentDate) {
      this.paymentDate = this.formatDateToInput(new Date());
    }
  }

  private async updateSpending(amount: number) {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');

      const monthlyDocRef = doc(this.firestore, 'Monthly_Spending', `${this.carId}_${year}-${month}`);
      const yearlyDocRef = doc(this.firestore, 'Yearly_Spending', `${this.carId}`);
      const allTimeDocRef = doc(this.firestore, 'All_Time_Spending', `${this.carId}`);

      await this.modifySpending(monthlyDocRef, amount);
      await this.modifySpending(yearlyDocRef, amount);
      await this.modifySpending(allTimeDocRef, amount);
    } catch (error) {
      console.error('Error updating spending:', error);
    }
  }

  private async modifySpending(docRef: any, amount: number) {
    try {
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const existingData = docSnapshot.data() as { spentsThisPeriod?: number };
        await updateDoc(docRef, {
          spentsThisPeriod: (existingData['spentsThisPeriod'] || 0) + amount,
          lastSpent: new Date().toISOString(),
        });
      } else {
        await addDoc(collection(this.firestore, docRef.path), {
          carID: this.carId,
          spentsThisPeriod: amount,
          lastSpent: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error modifying spending:', error);
    }
  }
}
