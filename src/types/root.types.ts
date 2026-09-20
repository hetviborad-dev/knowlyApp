export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  OTP: {email: string};
  SetNewPassword: {email: string};

  Category: {
    mode?: 'onboarding' | 'edit';
  };

  Home: undefined;
  Dashboard: undefined;
};

export type TabParamList = {
  Home: undefined;
  Facts: undefined;
  Explore: undefined;
  Profile: undefined;
};