import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F1E36',
          borderTopColor: '#1B2F4E',
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#FF6B00',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Active Trip',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🛺</Text>,
        }}
      />
      <Tabs.Screen
        name="roster"
        options={{
          title: 'Passengers',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📋</Text>,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>💰</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Compliance',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🛡️</Text>,
        }}
      />
    </Tabs>
  );
}
