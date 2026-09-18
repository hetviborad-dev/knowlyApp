import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { FontText, CustomInput, CustomButton, Header } from '../../component';
import { normalize, wp, hp } from '../../styles/responsiveScreen';
import { useAppTheme } from '../../hooks/useTheme';
import { SCREENS } from '../../constant/screens';

type Props = NativeStackScreenProps<RootStackParamList, 'SetNewPassword'>;

const MIN_PASSWORD_LENGTH = 8;

const SetNewPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const colors = useAppTheme();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const hasNumber = (text: string) => /\d/.test(text);

  const validate = () => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};

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

  const handleResetPassword = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.reset({
        index: 0,
        routes: [{ name: SCREENS.LOGIN }],
      });
    }, 1200);
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.white }]}>
      <Header
        showBack
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
              if (errors.newPassword)
                setErrors(prev => ({ ...prev, newPassword: undefined }));
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
              if (errors.confirmPassword)
                setErrors(prev => ({ ...prev, confirmPassword: undefined }));
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
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: wp(6),
    paddingTop: hp(2),
    paddingBottom: hp(2),
  },
  resetBtn: { marginBottom: hp(2) },
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
