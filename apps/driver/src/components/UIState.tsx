import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { brandTokens } from '@tinyride/ui';

export function LoadingIndicator({ message = 'Loading details...' }: { message?: string }) {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={brandTokens.warmOrange} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

export function EmptyState({
  icon = '📋',
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

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
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

export function StatusBadge({ status }: { status: string }) {
  let badgeStyle = styles.badgeDefault;
  let textStyle = styles.badgeTextDefault;
  let label = status;

  switch (status) {
    case 'VERIFIED':
    case 'COMPLETED':
    case 'TRANSFERRED':
    case 'ACTIVE':
      badgeStyle = styles.badgeSuccess;
      textStyle = styles.badgeTextSuccess;
      break;
    case 'UNDER_REVIEW':
    case 'IN_PROGRESS':
    case 'PENDING':
      badgeStyle = styles.badgeWarning;
      textStyle = styles.badgeTextWarning;
      break;
    case 'REJECTED':
    case 'CANCELLED':
    case 'ABSENT':
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
    backgroundColor: '#070D18',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  emptyContainer: {
    padding: 28,
    alignItems: 'center',
    backgroundColor: '#142B4A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    marginVertical: 12,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 12,
    color: '#94A3B8',
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
    backgroundColor: '#450A0A',
    borderWidth: 1,
    borderColor: '#7F1D1D',
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
    color: '#FCA5A5',
  },
  errorMessage: {
    fontSize: 11,
    color: '#FECACA',
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
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeTextBase: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeSuccess: {
    backgroundColor: '#064E3B',
  },
  badgeTextSuccess: {
    color: '#6EE7B7',
  },
  badgeWarning: {
    backgroundColor: '#451A03',
  },
  badgeTextWarning: {
    color: '#FDE68A',
  },
  badgeDanger: {
    backgroundColor: '#881337',
  },
  badgeTextDanger: {
    color: '#FDA4AF',
  },
  badgeDefault: {
    backgroundColor: '#1E293B',
  },
  badgeTextDefault: {
    color: '#94A3B8',
  },
});
