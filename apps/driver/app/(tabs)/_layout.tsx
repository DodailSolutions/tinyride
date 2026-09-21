import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#142B4A',
          borderTopColor: '#1E3A5F',
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#F07832',
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
