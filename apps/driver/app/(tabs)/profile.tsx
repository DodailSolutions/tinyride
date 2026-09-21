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

export default function DriverProfileScreen() {
  const handleReportIncident = () => {
    Alert.alert(
      'Report Safety Incident / Delay',
      'Select category to immediately notify Dodail Operations and affected parents:',
      [
        {
          text: 'Traffic Delay (10+ mins)',
          onPress: () => Alert.alert('Logged', 'Parents notified of delay. Drive safely.'),
        },
        {
          text: 'Vehicle Breakdown',
          onPress: () =>
            Alert.alert(
              'Emergency Dispatch Alerted',
              'Operations team dispatched backup auto from Gachibowli hub.'
            ),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Driver Compliance & Profile</Text>
          <Text style={styles.sub}>Dodail Verified Independent Partner</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>RG</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>Ramesh Goud</Text>
              <Text style={styles.phone}>+91 98490 11223</Text>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ DODIAL VERIFIED DRIVER</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>8 Yrs</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>4.9 ★</Text>
              <Text style={styles.statLabel}>Parent Rating</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>340+</Text>
              <Text style={styles.statLabel}>Safe Trips</Text>
            </View>
          </View>
        </View>

        {/* Vehicle Card */}
        <Text style={styles.sectionHeading}>Approved Vehicle</Text>
        <View style={styles.vehicleCard}>
          <View style={styles.vehHeader}>
            <div>
              <Text style={styles.vehModel}>Bajaj Compact RE (Auto)</Text>
              <Text style={styles.vehReg}>Registration: TS09UA1234</Text>
            </div>
            <View style={styles.capBadge}>
              <Text style={styles.capText}>4 Seats Max</Text>
            </View>
          </View>

          <View style={styles.docList}>
            <View style={styles.docItem}>
              <Text style={styles.docName}>Commercial Transport DL</Text>
              <Text style={styles.docExp}>Exp: 15 Oct 2028 (Valid)</Text>
            </View>
            <View style={styles.docItem}>
              <Text style={styles.docName}>Telangana Fitness (FC)</Text>
              <Text style={styles.docExp}>Exp: 30 Jun 2027 (Valid)</Text>
            </View>
            <View style={styles.docItem}>
              <Text style={styles.docName}>Third-Party Insurance</Text>
              <Text style={styles.docExp}>Exp: 12 May 2027 (Valid)</Text>
            </View>
            <View style={styles.docItem}>
              <Text style={styles.docName}>Police Verification (PCC)</Text>
              <Text style={styles.docExp}>Cyberabad Commissionerate (Clear)</Text>
            </View>
          </View>
        </View>

        {/* Emergency Incident Button */}
        <TouchableOpacity style={styles.incidentButton} onPress={handleReportIncident}>
          <Text style={styles.incidentText}>🚨 Report Delay or Vehicle Breakdown</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070D18' },
  scrollContent: { padding: 20 },
  header: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  sub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  profileCard: {
    backgroundColor: '#0F1E36',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1B2F4E',
    marginBottom: 20,
  },
  profileRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1B2F4E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FF6B00', fontWeight: '800', fontSize: 18 },
  name: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  phone: { fontSize: 12, color: '#94A3B8', marginTop: 1 },
  verifiedBadge: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  verifiedText: { fontSize: 10, fontWeight: '800', color: '#6EE7B7' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1B2F4E',
  },
  statBox: { alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  statLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  vehicleCard: {
    backgroundColor: '#0F1E36',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1B2F4E',
    marginBottom: 20,
  },
  vehHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vehModel: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  vehReg: { fontSize: 12, color: '#FF6B00', marginTop: 2, fontWeight: '600' },
  capBadge: { backgroundColor: '#1B2F4E', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  capText: { fontSize: 11, fontWeight: '700', color: '#E2E8F0' },
  docList: { marginTop: 12, gap: 8 },
  docItem: {
    backgroundColor: '#1B2F4E',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  docName: { fontSize: 11, fontWeight: '700', color: '#E2E8F0' },
  docExp: { fontSize: 10, color: '#6EE7B7', fontWeight: '600' },
  incidentButton: {
    backgroundColor: '#7F1D1D',
    borderColor: '#991B1B',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  incidentText: { color: '#FCA5A5', fontWeight: '800', fontSize: 13 },
});
