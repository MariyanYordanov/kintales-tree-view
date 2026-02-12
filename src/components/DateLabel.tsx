import React from 'react';
import { Text } from 'react-native-svg';
import { formatDateLabel } from '../utils/dateFormat';
import type { TreeTheme } from '../types';

interface DateLabelProps {
  birthYear?: number;
  deathYear?: number;
  x: number;
  y: number;
  theme: TreeTheme;
}

export const DateLabel = React.memo(function DateLabel({
  birthYear,
  deathYear,
  x,
  y,
  theme,
}: DateLabelProps) {
  const label = formatDateLabel(birthYear, deathYear);
  if (!label) return null;

  return (
    <Text
      x={x}
      y={y}
      fontSize={theme.fontSize - 2}
      fontFamily={theme.fontFamily}
      fill={theme.nodeTextColor}
      textAnchor="middle"
      opacity={0.7}
    >
      {label}
    </Text>
  );
});
