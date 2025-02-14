import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonAlert, IonicSafeString, IonInput, IonList, IonItem, useIonViewWillEnter } from '@ionic/react';
import { textToDataView, BleClient } from '@capacitor-community/bluetooth-le';
import { useState } from 'react';
import { useBluetooth } from '../context/BluetoothContext';
import StorageService from '../services/StorageService';

const TransmitData: React.FC = () => {
  const { selectedDevice, serviceUUID, writeUUID, readUUID, readData, setReadData, writeData, setWriteData } = useBluetooth();
  const [alertMessage, setAlertMessage] = useState<string | IonicSafeString | undefined>(undefined);
  const [inputNumber, setInputNumber] = useState<string>('');
  const [isNumberEntered, setIsNumberEntered] = useState(false);
  const [storedData, setStoredData] = useState<string[]>([]);

  useIonViewWillEnter(() => {
    const initializeData = async () => {
      await StorageService.initialize();
      const data = await StorageService.getData('data') || [];
      setStoredData(data);
    };
    initializeData();
  });

  const handleNumberChange = (e: CustomEvent) => {
    const value = (e.target as HTMLInputElement).value;
    setInputNumber(value);
    setIsNumberEntered(value.trim() !== '');
  };

  const readDataFromBLE = async () => {
    if (selectedDevice) {
      try {
        await BleClient.startNotifications(selectedDevice.deviceId, serviceUUID, readUUID, (data) => {
          const decodedData = new TextDecoder().decode(data);
          setReadData(decodedData);
        });
        if(readData === '100') {
          await BleClient.stopNotifications(selectedDevice.deviceId, serviceUUID, readUUID);
        }
      } catch (error) {
        setAlertMessage('Falha na comunicação com o dispositivo');
      }
    }
  };

  const sendDataToBLE = async (data: string) => {
    if (selectedDevice) {
      try {
        setWriteData(data);
        await BleClient.write(selectedDevice.deviceId, serviceUUID, writeUUID, textToDataView(data));
        if(data !== 'transmitir') {
          readDataFromBLE();
        }
      } catch (error) {
        setAlertMessage('Falha na comunicação com o dispositivo');
      }
    }
  };

  const handleStoredDataClick = (data: string) => {
    setInputNumber(data);
    setIsNumberEntered(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Transmitir</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Transmitir</IonTitle>
          </IonToolbar>
        </IonHeader>
        {selectedDevice && <IonContent>
            <div>
              <IonInput
                placeholder="Insira o código do cliente"
                value={inputNumber}
                onIonChange={handleNumberChange}
                type="number"
              />
              <IonButton onClick={() => sendDataToBLE(inputNumber)} disabled={!isNumberEntered}>Confirmar</IonButton>
              <IonButton onClick={() => sendDataToBLE('transmitir')} disabled={!readData}>Transmitir</IonButton>
              {readData && <p>Resposta do dispositivo: {readData}</p>}
              <IonList>
                {storedData.map((data, index) => (
                  <IonItem key={index} button onClick={() => handleStoredDataClick(data)}>
                    {data}
                  </IonItem>
                ))}
              </IonList>
            </div>
          <IonAlert
            isOpen={!!alertMessage}
            onDidDismiss={() => setAlertMessage('')}
            message={alertMessage}
            buttons={['OK']}
          />
        </IonContent>}
        {!selectedDevice && <IonContent>
          <IonTitle>Conecte-se a um dispositivo: </IonTitle>
          <IonButton routerLink="/select-device-tab">Selecionar Dispositivo</IonButton>
        </IonContent>}
      </IonContent>
    </IonPage>
  );
};

export default TransmitData;
