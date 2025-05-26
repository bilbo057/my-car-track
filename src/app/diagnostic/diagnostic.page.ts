import { Component, OnInit } from '@angular/core';
import { BleDevice, BluetoothLe } from '@capacitor-community/bluetooth-le';
import { ToastController } from '@ionic/angular';


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

  constructor(private toastController: ToastController) {}

  ngOnInit() {
    this.initializeBluetooth();
  }

    async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2200,
      color: 'dark',
      position: 'bottom',
      cssClass: 'custom-toast',
    });
    await toast.present();
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
      this.showToast('Устройство намерено.');
    } catch (error) {
      this.showToast('Грешка при сканиране за устройства.');
    }
  }

  selectDevice(device: any) {
    this.selectedDevice = device;
    this.deviceId = device.deviceId;
  }

  async connectToDevice() {
    if (!this.deviceId) {
      this.showToast('Моля, изберете или въведете ID на устройство.');
      return;
    }
    try {
      await BluetoothLe.connect({ deviceId: this.deviceId });
      this.showToast('Свързано успешно.');
    } catch (error) {
      this.showToast('Неуспешно свързване.');
    }
  }

  async startCommunication() {
    if (!this.deviceId) {
      this.showToast('Не е избрано устройство.');
      return;
    }
    try {
      await BluetoothLe.write({
        deviceId: this.deviceId,
        service: '0000180d-0000-1000-8000-00805f9b34fb',
        characteristic: '00002a37-0000-1000-8000-00805f9b34fb',
        value: this.encodeHexCommand('0300'),
      });

      await BluetoothLe.startNotifications({
        deviceId: this.deviceId,
        service: '0000180d-0000-1000-8000-00805f9b34fb',
        characteristic: '00002a37-0000-1000-8000-00805f9b34fb',
      });

      BluetoothLe.addListener('notification', (data) => {
        if (data && data.value instanceof ArrayBuffer) {
          const response = new TextDecoder().decode(data.value);
          this.errors = this.parseDTCs(response);
        }
      });

      this.showToast('Комуникацията е стартирана.');
    } catch (error) {
      this.showToast('Грешка при стартиране на комуникацията.');
    }
  }

  async disconnect() {
    if (!this.deviceId) {
      this.showToast('Не е избрано устройство.');
      return;
    }
    try {
      await BluetoothLe.disconnect({ deviceId: this.deviceId });
      this.showToast('Връзката е прекъсната.');
    } catch (error) {
      this.showToast('Грешка при прекъсване на връзката.');
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
