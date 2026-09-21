import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { brandTokens } from '@tinyride/ui';
import { childSchema } from '@tinyride/validation';
import { Child, School } from '@tinyride/types';
import { fetchChildren, fetchSchools, createChild, deleteChild } from '@tinyride/api-client';
import { useAuth } from '../../src/context/AuthContext';
import { LoadingIndicator, EmptyState, ErrorBanner } from '../../src/components/UIState';

// Quick Hyderabad locality presets
const HYDERABAD_LOCALITIES = [
  'Kondapur, Hyderabad',
  'Khajaguda, Gachibowli',
  'Madhapur, Hitec City',
  'Jubilee Hills, Road No. 36',
  'Manikonda, Puppalguda',
];

export default function ChildrenScreen() {
  const { user } = useAuth();
  const parentId = user?.id || 'parent-demo-user-001';

  const [children, setChildren] = useState<Child[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('2017-06-15');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [grade, setGrade] = useState('');
  const [section, setSection] = useState('A');
  const [pickupAddress, setPickupAddress] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedChildren, fetchedSchools] = await Promise.all([
        fetchChildren(parentId),
        fetchSchools(),
      ]);
      setChildren(fetchedChildren);
      setSchools(fetchedSchools);
      if (fetchedSchools.length > 0 && !selectedSchoolId) {
        setSelectedSchoolId(fetchedSchools[0]?.id || '');
      }
    } catch (err) {
      setError('Could not load children profiles. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [parentId, selectedSchoolId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddChild = async () => {
    setFormError(null);

    const effectiveSchoolId = selectedSchoolId || schools[0]?.id || '';
    if (!firstName.trim() || !lastName.trim() || !grade.trim()) {
      setFormError('Please fill in child first name, last name, and grade/class');
      return;
    }

    const payload = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      date_of_birth: dob.trim(),
      gender,
      school_id: effectiveSchoolId,
      grade: grade.trim(),
      section: section.trim() || undefined,
      home_pickup_location: {
        latitude: 17.4645,
        longitude: 78.3582,
        address: pickupAddress.trim() || 'Kondapur, Hyderabad',
      },
      home_drop_location: {
        latitude: 17.4645,
        longitude: 78.3582,
        address: pickupAddress.trim() || 'Kondapur, Hyderabad',
      },
    };

    const validation = childSchema.safeParse(payload);
    if (!validation.success) {
      setFormError(validation.error.errors[0]?.message || 'Validation error');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createChild(parentId, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        date_of_birth: dob.trim(),
        gender,
        school_id: effectiveSchoolId,
        grade: grade.trim(),
        section: section.trim() || undefined,
        home_pickup_address: pickupAddress.trim() || 'Kondapur, Hyderabad',
        authorized_guardians: guardianName.trim()
          ? [
              {
                name: guardianName.trim(),
                relationship: 'Primary Guardian',
                phone: guardianPhone.trim() || '+919849012345',
              },
            ]
          : [{ name: 'Self (Primary Parent)', relationship: 'Parent', phone: user?.phone || '+919849012345' }],
      });

      setChildren((prev) => [created, ...prev]);
      setModalVisible(false);

      // Reset form
      setFirstName('');
      setLastName('');
      setGrade('');
      setPickupAddress('');
      setGuardianName('');
      setGuardianPhone('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register child profile';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChild = (childId: string, childName: string) => {
    Alert.alert(
      'Remove Child Registration',
      `Are you sure you want to remove ${childName}'s school profile? This will not cancel active paid bookings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteChild(childId, parentId);
            setChildren((prev) => prev.filter((c) => c.id !== childId));
          },
        },
      ]
    );
  };

  const getSchoolName = (schoolId: string) => {
    const s = schools.find((sc) => sc.id === schoolId);
    return s ? `${s.name} (${s.branch_name})` : 'Hyderabad Pilot Partner School';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Child Profiles</Text>
            <Text style={styles.sub}>Manage school transport registrations</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>+ Add Child</Text>
          </TouchableOpacity>
        </View>

        {error && <ErrorBanner message={error} onRetry={loadData} />}

        {isLoading ? (
          <LoadingIndicator message="Fetching registered children..." />
        ) : children.length === 0 ? (
          <EmptyState
            icon="🎒"
            title="No Children Registered Yet"
            description="Add your child's profile and school to explore verified auto & van transport routes in Hyderabad."
            actionLabel="+ Register Your First Child"
            onAction={() => setModalVisible(true)}
          />
        ) : (
          children.map((child) => (
            <View key={child.id} style={styles.childCard}>
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {child.first_name.substring(0, 1)}
                    {child.last_name.substring(0, 1)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>
                    {child.first_name} {child.last_name}
                  </Text>
                  <Text style={styles.grade}>
                    {child.grade} {child.section ? `• Section ${child.section}` : ''}
                  </Text>
                  <Text style={styles.school}>🏫 {getSchoolName(child.school_id)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() =>
                    handleDeleteChild(child.id, `${child.first_name} ${child.last_name}`)
                  }
                >
                  <Text style={styles.deleteButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionLabel}>Home Pickup Location:</Text>
                <Text style={styles.sectionValue}>
                  📍 {child.home_pickup_location?.address || 'Hyderabad, Telangana'}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionLabel}>Authorized Pickup Guardians:</Text>
                {child.authorized_guardians && child.authorized_guardians.length > 0 ? (
                  child.authorized_guardians.map((g, i) => (
                    <Text key={i} style={styles.guardianBadge}>
                      🛡️ {g.name} ({g.relationship}) • {g.phone}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.guardianBadge}>🛡️ Primary Registered Parent Only</Text>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Child Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Register Child Profile</Text>
              <Text style={styles.modalSub}>
                Information is verified with the driver for safe daily boarding
              </Text>

              {formError && <ErrorBanner message={formError} />}

              {/* Name Row */}
              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>First Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Aarav"
                    placeholderTextColor="#94A3B8"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Last Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Sharma"
                    placeholderTextColor="#94A3B8"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>

              {/* DOB & Gender */}
              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Date of Birth (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2017-06-15"
                    placeholderTextColor="#94A3B8"
                    value={dob}
                    onChangeText={setDob}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Gender</Text>
                  <View style={styles.genderRow}>
                    {(['MALE', 'FEMALE'] as const).map((g) => (
                      <TouchableOpacity
                        key={g}
                        style={[styles.genderChip, gender === g && styles.genderChipSelected]}
                        onPress={() => setGender(g)}
                      >
                        <Text
                          style={[
                            styles.genderChipText,
                            gender === g && styles.genderChipTextSelected,
                          ]}
                        >
                          {g === 'MALE' ? 'Boy' : 'Girl'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* School Selector */}
              <Text style={styles.inputLabel}>School in Hyderabad *</Text>
              <View style={styles.schoolSelectorContainer}>
                {schools.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.schoolOption,
                      selectedSchoolId === s.id && styles.schoolOptionSelected,
                    ]}
                    onPress={() => setSelectedSchoolId(s.id)}
                  >
                    <Text
                      style={[
                        styles.schoolOptionName,
                        selectedSchoolId === s.id && styles.schoolOptionNameSelected,
                      ]}
                    >
                      {s.name}
                    </Text>
                    <Text style={styles.schoolOptionBranch}>{s.branch_name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Grade & Section */}
              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Grade / Class *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 3rd Standard"
                    placeholderTextColor="#94A3B8"
                    value={grade}
                    onChangeText={setGrade}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Section</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. B"
                    placeholderTextColor="#94A3B8"
                    value={section}
                    onChangeText={setSection}
                  />
                </View>
              </View>

              {/* Home Pickup Address */}
              <Text style={styles.inputLabel}>Home Pickup Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="Flat / House No., Society / Street Name"
                placeholderTextColor="#94A3B8"
                value={pickupAddress}
                onChangeText={setPickupAddress}
              />

              {/* Quick Preset Chips */}
              <View style={styles.chipRow}>
                {HYDERABAD_LOCALITIES.map((loc, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.presetChip}
                    onPress={() => setPickupAddress(loc)}
                  >
                    <Text style={styles.presetChipText}>{loc.split(',')[0]}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Authorized Guardian */}
              <Text style={styles.inputLabel}>Authorized Guardian (Optional)</Text>
              <View style={styles.formRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Guardian Name"
                  placeholderTextColor="#94A3B8"
                  value={guardianName}
                  onChangeText={setGuardianName}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Phone Number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={guardianPhone}
                  onChangeText={setGuardianPhone}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setModalVisible(false);
                    setFormError(null);
                  }}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, isSubmitting && styles.buttonDisabled]}
                  onPress={handleAddChild}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Child Profile</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: '800', color: brandTokens.deepNavy },
  sub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  addButton: {
    backgroundColor: brandTokens.warmOrange,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  childCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: brandTokens.deepNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  name: { fontSize: 16, fontWeight: '800', color: brandTokens.deepNavy },
  grade: { fontSize: 12, color: '#64748B', marginTop: 1 },
  school: { fontSize: 12, color: '#047857', fontWeight: '600', marginTop: 3 },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '700',
  },
  detailSection: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
  sectionValue: { fontSize: 12, color: '#1E293B', marginTop: 2 },
  guardianBadge: { fontSize: 12, color: brandTokens.deepNavy, marginTop: 2, fontWeight: '500' },
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
  modalSub: { fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: 16 },
  formRow: { flexDirection: 'row', gap: 12 },
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
  genderRow: { flexDirection: 'row', gap: 6, marginTop: 2 },
  genderChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  genderChipSelected: {
    backgroundColor: brandTokens.deepNavy,
    borderColor: brandTokens.deepNavy,
  },
  genderChipText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  genderChipTextSelected: { color: '#FFFFFF' },
  schoolSelectorContainer: { gap: 6, marginVertical: 4 },
  schoolOption: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  schoolOptionSelected: {
    borderColor: brandTokens.warmOrange,
    backgroundColor: '#FFF7ED',
  },
  schoolOptionName: { fontSize: 13, fontWeight: '700', color: brandTokens.deepNavy },
  schoolOptionNameSelected: { color: brandTokens.warmOrange },
  schoolOptionBranch: { fontSize: 11, color: '#64748B', marginTop: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  presetChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  presetChipText: { fontSize: 11, color: '#475569', fontWeight: '500' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 22 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  cancelBtnText: { color: '#64748B', fontWeight: '600', fontSize: 13 },
  saveBtn: {
    backgroundColor: brandTokens.warmOrange,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});
