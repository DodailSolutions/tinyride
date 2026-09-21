import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { brandTokens } from '@tinyride/ui';
import { Route, School, Child, RouteStop } from '@tinyride/types';
import {
  fetchActiveRoutes,
  fetchSchools,
  fetchChildren,
  createBookingRequest,
  calculateFareSnapshot,
} from '@tinyride/api-client';
import { useAuth } from '../../src/context/AuthContext';
import { LoadingIndicator, EmptyState, ErrorBanner } from '../../src/components/UIState';

export default function RoutesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const parentId = user?.id || 'parent-demo-user-001';

  const [routes, setRoutes] = useState<Route[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail Modal
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  // Booking Modal
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [bookingRoute, setBookingRoute] = useState<Route | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [selectedPickupStopId, setSelectedPickupStopId] = useState<string>('');
  const [selectedDropStopId, setSelectedDropStopId] = useState<string>('');
  const [pickupNotes, setPickupNotes] = useState('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedRoutes, fetchedSchools, fetchedChildren] = await Promise.all([
        fetchActiveRoutes(selectedSchoolId || undefined),
        fetchSchools(),
        fetchChildren(parentId),
      ]);
      setRoutes(fetchedRoutes);
      setSchools(fetchedSchools);
      setChildren(fetchedChildren);
      if (fetchedChildren.length > 0 && !selectedChildId) {
        setSelectedChildId(fetchedChildren[0]?.id || '');
      }
    } catch {
      setError('Could not load active routes. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  }, [parentId, selectedSchoolId, selectedChildId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenBooking = (route: Route) => {
    setBookingRoute(route);
    const stops = route.stops || [];
    if (stops.length >= 2) {
      setSelectedPickupStopId(stops[0]?.id || '');
      setSelectedDropStopId(stops[stops.length - 1]?.id || '');
    }
    setBookingError(null);
    setBookingSuccess(false);
    setBookingModalVisible(true);
  };

  const handleConfirmBooking = async () => {
    if (!bookingRoute) return;
    if (!selectedChildId) {
      setBookingError('Please select a child for this transport booking');
      return;
    }
    if (!selectedPickupStopId || !selectedDropStopId) {
      setBookingError('Please select both pickup and drop-off stops');
      return;
    }

    setIsBookingSubmitting(true);
    setBookingError(null);

    try {
      const res = await createBookingRequest(parentId, {
        child_id: selectedChildId,
        route_id: bookingRoute.id,
        pickup_stop_id: selectedPickupStopId,
        drop_stop_id: selectedDropStopId,
        monthly_base_fee_inr: bookingRoute.monthly_base_fee_inr,
        pickup_notes: pickupNotes.trim() || undefined,
      });

      if (!res.success) {
        setBookingError(res.error || 'Failed to submit booking request');
        return;
      }

      setBookingSuccess(true);
      // Reload routes to update reserved seats count
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating booking';
      setBookingError(msg);
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  const fareSnapshot = bookingRoute
    ? calculateFareSnapshot(bookingRoute.monthly_base_fee_inr)
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Bar */}
        <View style={styles.header}>
          <Text style={styles.title}>Find School Ride</Text>
          <Text style={styles.sub}>
            Verified auto & van routes for Hyderabad partner schools
          </Text>
        </View>

        {/* School Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <TouchableOpacity
            style={[styles.filterChip, selectedSchoolId === '' && styles.filterChipActive]}
            onPress={() => setSelectedSchoolId('')}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedSchoolId === '' && styles.filterChipTextActive,
              ]}
            >
              All Schools ({schools.length})
            </Text>
          </TouchableOpacity>
          {schools.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.filterChip,
                selectedSchoolId === s.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedSchoolId(s.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedSchoolId === s.id && styles.filterChipTextActive,
                ]}
              >
                {s.name.split('(')[0]?.trim()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {error && <ErrorBanner message={error} onRetry={loadData} />}

        {isLoading ? (
          <LoadingIndicator message="Finding verified school routes..." />
        ) : routes.length === 0 ? (
          <EmptyState
            icon="🚌"
            title="No Routes Found For Selected Filter"
            description="Try selecting another school or check back soon as more verified drivers are onboarded in your locality."
            actionLabel="View All Routes"
            onAction={() => setSelectedSchoolId('')}
          />
        ) : (
          routes.map((route) => {
            const seatsLeft = route.total_capacity - route.reserved_seats;
            const isFull = seatsLeft <= 0;

            return (
              <View key={route.id} style={styles.routeCard}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.routeName}>{route.route_name}</Text>
                    <Text style={styles.schoolName}>
                      🏫 {route.school?.name || 'Hyderabad Partner School'}
                    </Text>
                  </View>
                  <View style={styles.priceBox}>
                    <Text style={styles.priceVal}>
                      ₹{route.monthly_base_fee_inr.toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.priceSub}>per month</Text>
                  </View>
                </View>

                {/* Driver & Vehicle Details */}
                <View style={styles.driverInfo}>
                  <Text style={styles.driverText}>
                    👨‍✈️ Driver: {route.driver?.profile?.full_name || 'Verified Driver'} (★{' '}
                    {route.driver?.rating_avg || 4.9})
                  </Text>
                  <Text style={styles.vehicleText}>
                    🛺 {route.vehicle?.make || 'Bajaj'} {route.vehicle?.model || 'Auto'} •{' '}
                    {route.vehicle?.registration_number || 'TS09'} ({route.vehicle?.color || 'Yellow-Black'})
                  </Text>
                  <Text style={styles.timeText}>
                    ⏰ Morning: {route.morning_start_time} - {route.morning_arrival_time} • Afternoon: {route.afternoon_pickup_time}
                  </Text>
                </View>

                {/* Stop Preview */}
                <TouchableOpacity
                  style={styles.stopsBox}
                  onPress={() => setSelectedRoute(route)}
                >
                  <Text style={styles.stopsHeader}>
                    Stops ({route.stops?.length || 0}) — Tap for schedule:
                  </Text>
                  <Text style={styles.stopsFlow} numberOfLines={1}>
                    {route.stops && route.stops.length > 0
                      ? route.stops.map((s: RouteStop) => s.stop_name).join(' ➔ ')
                      : 'Kondapur ➔ Gachibowli'}
                  </Text>
                </TouchableOpacity>

                {/* Card Footer */}
                <View style={styles.footerRow}>
                  <View>
                    <Text
                      style={[
                        styles.seatsLeft,
                        isFull && { color: '#DC2626' },
                      ]}
                    >
                      {isFull ? '🔴 Fully Booked' : `🟢 ${seatsLeft} of ${route.total_capacity} seats available`}
                    </Text>
                    <Text style={styles.verifiedTag}>✓ Police & Transport Audited</Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      style={styles.detailsButton}
                      onPress={() => setSelectedRoute(route)}
                    >
                      <Text style={styles.detailsButtonText}>Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.bookButton, isFull && styles.buttonDisabled]}
                      onPress={() => handleOpenBooking(route)}
                      disabled={isFull}
                    >
                      <Text style={styles.bookButtonText}>Book Ride</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Route Detail Modal */}
      <Modal visible={!!selectedRoute} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedRoute && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>{selectedRoute.route_name}</Text>
                <Text style={styles.modalSub}>
                  🏫 {selectedRoute.school?.name} ({selectedRoute.school?.branch_name})
                </Text>

                {/* Driver Credentials Card */}
                <View style={styles.infoSection}>
                  <Text style={styles.sectionHeading}>Verified Driver & Vehicle</Text>
                  <Text style={styles.infoRow}>
                    👤 Driver: {selectedRoute.driver?.profile?.full_name} ({selectedRoute.driver?.experience_years} yrs exp)
                  </Text>
                  <Text style={styles.infoRow}>
                    🛡️ Commercial Badge: {selectedRoute.driver?.badge_number || 'HYD-COM-VERIFIED'}
                  </Text>
                  <Text style={styles.infoRow}>
                    🛺 Vehicle: {selectedRoute.vehicle?.make} {selectedRoute.vehicle?.model}
                  </Text>
                  <Text style={styles.infoRow}>
                    📋 Registration: {selectedRoute.vehicle?.registration_number}
                  </Text>
                  <Text style={styles.infoRow}>
                    🔍 Fitness Expiry: {selectedRoute.vehicle?.fitness_expiry} • Insurance Valid
                  </Text>
                </View>

                {/* Stop Timetable */}
                <View style={styles.infoSection}>
                  <Text style={styles.sectionHeading}>Stop Schedule & Landmarks</Text>
                  {selectedRoute.stops?.map((stop: RouteStop, idx: number) => (
                    <View key={stop.id || idx} style={styles.timelineItem}>
                      <View style={styles.timelineMarker}>
                        <Text style={styles.markerText}>{idx + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.stopNameText}>{stop.stop_name}</Text>
                        <Text style={styles.stopTimeText}>
                          Pickup: {stop.estimated_pickup_time} • Drop: {stop.estimated_drop_time}
                        </Text>
                        {stop.landmark && (
                          <Text style={styles.stopLandmarkText}>📍 Landmark: {stop.landmark}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>

                {/* Pricing Breakdown */}
                <View style={styles.infoSection}>
                  <Text style={styles.sectionHeading}>Pricing & Coordination</Text>
                  <Text style={styles.infoRow}>
                    Monthly Base Fare: ₹{selectedRoute.monthly_base_fee_inr.toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.infoRow}>Platform Coordination & GST: Transparent breakdown upon booking</Text>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setSelectedRoute(null)}
                  >
                    <Text style={styles.cancelBtnText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={() => {
                      const r = selectedRoute;
                      setSelectedRoute(null);
                      handleOpenBooking(r);
                    }}
                  >
                    <Text style={styles.saveBtnText}>Proceed to Book</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Book Ride Modal */}
      <Modal visible={bookingModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {bookingRoute && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {bookingSuccess ? (
                  <View style={styles.successContainer}>
                    <Text style={styles.successIcon}>🎉</Text>
                    <Text style={styles.successTitle}>Booking Request Created!</Text>
                    <Text style={styles.successDesc}>
                      Your seat has been reserved in PENDING PAYMENT status. Complete the monthly fee payment to activate your child's pass.
                    </Text>
                    <TouchableOpacity
                      style={styles.payNowBtn}
                      onPress={() => {
                        setBookingModalVisible(false);
                        router.push('/(tabs)/subscriptions');
                      }}
                    >
                      <Text style={styles.payNowBtnText}>View Bookings & Pay Now ➔</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={styles.modalTitle}>Book School Transport</Text>
                    <Text style={styles.modalSub}>{bookingRoute.route_name}</Text>

                    {bookingError && <ErrorBanner message={bookingError} />}

                    {/* Child Selector */}
                    <Text style={styles.inputLabel}>Select Child *</Text>
                    {children.length === 0 ? (
                      <View style={styles.noChildWarning}>
                        <Text style={styles.noChildText}>
                          ⚠️ You must register a child profile first before booking a ride.
                        </Text>
                        <TouchableOpacity
                          style={styles.addChildSmallBtn}
                          onPress={() => {
                            setBookingModalVisible(false);
                            router.push('/(tabs)/children');
                          }}
                        >
                          <Text style={styles.addChildSmallBtnText}>+ Go to Children Tab</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.selectorRow}>
                        {children.map((c) => (
                          <TouchableOpacity
                            key={c.id}
                            style={[
                              styles.selectChip,
                              selectedChildId === c.id && styles.selectChipActive,
                            ]}
                            onPress={() => setSelectedChildId(c.id)}
                          >
                            <Text
                              style={[
                                styles.selectChipText,
                                selectedChildId === c.id && styles.selectChipTextActive,
                              ]}
                            >
                              {c.first_name} {c.last_name} ({c.grade})
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {/* Pickup Stop */}
                    <Text style={styles.inputLabel}>Home Pickup Stop *</Text>
                    <View style={styles.stopSelectorList}>
                      {bookingRoute.stops?.map((stop: RouteStop) => (
                        <TouchableOpacity
                          key={stop.id}
                          style={[
                            styles.stopOption,
                            selectedPickupStopId === stop.id && styles.stopOptionActive,
                          ]}
                          onPress={() => setSelectedPickupStopId(stop.id)}
                        >
                          <Text
                            style={[
                              styles.stopOptionText,
                              selectedPickupStopId === stop.id && styles.stopOptionTextActive,
                            ]}
                          >
                            {stop.stop_name} ({stop.estimated_pickup_time})
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Drop-off Stop */}
                    <Text style={styles.inputLabel}>School Drop-off Stop *</Text>
                    <View style={styles.stopSelectorList}>
                      {bookingRoute.stops?.map((stop: RouteStop) => (
                        <TouchableOpacity
                          key={stop.id}
                          style={[
                            styles.stopOption,
                            selectedDropStopId === stop.id && styles.stopOptionActive,
                          ]}
                          onPress={() => setSelectedDropStopId(stop.id)}
                        >
                          <Text
                            style={[
                              styles.stopOptionText,
                              selectedDropStopId === stop.id && styles.stopOptionTextActive,
                            ]}
                          >
                            {stop.stop_name} ({stop.estimated_drop_time})
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Pickup Special Instructions */}
                    <Text style={styles.inputLabel}>Special Boarding Notes (Optional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Wait at main gate 2 with mother"
                      placeholderTextColor="#94A3B8"
                      value={pickupNotes}
                      onChangeText={setPickupNotes}
                    />

                    {/* Fare Summary Breakdown */}
                    {fareSnapshot && (
                      <View style={styles.fareBreakdownCard}>
                        <Text style={styles.fareTitle}>Immutable Monthly Fare Snapshot</Text>
                        <View style={styles.fareRow}>
                          <Text style={styles.fareLabel}>Base Monthly Commute</Text>
                          <Text style={styles.fareVal}>₹{fareSnapshot.monthly_fee_inr}</Text>
                        </View>
                        <View style={styles.fareRow}>
                          <Text style={styles.fareLabel}>Platform Coordination Fee</Text>
                          <Text style={styles.fareVal}>₹{fareSnapshot.convenience_fee_inr}</Text>
                        </View>
                        <View style={styles.fareRow}>
                          <Text style={styles.fareLabel}>GST (5%)</Text>
                          <Text style={styles.fareVal}>₹{fareSnapshot.tax_inr}</Text>
                        </View>
                        <View style={[styles.fareRow, styles.fareTotalRow]}>
                          <Text style={styles.fareTotalLabel}>Total Monthly Due</Text>
                          <Text style={styles.fareTotalVal}>
                            ₹{fareSnapshot.total_amount_inr.toLocaleString('en-IN')}
                          </Text>
                        </View>
                      </View>
                    )}

                    <View style={styles.modalButtons}>
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => setBookingModalVisible(false)}
                        disabled={isBookingSubmitting}
                      >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.saveBtn,
                          (isBookingSubmitting || children.length === 0) &&
                            styles.buttonDisabled,
                        ]}
                        onPress={handleConfirmBooking}
                        disabled={isBookingSubmitting || children.length === 0}
                      >
                        {isBookingSubmitting ? (
                          <ActivityIndicator color="#FFFFFF" />
                        ) : (
                          <Text style={styles.saveBtnText}>Confirm Reservation</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20 },
  header: { marginBottom: 14 },
  title: { fontSize: 22, fontWeight: '800', color: brandTokens.deepNavy },
  sub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  filterRow: { gap: 8, paddingBottom: 16 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: brandTokens.deepNavy,
    borderColor: brandTokens.deepNavy,
  },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  filterChipTextActive: { color: '#FFFFFF' },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  routeName: { fontSize: 16, fontWeight: '800', color: brandTokens.deepNavy },
  schoolName: { fontSize: 12, color: '#047857', fontWeight: '600', marginTop: 2 },
  priceBox: { alignItems: 'flex-end' },
  priceVal: { fontSize: 18, fontWeight: '800', color: brandTokens.warmOrange },
  priceSub: { fontSize: 10, color: '#64748B' },
  driverInfo: { marginTop: 12, gap: 3 },
  driverText: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  vehicleText: { fontSize: 12, color: '#64748B' },
  timeText: { fontSize: 12, color: brandTokens.deepNavy, fontWeight: '600', marginTop: 2 },
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
  seatsLeft: { fontSize: 12, fontWeight: '700', color: brandTokens.deepNavy },
  verifiedTag: { fontSize: 11, fontWeight: '600', color: '#059669', marginTop: 1 },
  detailsButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
  },
  detailsButtonText: { color: brandTokens.deepNavy, fontWeight: '700', fontSize: 12 },
  bookButton: {
    backgroundColor: brandTokens.warmOrange,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  bookButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  buttonDisabled: { opacity: 0.5 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 43, 74, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    maxHeight: '85%',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: brandTokens.deepNavy },
  modalSub: { fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: 14 },
  infoSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: brandTokens.deepNavy,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  infoRow: { fontSize: 12, color: '#334155', lineHeight: 18 },
  timelineItem: { flexDirection: 'row', gap: 10, marginVertical: 6 },
  timelineMarker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: brandTokens.deepNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  stopNameText: { fontSize: 13, fontWeight: '700', color: brandTokens.deepNavy },
  stopTimeText: { fontSize: 11, color: '#64748B', marginTop: 1 },
  stopLandmarkText: { fontSize: 11, color: '#059669', marginTop: 1 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 18 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  cancelBtnText: { color: '#64748B', fontWeight: '600', fontSize: 13 },
  saveBtn: {
    backgroundColor: brandTokens.warmOrange,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: brandTokens.deepNavy,
    marginTop: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: brandTokens.deepNavy,
    backgroundColor: '#FFFFFF',
  },
  selectorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 4 },
  selectChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  selectChipActive: {
    backgroundColor: brandTokens.deepNavy,
    borderColor: brandTokens.deepNavy,
  },
  selectChipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  selectChipTextActive: { color: '#FFFFFF' },
  stopSelectorList: { gap: 4, marginVertical: 4 },
  stopOption: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  stopOptionActive: {
    borderColor: brandTokens.warmOrange,
    backgroundColor: '#FFF7ED',
  },
  stopOptionText: { fontSize: 12, fontWeight: '600', color: brandTokens.deepNavy },
  stopOptionTextActive: { color: brandTokens.warmOrange, fontWeight: '700' },
  fareBreakdownCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fareTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: brandTokens.deepNavy,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 },
  fareLabel: { fontSize: 12, color: '#64748B' },
  fareVal: { fontSize: 12, color: '#1E293B', fontWeight: '600' },
  fareTotalRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  fareTotalLabel: { fontSize: 13, fontWeight: '800', color: brandTokens.deepNavy },
  fareTotalVal: { fontSize: 15, fontWeight: '800', color: brandTokens.warmOrange },
  noChildWarning: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
    marginVertical: 4,
  },
  noChildText: { fontSize: 12, color: '#991B1B', fontWeight: '600' },
  addChildSmallBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  addChildSmallBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: { fontSize: 44, marginBottom: 12 },
  successTitle: { fontSize: 20, fontWeight: '800', color: brandTokens.deepNavy, textAlign: 'center' },
  successDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  payNowBtn: {
    backgroundColor: brandTokens.warmOrange,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  payNowBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
});
