import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { brandTokens, formatINR } from '@tinyride/ui';
import { fetchDriverEarnings, DriverEarningsSummary, SEED_DRIVER_ID } from '@tinyride/api-client';
import { useAuth } from '../../src/context/AuthContext';
import { LoadingIndicator, EmptyState, ErrorBanner, StatusBadge } from '../../src/components/UIState';

export default function DriverEarningsScreen() {
  const { user } = useAuth();
  const driverId = user?.id || SEED_DRIVER_ID;

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [earnings, setEarnings] = useState<DriverEarningsSummary | null>(null);

  const loadEarnings = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchDriverEarnings(driverId);
      setEarnings(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch earnings ledger');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [driverId]);

  useEffect(() => {
    loadEarnings();
  }, [loadEarnings]);

  const onRefresh = () => {
    setRefreshing(true);
    loadEarnings();
  };

  if (loading && !refreshing) {
    return <LoadingIndicator message="Calculating driver earnings ledger..." />;
  }

  const current = earnings?.currentMonth;
  const payouts = earnings?.payoutHistory || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F07832" />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Earnings & Payouts</Text>
          <Text style={styles.sub}>Direct NEFT bank transfers via Dodail Platform</Text>
        </View>

        {error && <ErrorBanner message={error} onRetry={loadEarnings} />}

        {/* Current Month Card */}
        {current && (
          <View style={styles.currentMonthCard}>
            <Text style={styles.cardHeader}>{current.period.toUpperCase()}</Text>
            <Text style={styles.currentNet}>{formatINR(current.netPayoutInr)}</Text>
            <Text style={styles.currentSub}>
              Estimated Net Payout ({current.activeChildrenCount} Active Children Subscribed)
            </Text>

            <View style={styles.feeBreakdown}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Gross Subscription Collections:</Text>
                <Text style={styles.breakdownVal}>{formatINR(current.grossEarningsInr)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Dodail Platform Fee (10%):</Text>
                <Text style={styles.breakdownFeeVal}>- {formatINR(current.platformFeeInr)}</Text>
              </View>
              <View style={[styles.breakdownRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Payable to Bank Account:</Text>
                <Text style={styles.totalVal}>{formatINR(current.netPayoutInr)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Payout Ledger */}
        <Text style={styles.sectionHeading}>Bank Transfer History</Text>

        {payouts.length === 0 ? (
          <EmptyState
            icon="💳"
            title="No Payout Records Yet"
            description="Completed monthly bank transfers will appear here along with bank reference numbers."
            actionLabel="Refresh Ledger"
            onAction={loadEarnings}
          />
        ) : (
          payouts.map((item) => (
            <View key={item.id} style={styles.payoutCard}>
              <View style={styles.payoutTop}>
                <View>
                  <Text style={styles.periodText}>
                    {item.period_start} to {item.period_end}
                  </Text>
                  <Text style={styles.tripsText}>
                    {item.total_trips_completed} School Trips Completed Safely
                  </Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <View style={styles.payoutBottom}>
                <View>
                  <Text style={styles.netVal}>{formatINR(item.net_payout_inr)}</Text>
                  {item.payout_reference && (
                    <Text style={styles.refText}>Ref: {item.payout_reference}</Text>
                  )}
                </View>
                {item.processed_at && (
                  <Text style={styles.dateText}>
                    {new Date(item.processed_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                )}
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
  header: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  sub: { fontSize: 12, color: '#94A3B8', marginTop: 3 },
  currentMonthCard: {
    backgroundColor: '#142B4A',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    marginBottom: 24,
  },
  cardHeader: { fontSize: 11, fontWeight: '800', color: brandTokens.warmOrange, letterSpacing: 0.5 },
  currentNet: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginTop: 6 },
  currentSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  feeBreakdown: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E3A5F',
    gap: 8,
  },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownLabel: { fontSize: 12, color: '#94A3B8' },
  breakdownVal: { fontSize: 12, color: '#E2E8F0', fontWeight: '600' },
  breakdownFeeVal: { fontSize: 12, color: '#F87171', fontWeight: '600' },
  totalRow: { marginTop: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#1E3A5F' },
  totalLabel: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  totalVal: { fontSize: 14, fontWeight: '800', color: '#10B981' },
  sectionHeading: {
    fontSize: 13,
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
  periodText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  tripsText: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
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
  refText: { fontSize: 10, color: '#64748B', fontFamily: 'monospace', marginTop: 2 },
  dateText: { fontSize: 11, color: '#94A3B8' },
});
