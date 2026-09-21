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
import { RootStackParamList } from '../../types';
import { FontText, CustomInput, CustomButton, Header } from '../../component';
import { normalize, wp, hp } from '../../styles/responsiveScreen';
import { useAppTheme } from '../../hooks/useTheme';
import { SvgIcons } from '../../assets';
import { SCREENS } from '../../constant/screens';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const colors = useAppTheme();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const validate = () => {
    const newErrors: {
      email?: string;
      password?: string;
    } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    setErrors({});

    const { error } = await signIn(email, password);

    setLoading(false);

    if (error) {
      setErrors({
        general: error,
      });
      return;
    }
  };

  return (
    <View style={styles.safeArea}>
      <Header
        showBack={false}
        containerStyle={{ backgroundColor: colors.white }}
        onBackPress={() => navigation.goBack()}
      />
      <View style={{ alignItems: 'center',marginBottom: hp(3) }}>
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
            onChangeText={text => {
              setEmail(text);
              if (errors.email || errors.general) {
                setErrors({});
              }
            }}
            placeholder="hello@knowly.app"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <CustomInput
            label="Password"
            value={password}
            onChangeText={text => {
              setPassword(text);
              if (errors.password || errors.general) {
                setErrors({});
              }
            }}
            placeholder="Enter your password"
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
          />

          <TouchableOpacity
            style={styles.forgotWrap}
            onPress={() => navigation.navigate(SCREENS.FORGOTPASSWORD)}
          >
            <FontText
              name="medium"
              size={normalize(13)}
              pureColor={colors.link}
            >
              Forgot password?
            </FontText>
          </TouchableOpacity>

          {errors.general ? (
            <View style={styles.generalError}>
              <FontText size={normalize(12)} pureColor={colors.error || 'red'}>
                {errors.general}
              </FontText>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton
            title="Log In"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
            rightIcon={<SvgIcons.arrow color={colors.white} />}
          />

          <View style={styles.subFooter}>
            <FontText size={normalize(13)} pureColor={colors.placeholder}>
              Don't have an account?
            </FontText>

            <TouchableOpacity
              onPress={() => navigation.navigate(SCREENS.SIGNUP)}
            >
              <FontText
                name="bold"
                size={normalize(13)}
                pureColor={colors.link}
              >
                Sign Up
              </FontText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },

  flex: {
    flex: 1,
  },

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

  generalError: {
    marginTop: hp(0.5),
    marginBottom: hp(1),
  },

  loginBtn: {
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
