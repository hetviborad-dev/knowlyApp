import React, { useState } from 'react';

import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../types';

import { FontText, CustomInput, CustomButton, Header } from '../../component';

import { normalize, wp, hp } from '../../styles/responsiveScreen';

import { useAppTheme } from '../../hooks/useTheme';

import { SvgIcons } from '../../assets';

import { SCREENS } from '../../constant/screens';

import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const colors = useAppTheme();

  const { sendPasswordResetOtp } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email');
      return false;
    }

    setError('');

    return true;
  };

  const handleSendOtp = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);

    const { error: resetError } = await sendPasswordResetOtp(email);

    setLoading(false);

    if (resetError) {
      console.error('Send password reset OTP error:', resetError);

      Alert.alert('Could not send OTP', resetError);

      return;
    }

    navigation.navigate(SCREENS.OTP, {
      email: email.trim().toLowerCase(),
    });
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.white,
        },
      ]}
    >
      <Header
        showBack={false}
        containerStyle={{
          backgroundColor: colors.white,
        }}
      />
      <View style={{ alignItems: 'center', marginBottom: hp(3) }}>
        <SvgIcons.logo height={hp(10)} width={hp(10)} />
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FontText
            name="bold"
            size={normalize(28)}
            color="black2"
            pBottom={hp(1)}
          >
            Reset password
          </FontText>

          <FontText
            name="regular"
            size={normalize(14)}
            pureColor={colors.placeholder}
            lineHeightFactor={1.4}
            pBottom={hp(3)}
          >
            Enter your registered email address and we'll send a 6-digit
            verification code.
          </FontText>

          <CustomInput
            label="Email address"
            value={email}
            onChangeText={text => {
              setEmail(text);

              if (error) {
                setError('');
              }
            }}
            placeholder="you@example.com"
            keyboardType="email-address"
            error={error}
          />
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton
            title="Send OTP Code"
            onPress={handleSendOtp}
            loading={loading}
            style={styles.sendBtn}
            rightIcon={<SvgIcons.arrow color={colors.white} />}
          />

          <View style={styles.subFooter}>
            <FontText size={normalize(13)} pureColor={colors.placeholder}>
              Remembered it?
            </FontText>

            <TouchableOpacity
              onPress={() => navigation.navigate(SCREENS.LOGIN)}
            >
              <FontText
                name="bold"
                size={normalize(13)}
                pureColor={colors.link}
              >
                Log In
              </FontText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: wp(6),
    paddingTop: hp(2),
    paddingBottom: hp(2),
  },

  sendBtn: {
    marginBottom: hp(2),
  },

  footer: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(2),
  },

  subFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: hp(2),
  },
});
