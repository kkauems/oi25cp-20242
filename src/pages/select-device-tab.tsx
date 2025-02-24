import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonList, IonItem, IonAlert } from '@ionic/react';
import React, { useState } from 'react';
import { BleClient, BleDevice } from '@capacitor-community/bluetooth-le';
import { useBluetooth } from '../context/BluetoothContext';

const SelectDeviceTab: React.FC = () => {
  const { setSelectedDevice, selectedDevice } = useBluetooth();
  const [isScanning, setIsScanning] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | undefined>(undefined);
  const [bondedDevices, setBondedDevices] = useState<BleDevice[]>([]);

  const getBondedDevices = async () => {
    try {
      await BleClient.initialize();
      const devices = await BleClient.getBondedDevices();
      setBondedDevices(devices);
    } catch (error) {
      setAlertMessage('Falha ao obter dispositivos pareados');
    }
  };

  const selectDevice = async (device: BleDevice) => {
    try {
      await BleClient.connect(device.deviceId);
      setSelectedDevice(device);
      setAlertMessage(`Conectado a ${device.name || 'Dispositivo não reconhecido'}`);
    } catch (error) {
      setAlertMessage('Erro ao se conectar com o dispositivo');
    } finally {
      await BleClient.stopLEScan();
      setIsScanning(false);
    }
  };

  function onDisconnect(){
    setAlertMessage(`${selectedDevice?.name || 'Dispositivo não reconhecido'} desconectado`);
    setSelectedDevice(null);
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Selecionar Dispositivo</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Selecionar Dispositivo</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonButton onClick={getBondedDevices} disabled={isScanning}>Procurar Dispositivos Pareados</IonButton>
        <IonList>
          {bondedDevices.map((device, index) => (
            <IonItem key={index} button onClick={() => selectDevice(device)}>
              <div>
                <div>{device.name || 'Dispositivo não reconhecido'}</div>
                <div>{device.deviceId}</div>
              </div>
            </IonItem>
          ))}
        </IonList>
        {selectedDevice && <IonButton onClick={onDisconnect}>Desconectar</IonButton>}
        <IonAlert
          isOpen={!!alertMessage}
          onDidDismiss={() => setAlertMessage('')}
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default SelectDeviceTab;
