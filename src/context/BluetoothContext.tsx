import React, { createContext, useState, useContext, ReactNode } from 'react';
import { BleDevice, BleClient, numberToUUID } from '@capacitor-community/bluetooth-le';

interface BluetoothContextProps {
  selectedDevice: BleDevice | null;
  setSelectedDevice: (device: BleDevice | null) => void;
  writeData: string | undefined;
  setWriteData: (data: string | undefined) => void;
  readData: string | undefined;
  setReadData: (data: string | undefined) => void;
  serviceUUID: string;
  readUUID: string;
  writeUUID: string;
}

const BluetoothContext = createContext<BluetoothContextProps | undefined>(undefined);

export const BluetoothProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedDevice, setSelectedDevice] = useState<BleDevice | null>(null);
  const [writeData, setWriteData] = useState<string | undefined>(undefined);
  const [readData, setReadData] = useState<string | undefined>(undefined);
  const serviceUUID = numberToUUID(0xABF0);
  const readUUID = numberToUUID(0xABF2);
  const writeUUID = numberToUUID(0xABF1);

  return (
    <BluetoothContext.Provider value={{ selectedDevice, setSelectedDevice, writeData, setWriteData, readData, setReadData, serviceUUID, readUUID, writeUUID }}>
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth = (): BluetoothContextProps => {
  const context = useContext(BluetoothContext);
  if (!context) {
    throw new Error('useBluetooth must be used within a BluetoothProvider');
  }
  return context;
};
