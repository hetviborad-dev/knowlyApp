import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Session, User } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  needsCategorySelection: boolean;
  isPasswordRecovery: boolean;

  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;

  signUp: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;

  signOut: () => Promise<{ error: string | null }>;

  sendPasswordResetOtp: (email: string) => Promise<{ error: string | null }>;

  verifyPasswordResetOtp: (
    email: string,
    token: string,
  ) => Promise<{ error: string | null }>;

  updatePassword: (password: string) => Promise<{ error: string | null }>;

  completeCategorySelection: () => void;

  
  
  
  exitPasswordRecovery: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);

  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const [needsCategorySelection, setNeedsCategorySelection] = useState(false);

  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  
  const checkCategorySelection = async (userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('user_categories')
      .select('category_id')
      .eq('user_id', userId)
      .limit(1);

    if (error) {
      console.error('Check category selection error:', error);

      return false;
    }

    return !data || data.length === 0;
  };

  
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        console.log('INITIAL SESSION:', currentSession ? 'EXISTS' : 'MISSING');

        console.log('INITIAL USER:', currentSession?.user?.email ?? 'NO USER');

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        
        if (!currentSession?.user) {
          setIsPasswordRecovery(false);
          setNeedsCategorySelection(false);
          setLoading(false);

          return;
        }

        
        if (currentSession.user && isRecoverySession(currentSession)) {
          console.log('INITIAL SESSION IS RECOVERY SESSION');

          setIsPasswordRecovery(true);
          setNeedsCategorySelection(false);
          setLoading(false);

          return;
        }

        
        const needsSelection = await checkCategorySelection(
          currentSession.user.id,
        );

        if (!mounted) {
          return;
        }

        setIsPasswordRecovery(false);
        setNeedsCategorySelection(needsSelection);

        setLoading(false);
      } catch (error) {
        console.error('Initialize auth error:', error);

        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) {
        return;
      }

      console.log('AUTH STATE CHANGE:', event);

      console.log('AUTH SESSION:', newSession ? 'EXISTS' : 'MISSING');

      
      setSession(newSession);
      setUser(newSession?.user ?? null);

      
      if (event === 'PASSWORD_RECOVERY') {
        console.log('PASSWORD RECOVERY MODE');

        setIsPasswordRecovery(true);
        setNeedsCategorySelection(false);
        setLoading(false);

        return;
      }

      
      if (event === 'USER_UPDATED') {
        console.log('PASSWORD UPDATED');

        setLoading(false);

        return;
      }

      
      if (event === 'SIGNED_OUT') {
        console.log('USER SIGNED OUT');

        setSession(null);
        setUser(null);
        setIsPasswordRecovery(false);
        setNeedsCategorySelection(false);
        setLoading(false);

        return;
      }

      
      if (event === 'SIGNED_IN') {
        console.log('NORMAL SIGN IN');

        setIsPasswordRecovery(false);
        setLoading(true);

        if (!newSession?.user) {
          setNeedsCategorySelection(false);
          setLoading(false);

          return;
        }

        const needsSelection = await checkCategorySelection(newSession.user.id);

        if (!mounted) {
          return;
        }

        setNeedsCategorySelection(needsSelection);

        setLoading(false);

        return;
      }

      
      if (!newSession?.user) {
        setIsPasswordRecovery(false);
        setNeedsCategorySelection(false);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  
  const isRecoverySession = (currentSession: Session): boolean => {
    const accessToken = currentSession.access_token;

    if (!accessToken) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));

      return (
        payload?.aal === 'aal1' &&
        payload?.amr?.some((item: any) => item?.method === 'otp')
      );
    } catch (error) {
      console.error('Recovery session detection error:', error);

      return false;
    }
  };

  
  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    return {
      error: error?.message ?? null,
    };
  };

  
  const signUp = async (
    fullName: string,
    email: string,
    password: string,
  ): Promise<{ error: string | null }> => {
    setLoading(true);

    const {
      data: { session: newSession },
      error,
    } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      setLoading(false);

      return {
        error: error.message,
      };
    }

    
    if (!newSession) {
      setLoading(false);

      return {
        error: null,
      };
    }

    setSession(newSession);
    setUser(newSession.user);

    setIsPasswordRecovery(false);

    
    setNeedsCategorySelection(true);

    setLoading(false);

    return {
      error: null,
    };
  };

  
  const signOut = async (): Promise<{
    error: string | null;
  }> => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    const { error } = await supabase.auth.signOut({
      scope: 'local',
    });

    setSession(null);
    setUser(null);
    setIsPasswordRecovery(false);
    setNeedsCategorySelection(false);

    if (error) {
      return {
        error: error.message,
      };
    }

    return {
      error: null,
    };
  };

  const sendPasswordResetOtp = async (
    email: string,
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
    );

    return {
      error: error?.message ?? null,
    };
  };

  const verifyPasswordResetOtp = async (
    email: string,
    token: string,
  ): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: 'recovery',
    });

    if (error) {
      console.error('Verify password reset OTP error:', error);

      return {
        error: error.message,
      };
    }

    
    if (!data.session) {
      return {
        error: 'OTP was verified, but no recovery session was created.',
      };
    }

    console.log('RECOVERY OTP VERIFIED');

    console.log('Recovery user:', data.user?.email ?? 'NO USER');

    
    setSession(data.session);
    setUser(data.user);

    setIsPasswordRecovery(true);
    setNeedsCategorySelection(false);

    return {
      error: null,
    };
  };

  
  const updatePassword = async (
    password: string,
  ): Promise<{ error: string | null }> => {
    console.log('========== UPDATE PASSWORD START ==========');

    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    console.log(
      'Session before updatePassword:',
      currentSession ? 'EXISTS' : 'MISSING',
    );

    console.log(
      'User before updatePassword:',
      currentSession?.user?.email ?? 'NO USER',
    );

    if (!currentSession) {
      console.log('NO SESSION - PASSWORD UPDATE STOPPED');

      return {
        error: 'Auth session missing!',
      };
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    console.log('updateUser error:', error?.message ?? 'null');

    console.log('========== UPDATE PASSWORD END ==========');

    return {
      error: error?.message ?? null,
    };
  };

  
  const completeCategorySelection = () => {
    setNeedsCategorySelection(false);
  };

  
  const exitPasswordRecovery = () => {
    console.log('EXIT PASSWORD RECOVERY (forced)');

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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
