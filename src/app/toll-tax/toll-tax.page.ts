import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-toll-tax',
  templateUrl: './toll-tax.page.html',
  styleUrls: ['./toll-tax.page.scss'],
})
export class TollTaxPage implements OnInit {
  carId: string = '';
  licensePlate: string = ''; // Holds the car's license plate
  tollTaxDocuments: any[] = []; // List of toll tax records
  tollTaxData: any = { startDate: '', amount: null }; // Holds the form data
  showForm: boolean = false; // Toggle form visibility
  private firestore = getFirestore();

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  async ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('carId') || '';
    if (this.carId) {
      await this.getCarDetails();
      await this.loadTollTaxDocuments();
    }
  }

  private async getCarDetails() {
    try {
      const carDocRef = doc(this.firestore, 'Cars', this.carId);
      const carDoc = await getDoc(carDocRef);

      if (carDoc.exists()) {
        const carData = carDoc.data();
        this.licensePlate = carData['License_plate']; // Get the car's license plate
      } else {
        console.error('Car document not found');
      }
    } catch (error) {
      console.error('Error fetching car details:', error);
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
    } catch (error) {
      console.error('Error loading toll tax documents:', error);
    }
  }

  async addTollTaxRecord() {
    if (this.tollTaxData.startDate && this.tollTaxData.amount) {
      try {
        const formattedStartDate = this.formatDate(this.tollTaxData.startDate);
        const formattedEndDate = this.calculateEndDate(new Date(formattedStartDate));

        const tollTaxCollection = collection(this.firestore, 'TollTax');
        await addDoc(tollTaxCollection, {
          carId: this.carId,
          licensePlate: this.licensePlate,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          amount: this.tollTaxData.amount,
        });

        // Reset form and refresh list
        this.tollTaxData = { startDate: '', amount: null };
        this.showForm = false;
        await this.loadTollTaxDocuments();
      } catch (error) {
        console.error('Error adding toll tax record:', error);
      }
    } else {
      console.error('All fields are required.');
    }
  }

  async deleteTollTaxRecord(recordId: string) {
    try {
      const tollDoc = doc(this.firestore, 'TollTax', recordId);
      await deleteDoc(tollDoc);
      this.tollTaxDocuments = this.tollTaxDocuments.filter((record) => record.id !== recordId);
      console.log('Toll tax record deleted:', recordId);
    } catch (error) {
      console.error('Error deleting toll tax record:', error);
    }
  }

  private calculateEndDate(startDate: Date): string {
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1); // Add one year
    endDate.setDate(endDate.getDate() - 1); // Subtract one day
    return this.formatDate(endDate);
  }

  private formatDate(date: string | Date): string {
    const parsedDate = new Date(date);
    return `${parsedDate.getFullYear()}-${(parsedDate.getMonth() + 1).toString().padStart(2, '0')}-${parsedDate
      .getDate()
      .toString()
      .padStart(2, '0')}`;
  }

  private async showTollTaxStatus(status: any) {
    alert(`Toll Tax Status:\n${JSON.stringify(status, null, 2)}`);
  }

  private async showErrorAlert() {
    alert('Unable to fetch toll tax status. Please try again later.');
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }
}
