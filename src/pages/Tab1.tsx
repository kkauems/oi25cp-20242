import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonAlert, IonicSafeString } from '@ionic/react';
import './Tab1.css';
import { BleClient, ScanResult, BleDevice, numberToUUID, textToDataView } from '@capacitor-community/bluetooth-le';
import { useState } from 'react';

const Tab1: React.FC = () => {
  const [devices, setDevices] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<BleDevice | null>(null);
  const [isPaired, setIsPaired] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | IonicSafeString | undefined>(undefined);

  const startScan = async () => {
    setIsScanning(true);
    setDevices([]);
    try {
      await BleClient.initialize();
      await BleClient.requestLEScan({}, (result) => {
        setDevices((prevDevices) => [...prevDevices, result]);
      });
    } catch (error) {
      console.error('Error initializing Bluetooth:', error);
    }
  };

  const selectDevice = async (device: BleDevice) => {
    try {
      await BleClient.connect(device.deviceId);
      setSelectedDevice(device);
      setIsPaired(true);
      setAlertMessage(`Connected to ${device.name || 'Unnamed Device'}`);
    } catch (error) {
      console.error('Error connecting to device:', error);
      setAlertMessage('Failed to connect to device');
    } finally {
      await BleClient.stopLEScan();
      setIsScanning(false);
    }
  };

  const sendData = async (data: DataView) => {
    if (selectedDevice) {
      try {
        const serviceUUID = numberToUUID(0x1800);
        const characteristicUUID = numberToUUID(0xABF1);
        await BleClient.write(selectedDevice.deviceId, serviceUUID, characteristicUUID, data);
        setAlertMessage('Data sent successfully');
      } catch (error) {
        console.error('Error sending data:', error);
        setAlertMessage('Failed to send data');
      }
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonButton onClick={startScan} disabled={isScanning}>
            {isScanning ? 'Scanning...' : 'Scan For Devices'}
          </IonButton>
          <IonList>
            {devices.map((device, index) => (
              <IonItem key={index} button onClick={() => selectDevice(device.device)}>
                <div>
                <div>{device.device.name|| 'Unnamed Device'}</div> 
                <div>{device.device.deviceId}</div>
                </div>
              </IonItem>
            ))}
          </IonList>
          {isPaired && (
            <div>
              <IonButton onClick={() => sendData(textToDataView('Hello World'))}>Send Data</IonButton>
            </div>
          )}
          <IonAlert
            isOpen={!!alertMessage}
            onDidDismiss={() => setAlertMessage('')}
            message={alertMessage}
            buttons={['OK']}
          />
        </IonContent>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
