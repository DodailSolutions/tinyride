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

export default function LoginScreen() {
  const router = useRouter();
  const { requestPhoneOtp, verifyPhoneOtp, devDemoLogin, isLoading, error, clearError } =
    useAuth();

  const [phone, setPhone] = useState('9849012345');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    clearError();
    setValidationError(null);

    // Format phone to E.164
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
    devDemoLogin('Ananya Sharma', '+919849012345');
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
            <Text style={styles.brandTitle}>TinyRide</Text>
            <Text style={styles.endorsement}>by Dodail</Text>
            <Text style={styles.tagline}>Little Rides. Big Peace of Mind.</Text>
          </View>

          {/* Card Container */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {step === 'PHONE' ? 'Parent Sign In / Register' : 'Verify Mobile OTP'}
            </Text>
            <Text style={styles.cardSub}>
              {step === 'PHONE'
                ? 'Enter your 10-digit mobile number to access school commute coordination'
                : `Enter the 6-digit verification code sent to +91 ${phone}`}
            </Text>

            {(validationError || error) && (
              <ErrorBanner
                message={validationError || error || ''}
                onRetry={() => {
                  setValidationError(null);
                  clearError();
                }}
              />
            )}

            {step === 'PHONE' ? (
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Indian Mobile Number</Text>
                <View style={styles.phoneInputRow}>
                  <View style={styles.prefixBox}>
                    <Text style={styles.prefixText}>🇮🇳 +91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="98490 12345"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={(t) => {
                      setPhone(t);
                      setValidationError(null);
                    }}
                    editable={!isLoading}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                  onPress={handleSendOtp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Get Verification OTP ➔</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>6-Digit OTP Code</Text>
                <TextInput
                  style={styles.otpInput}
                  placeholder="123456"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={(t) => {
                    setOtp(t);
                    setValidationError(null);
                  }}
                  editable={!isLoading}
                />

                <TouchableOpacity
                  style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                  onPress={handleVerifyOtp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Verify & Proceed ➔</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    setStep('PHONE');
                    setOtp('');
                  }}
                >
                  <Text style={styles.backButtonText}>← Edit Mobile Number</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Quick Demo Parent Bypass */}
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>DEVELOPMENT TESTING</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity style={styles.demoButton} onPress={handleDemoLogin}>
              <Text style={styles.demoButtonText}>⚡ Fast Demo Parent Login (Hyderabad)</Text>
              <Text style={styles.demoButtonSub}>Ananya Sharma • +91 98490 12345</Text>
            </TouchableOpacity>
          </View>

          {/* Safety & Compliance Notice */}
          <Text style={styles.safetyDisclaimer}>
            TinyRide connects parents with verified school auto & van drivers in Hyderabad. All
            drivers undergo police and transport department KYC audit before route assignment.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: brandTokens.deepNavy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoBadgeText: {
    color: brandTokens.warmOrange,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: brandTokens.deepNavy,
  },
  endorsement: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: -2,
  },
  tagline: {
    fontSize: 13,
    color: brandTokens.warmOrange,
    fontWeight: '700',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: brandTokens.deepNavy,
  },
  cardSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  formGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: brandTokens.deepNavy,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  prefixBox: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  prefixText: {
    fontSize: 14,
    fontWeight: '700',
    color: brandTokens.deepNavy,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
    color: brandTokens.deepNavy,
    backgroundColor: '#FFFFFF',
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 20,
    fontWeight: '800',
    color: brandTokens.deepNavy,
    textAlign: 'center',
    letterSpacing: 8,
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: brandTokens.warmOrange,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  backButtonText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 8,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  demoButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  demoButtonText: {
    color: brandTokens.deepNavy,
    fontSize: 13,
    fontWeight: '800',
  },
  demoButtonSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  safetyDisclaimer: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
    paddingHorizontal: 12,
  },
});
