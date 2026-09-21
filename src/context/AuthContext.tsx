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
  signIn: (email: string, password: string) => Promise<{error: string | null}>;
  signUp: (fullName: string, email: string, password: string) => Promise<{error: string | null}>;
  signOut: () => Promise<{error: string | null}>;
  sendPasswordResetOtp: (email: string) => Promise<{error: string | null}>;
  verifyPasswordResetOtp: (email: string, token: string) => Promise<{error: string | null}>;
  updatePassword: (password: string) => Promise<{error: string | null}>;
  completeCategorySelection: () => void;
  exitPasswordRecovery: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsCategorySelection, setNeedsCategorySelection] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const recoveryRef = useRef(false);
  const mountedRef = useRef(true);

  const checkCategorySelection = useCallback(async (userId: string) => {
    const {data, error} = await supabase
      .from('user_categories')
      .select('category_id')
      .eq('user_id', userId)
      .limit(1);
    if (error) {
      console.error('Check category selection error:', error);
      return false;
    }
    return !data?.length;
  }, []);

  const applySession = useCallback(async (nextSession: Session | null, recovery = false) => {
    if (!mountedRef.current) return;
    setSession(nextSession);
    setUser(nextSession?.user ?? null);
    recoveryRef.current = recovery;
    setIsPasswordRecovery(recovery);
    if (!nextSession?.user || recovery) {
      setNeedsCategorySelection(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const needsSelection = await checkCategorySelection(nextSession.user.id);
    if (!mountedRef.current) return;
    setNeedsCategorySelection(needsSelection);
    setLoading(false);
  }, [checkCategorySelection]);

  useEffect(() => {
    mountedRef.current = true;
    let subscription: {unsubscribe: () => void} | undefined;
    (async () => {
      try {
        const {data} = await supabase.auth.getSession();
        await applySession(data.session, false);
      } catch (error) {
        console.error('Initialize auth error:', error);
        if (mountedRef.current) setLoading(false);
      }
    })();
    const result = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        void applySession(nextSession, true);
        return;
      }
      if (event === 'SIGNED_OUT') {
        recoveryRef.current = false;
        void applySession(null, false);
        return;
      }
      if (event === 'SIGNED_IN') {
        void applySession(nextSession, false);
        return;
      }
      if (event === 'USER_UPDATED') {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
      }
    });
    subscription = result.data.subscription;
    return () => {
      mountedRef.current = false;
      subscription?.unsubscribe();
    };
  }, [applySession]);

  const signIn = async (email: string, password: string) => {
    const {error} = await supabase.auth.signInWithPassword({email: normalizeEmail(email), password});
    return {error: error?.message ?? null};
  };

  const signUp = async (fullName: string, email: string, password: string) => {
    setLoading(true);
    const {data, error} = await supabase.auth.signUp({
      email: normalizeEmail(email),
      password,
      options: {data: {full_name: fullName.trim()}},
    });
    if (error) {
      setLoading(false);
      return {error: error.message};
    }
    if (data.session) await applySession(data.session, false);
    else setLoading(false);
    return {error: null};
  };

  const signOut = async () => {
    const {error} = await supabase.auth.signOut({scope: 'local'});
    if (!error) await applySession(null, false);
    return {error: error?.message ?? null};
  };

  const sendPasswordResetOtp = async (email: string) => {
    const {error} = await supabase.auth.resetPasswordForEmail(normalizeEmail(email));
    return {error: error?.message ?? null};
  };

  const verifyPasswordResetOtp = async (email: string, token: string) => {
    const {data, error} = await supabase.auth.verifyOtp({
      email: normalizeEmail(email),
      token: token.trim(),
      type: 'recovery',
    });
    if (error) return {error: error.message};
    if (!data.session) return {error: 'OTP verified, but no recovery session was created.'};
    await applySession(data.session, true);
    return {error: null};
  };

  const updatePassword = async (password: string) => {
    const {data} = await supabase.auth.getSession();
    if (!data.session) return {error: 'Auth session missing!' };
    const {error} = await supabase.auth.updateUser({password});
    return {error: error?.message ?? null};
  };

  const completeCategorySelection = () => setNeedsCategorySelection(false);
  const exitPasswordRecovery = () => {
    recoveryRef.current = false;
    setIsPasswordRecovery(false);
  };

  return <AuthContext.Provider value={{user, session, loading, needsCategorySelection, isPasswordRecovery, signIn, signUp, signOut, sendPasswordResetOtp, verifyPasswordResetOtp, updatePassword, completeCategorySelection, exitPasswordRecovery}}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
