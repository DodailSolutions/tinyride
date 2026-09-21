import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { brandTokens } from '@tinyride/ui';
import { Booking, Payment } from '@tinyride/types';
import { fetchParentBookings, initiateBookingPayment } from '@tinyride/api-client';
import { useAuth } from '../../src/context/AuthContext';
import {
  LoadingIndicator,
  EmptyState,
  ErrorBanner,
  StatusBadge,
} from '../../src/components/UIState';

export default function SubscriptionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const parentId = user?.id || 'parent-demo-user-001';

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment Modal State
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);

  // Receipt Modal State
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState<Booking | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchParentBookings(parentId);
      setBookings(data);
    } catch {
      setError('Could not load booking subscriptions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [parentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePayNow = async () => {
    if (!payingBooking) return;
    setIsPaying(true);
    setPaymentError(null);

    try {
      const res = await initiateBookingPayment(parentId, {
        booking_id: payingBooking.id,
        amount_inr: payingBooking.fare_snapshot.total_amount_inr,
        payment_method: paymentMethod,
      });

      if (!res.success || !res.payment) {
        setPaymentError(res.error || 'Payment transaction could not be completed.');
        return;
      }

      setReceiptPayment(res.payment);
      setPayingBooking(null);
      // Reload bookings to show CONFIRMED status
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment error';
      setPaymentError(msg);
    } finally {
      setIsPaying(false);
    }
  };

  const activeBookings = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'ACTIVE');
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING_PAYMENT');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Bar */}
        <View style={styles.header}>
          <Text style={styles.title}>Bookings & Payments</Text>
          <Text style={styles.sub}>
            Monthly school transport subscriptions & payment receipts
          </Text>
        </View>

        {error && <ErrorBanner message={error} onRetry={loadData} />}

        {isLoading ? (
          <LoadingIndicator message="Fetching payment subscriptions..." />
        ) : bookings.length === 0 ? (
          <EmptyState
            icon="💳"
            title="No Bookings Yet"
            description="You have not reserved any school routes yet. Browse verified Hyderabad school routes to reserve a seat."
            actionLabel="Find a School Route"
            onAction={() => router.push('/(tabs)/routes')}
          />
        ) : (
          <>
            {/* Pending Payments Notice */}
            {pendingBookings.length > 0 && (
              <View style={styles.pendingSection}>
                <Text style={styles.sectionHeading}>⚠️ Action Required: Pending Payments</Text>
                {pendingBookings.map((booking) => (
                  <View key={booking.id} style={styles.pendingCard}>
                    <View style={styles.bookingTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.bookingId}>Booking #{booking.id.substring(0, 8)}</Text>
                        <Text style={styles.bookingDates}>
                          Commence: {booking.start_date} • Term: 1 Month
                        </Text>
                      </View>
                      <StatusBadge status={booking.status} />
                    </View>

                    <View style={styles.pendingBottom}>
                      <View>
                        <Text style={styles.fareDueLabel}>Amount Due:</Text>
                        <Text style={styles.fareDueVal}>
                          ₹{booking.fare_snapshot.total_amount_inr.toLocaleString('en-IN')}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.payNowButton}
                        onPress={() => setPayingBooking(booking)}
                      >
                        <Text style={styles.payNowButtonText}>Pay Now ➔</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Active Subscriptions Summary */}
            {activeBookings.length > 0 && (
              <View style={styles.activeCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.currentTag}>ACTIVE PASS</Text>
                  <Text style={styles.price}>
                    ₹{activeBookings[0]?.fare_snapshot.total_amount_inr.toLocaleString('en-IN')} / mo
                  </Text>
                </View>
                <Text style={styles.subTitle}>Confirmed School Transport Pass</Text>
                <Text style={styles.subDates}>
                  Valid from: {activeBookings[0]?.start_date} to {activeBookings[0]?.end_date}
                </Text>
                <Text style={styles.nextDate}>
                  Next Renewal: {activeBookings[0]?.end_date} (Auto-invoice 5 days prior)
                </Text>
              </View>
            )}

            {/* Booking History & Receipts */}
            <Text style={styles.sectionHeading}>Subscription Ledger</Text>
            {bookings.map((item) => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.monthText}>
                      Ref #{item.id.substring(0, 10)}
                    </Text>
                    <Text style={styles.childText}>
                      Start Date: {item.start_date} • End: {item.end_date}
                    </Text>
                  </View>
                  <StatusBadge status={item.status} />
                </View>

                <View style={styles.historyFooter}>
                  <View>
                    <Text style={styles.amountText}>
                      ₹{item.fare_snapshot.total_amount_inr.toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.methodText}>
                      Base: ₹{item.fare_snapshot.monthly_fee_inr} + GST: ₹{item.fare_snapshot.tax_inr}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.receiptButton}
                    onPress={() => setSelectedReceiptBooking(item)}
                  >
                    <Text style={styles.receiptButtonText}>Receipt 📄</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Pay Now Modal */}
      <Modal visible={!!payingBooking} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {payingBooking && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Complete Booking Payment</Text>
                <Text style={styles.modalSub}>
                  Razorpay Secure Payment Gateway (Escrow Account)
                </Text>

                {paymentError && <ErrorBanner message={paymentError} />}

                {/* Fare Summary */}
                <View style={styles.fareBreakdownBox}>
                  <Text style={styles.fareBreakdownTitle}>Invoice Summary</Text>
                  <View style={styles.fareRow}>
                    <Text style={styles.fareLabel}>Monthly Commute Fare</Text>
                    <Text style={styles.fareVal}>
                      ₹{payingBooking.fare_snapshot.monthly_fee_inr}
                    </Text>
                  </View>
                  <View style={styles.fareRow}>
                    <Text style={styles.fareLabel}>Platform Coordination Fee</Text>
                    <Text style={styles.fareVal}>
                      ₹{payingBooking.fare_snapshot.convenience_fee_inr}
                    </Text>
                  </View>
                  <View style={styles.fareRow}>
                    <Text style={styles.fareLabel}>GST (5%)</Text>
                    <Text style={styles.fareVal}>
                      ₹{payingBooking.fare_snapshot.tax_inr}
                    </Text>
                  </View>
                  <View style={[styles.fareRow, styles.fareTotalRow]}>
                    <Text style={styles.fareTotalLabel}>Total Amount Due</Text>
                    <Text style={styles.fareTotalVal}>
                      ₹{payingBooking.fare_snapshot.total_amount_inr.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                {/* Payment Method Selector */}
                <Text style={styles.methodSelectLabel}>Select Payment Method</Text>
                <View style={styles.methodList}>
                  {(
                    [
                      { id: 'UPI', label: 'UPI / Google Pay / PhonePe', icon: '📱' },
                      { id: 'CARD', label: 'Credit / Debit Card', icon: '💳' },
                      { id: 'NETBANKING', label: 'Net Banking (All Indian Banks)', icon: '🏦' },
                    ] as const
                  ).map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      style={[
                        styles.methodOption,
                        paymentMethod === m.id && styles.methodOptionSelected,
                      ]}
                      onPress={() => setPaymentMethod(m.id)}
                    >
                      <Text style={styles.methodIcon}>{m.icon}</Text>
                      <Text
                        style={[
                          styles.methodOptionText,
                          paymentMethod === m.id && styles.methodOptionTextSelected,
                        ]}
                      >
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setPayingBooking(null)}
                    disabled={isPaying}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveBtn, isPaying && styles.buttonDisabled]}
                    onPress={handlePayNow}
                    disabled={isPaying}
                  >
                    {isPaying ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.saveBtnText}>
                        Pay ₹{payingBooking.fare_snapshot.total_amount_inr.toLocaleString('en-IN')}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Payment Receipt / Success Modal */}
      <Modal
        visible={!!receiptPayment || !!selectedReceiptBooking}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.receiptHeader}>
                <Text style={styles.receiptStamp}>✓ PAYMENT CONFIRMED</Text>
                <Text style={styles.receiptTitle}>TinyRide by Dodail</Text>
                <Text style={styles.receiptSub}>Official Payment Receipt</Text>
              </View>

              <View style={styles.receiptBody}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptKey}>Transaction ID:</Text>
                  <Text style={styles.receiptVal}>
                    {receiptPayment?.razorpay_payment_id || 'pay_rzp_mock_12345'}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptKey}>Idempotency Ref:</Text>
                  <Text style={styles.receiptVal}>
                    {receiptPayment?.idempotency_key?.substring(0, 16) || 'pay-idemp-verified'}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptKey}>Payment Method:</Text>
                  <Text style={styles.receiptVal}>
                    {receiptPayment?.payment_method || 'UPI / NetBanking'}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptKey}>Payment Date:</Text>
                  <Text style={styles.receiptVal}>
                    {new Date().toLocaleDateString('en-IN')}
                  </Text>
                </View>
                <View style={[styles.receiptRow, styles.receiptTotalRow]}>
                  <Text style={styles.receiptTotalKey}>Amount Paid:</Text>
                  <Text style={styles.receiptTotalVal}>
                    ₹
                    {(
                      receiptPayment?.amount_inr ||
                      selectedReceiptBooking?.fare_snapshot.total_amount_inr ||
                      3350
                    ).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeReceiptBtn}
                onPress={() => {
                  setReceiptPayment(null);
                  setSelectedReceiptBooking(null);
                }}
              >
                <Text style={styles.closeReceiptBtnText}>Close Receipt</Text>
              </TouchableOpacity>
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
  header: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: brandTokens.deepNavy },
  sub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  pendingSection: { marginBottom: 20 },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: brandTokens.deepNavy,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  pendingCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 10,
  },
  bookingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bookingId: { fontSize: 14, fontWeight: '800', color: brandTokens.deepNavy },
  bookingDates: { fontSize: 11, color: '#64748B', marginTop: 2 },
  pendingBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#FEF3C7',
  },
  fareDueLabel: { fontSize: 10, color: '#64748B', textTransform: 'uppercase' },
  fareDueVal: { fontSize: 16, fontWeight: '800', color: brandTokens.warmOrange },
  payNowButton: {
    backgroundColor: brandTokens.warmOrange,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  payNowButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  activeCard: {
    backgroundColor: brandTokens.deepNavy,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  currentTag: { fontSize: 10, fontWeight: '800', color: brandTokens.warmOrange, letterSpacing: 0.5 },
  price: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  subTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginTop: 6 },
  subDates: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  nextDate: { fontSize: 11, color: '#CBD5E1', marginTop: 10, fontWeight: '500' },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  monthText: { fontSize: 14, fontWeight: '700', color: brandTokens.deepNavy },
  childText: { fontSize: 11, color: '#64748B', marginTop: 2 },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  amountText: { fontSize: 15, fontWeight: '800', color: brandTokens.deepNavy },
  methodText: { fontSize: 11, color: '#64748B', marginTop: 1 },
  receiptButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  receiptButtonText: { fontSize: 11, fontWeight: '600', color: brandTokens.deepNavy },
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
  modalSub: { fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: 14 },
  fareBreakdownBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  fareBreakdownTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: brandTokens.deepNavy,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 },
  fareLabel: { fontSize: 12, color: '#64748B' },
  fareVal: { fontSize: 12, color: '#1E293B', fontWeight: '600' },
  fareTotalRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  fareTotalLabel: { fontSize: 13, fontWeight: '800', color: brandTokens.deepNavy },
  fareTotalVal: { fontSize: 15, fontWeight: '800', color: brandTokens.warmOrange },
  methodSelectLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: brandTokens.deepNavy,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  methodList: { gap: 8, marginBottom: 16 },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  methodOptionSelected: {
    borderColor: brandTokens.warmOrange,
    backgroundColor: '#FFF7ED',
  },
  methodIcon: { fontSize: 18 },
  methodOptionText: { fontSize: 13, fontWeight: '600', color: brandTokens.deepNavy },
  methodOptionTextSelected: { color: brandTokens.warmOrange, fontWeight: '700' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
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
  receiptHeader: { alignItems: 'center', marginBottom: 16 },
  receiptStamp: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 1,
    marginBottom: 4,
  },
  receiptTitle: { fontSize: 20, fontWeight: '900', color: brandTokens.deepNavy },
  receiptSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  receiptBody: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between' },
  receiptKey: { fontSize: 12, color: '#64748B' },
  receiptVal: { fontSize: 12, fontWeight: '600', color: brandTokens.deepNavy },
  receiptTotalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  receiptTotalKey: { fontSize: 13, fontWeight: '800', color: brandTokens.deepNavy },
  receiptTotalVal: { fontSize: 16, fontWeight: '900', color: brandTokens.warmOrange },
  closeReceiptBtn: {
    backgroundColor: brandTokens.deepNavy,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 18,
  },
  closeReceiptBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});
