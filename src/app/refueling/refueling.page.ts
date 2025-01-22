import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-refueling',
  templateUrl: './refueling.page.html',
  styleUrls: ['./refueling.page.scss'],
})
export class RefuelingPage implements OnInit {
  refuelingData: any = { date: '' }; // Initialize with an empty date
  carId: string = ''; 
  engineTypes: { Type: string; Label: string }[] = []; 
  private firestore = getFirestore(); 

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService) {}

  async ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('carId') || '';
    if (this.carId) {
      this.refuelingData.carId = this.carId; 
      await this.loadEngineTypes(); 
    }

    // Auto-set the default date
    this.setDefaultDate();
  }

  private async loadEngineTypes() {
    try {
      const engineTypesCollection = collection(this.firestore, 'Engines');
      const engineTypesSnapshot = await getDocs(engineTypesCollection);
      this.engineTypes = engineTypesSnapshot.docs.map((doc: any) => ({
        Type: doc.data()['Engine_type'],
        Label: doc.data()['Label'],
      }));
    } catch (error) {
      console.error(error);
    }
  }

  private setDefaultDate() {
    const today = new Date();
    this.refuelingData.date = today.toISOString(); // Set default date as ISO string
  }

  private formatDateToDDMMYYYY(date: string): string {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      console.error('Invalid date:', date);
      return '';
    }
    const day = ('0' + parsedDate.getDate()).slice(-2);
    const month = ('0' + (parsedDate.getMonth() + 1)).slice(-2);
    const year = parsedDate.getFullYear();
    return `${day}-${month}-${year}`;
  }

  async addRefueling() {
    try {
      const userId = await this.authService.getUserId();
      if (!userId) return;

      // Format date to DD-MM-YYYY
      if (this.refuelingData.date) {
        this.refuelingData.date = this.formatDateToDDMMYYYY(this.refuelingData.date);
      } else {
        console.error('Date is missing.');
        return;
      }

      const refuelingCollection = collection(this.firestore, 'Refueling');
      await addDoc(refuelingCollection, {
        ...this.refuelingData,
        userId,
      });
      this.router.navigate(['/cars']);
    } catch (error) {
      console.error(error);
    }
  }
}
