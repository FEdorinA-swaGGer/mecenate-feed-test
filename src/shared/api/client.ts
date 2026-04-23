import axios, { AxiosError } from 'axios';

import { env } from '../config/env';
import { ApiError, ApiErrorPayload } from './types';

let apiToken: string | null = null;

export const setApiToken = (token: string | null): void => {
  apiToken = token;
};

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};

  if (apiToken) {
    config.headers.Authorization = `Bearer ${apiToken}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: ApiErrorPayload }>) => {
    const status = error.response?.status;
    const code = error.response?.data?.error?.code;
    const message =
      error.response?.data?.error?.message ??
      error.message ??
      'Неизвестная ошибка сети';

    return Promise.reject(new ApiError(message, status, code));
  },
);

