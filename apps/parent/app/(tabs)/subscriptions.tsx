import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

const PAYMENTS_HISTORY = [
  {
    id: 'pay-01',
    month: 'September 2026',
    child: 'Aarav Sharma (DPS Gachibowli)',
    amount: 3200,
    status: 'PAID',
    date: '01 Sep 2026',
    method: 'UPI (Google Pay)',
    orderId: 'order_RZP1029384756',
  },
  {
    id: 'pay-02',
    month: 'August 2026',
    child: 'Aarav Sharma (DPS Gachibowli)',
    amount: 3200,
    status: 'PAID',
    date: '01 Aug 2026',
    method: 'UPI (PhonePe)',
    orderId: 'order_RZP0928374655',
  },
];

export default function SubscriptionsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Payments & Billing</Text>
          <Text style={styles.sub}>Monthly transport subscriptions & receipts</Text>
        </View>

        {/* Current Active Subscription */}
        <View style={styles.currentCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.currentTag}>ACTIVE SUBSCRIPTION</Text>
            <Text style={styles.price}>₹3,200/mo</Text>
          </View>
          <Text style={styles.subTitle}>DPS Gachibowli — Kondapur Route</Text>
          <Text style={styles.subDates}>Current Cycle: 01 Sep 2026 – 30 Sep 2026</Text>
          <Text style={styles.nextDate}>Next Renewal: 01 Oct 2026 (Auto-invoice on 25 Sep)</Text>
        </View>

        {/* Invoices List */}
        <Text style={styles.sectionTitle}>Payment Receipts</Text>

        {PAYMENTS_HISTORY.map((item) => (
          <View key={item.id} style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <div>
                <Text style={styles.monthText}>{item.month}</Text>
                <Text style={styles.childText}>{item.child}</Text>
              </div>
              <View style={styles.badgePaid}>
                <Text style={styles.badgePaidText}>✓ {item.status}</Text>
              </View>
            </View>

            <View style={styles.historyFooter}>
              <View>
                <Text style={styles.amountText}>₹{item.amount.toLocaleString('en-IN')}</Text>
                <Text style={styles.methodText}>{item.method} • {item.date}</Text>
              </View>
              <TouchableOpacity style={styles.receiptButton}>
                <Text style={styles.receiptButtonText}>Receipt</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F1E36' },
  sub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  currentCard: {
    backgroundColor: '#0F1E36',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  currentTag: { fontSize: 10, fontWeight: '800', color: '#FF6B00', letterSpacing: 0.5 },
  price: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  subTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginTop: 6 },
  subDates: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  nextDate: { fontSize: 11, color: '#CBD5E1', marginTop: 10, fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F1E36', marginBottom: 12 },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  monthText: { fontSize: 14, fontWeight: '700', color: '#0F1E36' },
  childText: { fontSize: 12, color: '#64748B', marginTop: 1 },
  badgePaid: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgePaidText: { fontSize: 11, fontWeight: '700', color: '#047857' },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  amountText: { fontSize: 15, fontWeight: '800', color: '#0F1E36' },
  methodText: { fontSize: 11, color: '#64748B', marginTop: 1 },
  receiptButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  receiptButtonText: { fontSize: 11, fontWeight: '600', color: '#0F1E36' },
});
