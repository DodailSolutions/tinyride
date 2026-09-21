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
import { fetchDriverRoster, RosterPassenger, SEED_DRIVER_ID } from '@tinyride/api-client';
import { useAuth } from '../../src/context/AuthContext';
import { LoadingIndicator, EmptyState, ErrorBanner } from '../../src/components/UIState';

export default function DriverRosterScreen() {
  const { user } = useAuth();
  const driverId = user?.id || SEED_DRIVER_ID;

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [routeName, setRouteName] = useState<string>('');
  const [schoolName, setSchoolName] = useState<string>('');
  const [passengers, setPassengers] = useState<RosterPassenger[]>([]);

  const loadRoster = useCallback(async () => {
    try {
      setError(null);
      const res = await fetchDriverRoster(driverId);
      setRouteName(res.routeName);
      setSchoolName(res.schoolName);
      setPassengers(res.passengers);
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
          <Text style={styles.title}>Assigned Passengers</Text>
          <Text style={styles.sub}>{schoolName || 'DPS Gachibowli'} • {routeName || 'Morning & Afternoon Roster'}</Text>
        </View>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            🔒 PRIVACY PROTECTED: Displaying authorized students assigned to your verified vehicle.
          </Text>
        </View>

        {error && <ErrorBanner message={error} onRetry={loadRoster} />}

        {passengers.length === 0 ? (
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
});
