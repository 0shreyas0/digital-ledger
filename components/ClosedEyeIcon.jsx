import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function ClosedEyeIcon({ size = 22, color = '#64748b', style }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Curved eyelid */}
      <Path
        d="M 4 11 Q 12 21 20 11"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Eyelash 1 (left) */}
      <Path
        d="M 7.2 14.2 L 5.5 17.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Eyelash 2 (mid-left) */}
      <Path
        d="M 10.4 15.8 L 9.5 19.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Eyelash 3 (mid-right) */}
      <Path
        d="M 13.6 15.8 L 14.5 19.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Eyelash 4 (right) */}
      <Path
        d="M 16.8 14.2 L 18.5 17.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
