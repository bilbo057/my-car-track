import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class CarDeleteService {
  constructor(private firestore: AngularFirestore) {}

  async deleteCarPhotos(photoNames: string[]): Promise<void> {
    if (!photoNames || photoNames.length === 0) {
      return;
    }
    const storage = getStorage();
    const fileNamesArray = Array.isArray(photoNames) ? photoNames : [];
    const deletePromises = fileNamesArray.map((fileName: string) => {
      const imageRef = ref(storage, `car_images/${fileName}`);
      deleteObject(imageRef).catch(() => {});
    });
    await Promise.all(deletePromises);
  }

  async deleteCarAndRelated(carId: string, photoNames: string[] = []): Promise<void> {
    await this.deleteCarPhotos(photoNames);
    await this.firestore.collection('Cars').doc(carId).delete();

    await Promise.all([
      this.deleteUserCarDocument(carId),
      this.deleteCarOffers(carId),
      this.deleteMonthlySpending(carId),
      this.deleteYearlySpending(carId),
      this.deleteAllTimeSpending(carId),
      this.deleteAnnualTaxRecords(carId),
      this.deleteAnotherExpensesRecords(carId),
      this.deleteMaintainingRecords(carId),
      this.deleteMechanicalBills(carId),
      this.deleteRefuelingRecords(carId),
      this.deleteTollTaxRecords(carId),
      this.deleteVehicleInsuranceRecords(carId),
      this.deleteYearlyVehicleCheckRecords(carId),
    ]);
  }

  private async deleteUserCarDocument(carId: string): Promise<void> {
    const snapshot = await this.firestore.collection('User_car', ref =>
      ref.where('CarID', '==', carId)
    ).get().toPromise();
    if (snapshot && !snapshot.empty) {
      const batch = this.firestore.firestore.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  private async deleteCarOffers(carId: string): Promise<void> {
    const snapshot = await this.firestore.collection('Offers', ref =>
      ref.where('CarID', '==', carId)
    ).get().toPromise();
    if (snapshot && !snapshot.empty) {
      const batch = this.firestore.firestore.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  private async deleteMonthlySpending(carId: string): Promise<void> {
    const snapshot = await this.firestore.collection('Monthly_Spending', ref =>
      ref.where('carID', '==', carId)
    ).get().toPromise();
    if (snapshot && !snapshot.empty) {
      const batch = this.firestore.firestore.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  private async deleteYearlySpending(carId: string): Promise<void> {
    const snapshot = await this.firestore.collection('Yearly_Spending', ref =>
      ref.where('carID', '==', carId)
    ).get().toPromise();
    if (snapshot && !snapshot.empty) {
      const batch = this.firestore.firestore.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  private async deleteAllTimeSpending(carId: string): Promise<void> {
    const snapshot = await this.firestore.collection('All_Time_Spending', ref =>
      ref.where('carID', '==', carId)
    ).get().toPromise();
    if (snapshot && !snapshot.empty) {
      const batch = this.firestore.firestore.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  private async deleteAnnualTaxRecords(carId: string): Promise<void> {
    const snapshot = await this.firestore.collection('AnnualTax', ref =>
      ref.where('carId', '==', carId)
    ).get().toPromise();
    if (snapshot && !snapshot.empty) {
      const batch = this.firestore.firestore.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  private async deleteAnotherExpensesRecords(carId: string): Promise<void> {
    const snapshot = await this.firestore.collection('AnotherExpenses', ref =>
      ref.where('carId', '==', carId)
    ).get().toPromise();
    if (snapshot && !snapshot.empty) {
      const batch = this.firestore.firestore.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  private async deleteMaintainingRecords(carId: string): Promise<void> {
    const snapshot = await this.firestore.collection('Maintaining', ref =>
      ref.where('carId', '==', carId)
    ).get().toPromise();
    if (snapshot && !snapshot.empty) {
      const batch = this.firestore.firestore.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  private async deleteMechanicalBills(carId: string): Promise<void> {
    const snapshot = await this.firestore.collection('MechanicalBills', ref =>
      ref.where('carId', '==', carId)
    ).get().toPromise();
    if (snapshot && !snapshot.empty) {
      const batch = this.firestore.firestore.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  private async deleteRefuelingRecords(carId: string): Promise<void> {
    const snapshot = await this.firestore.collection('Refueling', ref =>
      ref.where('carId', '==', carId)
    ).get().toPromise();
    if (snapshot && !snapshot.empty) {
      const batch = this.firestore.firestore.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  private async deleteTollTaxRecords(carId: string): Promise<void> {
    const snapshot = await this.firestore.collection('TollTax', ref =>
      ref.where('carId', '==', carId)
    ).get().toPromise();
    if (snapshot && !snapshot.empty) {
      const batch = this.firestore.firestore.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  private async deleteVehicleInsuranceRecords(carId: string): Promise<void> {
    const snapshot = await this.firestore.collection('VehicleInsurance', ref =>
      ref.where('carId', '==', carId)
    ).get().toPromise();
    if (snapshot && !snapshot.empty) {
      const batch = this.firestore.firestore.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  private async deleteYearlyVehicleCheckRecords(carId: string): Promise<void> {
    const snapshot = await this.firestore.collection('YearlyVehicleCheck', ref =>
      ref.where('carId', '==', carId)
    ).get().toPromise();
    if (snapshot && !snapshot.empty) {
      const batch = this.firestore.firestore.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  }
}
