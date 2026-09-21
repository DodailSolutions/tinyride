import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { brandTokens } from '@tinyride/ui';

// ============================================================================
// 1. LOADING INDICATOR
// ============================================================================

export function LoadingIndicator({
  message = 'Loading details...',
}: {
  message?: string;
}) {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={brandTokens.warmOrange} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

// ============================================================================
// 2. EMPTY STATE
// ============================================================================

export function EmptyState({
  icon = '🎒',
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================================================
// 3. ERROR BANNER
// ============================================================================

export function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.errorTitle}>Action Failed</Text>
        <Text style={styles.errorMessage}>{message}</Text>
      </View>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================================================
// 4. STATUS BADGE
// ============================================================================

export function StatusBadge({ status }: { status: string }) {
  let badgeStyle = styles.badgeDefault;
  let textStyle = styles.badgeTextDefault;
  let label = status;

  switch (status) {
    case 'CONFIRMED':
    case 'ACTIVE':
    case 'CAPTURED':
    case 'VERIFIED':
      badgeStyle = styles.badgeSuccess;
      textStyle = styles.badgeTextSuccess;
      label = status === 'CAPTURED' ? 'PAID' : status;
      break;
    case 'PENDING_PAYMENT':
      badgeStyle = styles.badgeWarning;
      textStyle = styles.badgeTextWarning;
      label = 'PAYMENT DUE';
      break;
    case 'CANCELLED':
    case 'FAILED':
      badgeStyle = styles.badgeDanger;
      textStyle = styles.badgeTextDanger;
      break;
    default:
      break;
  }

  return (
    <View style={[styles.badgeBase, badgeStyle]}>
      <Text style={[styles.badgeTextBase, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: brandTokens.slate,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 12,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: brandTokens.deepNavy,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  actionButton: {
    backgroundColor: brandTokens.warmOrange,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 14,
    marginVertical: 10,
    gap: 10,
  },
  errorIcon: {
    fontSize: 20,
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
  },
  errorMessage: {
    fontSize: 11,
    color: '#B91C1C',
    marginTop: 1,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeBase: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeTextBase: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeSuccess: {
    backgroundColor: '#ECFDF5',
  },
  badgeTextSuccess: {
    color: '#047857',
  },
  badgeWarning: {
    backgroundColor: '#FFFBEB',
  },
  badgeTextWarning: {
    color: '#B45309',
  },
  badgeDanger: {
    backgroundColor: '#FEF2F2',
  },
  badgeTextDanger: {
    color: '#B91C1C',
  },
  badgeDefault: {
    backgroundColor: '#F1F5F9',
  },
  badgeTextDefault: {
    color: '#475569',
  },
});
