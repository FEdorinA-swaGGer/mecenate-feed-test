import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  getString: (key: string): Promise<string | null> => AsyncStorage.getItem(key),
  setString: (key: string, value: string): Promise<void> =>
    AsyncStorage.setItem(key, value),
  remove: (key: string): Promise<void> => AsyncStorage.removeItem(key),
};
