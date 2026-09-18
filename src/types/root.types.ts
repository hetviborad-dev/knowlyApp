export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  OTP: { email: string };
  SetNewPassword: { email: string };
};

export type TabParamList = {
  Home: undefined;
};
