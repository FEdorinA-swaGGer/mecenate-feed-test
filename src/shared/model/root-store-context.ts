import { createContext, useContext } from 'react';

import { RootStore, createRootStore } from './root-store';

export const rootStore = createRootStore();
export const RootStoreContext = createContext<RootStore>(rootStore);

export const useRootStore = (): RootStore => useContext(RootStoreContext);
