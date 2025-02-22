import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonicSafeString, IonList, IonItem, IonAlert, IonInput, useIonViewWillEnter } from '@ionic/react';
import { useState, useRef, useEffect } from 'react';
import { BleClient, textToDataView } from '@capacitor-community/bluetooth-le';
import { useBluetooth } from '../context/BluetoothContext';
import StorageService, { BDProps } from '../services/StorageService';

const RecordData: React.FC = () => {
  const { selectedDevice, serviceUUID, readUUID, writeUUID, writeData, setWriteData, readData, setReadData } = useBluetooth();
  const [alertMessage, setAlertMessage] = useState<string | IonicSafeString | undefined>(undefined);
  const [storedData, setStoredData] = useState<BDProps[]>([]);
  const [inputNumber, setInputNumber] = useState<string>('');
  const [isNumberEntered, setIsNumberEntered] = useState(false);
  const readDataRef = useRef<string | undefined>(readData);

  useEffect(() => {
    readDataRef.current = readData;
  }, [readData]);

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

  const saveData = async (newData: BDProps) => {
    try {
      const data = [...storedData, newData];
      await StorageService.setData('data', data);
      setStoredData(data);
      setIsNumberEntered(false);
      setAlertMessage('Dados salvos com sucesso');
    } catch (error) {
      setAlertMessage('Falha ao salvar dados');
    }
  };

  const deleteData = async (data: BDProps) => {
    try {
      const newData = storedData.filter((item) => item.accountCode !== data.accountCode);
      await StorageService.setData('data', newData);
      setStoredData(newData);
      setAlertMessage('Dados excluídos com sucesso');
    } catch (error) {
      setAlertMessage('Falha ao excluir dados');
    }
  }

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
        sendDataToBLE('gravar');
        await BleClient.startNotifications(selectedDevice.deviceId, serviceUUID, readUUID, (data) => {
          const decodedData = new TextDecoder().decode(data);
          setReadData(decodedData);
        });

        setTimeout(async () => {
          if (selectedDevice) {
            await BleClient.stopNotifications(selectedDevice.deviceId, serviceUUID, readUUID);
          }
          const newBDProps: BDProps = { accessCode: readDataRef.current || '', accountCode: inputNumber };
          saveData(newBDProps);
        }, 16000);

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
          <IonTitle>Gravar</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Gravar</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div>
          <IonInput
            placeholder="Insira o cliente"
            value={inputNumber}
            onIonChange={handleNumberChange}
            type="number"
          />
          <IonButton onClick={() => readDataFromBLE()} disabled={!isNumberEntered}>Gravar novo sinal para cliente</IonButton>
          {readData && <p>Último sinal gravado: {readDataRef.current}</p>}
          <IonList>
            {storedData.map((data, index) => (
              <IonItem key={index} button onClick={() => handleStoredDataClick(data.accountCode)}>
                {data.accountCode} - {data.accessCode}
                <IonButton onClick={() => deleteData(data)}>Excluir</IonButton>
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
