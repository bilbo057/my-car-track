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
  errors: string[] = [];

  constructor() {}

  ngOnInit() {
    this.initializeBluetooth();
  }

  async initializeBluetooth() {
    try {
      await BluetoothLe.initialize();
      console.log('Bluetooth initialized');
    } catch (error) {
      console.error('Bluetooth init error:', error);
    }
  }

  async scanForDevices() {
    try {
      const result = await BluetoothLe.requestDevice({
        services: [],
        optionalServices: ['0000180d-0000-1000-8000-00805f9b34fb'],
      });
      this.devices.push(result);
      console.log('Device found:', result);
    } catch (error) {
      console.error('Scan error:', error);
    }
  }

  selectDevice(device: any) {
    this.selectedDevice = device;
    this.deviceId = device.deviceId;
  }

  async connectToDevice() {
    if (!this.deviceId) return console.error('No device selected');
    try {
      await BluetoothLe.connect({ deviceId: this.deviceId });
      console.log('Connected to:', this.deviceId);
    } catch (error) {
      console.error('Connect error:', error);
    }
  }

  async startCommunication() {
    if (!this.deviceId) return;

    try {
      await BluetoothLe.write({
        deviceId: this.deviceId,
        service: '0000180d-0000-1000-8000-00805f9b34fb',
        characteristic: '00002a37-0000-1000-8000-00805f9b34fb',
        value: this.encodeHexCommand('0300'), // Mode 03 for request DTCs
      });

      await BluetoothLe.startNotifications({
        deviceId: this.deviceId,
        service: '0000180d-0000-1000-8000-00805f9b34fb',
        characteristic: '00002a37-0000-1000-8000-00805f9b34fb',
      });

      BluetoothLe.addListener('notification', (data) => {
        if (data && data.value instanceof ArrayBuffer) {
          const response = new TextDecoder().decode(data.value);
          console.log('OBD-II Response:', response);
          this.errors = this.parseDTCs(response);
        }
      });
    } catch (error) {
      console.error('Comm error:', error);
    }
  }

  async disconnect() {
    if (!this.deviceId) return;
    try {
      await BluetoothLe.disconnect({ deviceId: this.deviceId });
      console.log('Disconnected from:', this.deviceId);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }

  encodeHexCommand(cmd: string): string {
    const buffer = new Uint8Array(cmd.match(/.{1,2}/g)!.map(hex => parseInt(hex, 16)));
    return btoa(String.fromCharCode(...buffer));
  }

  parseDTCs(raw: string): string[] {
    // A very simplified parser for mock OBD-II data (real implementation may need full parsing)
    const binary = atob(raw);
const hex = Array.from(binary).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
    const codes: string[] = [];

    for (let i = 4; i < hex.length; i += 4) {
      const dtc = hex.slice(i, i + 4).toUpperCase();
      if (dtc === '0000') break;
      const firstCharCode = parseInt(dtc[0], 16);
      const system = ['P', 'C', 'B', 'U'][firstCharCode >> 2] || 'P';
      const code = `${system}${((firstCharCode & 3) << 2).toString()}${dtc.slice(1)}`;
      codes.push(code);
    }

    return codes;
  }
}
