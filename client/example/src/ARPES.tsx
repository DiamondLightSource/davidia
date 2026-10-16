import { useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import './App.css';
import { ConnectedARPESTab } from './ConnectedARPESTab';
import { LineTab } from './LineTab';
import { ImageTab } from './ImageTab';
import { AnyTab } from './AnyTab';
export default function App() {
  const [uuid] = useState(() => crypto.randomUUID().slice(-8));
  const host = import.meta.env.VITE_WS_HOST ?? window.location.hostname;
  const port = import.meta.env.VITE_WS_PORT ?? window.location.port;
  console.log('App uuid:', uuid);
  console.log('host:', host, 'port:', port);
  return (
    <Tabs className="outer-tabs">
      <TabList>
        <Tab>Connected</Tab> <Tab>Line</Tab> <Tab>Image</Tab>
        <Tab>Any</Tab>
      </TabList>
      <TabPanel>
        <ConnectedARPESTab uuid={uuid} host={host} port={port} />
      </TabPanel>
      <TabPanel>
        <LineTab />
      </TabPanel>
      <TabPanel>
        <ImageTab />
      </TabPanel>
      <TabPanel>
        <AnyTab />
      </TabPanel>
    </Tabs>
  );
}
