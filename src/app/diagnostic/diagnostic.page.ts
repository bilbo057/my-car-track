import { Component, OnInit } from '@angular/core';
import { BleDevice, BluetoothLe } from '@capacitor-community/bluetooth-le';

@Component({
  selector: 'app-diagnostic',
  templateUrl: './diagnostic.page.html',
  styleUrls: ['./diagnostic.page.scss'],
})
export class DiagnosticPage implements OnInit {
  deviceId: string = '';
  devices: BleDevice[] = [];
  selectedDevice: BleDevice | undefined;

  constructor() { }

  ngOnInit() {
    this.initializeBluetooth();
  }

  async initializeBluetooth() {
    try {
      await BluetoothLe.initialize();
      console.log('Bluetooth is initialized');
    } catch (error) {
      console.error('Error initializing Bluetooth:', error);
    }
  }

  async scanForDevices() {
    try {
      const result = await BluetoothLe.requestDevice({
        services: [], // Empty array to scan for all available services
        optionalServices: ['0000180d-0000-1000-8000-00805f9b34fb'], // Add your OBD-II service UUID here
      });
      console.log('Device:', result);
      this.devices.push(result);
    } catch (error) {
      console.error('Error scanning for devices:', error);
    }
  }

  selectDevice(device: any) {
    this.selectedDevice = device;
    this.deviceId = device.deviceId;
  }

  async connectToDevice() {
    if (!this.deviceId) {
      console.error('No device ID provided');
      return;
    }

    try {
      const connection = await BluetoothLe.connect({ deviceId: this.deviceId });
      console.log('Connected to device:', this.deviceId);
    } catch (error) {
      console.error('Error connecting to device:', error);
    }
  }

  async startCommunication() {
    if (!this.deviceId) {
      console.error('No device ID provided');
      return;
    }

    try {
      await BluetoothLe.startNotifications({
        deviceId: this.deviceId,
        service: '0000180d-0000-1000-8000-00805f9b34fb', // Replace with your OBD-II service UUID
        characteristic: '00002a37-0000-1000-8000-00805f9b34fb', // Replace with characteristic UUID
      });

      BluetoothLe.addListener('notification', (data) => {
        if (data && data.value instanceof ArrayBuffer) {
          console.log('New data received:', new TextDecoder().decode(data.value));
        } else {
          console.error('Received data is not an ArrayBuffer');
        }
      });
    } catch (error) {
      console.error('Error starting communication:', error);
    }
  }

  async disconnect() {
    if (!this.deviceId) {
      console.error('No device ID provided');
      return;
    }

    try {
      await BluetoothLe.disconnect({ deviceId: this.deviceId });
      console.log('Disconnected from device:', this.deviceId);
    } catch (error) {
      console.error('Error disconnecting from device:', error);
    }
  }
}