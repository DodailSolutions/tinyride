import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';

const PAYOUTS = [
  {
    id: 'pay-aug',
    period: '01 Aug 2026 – 31 Aug 2026',
    trips: 44,
    gross: 12800,
    platformFee: 1280,
    net: 11520,
    status: 'TRANSFERRED',
    ref: 'NEFT-SBI-9918273645',
    date: '02 Sep 2026',
  },
  {
    id: 'pay-jul',
    period: '01 Jul 2026 – 31 Jul 2026',
    trips: 44,
    gross: 12800,
    platformFee: 1280,
    net: 11520,
    status: 'TRANSFERRED',
    ref: 'NEFT-SBI-8817263544',
    date: '02 Aug 2026',
  },
];

export default function DriverEarningsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Earnings & Payouts</Text>
          <Text style={styles.sub}>Direct bank transfers via Dodail Platform</Text>
        </View>

        {/* Current Month Card */}
        <View style={styles.currentMonthCard}>
          <Text style={styles.cardHeader}>CURRENT MONTH (SEP 2026)</Text>
          <Text style={styles.currentNet}>₹11,520</Text>
          <Text style={styles.currentSub}>Estimated Net Payout (4 Active Children)</Text>

          <View style={styles.feeBreakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Gross Subscription Collections:</Text>
              <Text style={styles.breakdownVal}>₹12,800</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Dodail Platform Fee (10%):</Text>
              <Text style={styles.breakdownVal}>- ₹1,280</Text>
            </View>
            <View style={[styles.breakdownRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Payable to Bank Account:</Text>
              <Text style={styles.totalVal}>₹11,520</Text>
            </View>
          </View>
        </View>

        {/* Payout Ledger */}
        <Text style={styles.sectionHeading}>Bank Transfer History</Text>

        {PAYOUTS.map((item) => (
          <View key={item.id} style={styles.payoutCard}>
            <View style={styles.payoutTop}>
              <View>
                <Text style={styles.periodText}>{item.period}</Text>
                <Text style={styles.tripsText}>{item.trips} Trips Completed Safely</Text>
              </View>
              <View style={styles.badgeSuccess}>
                <Text style={styles.badgeText}>✓ {item.status}</Text>
              </View>
            </View>

            <View style={styles.payoutBottom}>
              <View>
                <Text style={styles.netVal}>₹{item.net.toLocaleString('en-IN')}</Text>
                <Text style={styles.refText}>Ref: {item.ref}</Text>
              </View>
              <Text style={styles.dateText}>{item.date}</Text>
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
  header: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  sub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  currentMonthCard: {
    backgroundColor: '#142B4A',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    marginBottom: 24,
  },
  cardHeader: { fontSize: 11, fontWeight: '800', color: '#F07832', letterSpacing: 0.5 },
  currentNet: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginTop: 6 },
  currentSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  feeBreakdown: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1E3A5F', gap: 6 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownLabel: { fontSize: 12, color: '#94A3B8' },
  breakdownVal: { fontSize: 12, color: '#E2E8F0', fontWeight: '600' },
  totalRow: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#1E3A5F' },
  totalLabel: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  totalVal: { fontSize: 13, fontWeight: '800', color: '#10B981' },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  payoutCard: {
    backgroundColor: '#142B4A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    marginBottom: 12,
  },
  payoutTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  periodText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  tripsText: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  badgeSuccess: { backgroundColor: '#064E3B', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#6EE7B7' },
  payoutBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E3A5F',
  },
  netVal: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  refText: { fontSize: 10, color: '#64748B', fontFamily: 'monospace', marginTop: 1 },
  dateText: { fontSize: 11, color: '#94A3B8' },
});
