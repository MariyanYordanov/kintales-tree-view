import { useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

export interface PanZoomConfig {
  enablePan: boolean;
  enableZoom: boolean;
  minZoom: number;
  maxZoom: number;
  initialZoom: number;
}

export interface PanZoomState {
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  scale: SharedValue<number>;
}

export interface PanZoomResult {
  gesture: ReturnType<typeof Gesture.Simultaneous>;
  state: PanZoomState;
}

const ANIMATION_DURATION = 250;

/**
 * Hook that provides pan + pinch-to-zoom + double-tap-to-reset gestures.
 * Uses react-native-gesture-handler v2 API + react-native-reanimated shared values.
 */
export function usePanZoom(config: PanZoomConfig): PanZoomResult {
  const { enablePan, enableZoom, minZoom, maxZoom, initialZoom } = config;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(initialZoom);

  // Saved values for gesture continuity
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const savedScale = useSharedValue(initialZoom);

  const panGesture = useMemo(() => {
    const gesture = Gesture.Pan()
      .enabled(enablePan)
      .onStart(() => {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      })
      .onUpdate((event) => {
        translateX.value = savedTranslateX.value + event.translationX;
        translateY.value = savedTranslateY.value + event.translationY;
      });

    return gesture;
  }, [enablePan, translateX, translateY, savedTranslateX, savedTranslateY]);

  const pinchGesture = useMemo(() => {
    const gesture = Gesture.Pinch()
      .enabled(enableZoom)
      .onStart(() => {
        savedScale.value = scale.value;
      })
      .onUpdate((event) => {
        const newScale = savedScale.value * event.scale;
        scale.value = Math.min(Math.max(newScale, minZoom), maxZoom);
      });

    return gesture;
  }, [enableZoom, minZoom, maxZoom, scale, savedScale]);

  const doubleTapGesture = useMemo(() => {
    const gesture = Gesture.Tap()
      .numberOfTaps(2)
      .onEnd(() => {
        // Reset to initial state
        translateX.value = withTiming(0, { duration: ANIMATION_DURATION });
        translateY.value = withTiming(0, { duration: ANIMATION_DURATION });
        scale.value = withTiming(initialZoom, {
          duration: ANIMATION_DURATION,
        });
      });

    return gesture;
  }, [initialZoom, translateX, translateY, scale]);

  const composedGesture = useMemo(
    () =>
      Gesture.Simultaneous(
        doubleTapGesture,
        Gesture.Simultaneous(panGesture, pinchGesture),
      ),
    [panGesture, pinchGesture, doubleTapGesture],
  );

  const state: PanZoomState = { translateX, translateY, scale };

  return { gesture: composedGesture, state };
}
