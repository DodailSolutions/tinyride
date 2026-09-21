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

interface ChildPassenger {
  id: string;
  name: string;
  stopName: string;
  status: 'PENDING' | 'PICKED_UP' | 'DROPPED' | 'ABSENT';
}

const INITIAL_PASSENGERS: ChildPassenger[] = [
  { id: 'c-1', name: 'Aarav Sharma', stopName: '1. Kondapur RTO Cross', status: 'PENDING' },
  { id: 'c-2', name: 'Ananya Rao', stopName: '2. Chirec Avenue Stop', status: 'PENDING' },
  { id: 'c-3', name: 'Siddharth M', stopName: '3. Botanical Garden Gate', status: 'PENDING' },
  { id: 'c-4', name: 'Rohan Verma', stopName: '3. Botanical Garden Gate', status: 'PENDING' },
];

export default function DriverTripScreen() {
  const [tripStarted, setTripStarted] = useState(false);
  const [passengers, setPassengers] = useState<ChildPassenger[]>(INITIAL_PASSENGERS);
  const [offlinePendingCount, setOfflinePendingCount] = useState(0);

  const handleStartTrip = () => {
    setTripStarted(true);
    Alert.alert('Trip Started', 'Morning Pickup initiated. Drive safely!');
  };

  const handleRecordPickup = (childId: string) => {
    // Generate UUID idempotency key to prevent duplicates
    const idempotencyKey = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    setPassengers((prev) =>
      prev.map((p) => (p.id === childId ? { ...p, status: 'PICKED_UP' } : p))
    );
    // Queue offline event
    setOfflinePendingCount((prev) => prev + 1);
    setTimeout(() => {
      // Simulate background flush
      setOfflinePendingCount((prev) => Math.max(0, prev - 1));
    }, 1500);
  };

  const handleRecordAbsent = (childId: string) => {
    setPassengers((prev) =>
      prev.map((p) => (p.id === childId ? { ...p, status: 'ABSENT' } : p))
    );
  };

  const handleEndTrip = () => {
    Alert.alert(
      'Complete Trip',
      'Confirm drop-off of all students at DPS Gachibowli Gate?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Drop & Finish',
          onPress: () => {
            setPassengers((prev) =>
              prev.map((p) =>
                p.status === 'PICKED_UP' ? { ...p, status: 'DROPPED' } : p
              )
            );
            setTripStarted(false);
            Alert.alert('Trip Completed', 'All students dropped safely. Great job!');
          },
        },
      ]
    );
  };

  const pickedCount = passengers.filter((p) => p.status === 'PICKED_UP' || p.status === 'DROPPED').length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar with Offline indicator */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brandTitle}>TinyRide Driver</Text>
          <Text style={styles.routeHeader}>Kondapur ➔ DPS Gachibowli</Text>
        </View>
        <View style={styles.syncBadge}>
          <Text style={styles.syncText}>
            {offlinePendingCount > 0 ? `Syncing (${offlinePendingCount})...` : '🟢 Online'}
          </Text>
        </View>
      </View>

      {/* Safety Notice */}
      <View style={styles.safetyNotice}>
        <Text style={styles.safetyText}>
          ⚠️ SAFETY RULE: Record pickups only while vehicle is completely stopped.
        </Text>
      </View>

      {/* Trip Controller */}
      <View style={styles.tripSummaryCard}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Morning Shift</Text>
            <Text style={styles.summaryTime}>Target Arrival: 08:15 AM</Text>
          </View>
          <View style={styles.counterBox}>
            <Text style={styles.counterNum}>
              {pickedCount} / {passengers.length}
            </Text>
            <Text style={styles.counterSub}>Boarded</Text>
          </View>
        </View>

        {!tripStarted ? (
          <TouchableOpacity style={styles.startTripButton} onPress={handleStartTrip}>
            <Text style={styles.startTripButtonText}>START MORNING TRIP</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.endTripButton} onPress={handleEndTrip}>
            <Text style={styles.endTripButtonText}>CONFIRM SCHOOL DROP & END</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Passenger Boarding List */}
      <Text style={styles.sectionHeading}>Passenger Stops</Text>

      <ScrollView style={styles.listArea} contentContainerStyle={styles.listContent}>
        {passengers.map((p) => (
          <View key={p.id} style={styles.passengerCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.passengerName}>{p.name}</Text>
              <Text style={styles.stopName}>{p.stopName}</Text>
              <Text
                style={[
                  styles.statusTag,
                  p.status === 'PICKED_UP'
                    ? styles.statusPicked
                    : p.status === 'DROPPED'
                    ? styles.statusDropped
                    : p.status === 'ABSENT'
                    ? styles.statusAbsent
                    : styles.statusPending,
                ]}
              >
                {p.status}
              </Text>
            </View>

            {tripStarted && p.status === 'PENDING' && (
              <View style={styles.buttonCol}>
                <TouchableOpacity
                  style={styles.pickupButton}
                  onPress={() => handleRecordPickup(p.id)}
                >
                  <Text style={styles.pickupButtonText}>PICKED UP</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.absentButton}
                  onPress={() => handleRecordAbsent(p.id)}
                >
                  <Text style={styles.absentButtonText}>Absent</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070D18' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  brandTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  routeHeader: { fontSize: 12, color: '#F07832', fontWeight: '600', marginTop: 2 },
  syncBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  syncText: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  safetyNotice: {
    backgroundColor: '#451A03',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  safetyText: { fontSize: 11, color: '#FDE68A', fontWeight: '600' },
  tripSummaryCard: {
    backgroundColor: '#142B4A',
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E3A5F',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  summaryTime: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  counterBox: { alignItems: 'flex-end' },
  counterNum: { fontSize: 22, fontWeight: '800', color: '#F07832' },
  counterSub: { fontSize: 10, color: '#94A3B8', textTransform: 'uppercase' },
  startTripButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  startTripButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
  endTripButton: {
    backgroundColor: '#F07832',
    borderRadius: 12,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  endTripButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  listArea: { flex: 1 },
  listContent: { paddingHorizontal: 16, gap: 10, paddingBottom: 30 },
  passengerCard: {
    backgroundColor: '#1E3A5F',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerName: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  stopName: { fontSize: 12, color: '#94A3B8', marginTop: 3 },
  statusTag: {
    fontSize: 11,
    fontWeight: '700',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  statusPending: { backgroundColor: '#334155', color: '#CBD5E1' },
  statusPicked: { backgroundColor: '#064E3B', color: '#6EE7B7' },
  statusDropped: { backgroundColor: '#1E3A8A', color: '#93C5FD' },
  statusAbsent: { backgroundColor: '#881337', color: '#FDA4AF' },
  buttonCol: { gap: 6 },
  pickupButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 18,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickupButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  absentButton: {
    borderWidth: 1,
    borderColor: '#64748B',
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  absentButtonText: { color: '#CBD5E1', fontSize: 11, fontWeight: '600' },
});
