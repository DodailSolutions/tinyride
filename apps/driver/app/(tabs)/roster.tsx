import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

const PASSENGERS = [
  {
    id: 'c-1',
    name: 'Aarav Sharma',
    grade: '3rd Standard',
    school: 'DPS Gachibowli',
    stop: 'Kondapur RTO Cross (Opp. HP Petrol Pump)',
    parent: 'Ananya Sharma',
    phone: '+91 98490 88776',
    specialNotes: 'Child carries blue backpack with asthma inhaler in side pocket.',
  },
  {
    id: 'c-2',
    name: 'Ananya Rao',
    grade: '4th Standard',
    school: 'DPS Gachibowli',
    stop: 'Chirec Avenue (Near Gate 2)',
    parent: 'Srinivas Rao',
    phone: '+91 98490 55443',
    specialNotes: 'Handover only to mother or grandfather.',
  },
  {
    id: 'c-3',
    name: 'Siddharth M',
    grade: '2nd Standard',
    school: 'DPS Gachibowli',
    stop: 'Botanical Garden Main Gate',
    parent: 'Madhavan V',
    phone: '+91 98490 44332',
    specialNotes: null,
  },
  {
    id: 'c-4',
    name: 'Rohan Verma',
    grade: '5th Standard',
    school: 'DPS Gachibowli',
    stop: 'Botanical Garden Main Gate',
    parent: 'Rajesh Verma',
    phone: '+91 98490 33221',
    specialNotes: null,
  },
];

export default function DriverRosterScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Assigned Passengers</Text>
          <Text style={styles.sub}>DPS Gachibowli Morning & Afternoon Roster</Text>
        </View>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            🔒 PRIVACY PROTECTED: Displaying only students assigned to Auto TS09UA1234.
          </Text>
        </View>

        {PASSENGERS.map((p) => (
          <View key={p.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{p.name.substring(0, 2).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{p.name}</Text>
                <Text style={styles.grade}>{p.grade} • {p.school}</Text>
              </View>
            </View>

            <View style={styles.details}>
              <Text style={styles.detailLabel}>Pickup Landmark:</Text>
              <Text style={styles.detailVal}>📍 {p.stop}</Text>
            </View>

            {p.specialNotes && (
              <View style={styles.specialNotesBox}>
                <Text style={styles.notesLabel}>Special Care Instruction:</Text>
                <Text style={styles.notesVal}>ℹ️ {p.specialNotes}</Text>
              </View>
            )}

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.parentLabel}>Primary Guardian:</Text>
                <Text style={styles.parentName}>{p.parent}</Text>
              </View>
              <TouchableOpacity style={styles.callBtn}>
                <Text style={styles.callBtnText}>📞 {p.phone}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070D18' },
  scrollContent: { padding: 20 },
  header: { marginBottom: 14 },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  sub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  noticeBox: {
    backgroundColor: '#0F1E36',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1B2F4E',
    marginBottom: 16,
  },
  noticeText: { fontSize: 11, color: '#93C5FD', fontWeight: '600' },
  card: {
    backgroundColor: '#0F1E36',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1B2F4E',
    marginBottom: 14,
  },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1B2F4E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FF6B00', fontWeight: '800', fontSize: 14 },
  name: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  grade: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  details: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#1B2F4E' },
  detailLabel: { fontSize: 10, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
  detailVal: { fontSize: 12, color: '#E2E8F0', marginTop: 2 },
  specialNotesBox: {
    backgroundColor: '#1B2F4E',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  notesLabel: { fontSize: 10, fontWeight: '700', color: '#F59E0B', textTransform: 'uppercase' },
  notesVal: { fontSize: 11, color: '#FDE68A', marginTop: 2 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1B2F4E',
  },
  parentLabel: { fontSize: 10, color: '#64748B' },
  parentName: { fontSize: 12, color: '#FFFFFF', fontWeight: '700' },
  callBtn: { backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  callBtnText: { color: '#FF6B00', fontWeight: '700', fontSize: 11 },
});
