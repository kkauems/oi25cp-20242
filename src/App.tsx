import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle } from 'ionicons/icons';
import TransmitData from './pages/transmit-data';
import RecordData from './pages/record-data';
import SelectDeviceTab from './pages/select-device-tab';
import { BluetoothProvider } from './context/BluetoothContext';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <BluetoothProvider>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/transmit-data">
              <TransmitData />
            </Route>
            <Route exact path="/record-data">
              <RecordData />
            </Route>
            <Route exact path="/select-device">
              <SelectDeviceTab />
            </Route>
            <Route exact path="/">
              <Redirect to="/select-device" />
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="select-device" href="/select-device">
              <IonIcon aria-hidden="true" icon={square} />
              <IonLabel>Dispositivos</IonLabel>
            </IonTabButton>
            <IonTabButton tab="transmit-data" href="/transmit-data">
              <IonIcon aria-hidden="true" icon={triangle} />
              <IonLabel>Transmitir</IonLabel>
            </IonTabButton>
            <IonTabButton tab="record-data" href="/record-data">
              <IonIcon aria-hidden="true" icon={ellipse} />
              <IonLabel>Gravar</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </BluetoothProvider>
  </IonApp>
);

export default App;
