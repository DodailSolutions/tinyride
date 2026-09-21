import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
  RefreshControl,
} from 'react-native';
import { brandTokens, formatINR } from '@tinyride/ui';
import {
  fetchDriverRouteConfig,
  updateDriverRouteTimings,
  fetchDriverBookingRequests,
  DriverRouteConfig,
  DriverBookingRequest,
  SEED_DRIVER_ID,
} from '@tinyride/api-client';
import { useAuth } from '../../src/context/AuthContext';
import { LoadingIndicator, EmptyState, ErrorBanner, StatusBadge } from '../../src/components/UIState';

export default function DriverRouteScreen() {
  const { user } = useAuth();
  const driverId = user?.id || SEED_DRIVER_ID;

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [routeConfig, setRouteConfig] = useState<DriverRouteConfig | null>(null);
  const [bookings, setBookings] = useState<DriverBookingRequest[]>([]);
  const [isRouteActive, setIsRouteActive] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [configRes, bookingsRes] = await Promise.all([
        fetchDriverRouteConfig(driverId),
        fetchDriverBookingRequests(driverId),
      ]);
      setRouteConfig(configRes);
      setBookings(bookingsRes);
      if (configRes?.route) {
        setIsRouteActive(configRes.route.status === 'ACTIVE');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load route configuration');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [driverId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleToggleRouteStatus = async (value: boolean) => {
    setIsRouteActive(value);
    if (!routeConfig?.route.id) return;
    try {
      const newStatus = value ? 'ACTIVE' : 'INACTIVE';
      await updateDriverRouteTimings(routeConfig.route.id, { status: newStatus });
      Alert.alert(
        'Route Status Updated',
        value
          ? 'Route is now ACTIVE. Parents can view and book available seats.'
          : 'Route is paused. No new booking requests will be accepted.'
      );
    } catch {
      setIsRouteActive(!value);
      Alert.alert('Error', 'Could not update route availability');
    }
  };

  if (loading && !refreshing) {
    return <LoadingIndicator message="Loading route configuration & seat ledger..." />;
  }

  const route = routeConfig?.route;
  const stops = routeConfig?.stops || [];
  const reservedSeats = route?.reserved_seats ?? 4;
  const totalCapacity = route?.total_capacity ?? 4;
  const availableSeats = Math.max(0, totalCapacity - reservedSeats);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F07832" />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Route & Seat Management</Text>
          <Text style={styles.sub}>{routeConfig?.schoolName || 'DPS Gachibowli'}</Text>
        </View>

        {error && <ErrorBanner message={error} onRetry={loadData} />}

        {/* Route Availability & Seat Gauge Card */}
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.routeName}>{route?.route_name || 'Kondapur Route'}</Text>
              <Text style={styles.routeFee}>Monthly Base Fare: {formatINR(route?.monthly_base_fee_inr || 3200)}/child</Text>
            </View>
            <StatusBadge status={isRouteActive ? 'ACTIVE' : 'INACTIVE'} />
          </View>

          {/* Seat Capacity Gauge */}
          <View style={styles.capacityBox}>
            <View style={styles.seatStat}>
              <Text style={styles.seatVal}>{totalCapacity}</Text>
              <Text style={styles.seatLabel}>Total Seats</Text>
            </View>
            <View style={styles.seatStat}>
              <Text style={[styles.seatVal, { color: brandTokens.warmOrange }]}>{reservedSeats}</Text>
              <Text style={styles.seatLabel}>Reserved</Text>
            </View>
            <View style={styles.seatStat}>
              <Text style={[styles.seatVal, { color: availableSeats > 0 ? '#10B981' : '#EF4444' }]}>
                {availableSeats}
              </Text>
              <Text style={styles.seatLabel}>{availableSeats > 0 ? 'Available' : 'Full'}</Text>
            </View>
          </View>

          {/* Route Active Toggle */}
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Accepting Seat Bookings</Text>
              <Text style={styles.toggleDesc}>
                {isRouteActive
                  ? 'Visible in Parent App search for DPS Gachibowli.'
                  : 'Hidden from discovery. Existing active trips continue.'}
              </Text>
            </View>
            <Switch
              value={isRouteActive}
              onValueChange={handleToggleRouteStatus}
              trackColor={{ false: '#334155', true: '#065F46' }}
              thumbColor={isRouteActive ? '#10B981' : '#94A3B8'}
            />
          </View>
        </View>

        {/* Timetable Shifts Card */}
        <Text style={styles.sectionHeading}>Commute Timetable & Shifts</Text>
        <View style={styles.card}>
          <View style={styles.shiftRow}>
            <View style={styles.shiftBadge}>
              <Text style={styles.shiftBadgeText}>MORNING PICKUP</Text>
            </View>
            <Text style={styles.shiftTime}>
              {route?.morning_start_time || '07:15'} ➔ {route?.morning_arrival_time || '08:15'} (Arrival at Gate)
            </Text>
          </View>

          <View style={[styles.shiftRow, { marginTop: 12 }]}>
            <View style={[styles.shiftBadge, { backgroundColor: '#1E3A8A' }]}>
              <Text style={[styles.shiftBadgeText, { color: '#93C5FD' }]}>AFTERNOON DROP</Text>
            </View>
            <Text style={styles.shiftTime}>
              {route?.afternoon_pickup_time || '15:30'} ➔ {route?.afternoon_end_time || '16:30'} (Final Drop)
            </Text>
          </View>
        </View>

        {/* Route Stops Sequence */}
        <Text style={styles.sectionHeading}>Designated Stops ({stops.length} Stops)</Text>
        <View style={styles.stopList}>
          {stops.map((stop) => (
            <View key={stop.id} style={styles.stopCard}>
              <View style={styles.sequenceCircle}>
                <Text style={styles.sequenceText}>{stop.stop_sequence}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stopNameText}>{stop.stop_name}</Text>
                {stop.landmark && <Text style={styles.landmarkText}>📍 Landmark: {stop.landmark}</Text>}
                <View style={styles.timeTagRow}>
                  <Text style={styles.timeTag}>Morning Pickup: {stop.estimated_pickup_time}</Text>
                  <Text style={styles.timeTag}>Afternoon Drop: {stop.estimated_drop_time}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Booking Requests Queue */}
        <Text style={styles.sectionHeading}>Parent Booking Requests ({bookings.length})</Text>
        {bookings.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No Bookings Yet"
            description="Parent subscription requests for your verified route will be queued here."
          />
        ) : (
          bookings.map((item) => (
            <View key={item.id} style={styles.bookingCard}>
              <View style={styles.bookingTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bookingChild}>{item.childName}</Text>
                  <Text style={styles.bookingGrade}>{item.childGrade} • Stop: {item.pickupStopName}</Text>
                  <Text style={styles.bookingParent}>Guardian: {item.parentName} ({item.parentPhone})</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <View style={styles.bookingFooter}>
                <Text style={styles.bookingFee}>{formatINR(item.monthlyFee)}/month</Text>
                <Text style={styles.bookingDate}>Commute Start: {item.startDate}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070D18' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  sub: { fontSize: 12, color: brandTokens.warmOrange, marginTop: 3, fontWeight: '600' },
  card: {
    backgroundColor: '#142B4A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    marginBottom: 20,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  routeName: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  routeFee: { fontSize: 12, color: '#94A3B8', marginTop: 3 },
  capacityBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#0F1E33',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#1E3A5F',
  },
  seatStat: { alignItems: 'center' },
  seatVal: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  seatLabel: { fontSize: 10, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginTop: 2 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E3A5F',
  },
  toggleTitle: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  toggleDesc: { fontSize: 11, color: '#94A3B8', marginTop: 2, maxWidth: '85%' },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  shiftRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  shiftBadge: { backgroundColor: '#064E3B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  shiftBadgeText: { fontSize: 10, fontWeight: '800', color: '#6EE7B7' },
  shiftTime: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  stopList: { gap: 8, marginBottom: 20 },
  stopCard: {
    backgroundColor: '#142B4A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sequenceCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E3A5F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sequenceText: { fontSize: 12, fontWeight: '800', color: brandTokens.warmOrange },
  stopNameText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  landmarkText: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  timeTagRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  timeTag: { fontSize: 10, color: '#CBD5E1', fontWeight: '600' },
  bookingCard: {
    backgroundColor: '#142B4A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    marginBottom: 10,
  },
  bookingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bookingChild: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  bookingGrade: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  bookingParent: { fontSize: 11, color: '#CBD5E1', marginTop: 2 },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E3A5F',
  },
  bookingFee: { fontSize: 12, fontWeight: '800', color: '#10B981' },
  bookingDate: { fontSize: 10, color: '#94A3B8' },
});
