import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { FontText, CustomButton, Header, OTPInput } from '../../component';
import { normalize, wp, hp } from '../../styles/responsiveScreen';
import { useAppTheme } from '../../hooks/useTheme';
import { SvgIcons } from '../../assets';
import { SCREENS } from '../../constant/screens';

type Props = NativeStackScreenProps<RootStackParamList, 'OTP'>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;

const OTPScreen: React.FC<Props> = ({ navigation, route }) => {
  const colors = useAppTheme();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = () => {
    setSecondsLeft(RESEND_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleVerify = () => {
    if (code.length < OTP_LENGTH) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate(SCREENS.SETNEWPASSWORD, {
        email: route.params.email,
      });
    }, 1200);
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;
    setCode('');
    startTimer();
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.white }]}>
      <Header
        showBack
        containerStyle={{ backgroundColor: colors.white }}
        onBackPress={() => navigation.goBack()}
      />
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
          Enter verification code
        </FontText>
        <FontText
          name="regular"
          size={normalize(14)}
          pureColor={colors.placeholder}
          pBottom={hp(4)}
        >
          We sent a 6-digit code to your email.
        </FontText>

        <OTPInput
          length={OTP_LENGTH}
          value={code}
          onChangeText={setCode}
          containerStyle={styles.otpWrap}
        />

        <View style={styles.resendRow}>
          <FontText size={normalize(13)} pureColor={colors.placeholder}>
            Didn't receive code?{' '}
          </FontText>
          <TouchableOpacity onPress={handleResend} disabled={secondsLeft > 0}>
            <FontText
              name="bold"
              size={normalize(13)}
              pureColor={secondsLeft > 0 ? colors.placeholder : colors.link}
            >
              {secondsLeft > 0
                ? `Resend in ${formatTime(secondsLeft)}`
                : 'Resend code'}
            </FontText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="Verify Code"
          onPress={handleVerify}
          loading={loading}
          disabled={code.length < OTP_LENGTH}
          style={styles.verifyBtn}
          rightIcon={<SvgIcons.arrow color={colors.white} />}
        />

        <View style={styles.subFooter}>
          <FontText
            size={normalize(12)}
            pureColor={colors.placeholder}
            textAlign="center"
          >
            Check your spam folder if it isn't there.
          </FontText>
        </View>
      </View>
    </View>
  );
};

export default OTPScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: wp(6),
    paddingTop: hp(2),
    paddingBottom: hp(2),
  },
  otpWrap: { marginBottom: hp(3) },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(3),
  },
  verifyBtn: { marginBottom: hp(2) },
  footer: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(2),
  },
  subFooter: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(2),
  },
});
