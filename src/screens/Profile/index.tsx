import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { FontText, Header } from '../../component';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../hooks/useTheme';
import { normalize, wp, hp } from '../../styles/responsiveScreen';

const ProfileScreen = () => {
  const colors = useAppTheme();
  const { user, signOut } = useAuth();

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    'Knowly User';

  const email = user?.email || '';

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <Header
        title="Profile"
        showBack={false}
        containerStyle={{
          backgroundColor: colors.background,
        }}
      />

      <View style={styles.content}>
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: colors.primaryTint,
            },
          ]}
        >
          <FontText name="bold" size={normalize(28)} pureColor={colors.primary}>
            {fullName.charAt(0).toUpperCase()}
          </FontText>
        </View>

        <FontText
          name="bold"
          size={normalize(22)}
          color="black2"
          textAlign="center"
          pTop={hp(1.5)}
        >
          {fullName}
        </FontText>

        <FontText
          name="regular"
          size={normalize(14)}
          pureColor={colors.placeholder}
          textAlign="center"
          pTop={hp(0.5)}
        >
          {email}
        </FontText>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          style={[
            styles.logoutButton,
            {
              borderColor: colors.error || colors.primary,
            },
          ]}
        >
          <FontText
            name="bold"
            size={normalize(15)}
            pureColor={colors.error || colors.primary}
          >
            Log out
          </FontText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: wp(6),
    paddingTop: hp(4),
  },

  avatar: {
    width: wp(24),
    height: wp(24),
    borderRadius: wp(12),
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoCard: {
    width: '100%',
    marginTop: hp(4),
    padding: wp(5),
    borderRadius: wp(4),
    backgroundColor: '#F8F8F8',
  },

  logoutButton: {
    width: '100%',
    height: hp(6.5),
    borderWidth: 1.2,
    borderRadius: wp(4),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(2),
  },
});
