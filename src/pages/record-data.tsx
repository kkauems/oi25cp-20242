import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonicSafeString, IonList, IonItem, IonAlert, IonInput, useIonViewWillEnter } from '@ionic/react';
import { useState } from 'react';
import { BleClient, textToDataView } from '@capacitor-community/bluetooth-le';
import { useBluetooth } from '../context/BluetoothContext';
import StorageService from '../services/StorageService';

const RecordData: React.FC = () => {
  const { selectedDevice, serviceUUID, readUUID, writeUUID, writeData, setWriteData, readData, setReadData } = useBluetooth();
  const [alertMessage, setAlertMessage] = useState<string | IonicSafeString | undefined>(undefined);
  const [storedData, setStoredData] = useState<string[]>([]);
  const [inputNumber, setInputNumber] = useState<string>('');
  const [isNumberEntered, setIsNumberEntered] = useState(false);

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

  const saveData = async () => {
    try {
      if (inputNumber.trim() !== '') {
        const data = [...storedData, inputNumber];
        await StorageService.setData('data', data);
        setStoredData(data);
        setInputNumber('');
        setIsNumberEntered(false);
      }
      setAlertMessage('Dados salvos com sucesso');
    } catch (error) {
      setAlertMessage('Falha ao salvar dados');
    }
  };

  const sendDataToBLE = async (data: string) => {
    if (selectedDevice) {
      try {
        setWriteData(data);
        await BleClient.write(selectedDevice.deviceId, serviceUUID, writeUUID, textToDataView(data));
      } catch (error) {
        setAlertMessage('Falha na comunicação com o dispositivo');
      }
    }
  };

 const readDataFromBLE = async () => {
     if (selectedDevice) {
       try {
        let flag = false;
         await BleClient.startNotifications(selectedDevice.deviceId, serviceUUID, readUUID, (data) => {
           const decodedData = new TextDecoder().decode(data);
           setReadData(decodedData);
           if(decodedData === '300000000'){
            sendDataToBLE(decodedData);
            flag = true;
           }
         });
         if(!flag){sendDataToBLE('gravar');}
       } catch (error) {
         setAlertMessage('Falha na comunicação com o dispositivo');
       }
     }
   };
 
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Gravar</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Gravar</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonButton onClick={readDataFromBLE}>Gravar novo sinal</IonButton>
        {readData && <p>Data from BLE: {readData}</p>}
        <div>
          <IonInput
            placeholder="Insira um número"
            value={inputNumber}
            onIonChange={handleNumberChange}
            type="number"
          />
          <IonButton onClick={saveData} disabled={!isNumberEntered}>Selecionar Cliente</IonButton>
          <IonList>
            {storedData.map((data, index) => (
              <IonItem key={index}>
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
      </IonContent>
    </IonPage>
  );
};

export default RecordData;
