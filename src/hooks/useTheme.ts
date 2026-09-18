import { useColorScheme } from 'react-native';
import { darkColors, lightColors } from '../assets/colors';

export function useAppTheme() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkColors : lightColors;
}
