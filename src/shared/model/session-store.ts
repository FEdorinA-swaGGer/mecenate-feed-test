import { makeAutoObservable, runInAction } from 'mobx';

import { storage } from '../lib/storage';
import { createUuid } from '../lib/uuid';

const SESSION_ID_KEY = 'session_id';
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUuid = (value: string | null | undefined): value is string =>
  typeof value === 'string' && UUID_V4_REGEX.test(value);

export class SessionStore {
  sessionId: string | null = null;
  isHydrated = false;

  constructor() {
    makeAutoObservable(this);
  }

  get isAuthorized(): boolean {
    return Boolean(this.sessionId);
  }

  async init(): Promise<void> {
    try {
      const savedSessionId = await storage.getString(SESSION_ID_KEY);

      if (isValidUuid(savedSessionId)) {
        this.setSessionId(savedSessionId);
      } else {
        await this.createAndPersistSessionId();
      }
    } catch {
      // Keep app usable even if storage read/write fails.
      this.setSessionId(createUuid());
    } finally {
      if (!this.sessionId) {
        this.setSessionId(createUuid());
      }

      runInAction(() => {
        this.isHydrated = true;
      });
    }
  }

  private async createAndPersistSessionId(): Promise<void> {
    const newSessionId = createUuid();
    this.setSessionId(newSessionId);
    await storage.setString(SESSION_ID_KEY, newSessionId);
  }

  private setSessionId(sessionId: string): void {
    runInAction(() => {
      this.sessionId = sessionId;
    });
  }
}
