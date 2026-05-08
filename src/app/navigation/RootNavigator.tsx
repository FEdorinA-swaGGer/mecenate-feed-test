import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { FeedScreen } from '../../features/feed/screens/FeedScreen';
import { PostDetailScreen } from '../../features/post-detail/screens/PostDetailScreen';
import { theme } from '../../shared/theme/theme';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Feed">
      <Stack.Screen
        name="Feed"
        component={FeedScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{
          title: 'Публикация',
          headerStyle: { backgroundColor: theme.colors.postDetailScreenBackground },
          headerShadowVisible: false,
          headerTintColor: theme.colors.textPrimary,
          headerTitleStyle: { color: theme.colors.textPrimary },
          contentStyle: { backgroundColor: theme.colors.postDetailScreenBackground },
        }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);
