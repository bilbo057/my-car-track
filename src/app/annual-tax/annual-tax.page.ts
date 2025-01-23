import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-annual-tax',
  templateUrl: './annual-tax.page.html',
  styleUrls: ['./annual-tax.page.scss'],
})
export class AnnualTaxPage implements OnInit {
  carId: string = '';
  licensePlate: string = ''; // Car's license plate
  annualTaxDocuments: any[] = []; // List of annual tax records
  taxYear: number | null = null;
  paymentHalf: string = ''; // Selected half: "First Half" or "Second Half"
  paymentDate: string = ''; // Payment date in DD-MM-YYYY format
  private firestore = getFirestore();

  constructor(private route: ActivatedRoute, private alertController: AlertController) {}

  async ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('carId') || '';
    if (this.carId) {
      await this.loadCarDetails();
      await this.loadAnnualTaxDocuments();
    }
  }

  private async loadCarDetails() {
    try {
      // Mock license plate retrieval. Replace with actual Firestore call if needed.
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

  async openAddAnnualTaxPopup() {
    const alert = await this.alertController.create({
      header: 'Add Annual Tax',
      inputs: [
        {
          name: 'taxYear',
          type: 'number',
          placeholder: 'Tax Year (e.g., 2024)',
        },
        {
          name: 'paymentDate',
          type: 'date',
          placeholder: 'Payment Date',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Save',
          handler: async (data) => {
            if (data.taxYear && this.paymentHalf && data.paymentDate) {
              await this.addAnnualTaxDocument(
                Number(data.taxYear),
                this.paymentHalf,
                this.formatDate(new Date(data.paymentDate))
              );
            } else {
              console.error('All fields are required.');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  private async addAnnualTaxDocument(taxYear: number, paymentHalf: string, paymentDate: string) {
    try {
      const taxCollection = collection(this.firestore, 'AnnualTax');
      await addDoc(taxCollection, {
        carId: this.carId,
        licensePlate: this.licensePlate,
        taxYear,
        paymentHalf,
        paymentDate,
      });
      await this.loadAnnualTaxDocuments(); // Refresh the list
    } catch (error) {
      console.error('Error adding annual tax document:', error);
    }
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
}
