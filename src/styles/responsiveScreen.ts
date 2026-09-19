import { Dimensions, Platform } from 'react-native';



const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

export const isiPAD: boolean = viewportHeight / viewportWidth < 1.6;
export const isIOS: boolean = Platform.OS === 'ios';
export const isAndroid: boolean = Platform.OS === 'android';



export function wp(percentage: number): number {
  const value = (percentage * viewportWidth) / 100;
  return Math.round(value);
}

export function hp(percentage: number): number {
  const value = (percentage * viewportHeight) / 100;
  return Math.round(value);
}


const scale: number = viewportWidth / 375;

export function normalize(size: number): number {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    if (isiPAD) {
      return Math.round(newSize) - wp(1);
    }
    return Math.round(newSize);
  }
  
  
  
  return Math.round(newSize);
}
