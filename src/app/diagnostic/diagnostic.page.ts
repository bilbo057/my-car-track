// Import necessary modules
import { Component, OnInit } from '@angular/core';
import { BluetoothLe } from '@capacitor-community/bluetooth-le';

@Component({
  selector: 'app-diagnostic',
  templateUrl: './diagnostic.page.html',
  styleUrls: ['./diagnostic.page.scss'],
})
export class DiagnosticPage implements OnInit {
  deviceId: string = '';
  devices: any[] = [];

  constructor() { }

  ngOnInit() {
    this.initializeBluetooth();
  }

  async initializeBluetooth() {
    await BluetoothLe.initialize();
    console.log('Bluetooth is initialized');
  }

  async scanForDevices() {
    const result = await BluetoothLe.requestDevice({
      services: [], // Empty array to scan for all available services
    });
    console.log('Device:', result);
    this.devices.push(result);
  }

  async connectToDevice(deviceId: string) {
    const connection = await BluetoothLe.connect({ deviceId });
    console.log('Connected to device:', deviceId);
    this.startCommunication(deviceId);
  }

  async startCommunication(deviceId: string) {
    // Example of reading data
    await BluetoothLe.startNotifications({
      deviceId,
      service: '<OBD-II service UUID>', // Replace with your OBD-II service UUID
      characteristic: '<Characteristic UUID>', // Replace with characteristic UUID
    });

    BluetoothLe.addListener('notification', (data) => {
      if (data && data.value instanceof ArrayBuffer) {
        console.log('New data received:', new TextDecoder().decode(data.value));
      } else {
        console.error('Received data is not an ArrayBuffer');
      }
    });
  }

  async disconnect(deviceId: string) {
    await BluetoothLe.disconnect({ deviceId });
    console.log('Disconnected from device:', deviceId);
  }
}
