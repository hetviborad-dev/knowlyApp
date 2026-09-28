import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {Session, User} from '@supabase/supabase-js';

import {supabase} from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  needsCategorySelection: boolean;
  isPasswordRecovery: boolean;

  signIn: (
    email: string,
    password: string,
  ) => Promise<{error: string | null}>;

  signUp: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<{error: string | null}>;

  signOut: () => Promise<{error: string | null}>;

  sendPasswordResetOtp: (
    email: string,
  ) => Promise<{error: string | null}>;

  verifyPasswordResetOtp: (
    email: string,
    token: string,
  ) => Promise<{error: string | null}>;

  updatePassword: (
    password: string,
  ) => Promise<{error: string | null}>;

  completeCategorySelection: () => void;

  exitPasswordRecovery: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const [needsCategorySelection, setNeedsCategorySelection] =
    useState(false);

  const [isPasswordRecovery, setIsPasswordRecovery] =
    useState(false);

  const mountedRef = useRef(true);

  /**
   * Checks whether the logged-in user has selected
   * at least one category.
   */
  const checkCategorySelection = useCallback(
    async (userId: string): Promise<boolean> => {
      try {
        const {data, error} = await supabase
          .from('user_categories')
          .select('category_id')
          .eq('user_id', userId)
          .limit(1);

        if (error) {
          console.error(
            '❌ Check category selection error:',
            error,
          );

          /**
           * IMPORTANT:
           *
           * Do not return false here.
           *
           * false means:
           * "User already has categories."
           *
           * If the query fails because of RLS/database problems,
           * we don't actually know whether the user has categories.
           *
           * Returning true is safer for a new account because
           * it keeps the user in the category-selection flow.
           */
          return true;
        }

        const hasCategories = Boolean(data && data.length > 0);

        console.log(
          '✅ Category check:',
          hasCategories
            ? 'User already has categories'
            : 'User needs category selection',
        );

        return !hasCategories;
      } catch (error) {
        console.error(
          '❌ Unexpected category check error:',
          error,
        );

        return true;
      }
    },
    [],
  );

  /**
   * Applies an authenticated session to the app.
   */
  const applySession = useCallback(
    async (
      nextSession: Session | null,
      recovery = false,
    ) => {
      if (!mountedRef.current) {
        return;
      }

      console.log(
        '🔐 Applying session:',
        nextSession?.user?.email ?? 'NO SESSION',
      );

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      setIsPasswordRecovery(recovery);

      /**
       * No authenticated user.
       */
      if (!nextSession?.user) {
        if (!mountedRef.current) {
          return;
        }

        setNeedsCategorySelection(false);
        setLoading(false);

        return;
      }

      /**
       * Password recovery should go directly
       * to SetNewPasswordScreen.
       */
      if (recovery) {
        if (!mountedRef.current) {
          return;
        }

        setNeedsCategorySelection(false);
        setLoading(false);

        return;
      }

      /**
       * We have a valid authenticated user.
       *
       * Now check whether they have categories.
       */
      setLoading(true);

      const needsSelection = await checkCategorySelection(
        nextSession.user.id,
      );

      if (!mountedRef.current) {
        return;
      }

      console.log(
        '📚 Needs category selection:',
        needsSelection,
      );

      setNeedsCategorySelection(needsSelection);
      setLoading(false);
    },
    [checkCategorySelection],
  );

  useEffect(() => {
    mountedRef.current = true;

    let subscription:
      | {
          unsubscribe: () => void;
        }
      | undefined;

    /**
     * Initial session check.
     */
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');

        const {data, error} =
          await supabase.auth.getSession();

        if (error) {
          console.error(
            '❌ Get session error:',
            error,
          );

          if (mountedRef.current) {
            setLoading(false);
          }

          return;
        }

        console.log(
          '🔐 Initial session:',
          data.session?.user?.email ?? 'NO SESSION',
        );

        await applySession(data.session, false);
      } catch (error) {
        console.error(
          '❌ Initialize auth error:',
          error,
        );

        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    void initializeAuth();

    /**
     * Listen for Supabase authentication changes.
     *
     * IMPORTANT:
     * We don't perform Supabase database queries directly
     * inside the auth callback.
     *
     * Supabase can still be processing the auth event at this
     * moment, so we defer applySession().
     */
    const result = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        console.log(
          '🔔 Auth event:',
          event,
          nextSession?.user?.email ?? 'NO SESSION',
        );

        /**
         * Defer the async work until Supabase has finished
         * processing the auth event.
         */
        setTimeout(() => {
          if (!mountedRef.current) {
            return;
          }

          if (event === 'PASSWORD_RECOVERY') {
            void applySession(nextSession, true);
            return;
          }

          if (event === 'SIGNED_OUT') {
            void applySession(null, false);
            return;
          }

          if (
            event === 'SIGNED_IN' ||
            event === 'INITIAL_SESSION'
          ) {
            void applySession(nextSession, false);
            return;
          }

          if (event === 'USER_UPDATED') {
            setSession(nextSession);
            setUser(nextSession?.user ?? null);
          }
        }, 0);
      },
    );

    subscription = result.data.subscription;

    return () => {
      mountedRef.current = false;
      subscription?.unsubscribe();
    };
  }, [applySession]);

  /**
   * LOGIN
   */
  const signIn = async (
    email: string,
    password: string,
  ) => {
    try {
      setLoading(true);

      const {data, error} =
        await supabase.auth.signInWithPassword({
          email: normalizeEmail(email),
          password,
        });

      if (error) {
        setLoading(false);

        return {
          error: error.message,
        };
      }

      /**
       * Explicitly apply the returned session.
       *
       * This prevents us from depending only on the
       * SIGNED_IN event.
       */
      if (data.session) {
        await applySession(data.session, false);
      } else {
        setLoading(false);

        return {
          error: 'Login succeeded, but no session was created.',
        };
      }

      return {
        error: null,
      };
    } catch (error: any) {
      setLoading(false);

      return {
        error:
          error?.message ??
          'Something went wrong while logging in.',
      };
    }
  };

  /**
   * CREATE ACCOUNT
   */
  const signUp = async (
    fullName: string,
    email: string,
    password: string,
  ) => {
    try {
      setLoading(true);

      const normalizedEmail = normalizeEmail(email);

      console.log(
        '📝 Creating account:',
        normalizedEmail,
      );

      const {data, error} =
        await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

      console.log('📝 SIGN UP RESULT:', {
        userId: data.user?.id ?? null,
        email: data.user?.email ?? null,
        hasSession: Boolean(data.session),
      });

      if (error) {
        console.error(
          '❌ Sign up error:',
          error,
        );

        setLoading(false);

        return {
          error: error.message,
        };
      }

      /**
       * With email confirmation disabled,
       * Supabase should return a session.
       */
      if (data.session) {
        console.log(
          '✅ Account created and session received.',
        );

        await applySession(data.session, false);

        return {
          error: null,
        };
      }

      /**
       * If there is no session, check getSession().
       *
       * This also protects against an auth-event timing issue.
       */
      console.log(
        '⚠️ Sign up returned no session. Checking current session...',
      );

      const {data: sessionData, error: sessionError} =
        await supabase.auth.getSession();

      if (sessionError) {
        console.error(
          '❌ Session after signup error:',
          sessionError,
        );

        setLoading(false);

        return {
          error: sessionError.message,
        };
      }

      if (sessionData.session) {
        console.log(
          '✅ Session found after signup.',
        );

        await applySession(
          sessionData.session,
          false,
        );

        return {
          error: null,
        };
      }

      /**
       * This is important.
       *
       * If this happens while Confirm email is OFF,
       * Supabase is not giving the app an authenticated
       * session. We should NOT pretend signup succeeded
       * and silently send the user to Login.
       */
      console.error(
        '❌ Account was created but no authenticated session exists.',
      );

      setLoading(false);

      return {
        error:
          'Account was created, but you were not logged in automatically. Please try logging in.',
      };
    } catch (error: any) {
      console.error(
        '❌ Unexpected signup error:',
        error,
      );

      setLoading(false);

      return {
        error:
          error?.message ??
          'Something went wrong while creating your account.',
      };
    }
  };

  /**
   * LOGOUT
   */
  const signOut = async () => {
    try {
      const {error} =
        await supabase.auth.signOut({
          scope: 'local',
        });

      if (error) {
        return {
          error: error.message,
        };
      }

      /**
       * Clear local auth state immediately.
       */
      setSession(null);
      setUser(null);
      setNeedsCategorySelection(false);
      setIsPasswordRecovery(false);
      setLoading(false);

      return {
        error: null,
      };
    } catch (error: any) {
      return {
        error:
          error?.message ??
          'Something went wrong while logging out.',
      };
    }
  };

  /**
   * SEND PASSWORD RESET OTP
   */
  const sendPasswordResetOtp = async (
    email: string,
  ) => {
    const {error} =
      await supabase.auth.resetPasswordForEmail(
        normalizeEmail(email),
      );

    return {
      error: error?.message ?? null,
    };
  };

  /**
   * VERIFY PASSWORD RESET OTP
   */
  const verifyPasswordResetOtp = async (
    email: string,
    token: string,
  ) => {
    const {data, error} =
      await supabase.auth.verifyOtp({
        email: normalizeEmail(email),
        token: token.trim(),
        type: 'recovery',
      });

    if (error) {
      return {
        error: error.message,
      };
    }

    if (!data.session) {
      return {
        error:
          'OTP verified, but no recovery session was created.',
      };
    }

    await applySession(data.session, true);

    return {
      error: null,
    };
  };

  /**
   * UPDATE PASSWORD
   */
  const updatePassword = async (
    password: string,
  ) => {
    const {data, error} =
      await supabase.auth.getSession();

    if (error) {
      return {
        error: error.message,
      };
    }

    if (!data.session) {
      return {
        error: 'Auth session missing!',
      };
    }

    const {error: updateError} =
      await supabase.auth.updateUser({
        password,
      });

    return {
      error: updateError?.message ?? null,
    };
  };

  /**
   * CATEGORY SELECTION COMPLETE
   */
  const completeCategorySelection = () => {
    console.log(
      '✅ Category selection completed.',
    );

    setNeedsCategorySelection(false);
  };

  /**
   * EXIT PASSWORD RECOVERY
   */
  const exitPasswordRecovery = () => {
    setIsPasswordRecovery(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        needsCategorySelection,
        isPasswordRecovery,
        signIn,
        signUp,
        signOut,
        sendPasswordResetOtp,
        verifyPasswordResetOtp,
        updatePassword,
        completeCategorySelection,
        exitPasswordRecovery,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    );
  }

  return context;
};