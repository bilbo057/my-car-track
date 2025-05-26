import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-maintaining',
  templateUrl: './maintaining.page.html',
  styleUrls: ['./maintaining.page.scss'],
})
export class MaintainingPage implements OnInit {
  carId: string = '';
  maintainingDocuments: any[] = [];
  maintainingData: any = { type: '', cost: null, date: '', description: '' };
  showForm: boolean = false;
  showError: any = { type: false, cost: false };
  isAdding: boolean = false;
  disableSaveBtn: boolean = false;

  maintainingOptions = [
    { label: 'Смяна на масло', value: 'Смяна на масло' },
    { label: 'Гуми', value: 'Гуми' },
    { label: 'Спирачки', value: 'Спирачки' },
    { label: 'Акумулатор', value: 'Акумулатор' },
    { label: 'Окачване', value: 'Окачване' },
    { label: 'Скоростна кутия', value: 'Скоростна кутия' },
    { label: 'Климатик', value: 'Климатик' },
    { label: 'Разширено обслужване', value: 'Разширено обслужване' }
  ];

  private firestore = getFirestore();

  constructor(
    private route: ActivatedRoute,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  async ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('carId') || '';
    this.initValidation();
    if (this.carId) {
      await this.loadMaintainingRecords();
    }
    this.setTodayIfNoDate();
  }

  setTodayIfNoDate() {
    if (!this.maintainingData.date) {
      this.maintainingData.date = this.formatDateToInput(new Date());
    }
  }

  formatDateToInput(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  onInputChange(field: string) {
    this.showError[field] = !this.isFieldValid(field);
  }

  isFieldValid(field: string): boolean {
    switch (field) {
      case 'type':
        return !!this.maintainingData.type;
      case 'cost':
        return this.maintainingData.cost !== null && this.maintainingData.cost !== '' && +this.maintainingData.cost >= 0 && +this.maintainingData.cost <= 100000;
      case 'date':
        return !!this.maintainingData.date;
      default:
        return true;
    }
  }

  isFormValid(): boolean {
    return (
      this.isFieldValid('type') &&
      this.isFieldValid('cost')
      // Date is optional for locking the button!
    );
  }

  getSelectedTypeLabel(): string {
    const found = this.maintainingOptions.find(option => option.value === this.maintainingData.type);
    return found ? found.label : 'Избери';
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (this.showForm && !this.maintainingData.date) {
      this.setTodayIfNoDate();
    }
    this.initValidation();
  }

  initValidation() {
    this.showError = { type: false, cost: false };
  }

  private async loadMaintainingRecords() {
    try {
      const maintainingCollection = collection(this.firestore, 'Maintaining');
      const q = query(maintainingCollection, where('carId', '==', this.carId));
      const querySnapshot = await getDocs(q);
      this.maintainingDocuments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error loading maintaining records:', error);
    }
  }

  async addMaintainingRecord() {
    Object.keys(this.showError).forEach(k => this.showError[k] = !this.isFieldValid(k));
    if (!this.isFormValid()) return;

    this.isAdding = true;
    this.disableSaveBtn = true;
    try {
      const formattedDate = this.maintainingData.date ? this.maintainingData.date : this.formatDateToInput(new Date());

      const maintainingCollection = collection(this.firestore, 'Maintaining');
      await addDoc(maintainingCollection, {
        carId: this.carId,
        type: this.maintainingData.type,
        cost: +this.maintainingData.cost,
        date: formattedDate,
        description: this.maintainingData.description || ''
      });

      await this.updateSpending(+this.maintainingData.cost);

      this.maintainingData = { type: '', cost: null, date: this.formatDateToInput(new Date()), description: '' };
      this.showForm = false;
      this.initValidation();
      await this.loadMaintainingRecords();
    } catch (error) {
      console.error('Error adding maintaining record:', error);
    } finally {
      setTimeout(() => {
        this.disableSaveBtn = false;
      }, 1500);
      this.isAdding = false;
    }
  }

  async deleteMaintainingRecord(recordId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Потвърди изтриване',
      message: 'Сигурни ли сте, че искате да изтриете тази поддръжка?',
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
              const record = this.maintainingDocuments.find((r) => r.id === recordId);
              if (record) {
                await this.updateSpending(-record.cost);
              }

              const maintainingDoc = doc(this.firestore, 'Maintaining', recordId);
              await deleteDoc(maintainingDoc);

              this.maintainingDocuments = this.maintainingDocuments.filter((record) => record.id !== recordId);
            } catch (error) {
              console.error('Error deleting maintaining record:', error);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  private formatDate(date: string): string {
    const parsedDate = new Date(date);
    return `${parsedDate.getFullYear()}-${(parsedDate.getMonth() + 1).toString().padStart(2, '0')}-${parsedDate
      .getDate()
      .toString()
      .padStart(2, '0')}`;
  }

  private async updateSpending(amount: number) {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');

      const monthlyDocRef = doc(this.firestore, 'Monthly_Spending', `${this.carId}_${year}-${month}`);
      const yearlyDocRef = doc(this.firestore, 'Yearly_Spending', `${this.carId}_${year}`);
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
