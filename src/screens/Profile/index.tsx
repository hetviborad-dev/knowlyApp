import React, { useCallback, useState } from 'react';

import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

import { FontText, Header } from '../../component';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../hooks/useTheme';
import { hp, normalize, wp } from '../../styles/responsiveScreen';

type MenuIconName =
  | 'bookmark-outline'
  | 'notifications-outline'
  | 'log-out-outline';

interface ProfileScreenProps {
  navigation: {
    goBack: () => void;
  };
}

interface ProfileRowProps {
  iconName: MenuIconName;
  title: string;
  description?: string;
  onPress: () => void;
  comingSoon?: boolean;
  destructive?: boolean;
  disabled?: boolean;
}

const PROFILE_BACKGROUND = '#F8F7F2';
const CARD_BACKGROUND = '#FFFFFF';
const SOFT_PRIMARY = '#FFF0D1';
const SOFT_DANGER = '#FDEBEC';
const DANGER = '#D95B61';
const MUTED_TEXT = '#929088';
const DARK_TEXT = '#272621';
const DIVIDER = '#EEECE6';

const ProfileRow: React.FC<ProfileRowProps> = ({
  iconName,
  title,
  description,
  onPress,
  comingSoon = false,
  destructive = false,
  disabled = false,
}) => {
  const colors = useAppTheme();

  const iconColor = destructive ? DANGER : colors.primary;
  const iconBackground = destructive ? SOFT_DANGER : SOFT_PRIMARY;
  const titleColor = destructive ? DANGER : DARK_TEXT;

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.75}
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[styles.row, disabled && styles.disabledRow]}
    >
      <View
        style={[
          styles.rowIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Ionicons name={iconName} size={normalize(22)} color={iconColor} />
      </View>

      <View style={styles.rowText}>
        <View style={styles.rowTitleLine}>
          <FontText name="semibold" size={normalize(16)} pureColor={titleColor}>
            {title}
          </FontText>

          {comingSoon ? (
            <View style={styles.comingSoonBadge}>
              <FontText name="bold" size={normalize(9)} pureColor={MUTED_TEXT}>
                COMING SOON
              </FontText>
            </View>
          ) : null}
        </View>

        {description ? (
          <FontText
            name="regular"
            size={normalize(13)}
            pureColor={MUTED_TEXT}
            pTop={hp(0.35)}
          >
            {description}
          </FontText>
        ) : null}
      </View>

      {!destructive ? (
        <Ionicons name="chevron-forward" size={normalize(20)} color="#B8B5AC" />
      ) : null}
    </TouchableOpacity>
  );
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const colors = useAppTheme();
  const { user, signOut } = useAuth();

  const [loggingOut, setLoggingOut] = useState(false);

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    'Knowly User';

  const email = user?.email || '';

  const initial = fullName.trim().charAt(0).toUpperCase() || 'K';

  const handleLogout = useCallback(() => {
    if (loggingOut) {
      return;
    }

    Alert.alert(
      'Log out?',
      'You will need to sign in again to access your saved facts and preferences.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);

            const { error } = await signOut();

            setLoggingOut(false);

            if (error) {
              Alert.alert(
                'Could not log out',
                error || 'Please try again in a moment.',
              );
            }
          },
        },
      ],
    );
  }, [loggingOut, signOut]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: PROFILE_BACKGROUND,
        },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.profileHero,
            {
              backgroundColor: CARD_BACKGROUND,
            },
          ]}
        >
          <View
            style={[
              styles.avatarOuter,
              {
                backgroundColor: SOFT_PRIMARY,
              },
            ]}
          >
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: colors.primary,
                },
              ]}
            >
              <FontText
                name="bold"
                size={normalize(30)}
                pureColor={colors.white}
              >
                {initial}
              </FontText>
            </View>
          </View>

          <FontText
            name="bold"
            size={normalize(22)}
            pureColor={DARK_TEXT}
            textAlign="center"
            pTop={hp(1.5)}
          >
            {fullName}
          </FontText>

          {email ? (
            <FontText
              name="regular"
              size={normalize(14)}
              pureColor={MUTED_TEXT}
              textAlign="center"
              pTop={hp(0.45)}
            >
              {email}
            </FontText>
          ) : null}

          <View
            style={[
              styles.memberBadge,
              {
                backgroundColor: SOFT_PRIMARY,
              },
            ]}
          >
            <Ionicons
              name="sparkles"
              size={normalize(14)}
              color={colors.primary}
            />

            <FontText
              name="bold"
              size={normalize(11)}
              pureColor={colors.primary}
              pLeft={wp(1.5)}
            >
              KNOWLY EXPLORER
            </FontText>
          </View>
        </View>

        <View style={styles.section}>
          <FontText
            name="bold"
            size={normalize(13)}
            pureColor={MUTED_TEXT}
            style={styles.sectionTitle}
          >
            YOUR KNOWLY
          </FontText>

          <View
            style={[
              styles.listCard,
              {
                backgroundColor: CARD_BACKGROUND,
              },
            ]}
          >
            <ProfileRow
              iconName="bookmark-outline"
              title="Saved facts"
              description="Your favourite discoveries"
              onPress={() => {
                // Intentionally empty for now.
              }}
            />

            <View style={styles.divider} />

            <ProfileRow
              iconName="notifications-outline"
              title="Notifications"
              description="Daily reminders and updates"
              comingSoon
              onPress={() => {
                // Intentionally empty for now.
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <FontText
            name="bold"
            size={normalize(13)}
            pureColor={MUTED_TEXT}
            style={styles.sectionTitle}
          >
            ACCOUNT
          </FontText>

          <View
            style={[
              styles.listCard,
              {
                backgroundColor: CARD_BACKGROUND,
              },
            ]}
          >
            <ProfileRow
              iconName="log-out-outline"
              title={loggingOut ? 'Logging out...' : 'Log out'}
              description="Sign out from this device"
              destructive
              disabled={loggingOut}
              onPress={handleLogout}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(17),
  },

  profileHero: {
    width: '100%',
    minHeight: hp(25),
    borderRadius: wp(7),
    paddingHorizontal: wp(5),
    paddingTop: hp(4),
    paddingBottom: hp(3),
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#5F5A4E',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  avatarOuter: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatar: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#C87500',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 7,
    elevation: 4,
  },

  memberBadge: {
    marginTop: hp(2.2),
    minHeight: hp(4),
    borderRadius: wp(8),
    paddingHorizontal: wp(3.5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  section: {
    marginTop: hp(4),
  },

  sectionTitle: {
    letterSpacing: 1.2,
    marginLeft: wp(1),
    marginBottom: hp(1.2),
  },

  listCard: {
    width: '100%',
    borderRadius: wp(5),
    overflow: 'hidden',

    shadowColor: '#5F5A4E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  row: {
    minHeight: hp(9.4),
    paddingHorizontal: wp(4),
    flexDirection: 'row',
    alignItems: 'center',
  },

  disabledRow: {
    opacity: 0.6,
  },

  rowIcon: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(3.8),
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowText: {
    flex: 1,
    paddingHorizontal: wp(3),
  },

  rowTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  comingSoonBadge: {
    marginLeft: wp(2),
    backgroundColor: '#F1EFE9',
    borderRadius: wp(4),
    paddingHorizontal: wp(1.8),
    paddingVertical: hp(0.4),
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DIVIDER,
    marginLeft: wp(19),
  },
});
