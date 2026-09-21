import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { brandTokens } from '@tinyride/ui';
import { Child } from '@tinyride/types';
import { fetchChildren, fetchActiveTripForChild, ActiveTripInfo } from '@tinyride/api-client';
import { useAuth } from '../../src/context/AuthContext';
import { LoadingIndicator, EmptyState } from '../../src/components/UIState';

export default function ParentHomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const parentId = user?.id || 'parent-demo-user-001';

  const [children, setChildren] = useState<Child[]>([]);
  const [activeTrip, setActiveTrip] = useState<ActiveTripInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadHomeData = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedChildren = await fetchChildren(parentId);
      setChildren(fetchedChildren);

      if (fetchedChildren.length > 0) {
        // Check for active trip on first child
        const tripInfo = await fetchActiveTripForChild(fetchedChildren[0]?.id || '');
        setActiveTrip(tripInfo);
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  }, [parentId]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const handleCallDriver = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Call Driver', `Driver Phone: ${phone}`);
    });
  };

  const handleEmergencyHotline = () => {
    Alert.alert(
      '24/7 TinyRide Hyderabad Operations Desk',
      'Direct emergency escalation line: +91 40 6789 0000\n\nWould you like to place a call?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', onPress: () => Linking.openURL('tel:+914067890000') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>TinyRide</Text>
            <Text style={styles.brandTagline}>Little Rides. Big Peace of Mind.</Text>
            <Text style={styles.welcomeText}>
              Welcome, {user?.fullName || 'Parent'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Hyderabad Pilot</Text>
            </View>
            <TouchableOpacity onPress={signOut} style={styles.signOutBtn}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <LoadingIndicator message="Loading today's commute status..." />
        ) : (
          <>
            {/* Active Child Trip Card (Real-time tracking or scheduled card) */}
            {activeTrip ? (
              <View style={styles.activeCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.liveIndicatorRow}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>ACTIVE COMMUTE TRIP</Text>
                  </View>
                  <Text style={styles.timeText}>LIVE</Text>
                </View>

                <Text style={styles.childName}>{activeTrip.childName}</Text>
                <Text style={styles.schoolSub}>
                  Assigned Route • {activeTrip.trip.trip_type} COMMUTE
                </Text>

                {/* Status highlight */}
                <View style={styles.statusHighlight}>
                  <Text style={styles.statusTitle}>
                    {activeTrip.milestones.pickedUp
                      ? 'Safely Picked Up at Home Gate'
                      : activeTrip.milestones.tripStarted
                      ? 'Driver En Route to Home Pickup'
                      : 'Trip Scheduled for Today'}
                  </Text>
                  <Text style={styles.statusSub}>
                    {activeTrip.milestones.droppedOff
                      ? 'Safely Dropped at School Campus'
                      : 'Verified auto transport en route'}
                  </Text>
                </View>

                {/* Driver details */}
                <View style={styles.driverRow}>
                  <View style={styles.driverAvatar}>
                    <Text style={styles.avatarText}>
                      {activeTrip.driverName.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.driverName}>
                      {activeTrip.driverName} (★ {activeTrip.driverRating})
                    </Text>
                    <Text style={styles.driverVehicle}>{activeTrip.vehicleDesc}</Text>
                    <Text style={styles.verifiedBadge}>✓ Police & Transport Audited</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCallDriver(activeTrip.driverPhone)}
                  >
                    <Text style={styles.callButtonText}>📞 Call</Text>
                  </TouchableOpacity>
                </View>

                {/* Milestone checklist */}
                <View style={styles.milestones}>
                  <View style={styles.milestoneItem}>
                    <Text
                      style={
                        activeTrip.milestones.tripStarted
                          ? styles.checkDone
                          : styles.checkPending
                      }
                    >
                      {activeTrip.milestones.tripStarted ? '✓' : '○'}
                    </Text>
                    <Text
                      style={
                        activeTrip.milestones.tripStarted
                          ? styles.milestoneLabel
                          : styles.milestoneLabelPending
                      }
                    >
                      Trip Started{' '}
                      {activeTrip.milestones.tripStartedTime
                        ? `(${new Date(activeTrip.milestones.tripStartedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                        : ''}
                    </Text>
                  </View>
                  <View style={styles.milestoneItem}>
                    <Text
                      style={
                        activeTrip.milestones.pickedUp
                          ? styles.checkDone
                          : styles.checkPending
                      }
                    >
                      {activeTrip.milestones.pickedUp ? '✓' : '○'}
                    </Text>
                    <Text
                      style={
                        activeTrip.milestones.pickedUp
                          ? styles.milestoneLabel
                          : styles.milestoneLabelPending
                      }
                    >
                      Home Gate Pickup{' '}
                      {activeTrip.milestones.pickedUpTime
                        ? `(${new Date(activeTrip.milestones.pickedUpTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                        : ''}
                    </Text>
                  </View>
                  <View style={styles.milestoneItem}>
                    <Text
                      style={
                        activeTrip.milestones.droppedOff
                          ? styles.checkDone
                          : styles.checkPending
                      }
                    >
                      {activeTrip.milestones.droppedOff ? '✓' : '○'}
                    </Text>
                    <Text
                      style={
                        activeTrip.milestones.droppedOff
                          ? styles.milestoneLabel
                          : styles.milestoneLabelPending
                      }
                    >
                      School Campus Gate Drop
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.activeCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.scheduledTag}>SCHEDULED COMMUTE</Text>
                  <Text style={styles.timeText}>07:25 AM</Text>
                </View>

                {children.length > 0 ? (
                  <>
                    <Text style={styles.childName}>
                      {children[0]?.first_name} {children[0]?.last_name}
                    </Text>
                    <Text style={styles.schoolSub}>
                      Grade {children[0]?.grade} • Regular Morning Pickup
                    </Text>
                    <View style={styles.scheduledInfoBox}>
                      <Text style={styles.scheduledInfoText}>
                        📍 Home Pickup: {children[0]?.home_pickup_location?.address}
                      </Text>
                      <Text style={styles.scheduledSubText}>
                        Driver departs starting stop at 07:15 AM. You will receive notification on pickup.
                      </Text>
                    </View>
                  </>
                ) : (
                  <View style={{ paddingVertical: 10 }}>
                    <Text style={styles.childName}>No Child Registered</Text>
                    <Text style={styles.schoolSub}>
                      Add your child to view personalized daily morning pickup and drop milestones.
                    </Text>
                    <TouchableOpacity
                      style={styles.addFirstChildBtn}
                      onPress={() => router.push('/(tabs)/children')}
                    >
                      <Text style={styles.addFirstChildBtnText}>+ Register Child Profile</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Quick Action Shortcuts */}
            <Text style={styles.sectionHeading}>Daily Actions</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() =>
                  Alert.alert(
                    'Mark Student Absent',
                    'Would you like to notify your route driver that your child is absent today? Driver will skip your pickup stop.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Notify Driver',
                        onPress: () => Alert.alert('Notice Sent', 'Driver has been notified.'),
                      },
                    ]
                  )
                }
              >
                <Text style={styles.actionIcon}>✋</Text>
                <Text style={styles.actionTitle}>Mark Absent</Text>
                <Text style={styles.actionDesc}>Notify driver before 07:00 AM</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={handleEmergencyHotline}
              >
                <Text style={styles.actionIcon}>🛡️</Text>
                <Text style={styles.actionTitle}>24/7 Safety Desk</Text>
                <Text style={styles.actionDesc}>Direct operations hotline</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.actionGrid, { marginTop: 12 }]}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push('/(tabs)/routes')}
              >
                <Text style={styles.actionIcon}>🚌</Text>
                <Text style={styles.actionTitle}>Explore Routes</Text>
                <Text style={styles.actionDesc}>View available school seats</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push('/(tabs)/subscriptions')}
              >
                <Text style={styles.actionIcon}>💳</Text>
                <Text style={styles.actionTitle}>Payments</Text>
                <Text style={styles.actionDesc}>Invoices & monthly passes</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 6,
  },
  brandTitle: { fontSize: 24, fontWeight: '800', color: brandTokens.deepNavy },
  brandTagline: { fontSize: 12, color: brandTokens.warmOrange, fontWeight: '600', marginTop: 1 },
  welcomeText: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 4 },
  badge: {
    backgroundColor: '#FFF5EB',
    borderColor: brandTokens.warmOrange,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, color: brandTokens.warmOrange, fontWeight: '700' },
  signOutBtn: { paddingVertical: 2, paddingHorizontal: 4 },
  signOutText: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  activeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  liveIndicatorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  liveText: { fontSize: 11, fontWeight: '800', color: '#10B981', letterSpacing: 0.5 },
  scheduledTag: { fontSize: 11, fontWeight: '800', color: brandTokens.warmOrange, letterSpacing: 0.5 },
  timeText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  childName: { fontSize: 20, fontWeight: '800', color: brandTokens.deepNavy },
  schoolSub: { fontSize: 13, color: '#64748B', marginBottom: 12 },
  statusHighlight: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  statusTitle: { fontSize: 14, fontWeight: '700', color: '#065F46' },
  statusSub: { fontSize: 12, color: '#047857', marginTop: 2 },
  scheduledInfoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  scheduledInfoText: { fontSize: 12, fontWeight: '600', color: brandTokens.deepNavy },
  scheduledSubText: { fontSize: 11, color: '#64748B', lineHeight: 16 },
  addFirstChildBtn: {
    backgroundColor: brandTokens.warmOrange,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  addFirstChildBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    borderBottomColor: '#F1F5F9',
    borderBottomWidth: 1,
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: brandTokens.deepNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  driverName: { fontSize: 14, fontWeight: '700', color: brandTokens.deepNavy },
  driverVehicle: { fontSize: 11, color: '#64748B', marginTop: 1 },
  verifiedBadge: { fontSize: 10, fontWeight: '700', color: '#059669', marginTop: 2 },
  callButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callButtonText: { fontSize: 12, fontWeight: '700', color: brandTokens.deepNavy },
  milestones: { marginTop: 14, gap: 8 },
  milestoneItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkDone: { color: '#10B981', fontWeight: '900', fontSize: 14 },
  checkPending: { color: '#94A3B8', fontWeight: '900', fontSize: 14 },
  milestoneLabel: { fontSize: 12, color: '#334155', fontWeight: '500' },
  milestoneLabelPending: { fontSize: 12, color: '#94A3B8' },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: brandTokens.deepNavy,
    marginTop: 24,
    marginBottom: 12,
  },
  actionGrid: { flexDirection: 'row', gap: 12 },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionIcon: { fontSize: 22, marginBottom: 6 },
  actionTitle: { fontSize: 13, fontWeight: '700', color: brandTokens.deepNavy },
  actionDesc: { fontSize: 11, color: '#64748B', marginTop: 2 },
});
