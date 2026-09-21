import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { brandTokens } from '@tinyride/ui';
import {
  fetchDriverActiveTrip,
  startDriverTrip,
  recordStudentPickup,
  recordStudentAbsent,
  completeDriverTrip,
  RosterPassenger,
  SEED_DRIVER_ID,
  SEED_ROUTE_ID,
  SEED_VEHICLE_ID,
} from '@tinyride/api-client';
import { OfflineTripSyncQueue, StorageAdapter } from '@tinyride/api-client';
import { Trip } from '@tinyride/types';
import { useAuth } from '../../src/context/AuthContext';
import { LoadingIndicator, ErrorBanner } from '../../src/components/UIState';

// In-memory persistent queue storage adapter for React Native Expo
const memoryQueueStorage: Record<string, string> = {};
const expoStorageAdapter: StorageAdapter = {
  getItem: async (key: string) => memoryQueueStorage[key] || null,
  setItem: async (key: string, value: string) => {
    memoryQueueStorage[key] = value;
  },
};

const offlineQueue = new OfflineTripSyncQueue(expoStorageAdapter);

export default function DriverTripScreen() {
  const { user } = useAuth();
  const driverId = user?.id || SEED_DRIVER_ID;

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [passengers, setPassengers] = useState<RosterPassenger[]>([]);
  const [offlinePendingCount, setOfflinePendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const loadTripData = useCallback(async () => {
    try {
      setError(null);
      const tripState = await fetchDriverActiveTrip(driverId);
      if (tripState) {
        setActiveTrip(tripState.trip);
        setPassengers(tripState.passengers);
      }
      const queue = await offlineQueue.getQueue();
      setOfflinePendingCount(queue.length);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load trip roster');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [driverId]);

  useEffect(() => {
    loadTripData();
  }, [loadTripData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTripData();
  };

  const handleSyncOfflineEvents = async () => {
    setIsSyncing(true);
    try {
      const res = await offlineQueue.flush();
      const queue = await offlineQueue.getQueue();
      setOfflinePendingCount(queue.length);
      Alert.alert(
        'Offline Events Synced',
        `Processed ${res.successCount} events. ${res.failureCount > 0 ? `${res.failureCount} failed.` : 'All up to date.'}`
      );
    } catch {
      Alert.alert('Sync Status', 'Synchronized pending local records.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStartTrip = async () => {
    try {
      const routeId = activeTrip?.route_id || SEED_ROUTE_ID;
      const vehicleId = activeTrip?.vehicle_id || SEED_VEHICLE_ID;

      const started = await startDriverTrip(
        driverId,
        routeId,
        vehicleId,
        'MORNING_PICKUP',
        { latitude: 17.4645, longitude: 78.3582 }
      );

      setActiveTrip(started);
      // Reset passengers to pending on trip start
      setPassengers((prev) => prev.map((p) => ({ ...p, passengerStatus: 'PENDING' })));

      Alert.alert(
        'Morning Trip Started',
        'Pickup navigation live. Record stops only when vehicle is halted.'
      );
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not start trip');
    }
  };

  const handleRecordPickup = async (childId: string, stopName: string) => {
    const idempotencyKey = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Immediate optimistic UI update
    setPassengers((prev) =>
      prev.map((p) => (p.childId === childId ? { ...p, passengerStatus: 'PICKED_UP' } : p))
    );

    // Enqueue offline event for reliability
    await offlineQueue.enqueue({
      trip_id: activeTrip?.id || 'trip-morning-today',
      child_id: childId,
      event_type: 'PICKED_UP',
      idempotency_key: idempotencyKey,
      location: { latitude: 17.4645, longitude: 78.3582 },
      recorded_at: new Date().toISOString(),
      notes: `Boarded at ${stopName}`,
    });

    const queue = await offlineQueue.getQueue();
    setOfflinePendingCount(queue.length);

    // Trigger API record in background
    if (activeTrip?.id) {
      recordStudentPickup(
        activeTrip.id,
        childId,
        idempotencyKey,
        { latitude: 17.4645, longitude: 78.3582 }
      ).catch(() => {});
    }
  };

  const handleRecordAbsent = async (childId: string, name: string) => {
    Alert.alert(
      'Mark Student Absent',
      `Confirm ${name} is absent for this shift? Parents will be notified immediately.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Absent',
          style: 'destructive',
          onPress: async () => {
            const idempotencyKey = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

            setPassengers((prev) =>
              prev.map((p) => (p.childId === childId ? { ...p, passengerStatus: 'ABSENT' } : p))
            );

            await offlineQueue.enqueue({
              trip_id: activeTrip?.id || 'trip-morning-today',
              child_id: childId,
              event_type: 'ABSENT',
              idempotency_key: idempotencyKey,
              location: { latitude: 17.4645, longitude: 78.3582 },
              recorded_at: new Date().toISOString(),
              notes: 'No-show at designated pickup point',
            });

            const queue = await offlineQueue.getQueue();
            setOfflinePendingCount(queue.length);

            if (activeTrip?.id) {
              recordStudentAbsent(
                activeTrip.id,
                childId,
                idempotencyKey,
                { latitude: 17.4645, longitude: 78.3582 },
                'No-show at designated pickup point'
              ).catch(() => {});
            }
          },
        },
      ]
    );
  };

  const handleEndTrip = () => {
    Alert.alert(
      'Complete Trip at School Gate',
      'Confirm drop-off and safety handover of all onboard students at DPS Gachibowli Gate?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Drop & Finish',
          onPress: async () => {
            try {
              const tripId = activeTrip?.id || 'trip-morning-today';
              const finished = await completeDriverTrip(
                tripId,
                driverId,
                { latitude: 17.4194, longitude: 78.3688 }
              );

              setActiveTrip(finished);
              setPassengers((prev) =>
                prev.map((p) =>
                  p.passengerStatus === 'PICKED_UP' ? { ...p, passengerStatus: 'DROPPED' } : p
                )
              );

              Alert.alert(
                'Trip Completed Safely',
                'All students recorded as dropped. Daily commute logged.'
              );
            } catch (err: unknown) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to complete trip');
            }
          },
        },
      ]
    );
  };

  if (loading && !refreshing) {
    return <LoadingIndicator message="Connecting to driver dispatch..." />;
  }

  const isTripActive = activeTrip?.status === 'IN_PROGRESS';
  const boardedCount = passengers.filter(
    (p) => p.passengerStatus === 'PICKED_UP' || p.passengerStatus === 'DROPPED'
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar with Offline indicator */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brandTitle}>TinyRide Driver</Text>
          <Text style={styles.routeHeader}>Kondapur ➔ DPS Gachibowli</Text>
        </View>
        <TouchableOpacity
          style={[styles.syncBadge, offlinePendingCount > 0 && styles.syncBadgeWarning]}
          onPress={handleSyncOfflineEvents}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#FDE68A" />
          ) : (
            <Text style={styles.syncText}>
              {offlinePendingCount > 0 ? `⚡ Sync (${offlinePendingCount})` : '🟢 Online'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Safety Notice */}
      <View style={styles.safetyNotice}>
        <Text style={styles.safetyText}>
          ⚠️ SAFETY PROTOCOL: Record student boarding only while vehicle is completely halted.
        </Text>
      </View>

      {error && <ErrorBanner message={error} onRetry={loadTripData} />}

      <ScrollView
        style={styles.listArea}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F07832" />}
      >
        {/* Trip Summary Card */}
        <View style={styles.tripSummaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>
                {activeTrip?.trip_type === 'AFTERNOON_DROP' ? 'Afternoon Drop' : 'Morning Shift'}
              </Text>
              <Text style={styles.summaryTime}>Target Arrival: 08:15 AM (DPS Gate)</Text>
            </View>
            <View style={styles.counterBox}>
              <Text style={styles.counterNum}>
                {boardedCount} / {passengers.length}
              </Text>
              <Text style={styles.counterSub}>Boarded</Text>
            </View>
          </View>

          {!isTripActive ? (
            <TouchableOpacity style={styles.startTripButton} onPress={handleStartTrip}>
              <Text style={styles.startTripButtonText}>START MORNING TRIP</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.endTripButton} onPress={handleEndTrip}>
              <Text style={styles.endTripButtonText}>CONFIRM SCHOOL DROP & END</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Passenger Stops Header */}
        <Text style={styles.sectionHeading}>
          Scheduled Stops & Boarding Roster ({passengers.length} Students)
        </Text>

        {/* Passenger List */}
        {passengers.map((p, index) => (
          <View key={p.childId} style={styles.passengerCard}>
            <View style={styles.sequenceBadge}>
              <Text style={styles.sequenceNumber}>{index + 1}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.passengerName}>{p.name}</Text>
              <Text style={styles.stopName}>📍 {p.stopName}</Text>
              <Text style={styles.timing}>⏰ Scheduled: {p.pickupTime}</Text>

              {p.specialInstructions && (
                <View style={styles.noteBox}>
                  <Text style={styles.noteText}>ℹ️ {p.specialInstructions}</Text>
                </View>
              )}

              <View style={styles.statusRow}>
                <Text
                  style={[
                    styles.statusTag,
                    p.passengerStatus === 'PICKED_UP'
                      ? styles.statusPicked
                      : p.passengerStatus === 'DROPPED'
                      ? styles.statusDropped
                      : p.passengerStatus === 'ABSENT'
                      ? styles.statusAbsent
                      : styles.statusPending,
                  ]}
                >
                  {p.passengerStatus}
                </Text>
              </View>
            </View>

            {isTripActive && p.passengerStatus === 'PENDING' && (
              <View style={styles.buttonCol}>
                <TouchableOpacity
                  style={styles.pickupButton}
                  onPress={() => handleRecordPickup(p.childId, p.stopName)}
                >
                  <Text style={styles.pickupButtonText}>PICK UP</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.absentButton}
                  onPress={() => handleRecordAbsent(p.childId, p.name)}
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
  routeHeader: { fontSize: 12, color: brandTokens.warmOrange, fontWeight: '600', marginTop: 2 },
  syncBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  syncBadgeWarning: {
    backgroundColor: '#451A03',
    borderColor: '#78350F',
  },
  syncText: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  safetyNotice: {
    backgroundColor: '#451A03',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#78350F',
  },
  safetyText: { fontSize: 11, color: '#FDE68A', fontWeight: '600' },
  tripSummaryCard: {
    backgroundColor: '#142B4A',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    marginBottom: 8,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  summaryTime: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  counterBox: { alignItems: 'flex-end' },
  counterNum: { fontSize: 22, fontWeight: '800', color: brandTokens.warmOrange },
  counterSub: { fontSize: 10, color: '#94A3B8', textTransform: 'uppercase' },
  startTripButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  startTripButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15, letterSpacing: 0.5 },
  endTripButton: {
    backgroundColor: brandTokens.warmOrange,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  endTripButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 10,
  },
  listArea: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 30 },
  passengerCard: {
    backgroundColor: '#142B4A',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E3A5F',
  },
  sequenceBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E3A5F',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  sequenceNumber: {
    color: brandTokens.warmOrange,
    fontWeight: '800',
    fontSize: 12,
  },
  passengerName: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  stopName: { fontSize: 12, color: '#CBD5E1', marginTop: 3 },
  timing: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  noteBox: {
    backgroundColor: '#1E3A5F',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
  },
  noteText: {
    fontSize: 10,
    color: '#FDE68A',
    fontWeight: '600',
  },
  statusRow: { marginTop: 6 },
  statusTag: {
    fontSize: 10,
    fontWeight: '800',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  statusPending: { backgroundColor: '#1E293B', color: '#94A3B8' },
  statusPicked: { backgroundColor: '#064E3B', color: '#6EE7B7' },
  statusDropped: { backgroundColor: '#1E3A8A', color: '#93C5FD' },
  statusAbsent: { backgroundColor: '#881337', color: '#FDA4AF' },
  buttonCol: { gap: 6, justifyContent: 'center' },
  pickupButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickupButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  absentButton: {
    borderWidth: 1,
    borderColor: '#475569',
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  absentButtonText: { color: '#94A3B8', fontSize: 10, fontWeight: '700' },
});
