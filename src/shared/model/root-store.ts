import { SessionStore } from './session-store';

export class RootStore {
  readonly sessionStore: SessionStore;

  constructor() {
    this.sessionStore = new SessionStore();
  }
}

export const createRootStore = (): RootStore => new RootStore();
