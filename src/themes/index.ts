import type { TreeTheme } from '../types';
import { warmTheme } from './warm';
import { neutralTheme } from './neutral';

export { warmTheme } from './warm';
export { neutralTheme } from './neutral';

export function resolveTheme(
  theme: 'warm' | 'neutral' | 'custom' = 'warm',
  customTheme?: TreeTheme,
): TreeTheme {
  if (theme === 'custom' && customTheme) {
    return customTheme;
  }
  return theme === 'neutral' ? neutralTheme : warmTheme;
}
