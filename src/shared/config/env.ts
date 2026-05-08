const defaultApiBaseUrl = 'https://k8s.mectest.ru/test-app';

export const env = {
  /**
   * Базовый URL REST API. Переопределение: `EXPO_PUBLIC_API_BASE_URL` в `.env` (см. `.env.example`).
   * WebSocket URL в коде выводится из этого же значения (`http` → `ws`, путь `/ws?token=...`).
   */
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || defaultApiBaseUrl,
  simulateFeedError: false,
};
