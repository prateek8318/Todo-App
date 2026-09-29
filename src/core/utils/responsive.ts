const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const scale = (size: number, width: number) => (width / guidelineBaseWidth) * size;
export const verticalScale = (size: number, height: number) => (height / guidelineBaseHeight) * size;
export const moderateScale = (size: number, width: number, factor = 0.5) => size + (scale(size, width) - size) * factor;
