import { QueryClientProvider } from '@tanstack/react-query';
import { observer } from 'mobx-react-lite';
import { ReactNode, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { setApiToken } from '../../shared/api/client';
import {
  RootStoreContext,
  rootStore,
} from '../../shared/model/root-store-context';
import { theme } from '../../shared/theme/theme';
import { queryClient } from './query-client';

type AppProvidersProps = {
  children: ReactNode;
};

const AppProvidersBase = ({ children }: AppProvidersProps) => {
  const { sessionStore } = rootStore;

  useEffect(() => {
    void sessionStore.init();
  }, [sessionStore]);

  if (!sessionStore.isHydrated) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  // React runs child useEffects before parent useEffects. If we only set the
  // axios token in useEffect here, the first /posts fetch can run without Authorization.
  setApiToken(sessionStore.sessionId);

  return (
    <RootStoreContext.Provider value={rootStore}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </RootStoreContext.Provider>
  );
};

export const AppProviders = observer(AppProvidersBase);

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});
