import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../types';
import { FontText, CustomInput, CustomButton, Header } from '../../component';
import { normalize, wp, hp } from '../../styles/responsiveScreen';
import { useAppTheme } from '../../hooks/useTheme';
import { SvgIcons } from '../../assets';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const colors = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

  return (
    <View style={[styles.safeArea]}>
      <Header
        showBack={false}
        containerStyle={{ backgroundColor: colors.white }}
        onBackPress={() => navigation.goBack()}
      />
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
            Welcome back
          </FontText>
          <FontText
            name="regular"
            size={normalize(14)}
            pureColor={colors.placeholder}
            pBottom={hp(3)}
          >
            Log in to continue your daily discovery.
          </FontText>

          <CustomInput
            label="Email address"
            value={email}
            onChangeText={setEmail}
            placeholder="hello@knowly.app"
            keyboardType="email-address"
          />

          <CustomInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />

          <TouchableOpacity style={styles.forgotWrap} onPress={() => {}}>
            <FontText
              name="medium"
              size={normalize(13)}
              pureColor={colors.link}
            >
              Forgot password?
            </FontText>
          </TouchableOpacity>

          <CustomButton
            title="Log In"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
            rightIcon={<SvgIcons.arrow color={colors.white} />}
          />

          {/* <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, {backgroundColor: colors.separator}]} />
            <FontText size={normalize(12)} pureColor={colors.placeholder} pLeft={wp(3)} pRight={wp(3)}>
              Or continue with
            </FontText>
            <View style={[styles.dividerLine, {backgroundColor: colors.separator}]} />
          </View>

          <View style={styles.socialRow}>
            <CustomButton title="Google" variant="social" onPress={() => {}} icon={<SvgIcons.google height={normalize(24)} width={normalize(24)} />} style={styles.socialBtnSpacing} />
            <CustomButton title="Apple" variant="social" onPress={() => {}} icon={<SvgIcons.apple height={normalize(24)} width={normalize(24)} />} />
          </View> */}
        </ScrollView>

        <View style={styles.footer}>
          <FontText size={normalize(13)} pureColor={colors.placeholder}>
            Don't have an account?{' '}
          </FontText>
          <TouchableOpacity onPress={() => {}}>
            <FontText name="bold" size={normalize(13)} pureColor={colors.link}>
              Sign Up
            </FontText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: wp(6),
    paddingTop: hp(2),
    paddingBottom: hp(2),
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginBottom: hp(3),
    marginTop: hp(0.5),
  },
  loginBtn: { marginBottom: hp(3) },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(3),
  },
  dividerLine: { flex: 1, height: 1 },
  socialRow: { flexDirection: 'row', alignItems: 'center' },
  socialBtnSpacing: { marginRight: wp(3) },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: hp(2),
  },
});
