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
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="children"
        options={{
          title: 'Children',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🎒</Text>,
        }}
      />
      <Tabs.Screen
        name="routes"
        options={{
          title: 'Find Ride',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🚌</Text>,
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: 'Payments',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>💳</Text>,
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: 'Support',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>💬</Text>,
        }}
      />
    </Tabs>
  );
}
