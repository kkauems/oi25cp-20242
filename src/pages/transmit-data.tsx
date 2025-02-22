import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonAlert, IonicSafeString, IonInput, IonList, IonItem, useIonViewWillEnter } from '@ionic/react';
import { textToDataView, BleClient } from '@capacitor-community/bluetooth-le';
import { useState } from 'react';
import { useBluetooth } from '../context/BluetoothContext';
import StorageService, { BDProps } from '../services/StorageService';

const TransmitData: React.FC = () => {
  const { selectedDevice, serviceUUID, writeUUID, readUUID, readData, setReadData, writeData, setWriteData } = useBluetooth();
  const [alertMessage, setAlertMessage] = useState<string | IonicSafeString | undefined>(undefined);
  const [inputNumber, setInputNumber] = useState<string>('');
  const [isNumberEntered, setIsNumberEntered] = useState(false);
  const [finishedTransmission, setFinishedTransmission] = useState(false);
  const [storedData, setStoredData] = useState<BDProps[]>([]);
  const [selectedData, setSelectedData] = useState<BDProps | null>(null);

  useIonViewWillEnter(() => {
    const initializeData = async () => {
      await StorageService.initialize();
      const data = await StorageService.getData('data');
      setStoredData(data);
    };
    initializeData();
  });

  const handleNumberChange = (e: CustomEvent) => {
    const value = (e.target as HTMLInputElement).value;
    setInputNumber(value);
    setIsNumberEntered(value.trim() !== '');
  };

  const sendDataToBLE = async (data: string) => { 
    if (selectedDevice && data) {
      try {
        setWriteData(data);
        await BleClient.write(selectedDevice.deviceId, serviceUUID, writeUUID, textToDataView(data));
        setFinishedTransmission(true);

      } catch (error) {
        setAlertMessage('Falha na comunicação com o dispositivo');
      }
    }
  };

  const handleStoredDataClick = (data: BDProps) => {
    setSelectedData(data);
    setInputNumber(data.accountCode);
    setIsNumberEntered(true);
  };

  const clearTransmission = () => {
    setFinishedTransmission(false);
    setInputNumber('');
    setIsNumberEntered(false);
    setSelectedData(null);
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
              <IonButton onClick={() => sendDataToBLE(selectedData?.accessCode || '')} disabled={!selectedData}>Confirmar</IonButton>
              <IonButton onClick={() => sendDataToBLE('transmitir')} disabled={!finishedTransmission}>Transmitir</IonButton>
              <IonList>
                {storedData.map((data, index) => (
                  <IonItem key={index} button onClick={() => handleStoredDataClick(data)}>
                    {data.accountCode}
                  </IonItem>
                ))}
              </IonList>
              <IonButton onClick={clearTransmission}>Limpar</IonButton>
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
