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

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

const CreateAccountScreen: React.FC<Props> = ({ navigation }) => {
  const colors = useAppTheme();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const validate = () => {
    const newErrors: {
      fullName?: string;
      email?: string;
      password?: string;
    } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/\d/.test(password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAccount = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    setErrors({});

    const { error } = await signUp(fullName, email, password);

    setLoading(false);

    if (error) {
      setErrors({
        general: error,
      });
      return;
    }

    
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.white }]}>
      <Header
        showBack
        containerStyle={{
          backgroundColor: colors.white,
        }}
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
            Create account
          </FontText>

          <FontText
            name="regular"
            size={normalize(14)}
            pureColor={colors.placeholder}
            pBottom={hp(3)}
          >
            Start discovering fun facts every single day.
          </FontText>

          <CustomInput
            label="Full name"
            value={fullName}
            onChangeText={text => {
              setFullName(text);

              if (errors.fullName || errors.general) {
                setErrors({});
              }
            }}
            placeholder="Your full name"
            autoCapitalize="words"
            error={errors.fullName}
          />

          <CustomInput
            label="Email address"
            value={email}
            onChangeText={text => {
              setEmail(text);

              if (errors.email || errors.general) {
                setErrors({});
              }
            }}
            placeholder="you@example.com"
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
            placeholder="Create a password"
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
          />

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
            title="Create Account"
            onPress={handleCreateAccount}
            loading={loading}
            style={styles.createBtn}
            rightIcon={<SvgIcons.arrow color={colors.white} />}
          />

          <View style={styles.subFooter}>
            <FontText size={normalize(13)} pureColor={colors.placeholder}>
              Already have an account?{' '}
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
    </View>
  );
};

export default CreateAccountScreen;

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

  generalError: {
    marginTop: hp(1),
  },

  createBtn: {
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
