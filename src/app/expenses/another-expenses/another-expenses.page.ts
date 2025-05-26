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
  updateDoc,
} from 'firebase/firestore';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-another-expenses',
  templateUrl: './another-expenses.page.html',
  styleUrls: ['./another-expenses.page.scss'],
})
export class AnotherExpensesPage implements OnInit {
  carId: string = '';
  expensesRecords: any[] = [];
  expenseData: { date: string; cost: number | null; description: string } = {
    date: '',
    cost: null,
    description: '',
  };
  showExpenseForm = false;
  isAdding = false;
  disableSaveBtn = false;
  showError: any = {
    cost: false,
    description: false,
  };

  private firestore = getFirestore();

  constructor(
    private route: ActivatedRoute,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  async ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('carId') || '';
    this.expenseData.date = this.formatDateToInput(new Date());
    if (this.carId) {
      await this.loadExpensesRecords();
    }
  }

  toggleExpenseForm() {
    this.showExpenseForm = !this.showExpenseForm;
    if (this.showExpenseForm) {
      this.initValidation();
      this.expenseData.date = this.formatDateToInput(new Date());
    }
  }

  private async loadExpensesRecords() {
    try {
      const expensesCollection = collection(this.firestore, 'AnotherExpenses');
      const q = query(expensesCollection, where('carId', '==', this.carId));
      const querySnapshot = await getDocs(q);
      this.expensesRecords = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error loading expenses records:', error);
    }
  }

  // ---- Live validation
  get isCostValid() {
    const cost = this.expenseData.cost;
    return cost != null && cost >= 0 && cost <= 1000000;
  }

  get isDescriptionValid() {
    return !!this.expenseData.description && this.expenseData.description.trim().length > 0;
  }

  get canSave() {
    // Do NOT lock button for date
    return this.isCostValid && this.isDescriptionValid;
  }

  onCostChange() {
    this.showError.cost = !this.isCostValid;
  }

  onDescriptionChange() {
    this.showError.description = !this.isDescriptionValid;
  }

  initValidation() {
    this.showError = {
      cost: false,
      description: false,
    };
  }

  // ---- Add record
  async addExpenseRecord() {
    if (!this.canSave) {
      this.showError.cost = !this.isCostValid;
      this.showError.description = !this.isDescriptionValid;
      return;
    }
    this.isAdding = true;
    this.disableSaveBtn = true;

    try {
      // Date is auto-set to today if missing
      if (!this.expenseData.date) {
        this.expenseData.date = this.formatDateToInput(new Date());
      }

      const expensesCollection = collection(this.firestore, 'AnotherExpenses');
      await addDoc(expensesCollection, {
        carId: this.carId,
        ...this.expenseData,
      });

      await this.updateSpending(this.expenseData.cost!);

      this.expenseData = {
        date: this.formatDateToInput(new Date()),
        cost: null,
        description: '',
      };
      this.showExpenseForm = false;
      this.initValidation();
      await this.loadExpensesRecords();
      this.showToast('Разходът е добавен успешно.');
    } catch (error) {
      console.error('Error adding expense record:', error);
      this.showToast('Възникна грешка при добавянето.');
    } finally {
      setTimeout(() => {
        this.disableSaveBtn = false;
        this.isAdding = false;
      }, 1500);
    }
  }

  async confirmDeleteExpenseRecord(recordId: string) {
    const alert = await this.alertCtrl.create({
      cssClass: 'custom-delete-alert',
      header: 'Изтриване',
      message: 'Сигурни ли сте, че искате да изтриете този разход?',
      buttons: [
        {
          text: 'Отказ',
          role: 'cancel',
          cssClass: 'alert-cancel-btn',
        },
        {
          text: 'Изтрий',
          role: 'destructive',
          cssClass: 'alert-delete-btn',
          handler: () => this.deleteExpenseRecord(recordId),
        },
      ],
    });
    await alert.present();
  }

  async deleteExpenseRecord(recordId: string) {
    try {
      const record = this.expensesRecords.find((r) => r.id === recordId);
      if (record) {
        await this.updateSpending(-record['cost']);
      }
      const expenseDoc = doc(this.firestore, 'AnotherExpenses', recordId);
      await deleteDoc(expenseDoc);
      this.expensesRecords = this.expensesRecords.filter((r) => r.id !== recordId);
      this.showToast('Разходът е изтрит успешно.');
    } catch (error) {
      console.error('Error deleting expense record:', error);
      this.showToast('Грешка при изтриване.');
    }
  }

  private formatDateToInput(date: Date): string {
    // YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
          spentsThisPeriod: (existingData.spentsThisPeriod || 0) + amount,
          lastSpent: new Date().toISOString(),
        });
      } else {
        const docPath = docRef.path;
        const [collectionName] = docPath.split('/');
        await addDoc(collection(this.firestore, collectionName), {
          carID: this.carId,
          spentsThisPeriod: amount,
          lastSpent: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error modifying spending:', error);
    }
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color: 'dark',
      position: 'top',
    });
    await toast.present();
  }
}
