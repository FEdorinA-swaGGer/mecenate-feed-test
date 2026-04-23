import { StatusBar } from 'expo-status-bar';

import { AppProviders } from './src/app/providers/AppProviders';
import { FeedScreen } from './src/features/feed/screens/FeedScreen';

export default function App() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <FeedScreen />
    </AppProviders>
  );
}
