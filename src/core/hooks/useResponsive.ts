import { useWindowDimensions } from 'react-native';
import { scale, moderateScale } from '../utils/responsive';

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  
  const isTablet = width >= 768;
  const isLandscape = width > height;
  const columns = isTablet ? 2 : 1;
  const contentMaxWidth = isTablet ? 800 : '100%';

  return {
    width,
    height,
    isTablet,
    isLandscape,
    columns,
    contentMaxWidth,
    scale: (size: number) => scale(size, width),
    moderateScale: (size: number, factor = 0.5) => moderateScale(size, width, factor),
  };
};
