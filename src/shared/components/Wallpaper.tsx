import React, { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, RadialGradient, Path, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@core/theme';
import { getWallpaper, WallpaperId } from '@core/theme/wallpapers';

export const Wallpaper = ({ id, preview = false }: { id: WallpaperId; preview?: boolean }) => {
  const { isDark, theme } = useTheme();
  const gradientId = `wallpaper${useId().replace(/:/g, '')}`;
  const wallpaper = getWallpaper(id);
  const colors = isDark ? wallpaper.dark : wallpaper.light;
  const ink = wallpaper.ink;
  const softWhite = isDark ? '#C9CEE4' : '#FFFFFF';

  return (
    <Svg
      width="100%"
      height="100%"
      viewBox={preview ? '0 160 360 480' : '0 0 360 800'}
      preserveAspectRatio="xMidYMid slice"
      accessible={false}>
      <LinearGradient id={gradientId} x1="0" y1="0" x2="0.8" y2="1">
        <Stop offset="0" stopColor={id === 'none' ? theme.colors.background : colors[0]} />
        <Stop offset="1" stopColor={id === 'none' ? theme.colors.background : colors[1]} />
      </LinearGradient>
      <Defs>
        <RadialGradient id={`${gradientId}glow`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={ink} stopOpacity={isDark ? 0.28 : 0.38} />
          <Stop offset="1" stopColor={ink} stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id={`${gradientId}ribbon`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={softWhite} stopOpacity={isDark ? 0.12 : 0.65} />
          <Stop offset="0.55" stopColor={ink} stopOpacity={isDark ? 0.24 : 0.2} />
          <Stop offset="1" stopColor={softWhite} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Rect width="360" height="800" fill={`url(#${gradientId})`} />
      {id === 'aurora' && (
        <G>
          <Ellipse cx="15" cy="270" rx="270" ry="320" fill={`url(#${gradientId}glow)`} />
          <Ellipse cx="365" cy="650" rx="250" ry="300" fill={`url(#${gradientId}glow)`} />
          <Path d="M-90 85 C350 150 -70 400 430 490 L430 670 C-50 510 320 230 -90 250 Z" fill={`url(#${gradientId}ribbon)`} />
          <Path d="M-50 230 C260 210 65 530 410 590" stroke={softWhite} strokeWidth="1.5" opacity={isDark ? 0.13 : 0.4} fill="none" />
          <Path d="M-20 220 C250 215 90 515 410 580" stroke={softWhite} opacity="0.18" fill="none" />
        </G>
      )}
      {id === 'botanical' && (
        <G stroke={ink} fill="none" opacity={isDark ? 0.28 : 0.42}>
          <Path d="M-15 660 Q40 500 65 235 M295 855 Q290 670 365 460" strokeWidth="1.4" />
          {[[27, 520, -30], [44, 430, 12], [56, 345, -15], [317, 680, 190], [330, 600, 155], [301, 750, 165]].map(([x, y, rotate], index) => (
            <G key={index} transform={`translate(${x} ${y}) rotate(${rotate})`}>
              <Path d="M0 0 C-40 -15 -50 -70 -15 -98 C20 -66 17 -23 0 0 Z" fill={ink} fillOpacity="0.12" strokeWidth="1" />
              <Path d="M0 0 Q-17 -48 -15 -98 M-9 -35 L-31 -52 M-13 -58 L2 -72" strokeWidth="0.65" />
            </G>
          ))}
          <Circle cx="292" cy="205" r="44" strokeWidth="0.7" opacity="0.5" />
          <Circle cx="292" cy="205" r="36" strokeWidth="0.7" opacity="0.25" />
        </G>
      )}
      {id === 'dunes' && (
        <G>
          <Circle cx="285" cy="255" r="65" fill={`url(#${gradientId}glow)`} />
          <Path d="M-20 450 Q90 340 210 440 T390 410 L390 820 L-20 820 Z" fill={ink} opacity={isDark ? 0.12 : 0.14} />
          <Path d="M-20 590 Q95 440 240 550 T390 520 L390 820 L-20 820 Z" fill={ink} opacity={isDark ? 0.17 : 0.16} />
          <Path d="M-20 705 Q155 565 390 680 L390 820 L-20 820 Z" fill={ink} opacity={isDark ? 0.2 : 0.16} />
          <Path d="M-20 590 Q95 440 240 550 T390 520 M-20 705 Q155 565 390 680" stroke={softWhite} strokeWidth="1" opacity="0.3" fill="none" />
        </G>
      )}
      {id === 'pearl' && (
        <G>
          <Ellipse cx="340" cy="285" rx="230" ry="280" fill={`url(#${gradientId}glow)`} />
          <Path d="M-55 550 C190 275 450 520 250 735 C100 875 -65 775 -55 550 Z" fill={`url(#${gradientId}ribbon)`} />
          {[0, 1, 2, 3, 4, 5].map(index => (
            <Path key={index} transform={`translate(${index * 11} ${index * -9})`} d="M-70 500 C120 255 460 415 290 650 C190 790 -5 735 -25 690" stroke={ink} strokeWidth="0.75" opacity={isDark ? 0.19 : 0.22} fill="none" />
          ))}
          <Circle cx="310" cy="315" r="27" fill={softWhite} opacity={isDark ? 0.08 : 0.32} />
        </G>
      )}
      {id === 'noir' && (
        <G fill="none" stroke={ink} opacity={isDark ? 0.38 : 0.4}>
          {[0, 1, 2, 3, 4].map(index => (
            <Rect key={index} x={20 + index * 13} y={230 + index * 13} width={320 - index * 26} height={430 - index * 26} rx={160 - index * 13} strokeWidth="0.65" />
          ))}
          <Path d="M0 355 H360 M0 530 H360 M180 150 V735" strokeWidth="0.6" opacity="0.35" />
          <Circle cx="180" cy="445" r="27" strokeWidth="0.8" />
          <Path d="M180 405 V485 M140 445 H220" strokeWidth="0.8" />
          <Circle cx="180" cy="212" r="3" fill={ink} stroke="none" />
          <Circle cx="180" cy="680" r="3" fill={ink} stroke="none" />
        </G>
      )}
      {id === 'silk' && (
        <G>
          <Ellipse cx="355" cy="300" rx="280" ry="260" fill={`url(#${gradientId}glow)`} />
          <Path d="M-40 165 C300 170 20 420 410 570 L410 800 C30 670 290 375 -40 390 Z" fill={`url(#${gradientId}ribbon)`} />
          {[0, 1, 2, 3].map(index => (
            <Path key={index} transform={`translate(${index * -10} ${index * 9})`} d="M-40 255 C325 255 -45 470 410 635" stroke={softWhite} strokeWidth="1" opacity={isDark ? 0.12 : 0.35} fill="none" />
          ))}
          <Path d="M-40 295 C305 290 0 500 410 670" stroke={ink} strokeWidth="0.8" opacity="0.24" fill="none" />
        </G>
      )}
      {id === 'clouds' && (
        <G opacity={isDark ? 0.24 : 0.75}>
          {[
            [-25, 110, 1],
            [245, 230, 0.85],
            [-45, 440, 0.7],
            [205, 640, 1.2],
            [30, 735, 0.8],
          ].map(([x, y, scale], index) => (
            <G key={index} transform={`translate(${x} ${y}) scale(${scale})`}>
              <Path
                d="M15 55 C-10 48 -3 20 22 21 C20 -7 62 -9 70 17 C91 6 110 21 105 39 C136 39 132 61 110 63 L20 63 Z"
                fill={softWhite}
              />
              <Circle cx="46" cy="40" r="2.5" fill={ink} />
              <Circle cx="69" cy="40" r="2.5" fill={ink} />
              <Path
                d="M52 47 Q58 54 64 47"
                stroke={ink}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <Ellipse cx="37" cy="47" rx="5" ry="3" fill="#EDB1C8" />
              <Ellipse cx="78" cy="47" rx="5" ry="3" fill="#EDB1C8" />
            </G>
          ))}
          {[
            [40, 260],
            [325, 420],
            [90, 580],
          ].map(([x, y], index) => (
            <Circle key={index} cx={x} cy={y} r="4" fill={ink} opacity="0.5" />
          ))}
        </G>
      )}
      {id === 'blossom' && (
        <G opacity={isDark ? 0.25 : 0.55}>
          {[
            [22, 160, 1.1],
            [325, 300, 0.9],
            [30, 470, 0.75],
            [300, 650, 1.4],
            [80, 775, 0.8],
          ].map(([x, y, scale], index) => (
            <G key={index} transform={`translate(${x} ${y}) scale(${scale})`}>
              {[0, 60, 120, 180, 240, 300].map(rotation => (
                <Ellipse
                  key={rotation}
                  cx="0"
                  cy="-17"
                  rx="9"
                  ry="17"
                  fill={softWhite}
                  transform={`rotate(${rotation})`}
                />
              ))}
              <Circle r="10" fill="#E9BC68" />
              <Circle cx="-3" cy="-1" r="1.4" fill="#A97F4D" />
              <Circle cx="3" cy="-1" r="1.4" fill="#A97F4D" />
              <Path d="M-3 3 Q0 6 3 3" stroke="#A97F4D" strokeWidth="1.5" fill="none" />
            </G>
          ))}
          {[
            [310, 140],
            [45, 340],
            [330, 520],
            [40, 690],
          ].map(([x, y], index) => (
            <Path
              key={index}
              transform={`translate(${x} ${y})`}
              d="M0 8 C-19 -5 -8 -17 0 -8 C8 -17 19 -5 0 8 Z"
              fill={ink}
            />
          ))}
        </G>
      )}
      {id === 'starlight' && (
        <G opacity={isDark ? 0.45 : 0.55}>
          <Path d="M290 115 A45 45 0 1 0 327 184 A40 40 0 0 1 290 115 Z" fill={softWhite} />
          {[
            [30, 190, 12],
            [325, 290, 9],
            [42, 415, 8],
            [300, 560, 13],
            [75, 695, 15],
            [285, 775, 9],
          ].map(([x, y, size], index) => (
            <Path
              key={index}
              transform={`translate(${x} ${y}) scale(${size})`}
              d="M0 -1 Q0.2 -0.2 1 0 Q0.2 0.2 0 1 Q-0.2 0.2 -1 0 Q-0.2 -0.2 0 -1"
              fill={ink}
            />
          ))}
          {[
            [90, 140],
            [340, 470],
            [23, 580],
            [260, 720],
            [65, 320],
          ].map(([x, y], index) => (
            <Circle key={index} cx={x} cy={y} r="3" fill={softWhite} />
          ))}
          <Path
            d="M240 700 Q290 665 345 705"
            stroke={ink}
            strokeWidth="2"
            strokeDasharray="4 9"
            fill="none"
            opacity="0.4"
          />
        </G>
      )}
    </Svg>
  );
};
