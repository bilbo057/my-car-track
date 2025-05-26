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
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-mechanical-bills',
  templateUrl: './mechanical-bills.page.html',
  styleUrls: ['./mechanical-bills.page.scss'],
})
export class MechanicalBillsPage implements OnInit {
  carId: string = '';
  mechanicalBills: any[] = [];
  billData: any = { type: '', cost: null, date: '', description: '' };
  showBillForm: boolean = false;
  maintainingOptions = [
    { label: 'Двигател', value: 'engine' },
    { label: 'Гуми', value: 'tires' },
    { label: 'Спирачки', value: 'brake' },
    { label: 'Електроника', value: 'electronics' },
    { label: 'Окачване', value: 'suspension' },
    { label: 'Скоростна кутия', value: 'transmission' }
  ];

  showError: any = { type: false, cost: false };
  isAdding: boolean = false;
  disableSaveBtn: boolean = false;

  private firestore = getFirestore();

  constructor(
    private route: ActivatedRoute,
    private spendingService: SpendingService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('carId') || '';
    this.initValidation();
    if (this.carId) {
      this.loadMechanicalBills();
    }
    this.setTodayIfNoDate();
  }

  setTodayIfNoDate() {
    if (!this.billData.date) {
      this.billData.date = this.formatDateToInput(new Date());
    }
  }

  formatDateToInput(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  async loadMechanicalBills() {
    const billsCollection = collection(this.firestore, 'MechanicalBills');
    const q = query(billsCollection, where('carId', '==', this.carId));
    const querySnapshot = await getDocs(q);
    this.mechanicalBills = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  getTypeLabel(value: string): string {
    const selected = this.maintainingOptions.find(option => option.value === value);
    return selected ? selected.label : 'Избери';
  }

  onInputChange(field: string) {
    this.showError[field] = !this.isFieldValid(field);
  }

  isFieldValid(field: string): boolean {
    switch (field) {
      case 'type':
        return !!this.billData.type;
      case 'cost':
        return this.billData.cost !== null && this.billData.cost !== '' && +this.billData.cost >= 0 && +this.billData.cost <= 1000000;
      case 'date':
        return !!this.billData.date;
      default:
        return true;
    }
  }

  isFormValid(): boolean {
    return (
      this.isFieldValid('type') &&
      this.isFieldValid('cost')
      // Date not required for locking the button
    );
  }

  initValidation() {
    this.showError = { type: false, cost: false };
  }

  toggleBillForm() {
    this.showBillForm = !this.showBillForm;
    if (this.showBillForm && !this.billData.date) {
      this.setTodayIfNoDate();
    }
    this.initValidation();
  }

  private formatDate(date: string): string {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  async addMechanicalBill() {
    Object.keys(this.showError).forEach(k => this.showError[k] = !this.isFieldValid(k));
    if (!this.isFormValid()) return;

    this.isAdding = true;
    this.disableSaveBtn = true;
    try {
      const formattedDate = this.billData.date ? this.billData.date : this.formatDateToInput(new Date());

      const billsCollection = collection(this.firestore, 'MechanicalBills');
      await addDoc(billsCollection, {
        carId: this.carId,
        type: this.billData.type,
        cost: +this.billData.cost,
        date: formattedDate,
        description: this.billData.description || ''
      });

      await this.spendingService.addExpense(this.carId, +this.billData.cost);
      this.billData = { type: '', cost: null, date: this.formatDateToInput(new Date()), description: '' };
      this.showBillForm = false;
      this.initValidation();
      await this.loadMechanicalBills();
    } catch (error) {
      console.error('Error adding mechanical bill:', error);
    } finally {
      setTimeout(() => {
        this.disableSaveBtn = false;
      }, 1500);
      this.isAdding = false;
    }
  }

  async deleteMechanicalBill(recordId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Потвърди изтриване',
      message: 'Сигурни ли сте, че искате да изтриете тази сметка?',
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
            const billDoc = doc(this.firestore, 'MechanicalBills', recordId);
            const docSnap = await getDoc(billDoc);
            if (docSnap.exists()) {
              const data = docSnap.data();
              await deleteDoc(billDoc);
              this.mechanicalBills = this.mechanicalBills.filter(record => record.id !== recordId);
              await this.spendingService.subtractExpense(this.carId, data['cost']);
            }
          }
        }
      ]
    });
    await alert.present();
  }
}
