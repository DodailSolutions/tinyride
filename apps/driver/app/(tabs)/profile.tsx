import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import { brandTokens } from '@tinyride/ui';
import {
  fetchDriverCompliance,
  reportDriverIncident,
  submitDriverDocument,
  DriverComplianceDetails,
  SEED_DRIVER_ID,
} from '@tinyride/api-client';
import { useAuth } from '../../src/context/AuthContext';
import { LoadingIndicator, ErrorBanner, StatusBadge } from '../../src/components/UIState';

export default function DriverProfileScreen() {
  const { user, signOut } = useAuth();
  const driverId = user?.id || SEED_DRIVER_ID;

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [compliance, setCompliance] = useState<DriverComplianceDetails | null>(null);

  // Incident Modal State
  const [incidentModalVisible, setIncidentModalVisible] = useState<boolean>(false);
  const [incidentCategory, setIncidentCategory] = useState<'DELAY' | 'VEHICLE_BREAKDOWN' | 'CHILD_UNWELL' | 'OTHER'>('DELAY');
  const [incidentDesc, setIncidentDesc] = useState<string>('');
  const [isSubmittingIncident, setIsSubmittingIncident] = useState<boolean>(false);

  // Document Upload Modal State
  const [docModalVisible, setDocModalVisible] = useState<boolean>(false);
  const [docType, setDocType] = useState<'DRIVING_LICENSE' | 'VEHICLE_FITNESS' | 'VEHICLE_INSURANCE' | 'POLICE_VERIFICATION'>('DRIVING_LICENSE');
  const [docNumber, setDocNumber] = useState<string>('');
  const [docExpiry, setDocExpiry] = useState<string>('2028-12-31');

  const loadCompliance = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchDriverCompliance(driverId);
      setCompliance(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch compliance profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [driverId]);

  useEffect(() => {
    loadCompliance();
  }, [loadCompliance]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCompliance();
  };

  const handleReportIncidentSubmit = async () => {
    if (!incidentDesc.trim()) {
      Alert.alert('Details Required', 'Please enter a brief description of the incident or delay.');
      return;
    }

    setIsSubmittingIncident(true);
    try {
      const severity = incidentCategory === 'VEHICLE_BREAKDOWN' ? 'HIGH' : 'MEDIUM';
      await reportDriverIncident(driverId, {
        category: incidentCategory,
        severity,
        description: incidentDesc.trim(),
        location: { latitude: 17.4521, longitude: 78.3619 },
      });

      setIncidentModalVisible(false);
      setIncidentDesc('');
      Alert.alert(
        'Incident Logged & Broadcast',
        'Dodail Operations desk alerted. Automated SMS notification queued for affected parents.'
      );
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to report incident');
    } finally {
      setIsSubmittingIncident(false);
    }
  };

  const handleSubmitDoc = async () => {
    if (!docNumber.trim()) {
      Alert.alert('Document Number Required', 'Please enter the certificate or license number.');
      return;
    }

    try {
      await submitDriverDocument(driverId, {
        document_type: docType,
        document_number: docNumber.trim(),
        storage_path: `kyc-documents/${driverId}/${docType.toLowerCase()}_${Date.now()}.pdf`,
        expiry_date: docExpiry,
        vehicle_id: compliance?.vehicle?.id,
      });

      setDocModalVisible(false);
      setDocNumber('');
      loadCompliance();
      Alert.alert(
        'Document Submitted for Audit',
        'Your document has been uploaded. An Operations Admin will verify it within 24 hours.'
      );
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to submit document');
    }
  };

  if (loading && !refreshing) {
    return <LoadingIndicator message="Fetching compliance and vehicle credentials..." />;
  }

  const driver = compliance?.driver;
  const profile = compliance?.profile;
  const vehicle = compliance?.vehicle;
  const documents = compliance?.documents || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F07832" />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Driver Compliance & Profile</Text>
          <Text style={styles.sub}>Dodail Verified Independent Partner Network</Text>
        </View>

        {error && <ErrorBanner message={error} onRetry={loadCompliance} />}

        {/* Profile Card */}
        {profile && driver && (
          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profile.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{profile.full_name}</Text>
                <Text style={styles.phone}>{profile.phone}</Text>
                <View style={styles.badgeRow}>
                  <StatusBadge status={driver.status} />
                </View>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{driver.experience_years} Yrs</Text>
                <Text style={styles.statLabel}>Experience</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{driver.rating_avg} ★</Text>
                <Text style={styles.statLabel}>Parent Rating</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{driver.total_trips}+</Text>
                <Text style={styles.statLabel}>Safe Trips</Text>
              </View>
            </View>
          </View>
        )}

        {/* Vehicle Card */}
        <Text style={styles.sectionHeading}>Approved Vehicle</Text>
        {vehicle ? (
          <View style={styles.vehicleCard}>
            <View style={styles.vehHeader}>
              <View>
                <Text style={styles.vehModel}>
                  {vehicle.make} {vehicle.model} ({vehicle.vehicle_type})
                </Text>
                <Text style={styles.vehReg}>Registration: {vehicle.registration_number}</Text>
              </View>
              <View style={styles.capBadge}>
                <Text style={styles.capText}>{vehicle.seating_capacity} Seats Max</Text>
              </View>
            </View>

            <View style={styles.vehMetaRow}>
              <Text style={styles.vehMeta}>Color: {vehicle.color}</Text>
              <Text style={styles.vehMeta}>Year: {vehicle.year}</Text>
              <StatusBadge status={vehicle.status} />
            </View>
          </View>
        ) : (
          <View style={styles.emptyVehBox}>
            <Text style={styles.emptyVehText}>No vehicle registered yet.</Text>
          </View>
        )}

        {/* KYC Compliance Documents Checklist */}
        <View style={styles.docHeaderRow}>
          <Text style={styles.sectionHeading}>Mandatory Compliance Documents</Text>
          <TouchableOpacity onPress={() => setDocModalVisible(true)}>
            <Text style={styles.addDocBtnText}>+ Upload New</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.docList}>
          {documents.map((doc) => (
            <View key={doc.id} style={styles.docItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.docName}>{doc.document_type.replace(/_/g, ' ')}</Text>
                {doc.document_number && (
                  <Text style={styles.docNumber}>No: {doc.document_number}</Text>
                )}
                {doc.expiry_date && (
                  <Text style={styles.docExp}>Exp: {doc.expiry_date}</Text>
                )}
              </View>
              <StatusBadge status={doc.status} />
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.incidentButton}
          onPress={() => setIncidentModalVisible(true)}
        >
          <Text style={styles.incidentText}>🚨 Report Delay or Vehicle Breakdown</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out of Driver Partner App</Text>
        </TouchableOpacity>

        {/* Incident Modal */}
        <Modal
          visible={incidentModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setIncidentModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>🚨 Report Delay / Incident</Text>
              <Text style={styles.modalSub}>
                Operations desk and parents will receive real-time notifications.
              </Text>

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryRow}>
                {(['DELAY', 'VEHICLE_BREAKDOWN', 'CHILD_UNWELL', 'OTHER'] as const).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catChip,
                      incidentCategory === cat && styles.catChipActive,
                    ]}
                    onPress={() => setIncidentCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        incidentCategory === cat && styles.catChipTextActive,
                      ]}
                    >
                      {cat.replace(/_/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Situation Description</Text>
              <TextInput
                style={styles.textArea}
                placeholder="e.g. Stuck in Hitec City traffic jam for 15 mins. All children safe."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={3}
                value={incidentDesc}
                onChangeText={setIncidentDesc}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  onPress={() => setIncidentModalVisible(false)}
                >
                  <Text style={styles.cancelModalBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.submitModalBtn}
                  onPress={handleReportIncidentSubmit}
                  disabled={isSubmittingIncident}
                >
                  <Text style={styles.submitModalBtnText}>
                    {isSubmittingIncident ? 'Broadcasting...' : 'Broadcast Alert'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Document Upload Modal */}
        <Modal
          visible={docModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setDocModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>📄 Upload Compliance Document</Text>
              <Text style={styles.modalSub}>
                Upload valid documents to maintain active verified status.
              </Text>

              <Text style={styles.inputLabel}>Document Type</Text>
              <View style={styles.categoryRow}>
                {(
                  [
                    'DRIVING_LICENSE',
                    'VEHICLE_FITNESS',
                    'VEHICLE_INSURANCE',
                    'POLICE_VERIFICATION',
                  ] as const
                ).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.catChip, docType === t && styles.catChipActive]}
                    onPress={() => setDocType(t)}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        docType === t && styles.catChipTextActive,
                      ]}
                    >
                      {t.replace(/_/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Document / Policy Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. TS0920200012345"
                placeholderTextColor="#64748B"
                value={docNumber}
                onChangeText={setDocNumber}
              />

              <Text style={styles.inputLabel}>Expiry Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2028-12-31"
                placeholderTextColor="#64748B"
                value={docExpiry}
                onChangeText={setDocExpiry}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  onPress={() => setDocModalVisible(false)}
                >
                  <Text style={styles.cancelModalBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.submitModalBtn} onPress={handleSubmitDoc}>
                  <Text style={styles.submitModalBtnText}>Submit for Review</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070D18' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  sub: { fontSize: 12, color: '#94A3B8', marginTop: 3 },
  profileCard: {
    backgroundColor: '#142B4A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    marginBottom: 20,
  },
  profileRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1E3A5F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: brandTokens.warmOrange, fontWeight: '800', fontSize: 18 },
  name: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  phone: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  badgeRow: { marginTop: 6 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E3A5F',
  },
  statBox: { alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  statLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  vehicleCard: {
    backgroundColor: '#142B4A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    marginBottom: 20,
  },
  vehHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vehModel: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  vehReg: { fontSize: 12, color: brandTokens.warmOrange, marginTop: 2, fontWeight: '700' },
  capBadge: { backgroundColor: '#1E3A5F', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  capText: { fontSize: 11, fontWeight: '700', color: '#E2E8F0' },
  vehMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E3A5F',
  },
  vehMeta: { fontSize: 12, color: '#94A3B8' },
  emptyVehBox: {
    backgroundColor: '#142B4A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyVehText: { color: '#94A3B8', fontSize: 13 },
  docHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addDocBtnText: { color: brandTokens.warmOrange, fontWeight: '700', fontSize: 12 },
  docList: { gap: 8, marginBottom: 24 },
  docItem: {
    backgroundColor: '#142B4A',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  docName: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', textTransform: 'capitalize' },
  docNumber: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  docExp: { fontSize: 10, color: '#6EE7B7', marginTop: 2 },
  incidentButton: {
    backgroundColor: '#7F1D1D',
    borderColor: '#991B1B',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  incidentText: { color: '#FCA5A5', fontWeight: '800', fontSize: 13 },
  signOutButton: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  signOutText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderColor: '#1E293B',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  modalSub: { fontSize: 12, color: '#94A3B8', marginTop: 4, marginBottom: 16 },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  catChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  catChipActive: { backgroundColor: brandTokens.warmOrange, borderColor: brandTokens.warmOrange },
  catChipText: { fontSize: 11, color: '#CBD5E1', fontWeight: '600' },
  catChipTextActive: { color: '#FFFFFF', fontWeight: '800' },
  textArea: {
    backgroundColor: '#070D18',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#FFFFFF',
    padding: 12,
    fontSize: 13,
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#070D18',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#FFFFFF',
    padding: 12,
    fontSize: 13,
    height: 46,
    marginBottom: 14,
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelModalBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelModalBtnText: { color: '#94A3B8', fontWeight: '700', fontSize: 13 },
  submitModalBtn: {
    flex: 2,
    backgroundColor: brandTokens.warmOrange,
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitModalBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
});
