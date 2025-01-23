import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { AlertController } from '@ionic/angular';
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
  tollTaxData: any = {}; // Holds the form data
  private firestore = getFirestore();

  constructor(
    private route: ActivatedRoute,
    private alertController: AlertController,
    private http: HttpClient
  ) {}

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

  async openAddTollTaxPopup() {
    const alert = await this.alertController.create({
      header: 'Add Toll Tax',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Save',
          handler: async (data) => {
            if (data.startDate && data.amount) {
              const startDate = new Date(data.startDate);
              const endDate = this.calculateEndDate(startDate);
  
              this.tollTaxData = {
                startDate: this.formatDate(startDate),
                endDate: this.formatDate(endDate),
                amount: data.amount,
              };
              await this.addTollTaxDocument();
            } else {
              console.error('All fields are required');
            }
          },
        },
      ],
      inputs: [
        {
          name: 'startDate',
          type: 'date',
          placeholder: 'Select Start Date',
        },
        {
          name: 'amount',
          type: 'number',
          placeholder: 'Amount Paid',
        },
      ],
    });
  
    await alert.present();
  }
  
  // Calculate the end date based on the start date
  private calculateEndDate(startDate: Date): Date {
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1); // Add one year
    endDate.setDate(endDate.getDate() - 1); // Subtract one day
    return endDate;
  }
  
  // Format date as DD-MM-YYYY
  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
  
  private async addTollTaxDocument() {
    try {
      const tollTaxCollection = collection(this.firestore, 'TollTax');
      await addDoc(tollTaxCollection, {
        carId: this.carId,
        licensePlate: this.licensePlate,
        ...this.tollTaxData,
      });
      await this.loadTollTaxDocuments(); // Refresh the list
    } catch (error) {
      console.error('Error adding toll tax document:', error);
    }
  }

  async checkTollTaxStatus() {
    try {
      const url = `https://web.bgtoll.bg/TollProduct?LicensePlateNumber=${this.licensePlate}`;
      const response = await this.http.get(url).toPromise();
      console.log('Toll Tax Status:', response);
      this.showTollTaxStatus(response);
    } catch (error) {
      console.error('Error checking toll tax status:', error);
      this.showErrorAlert();
    }
  }

  private async showTollTaxStatus(status: any) {
    const alert = await this.alertController.create({
      header: 'Toll Tax Status',
      message: JSON.stringify(status, null, 2), // Format the response for better readability
      buttons: ['OK'],
    });

    await alert.present();
  }

  private async showErrorAlert() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Unable to fetch toll tax status. Please try again later.',
      buttons: ['OK'],
    });

    await alert.present();
  }
}
