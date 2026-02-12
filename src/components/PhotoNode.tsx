import React from 'react';
import { Circle, Text, ClipPath, Defs, Image, Rect } from 'react-native-svg';
import { getInitials } from '../utils/initials';
import type { TreeTheme } from '../types';

interface PhotoNodeProps {
  name: string;
  photo?: string;
  x: number;
  y: number;
  size: number;
  shape: 'circle' | 'rounded';
  theme: TreeTheme;
}

export const PhotoNode = React.memo(function PhotoNode({
  name,
  photo,
  x,
  y,
  size,
  shape,
  theme,
}: PhotoNodeProps) {
  const radius = size / 2;
  const centerX = x + radius;
  const centerY = y + radius;
  const clipId = `photo-clip-${centerX}-${centerY}`;

  if (photo) {
    return (
      <>
        <Defs>
          <ClipPath id={clipId}>
            {shape === 'circle' ? (
              <Circle cx={centerX} cy={centerY} r={radius} />
            ) : (
              <Rect x={x} y={y} width={size} height={size} rx={8} ry={8} />
            )}
          </ClipPath>
        </Defs>
        <Image
          x={x}
          y={y}
          width={size}
          height={size}
          href={photo}
          clipPath={`url(#${clipId})`}
          preserveAspectRatio="xMidYMid slice"
        />
      </>
    );
  }

  // Fallback: initials on colored background
  const initials = getInitials(name);

  return (
    <>
      {shape === 'circle' ? (
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill={theme.photoPlaceholderColor}
        />
      ) : (
        <Rect
          x={x}
          y={y}
          width={size}
          height={size}
          rx={8}
          ry={8}
          fill={theme.photoPlaceholderColor}
        />
      )}
      <Text
        x={centerX}
        y={centerY + theme.fontSize / 3}
        fontSize={theme.fontSize + 4}
        fontFamily={theme.fontFamily}
        fontWeight="bold"
        fill={theme.nodeTextColor}
        textAnchor="middle"
      >
        {initials}
      </Text>
    </>
  );
});
