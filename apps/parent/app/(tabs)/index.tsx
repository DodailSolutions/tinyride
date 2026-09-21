import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { colors } from '@tinyride/ui';

export default function ParentHomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>TinyRide</Text>
            <Text style={styles.brandTagline}>Little Rides. Big Peace of Mind.</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Hyderabad Pilot</Text>
          </View>
        </View>

        {/* Active Child Trip Card */}
        <View style={styles.activeCard}>
          <View style={styles.cardHeader}>
            <View style={styles.liveIndicatorRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>ACTIVE MORNING TRIP</Text>
            </View>
            <Text style={styles.timeText}>08:10 AM</Text>
          </View>

          <Text style={styles.childName}>Aarav Sharma</Text>
          <Text style={styles.schoolSub}>Delhi Public School (DPS) Gachibowli</Text>

          {/* Status highlight */}
          <View style={styles.statusHighlight}>
            <Text style={styles.statusTitle}>Safely Picked Up at Home Gate</Text>
            <Text style={styles.statusSub}>En route to DPS Campus • ETA 6 mins</Text>
          </View>

          {/* Driver details */}
          <View style={styles.driverRow}>
            <View style={styles.driverAvatar}>
              <Text style={styles.avatarText}>RG</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.driverName}>Ramesh Goud</Text>
              <Text style={styles.driverVehicle}>Bajaj Auto (Yellow-Black) • TS09UA1234</Text>
              <Text style={styles.verifiedBadge}>✓ Police & Transport Verified</Text>
            </View>
            <TouchableOpacity style={styles.callButton}>
              <Text style={styles.callButtonText}>📞 Call</Text>
            </TouchableOpacity>
          </View>

          {/* Milestone checklist */}
          <View style={styles.milestones}>
            <View style={styles.milestoneItem}>
              <Text style={styles.checkDone}>✓</Text>
              <Text style={styles.milestoneLabel}>Trip Started (07:32 AM)</Text>
            </View>
            <View style={styles.milestoneItem}>
              <Text style={styles.checkDone}>✓</Text>
              <Text style={styles.milestoneLabel}>Aarav Picked Up (07:36 AM)</Text>
            </View>
            <View style={styles.milestoneItem}>
              <Text style={styles.checkPending}>○</Text>
              <Text style={styles.milestoneLabelPending}>School Drop-off (Est. 08:16 AM)</Text>
            </View>
          </View>
        </View>

        {/* Quick Action Shortcuts */}
        <Text style={styles.sectionHeading}>Daily Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>✋</Text>
            <Text style={styles.actionTitle}>Mark Absent</Text>
            <Text style={styles.actionDesc}>Notify driver before 07:00 AM</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>🛡️</Text>
            <Text style={styles.actionTitle}>Emergency</Text>
            <Text style={styles.actionDesc}>Dodail 24/7 Operations Desk</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#142B4A',
  },
  brandTagline: {
    fontSize: 12,
    color: '#F07832',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#FFF5EB',
    borderColor: '#F07832',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    color: '#F07832',
    fontWeight: '700',
  },
  activeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  childName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#142B4A',
  },
  schoolSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  statusHighlight: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
  },
  statusSub: {
    fontSize: 12,
    color: '#047857',
    marginTop: 2,
  },
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
    backgroundColor: '#142B4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#142B4A',
  },
  driverVehicle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  verifiedBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    marginTop: 2,
  },
  callButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#142B4A',
  },
  milestones: {
    marginTop: 14,
    gap: 8,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkDone: {
    color: '#10B981',
    fontWeight: '900',
    fontSize: 14,
  },
  checkPending: {
    color: '#94A3B8',
    fontWeight: '900',
    fontSize: 14,
  },
  milestoneLabel: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  milestoneLabelPending: {
    fontSize: 12,
    color: '#94A3B8',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#142B4A',
    marginTop: 24,
    marginBottom: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#142B4A',
  },
  actionDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
