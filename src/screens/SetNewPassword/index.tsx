import React, { useState } from 'react';
import {
  View,
  StyleSheet,
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

import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'SetNewPassword'>;

const MIN_PASSWORD_LENGTH = 8;

const SetNewPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const colors = useAppTheme();

  const { updatePassword, signOut, exitPasswordRecovery } = useAuth();

  const [newPassword, setNewPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const hasNumber = (text: string) => /\d/.test(text);

  const validate = () => {
    const newErrors: {
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < MIN_PASSWORD_LENGTH) {
      newErrors.newPassword = `Use ${MIN_PASSWORD_LENGTH}+ characters, including a number`;
    } else if (!hasNumber(newPassword)) {
      newErrors.newPassword = 'Password must include a number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword && confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);

    /*
     * Step 1:
     * Update the password using the recovery session.
     */
    const { error } = await updatePassword(newPassword);

    if (error) {
      console.error('Update password error:', error);

      setLoading(false);

      Alert.alert('Could not reset password', error);

      return;
    }

    /*
     * Step 2:
     * Password has successfully changed.
     *
     * FIX: Force-exit recovery mode right here,
     * synchronously, BEFORE calling signOut().
     *
     * Previously the code relied entirely on the
     * Supabase onAuthStateChange listener to flip
     * isPasswordRecovery/session after signOut().
     * That listener callback can be delayed or race
     * with the earlier USER_UPDATED event, which left
     * RootNavigation still rendering SetNewPassword
     * even though the password update succeeded.
     *
     * Calling exitPasswordRecovery() here updates React
     * state immediately, so RootNavigation's condition
     * `isPasswordRecovery` becomes false right away.
     */
    exitPasswordRecovery();

    /*
     * Step 3:
     * Now sign out the recovery session.
     *
     * signOut() also force-resets session/user locally
     * (see updated AuthContext), so RootNavigation does
     * not have to wait on the SIGNED_OUT event either.
     */
    const { error: signOutError } = await signOut();

    if (signOutError) {
      console.error('Sign out after password reset error:', signOutError);

      setLoading(false);

      Alert.alert(
        'Password updated',
        'Your password was changed successfully, but we could not sign you out automatically. Please restart the app.',
      );

      return;
    }

    /*
     * Step 4:
     * signOut() sets session -> null and
     * isPasswordRecovery -> false synchronously.
     *
     * RootNavigation will automatically replace
     * the current navigator with the Login screen.
     *
     * DO NOT call navigation.reset() here.
     */
    setLoading(false);
  };

  return (
    <View
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.white,
        },
      ]}
    >
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
            Set new password
          </FontText>

          <FontText
            name="regular"
            size={normalize(14)}
            pureColor={colors.placeholder}
            lineHeightFactor={1.4}
            pBottom={hp(3)}
          >
            Your new password must be different from previously used passwords.
          </FontText>

          <CustomInput
            label="New password"
            value={newPassword}
            onChangeText={text => {
              setNewPassword(text);

              if (errors.newPassword) {
                setErrors(prev => ({
                  ...prev,
                  newPassword: undefined,
                }));
              }
            }}
            placeholder="Enter new password"
            secureTextEntry
            error={errors.newPassword}
          />

          <CustomInput
            label="Confirm new password"
            value={confirmPassword}
            onChangeText={text => {
              setConfirmPassword(text);

              if (errors.confirmPassword) {
                setErrors(prev => ({
                  ...prev,
                  confirmPassword: undefined,
                }));
              }
            }}
            placeholder="Re-enter new password"
            secureTextEntry
            error={errors.confirmPassword}
          />
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton
            title="Reset Password & Log In"
            onPress={handleResetPassword}
            loading={loading}
            style={styles.resetBtn}
          />

          <View style={styles.subFooter}>
            <FontText
              size={normalize(12)}
              pureColor={colors.placeholder}
              textAlign="center"
            >
              Use 8+ characters, including a number.
            </FontText>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SetNewPasswordScreen;

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

  resetBtn: {
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
