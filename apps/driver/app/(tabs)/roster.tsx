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
  RefreshControl,
} from 'react-native';
import { brandTokens } from '@tinyride/ui';
import {
  fetchDriverRoster,
  fetchDriverDailySchedule,
  RosterPassenger,
  DriverDailySchedule,
  SEED_DRIVER_ID,
} from '@tinyride/api-client';
import { useAuth } from '../../src/context/AuthContext';
import { LoadingIndicator, EmptyState, ErrorBanner } from '../../src/components/UIState';

export default function DriverRosterScreen() {
  const { user } = useAuth();
  const driverId = user?.id || SEED_DRIVER_ID;

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'ROSTER' | 'SCHEDULE'>('ROSTER');
  const [routeName, setRouteName] = useState<string>('');
  const [schoolName, setSchoolName] = useState<string>('');
  const [passengers, setPassengers] = useState<RosterPassenger[]>([]);
  const [dailySchedule, setDailySchedule] = useState<DriverDailySchedule | null>(null);

  const loadRoster = useCallback(async () => {
    try {
      setError(null);
      const [rosterRes, scheduleRes] = await Promise.all([
        fetchDriverRoster(driverId),
        fetchDriverDailySchedule(driverId),
      ]);
      setRouteName(rosterRes.routeName);
      setSchoolName(rosterRes.schoolName);
      setPassengers(rosterRes.passengers);
      setDailySchedule(scheduleRes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch passenger roster');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [driverId]);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRoster();
  };

  const handleCallParent = (phone: string, parentName: string) => {
    const url = `tel:${phone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Phone Call', `Dial ${parentName} directly at ${phone}`);
        }
      })
      .catch(() => {
        Alert.alert('Phone Call', `Dial ${parentName} directly at ${phone}`);
      });
  };

  if (loading && !refreshing) {
    return <LoadingIndicator message="Fetching assigned passenger roster..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F07832" />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Passengers & Schedules</Text>
          <Text style={styles.sub}>{schoolName || 'DPS Gachibowli'} • {routeName || 'Morning & Afternoon'}</Text>
        </View>

        {/* View Mode Segmented Controls */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, viewMode === 'ROSTER' && styles.tabBtnActive]}
            onPress={() => setViewMode('ROSTER')}
          >
            <Text style={[styles.tabBtnText, viewMode === 'ROSTER' && styles.tabBtnTextActive]}>
              Assigned Students ({passengers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, viewMode === 'SCHEDULE' && styles.tabBtnActive]}
            onPress={() => setViewMode('SCHEDULE')}
          >
            <Text style={[styles.tabBtnText, viewMode === 'SCHEDULE' && styles.tabBtnTextActive]}>
              Daily Shift Timetable
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            🔒 PRIVACY PROTECTED: Displaying authorized students assigned to your verified vehicle.
          </Text>
        </View>

        {error && <ErrorBanner message={error} onRetry={loadRoster} />}

        {viewMode === 'ROSTER' ? (
          passengers.length === 0 ? (
            <EmptyState
              icon="🎒"
              title="No Students Assigned Yet"
              description="When parents book seats on your route and bookings are confirmed, their stop schedule will appear here."
              actionLabel="Refresh Roster"
              onAction={loadRoster}
            />
          ) : (
            passengers.map((p, index) => (
              <View key={p.childId} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{p.name.substring(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{p.name}</Text>
                    <Text style={styles.grade}>{p.grade} • Stop #{index + 1}</Text>
                  </View>
                </View>

                <View style={styles.details}>
                  <Text style={styles.detailLabel}>Pickup Landmark & Time:</Text>
                  <Text style={styles.detailVal}>📍 {p.stopName} (⏰ {p.pickupTime})</Text>
                </View>

                {p.specialInstructions && (
                  <View style={styles.specialNotesBox}>
                    <Text style={styles.notesLabel}>Special Care Instruction:</Text>
                    <Text style={styles.notesVal}>ℹ️ {p.specialInstructions}</Text>
                  </View>
                )}

                {p.medicalNotes && (
                  <View style={styles.medicalBox}>
                    <Text style={styles.medicalLabel}>Medical / Health Alert:</Text>
                    <Text style={styles.medicalVal}>🩺 {p.medicalNotes}</Text>
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.parentLabel}>Primary Guardian:</Text>
                    <Text style={styles.parentName}>{p.parentName}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => handleCallParent(p.parentPhone, p.parentName)}
                  >
                    <Text style={styles.callBtnText}>📞 Call {p.parentPhone}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )
        ) : (
          /* Daily Shift Schedule Timeline */
          <View style={styles.timelineArea}>
            {/* Morning Shift */}
            <View style={styles.shiftHeaderCard}>
              <View style={styles.shiftBadgeRow}>
                <View style={styles.morningBadge}>
                  <Text style={styles.morningBadgeText}>MORNING COMMUTE</Text>
                </View>
                <Text style={styles.shiftSummaryTime}>
                  Starts {dailySchedule?.morningShift.startTime} ➔ School Bell {dailySchedule?.morningShift.schoolArrivalTime}
                </Text>
              </View>
            </View>

            {dailySchedule?.morningShift.stops.map((stop) => (
              <View key={`m-${stop.stopSequence}`} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <View style={styles.timelineTop}>
                    <Text style={styles.timelineTime}>⏰ {stop.scheduledTime}</Text>
                    <Text style={styles.timelineSeq}>Stop #{stop.stopSequence}</Text>
                  </View>
                  <Text style={styles.timelineStopName}>{stop.stopName}</Text>
                  <Text style={styles.timelineStudents}>
                    Students Boarding: {stop.studentNames.join(', ')}
                  </Text>
                </View>
              </View>
            ))}

            <View style={styles.schoolGateCard}>
              <Text style={styles.schoolGateText}>
                🏫 08:15 AM — School Gate Arrival & Student Handover ({dailySchedule?.morningShift.schoolName})
              </Text>
            </View>

            {/* Afternoon Shift */}
            <View style={[styles.shiftHeaderCard, { marginTop: 24 }]}>
              <View style={styles.shiftBadgeRow}>
                <View style={styles.afternoonBadge}>
                  <Text style={styles.afternoonBadgeText}>AFTERNOON COMMUTE</Text>
                </View>
                <Text style={styles.shiftSummaryTime}>
                  Departs Gate {dailySchedule?.afternoonShift.schoolPickupTime} ➔ Final Drop {dailySchedule?.afternoonShift.endTime}
                </Text>
              </View>
            </View>

            {dailySchedule?.afternoonShift.stops.map((stop) => (
              <View key={`a-${stop.stopSequence}`} style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: '#38BDF8' }]} />
                <View style={styles.timelineContent}>
                  <View style={styles.timelineTop}>
                    <Text style={styles.timelineTime}>⏰ {stop.scheduledTime}</Text>
                    <Text style={styles.timelineSeq}>Stop #{stop.stopSequence}</Text>
                  </View>
                  <Text style={styles.timelineStopName}>{stop.stopName}</Text>
                  <Text style={styles.timelineStudents}>
                    Students Dropping: {stop.studentNames.join(', ')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070D18' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 14 },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  sub: { fontSize: 12, color: brandTokens.warmOrange, marginTop: 3, fontWeight: '600' },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: brandTokens.warmOrange,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  noticeBox: {
    backgroundColor: '#142B4A',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    marginBottom: 16,
  },
  noticeText: { fontSize: 11, color: '#93C5FD', fontWeight: '600', lineHeight: 16 },
  card: {
    backgroundColor: '#142B4A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    marginBottom: 14,
  },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E3A5F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: brandTokens.warmOrange, fontWeight: '800', fontSize: 14 },
  name: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  grade: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  details: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#1E3A5F' },
  detailLabel: { fontSize: 10, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
  detailVal: { fontSize: 12, color: '#E2E8F0', marginTop: 2, fontWeight: '600' },
  specialNotesBox: {
    backgroundColor: '#1E3A5F',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  notesLabel: { fontSize: 10, fontWeight: '700', color: '#F59E0B', textTransform: 'uppercase' },
  notesVal: { fontSize: 11, color: '#FDE68A', marginTop: 2 },
  medicalBox: {
    backgroundColor: '#450A0A',
    borderWidth: 1,
    borderColor: '#7F1D1D',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  medicalLabel: { fontSize: 10, fontWeight: '700', color: '#F87171', textTransform: 'uppercase' },
  medicalVal: { fontSize: 11, color: '#FECACA', marginTop: 2 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E3A5F',
  },
  parentLabel: { fontSize: 10, color: '#64748B' },
  parentName: { fontSize: 12, color: '#FFFFFF', fontWeight: '700' },
  callBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  callBtnText: { color: brandTokens.warmOrange, fontWeight: '700', fontSize: 11 },
  timelineArea: { gap: 8, marginBottom: 20 },
  shiftHeaderCard: {
    backgroundColor: '#142B4A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    marginBottom: 6,
  },
  shiftBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  morningBadge: { backgroundColor: '#064E3B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  morningBadgeText: { fontSize: 10, fontWeight: '800', color: '#6EE7B7' },
  afternoonBadge: { backgroundColor: '#1E3A8A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  afternoonBadgeText: { fontSize: 10, fontWeight: '800', color: '#93C5FD' },
  shiftSummaryTime: { fontSize: 11, fontWeight: '700', color: '#CBD5E1' },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: '#142B4A',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E3A5F',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    marginTop: 4,
  },
  timelineContent: { flex: 1 },
  timelineTop: { flexDirection: 'row', justifyContent: 'space-between' },
  timelineTime: { fontSize: 12, fontWeight: '800', color: brandTokens.warmOrange },
  timelineSeq: { fontSize: 10, fontWeight: '700', color: '#94A3B8' },
  timelineStopName: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', marginTop: 2 },
  timelineStudents: { fontSize: 11, color: '#CBD5E1', marginTop: 3 },
  schoolGateCard: {
    backgroundColor: '#064E3B',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#047857',
    marginTop: 4,
  },
  schoolGateText: { fontSize: 12, fontWeight: '800', color: '#E2E8F0', textAlign: 'center' },
});
