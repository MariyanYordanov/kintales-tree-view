import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-native',
    'react-native-svg',
    'react-native-gesture-handler',
    'react-native-reanimated',
  ],
  treeshake: true,
});
