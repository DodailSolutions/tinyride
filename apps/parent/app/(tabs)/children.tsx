import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
} from 'react-native';

interface ChildProfile {
  id: string;
  name: string;
  grade: string;
  schoolName: string;
  pickupAddress: string;
  guardians: string[];
}

const INITIAL_CHILDREN: ChildProfile[] = [
  {
    id: 'ch-01',
    name: 'Aarav Sharma',
    grade: '3rd Standard (Section B)',
    schoolName: 'Delhi Public School (DPS) Gachibowli',
    pickupAddress: 'Flat 402, Rainbow Vistas, Green Hills Rd, Moosapet/Kondapur',
    guardians: ['Ananya Sharma (Mother)', 'Rohit Sharma (Father)'],
  },
];

export default function ChildrenScreen() {
  const [children, setChildren] = useState<ChildProfile[]>(INITIAL_CHILDREN);
  const [modalVisible, setModalVisible] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [grade, setGrade] = useState('');
  const [school, setSchool] = useState('Delhi Public School (DPS) Gachibowli');
  const [address, setAddress] = useState('');

  const handleAddChild = () => {
    if (!firstName.trim() || !grade.trim()) return;
    const newChild: ChildProfile = {
      id: `ch-${Date.now()}`,
      name: `${firstName} ${lastName}`.trim(),
      grade,
      schoolName: school,
      pickupAddress: address || 'Hyderabad, Telangana',
      guardians: ['Self (Primary Parent)'],
    };
    setChildren([...children, newChild]);
    setModalVisible(false);
    setFirstName('');
    setLastName('');
    setGrade('');
    setAddress('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Child Profiles</Text>
            <Text style={styles.sub}>Manage school transport registrations</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>+ Add Child</Text>
          </TouchableOpacity>
        </View>

        {children.map((child) => (
          <View key={child.id} style={styles.childCard}>
            <View style={styles.cardTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{child.name.substring(0, 2).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{child.name}</Text>
                <Text style={styles.grade}>{child.grade}</Text>
                <Text style={styles.school}>🏫 {child.schoolName}</Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionLabel}>Home Pickup Location:</Text>
              <Text style={styles.sectionValue}>📍 {child.pickupAddress}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionLabel}>Authorized Pickup Guardians:</Text>
              {child.guardians.map((g, i) => (
                <Text key={i} style={styles.guardianBadge}>
                  🛡️ {g}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Child Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Register Child Profile</Text>

            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Diya"
              value={firstName}
              onChangeText={setFirstName}
            />

            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Sharma"
              value={lastName}
              onChangeText={setLastName}
            />

            <Text style={styles.inputLabel}>Grade / Class</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 4th Standard"
              value={grade}
              onChangeText={setGrade}
            />

            <Text style={styles.inputLabel}>Home Pickup Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Apartment, Street, Landmark"
              value={address}
              onChangeText={setAddress}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddChild}>
                <Text style={styles.saveBtnText}>Save Child Profile</Text>
              </TouchableOpacity>
            </View>
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
  title: { fontSize: 22, fontWeight: '800', color: '#142B4A' },
  sub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  addButton: {
    backgroundColor: '#F07832',
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
    backgroundColor: '#142B4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  name: { fontSize: 16, fontWeight: '800', color: '#142B4A' },
  grade: { fontSize: 12, color: '#64748B', marginTop: 1 },
  school: { fontSize: 12, color: '#047857', fontWeight: '600', marginTop: 3 },
  detailSection: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
  sectionValue: { fontSize: 12, color: '#1E293B', marginTop: 2 },
  guardianBadge: { fontSize: 12, color: '#142B4A', marginTop: 2, fontWeight: '500' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 43, 74, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#142B4A', marginBottom: 14 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#334155', marginTop: 8, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 18 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  cancelBtnText: { color: '#64748B', fontWeight: '600', fontSize: 13 },
  saveBtn: { backgroundColor: '#142B4A', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});
