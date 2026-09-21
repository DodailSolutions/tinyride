import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';

interface RouteOption {
  id: string;
  name: string;
  school: string;
  driver: string;
  vehicle: string;
  totalSeats: number;
  availableSeats: number;
  timeWindow: string;
  monthlyFee: number;
  stops: string[];
}

const AVAILABLE_ROUTES: RouteOption[] = [
  {
    id: 'rt-01',
    name: 'Kondapur & Madhapur Shuttle',
    school: 'Delhi Public School (DPS) Gachibowli',
    driver: 'Ramesh Goud',
    vehicle: 'Bajaj Auto (4 Seats TS09UA1234)',
    totalSeats: 4,
    availableSeats: 1,
    timeWindow: '07:30 AM - 08:15 AM',
    monthlyFee: 3200,
    stops: ['Kondapur RTO', 'Chirec Avenue', 'Botanical Garden Gate', 'DPS Campus'],
  },
  {
    id: 'rt-02',
    name: 'Manikonda & Lanco Hills Route',
    school: 'Oakridge International School',
    driver: 'Mohammed Khaja',
    vehicle: 'Maruti Eeco Van (8 Seats TS09VB4567)',
    totalSeats: 8,
    availableSeats: 2,
    timeWindow: '07:20 AM - 08:25 AM',
    monthlyFee: 3800,
    stops: ['Puppalguda Temple', 'Alkapur Township', 'Lanco Hills Tower 3', 'Oakridge Gate'],
  },
];

export default function RouteDiscoveryScreen() {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  const handleBook = (route: RouteOption) => {
    Alert.alert(
      'Confirm Seat Reservation',
      `Reserve seat on "${route.name}" for ₹${route.monthlyFee.toLocaleString('en-IN')}/month?\n\nDriver: ${route.driver} (${route.vehicle})\n\nYou will be redirected to Razorpay checkout.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed to Pay',
          onPress: () => {
            Alert.alert(
              'Order Created (Razorpay)',
              'Order rzp_order_10293 created. Opening secure Razorpay checkout modal...'
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Find School Transport</Text>
          <Text style={styles.sub}>Verified independent auto and van routes</Text>
        </View>

        {AVAILABLE_ROUTES.map((route) => (
          <View key={route.id} style={styles.routeCard}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.routeName}>{route.name}</Text>
                <Text style={styles.schoolName}>🏫 {route.school}</Text>
              </View>
              <View style={styles.priceBox}>
                <Text style={styles.priceVal}>₹{route.monthlyFee.toLocaleString('en-IN')}</Text>
                <Text style={styles.priceSub}>/month</Text>
              </View>
            </View>

            <View style={styles.driverInfo}>
              <Text style={styles.driverText}>👤 Driver: {route.driver}</Text>
              <Text style={styles.vehicleText}>🛺 {route.vehicle}</Text>
              <Text style={styles.timeText}>⏰ Pickup Window: {route.timeWindow}</Text>
            </View>

            {/* Stops list */}
            <View style={styles.stopsBox}>
              <Text style={styles.stopsHeader}>Route Stops:</Text>
              <Text style={styles.stopsFlow}>{route.stops.join(' ➔ ')}</Text>
            </View>

            {/* Bottom Row */}
            <View style={styles.footerRow}>
              <View>
                <Text style={styles.seatsLeft}>
                  {route.availableSeats} of {route.totalSeats} seats left
                </Text>
                <Text style={styles.verifiedTag}>✓ Dodail Safety Audited</Text>
              </View>

              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => handleBook(route)}
              >
                <Text style={styles.bookButtonText}>Reserve Seat</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F1E36' },
  sub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  routeName: { fontSize: 16, fontWeight: '800', color: '#0F1E36' },
  schoolName: { fontSize: 12, color: '#047857', fontWeight: '600', marginTop: 2 },
  priceBox: { alignItems: 'flex-end' },
  priceVal: { fontSize: 18, fontWeight: '800', color: '#FF6B00' },
  priceSub: { fontSize: 10, color: '#64748B' },
  driverInfo: { marginTop: 12, gap: 3 },
  driverText: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  vehicleText: { fontSize: 12, color: '#64748B' },
  timeText: { fontSize: 12, color: '#0F1E36', fontWeight: '600', marginTop: 2 },
  stopsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stopsHeader: { fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
  stopsFlow: { fontSize: 12, color: '#334155', marginTop: 3, fontWeight: '500' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  seatsLeft: { fontSize: 12, fontWeight: '700', color: '#0F1E36' },
  verifiedTag: { fontSize: 11, fontWeight: '600', color: '#059669', marginTop: 1 },
  bookButton: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  bookButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});
