import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { brandTokens } from '@tinyride/ui';
import { phoneSchema, otpSchema } from '@tinyride/validation';
import { useAuth } from '../../src/context/AuthContext';
import { ErrorBanner } from '../../src/components/UIState';

export default function DriverLoginScreen() {
  const router = useRouter();
  const { requestPhoneOtp, verifyPhoneOtp, devDemoLogin, isLoading, error, clearError } =
    useAuth();

  const [phone, setPhone] = useState('9849011223');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    clearError();
    setValidationError(null);

    const cleanPhone = phone.trim();
    const formattedPhone = cleanPhone.startsWith('+91')
      ? cleanPhone
      : `+91${cleanPhone.replace(/^0+/, '')}`;

    const parsed = phoneSchema.safeParse(formattedPhone);
    if (!parsed.success) {
      setValidationError(parsed.error.errors[0]?.message || 'Invalid Indian mobile number');
      return;
    }

    const res = await requestPhoneOtp(formattedPhone);
    if (res.success) {
      setStep('OTP');
    }
  };

  const handleVerifyOtp = async () => {
    clearError();
    setValidationError(null);

    const parsed = otpSchema.safeParse(otp.trim());
    if (!parsed.success) {
      setValidationError('Enter valid 6-digit OTP code');
      return;
    }

    const formattedPhone = phone.trim().startsWith('+91')
      ? phone.trim()
      : `+91${phone.trim().replace(/^0+/, '')}`;

    const res = await verifyPhoneOtp(formattedPhone, otp.trim());
    if (res.success) {
      router.replace('/(tabs)');
    }
  };

  const handleDemoLogin = () => {
    devDemoLogin('Ramesh Goud', '+919849011223');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Brand Lockup */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>TR</Text>
            </View>
            <Text style={styles.brandTitle}>TinyRide Driver</Text>
            <Text style={styles.endorsement}>by Dodail</Text>
            <Text style={styles.tagline}>Little Rides. Big Peace of Mind.</Text>
          </View>

          {/* Card Container */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {step === 'PHONE' ? 'Driver Partner Login' : 'Verify Mobile OTP'}
            </Text>
            <Text style={styles.cardSub}>
              {step === 'PHONE'
                ? 'Enter your registered mobile number for two-tap trip execution and earnings'
                : `We sent a 6-digit verification code to +91 ${phone.replace('+91', '')}`}
            </Text>

            {/* Error Notifications */}
            {validationError && (
              <ErrorBanner message={validationError} onRetry={() => setValidationError(null)} />
            )}
            {error && <ErrorBanner message={error} onRetry={clearError} />}

            {step === 'PHONE' ? (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Mobile Number (India)</Text>
                <View style={styles.phoneInputRow}>
                  <View style={styles.countryCodeBox}>
                    <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="98490 11223"
                    placeholderTextColor="#64748B"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone.replace('+91', '')}
                    onChangeText={setPhone}
                    autoFocus
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, isLoading && styles.disabledButton]}
                  onPress={handleSendOtp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Get OTP Code</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formGroup}>
                <Text style={styles.label}>6-Digit Verification Code</Text>
                <TextInput
                  style={styles.otpInput}
                  placeholder="• • • • • •"
                  placeholderTextColor="#64748B"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                  autoFocus
                />

                <TouchableOpacity
                  style={[styles.primaryButton, isLoading && styles.disabledButton]}
                  onPress={handleVerifyOtp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Verify & Enter App</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    setStep('PHONE');
                    setOtp('');
                    clearError();
                  }}
                >
                  <Text style={styles.backButtonText}>← Change Mobile Number</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Dev Demo Fast Login */}
            <View style={styles.demoDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>DEVELOPMENT MODE</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.demoButton} onPress={handleDemoLogin}>
              <Text style={styles.demoButtonText}>⚡ Quick Login as Ramesh Goud (Driver Demo)</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070D18',
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#142B4A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: brandTokens.warmOrange,
    marginBottom: 12,
  },
  logoBadgeText: {
    color: brandTokens.warmOrange,
    fontWeight: '900',
    fontSize: 22,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  endorsement: {
    fontSize: 12,
    fontWeight: '700',
    color: brandTokens.warmOrange,
    letterSpacing: 1,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#142B4A',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1E3A5F',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cardSub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  formGroup: {
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    textTransform: 'uppercase',
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countryCodeBox: {
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#070D18',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
    height: 50,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  otpInput: {
    backgroundColor: '#070D18',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
    height: 52,
    fontSize: 22,
    fontWeight: '800',
    color: brandTokens.warmOrange,
    textAlign: 'center',
    letterSpacing: 6,
  },
  primaryButton: {
    backgroundColor: brandTokens.warmOrange,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  backButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  demoDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E3A5F',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
  },
  demoButton: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  demoButtonText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
});
