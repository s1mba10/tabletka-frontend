import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, AccessibilityInfo, Easing } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Filter,
  FeGaussianBlur,
} from 'react-native-svg';
import { Animated } from 'react-native';

interface Props {
  label: string;
  consumed: number;
  target?: number;
  type: 'calories' | 'protein' | 'fat' | 'carbs';
}

const MacroRing: React.FC<Props> = ({ label, consumed, target, type }) => {
  const radius = 48;
  const strokeWidth = 12;
  const size = 120;
  const circumference = 2 * Math.PI * radius;

  const pct = target ? (consumed / target) * 100 : NaN;
  const normalized = isFinite(pct) ? Math.min(Math.max(pct, 0), 100) : 0;
  const displayPct = isFinite(pct)
    ? Math.min(Math.max(Math.round(pct), 0), 300)
    : null;

  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      // @ts-ignore
      sub.remove && sub.remove();
    };
  }, []);

  const progress = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const toValue = normalized;
    const glowTo = target && isFinite(pct) ? 0.45 : 0;
    if (reduceMotion) {
      progress.setValue(toValue);
      glowOpacity.setValue(glowTo);
    } else {
      Animated.timing(progress, {
        toValue,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
      Animated.timing(glowOpacity, {
        toValue: glowTo,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [normalized, reduceMotion, pct, target, progress, glowOpacity]);

  const offset = progress.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const id = useRef(Math.random().toString(36).slice(2)).current;

  let gradient = `gradGreen${id}`;
  let glowColor = '#22C55E';
  if (type === 'calories') {
    if (pct > 110) {
      gradient = `gradRed${id}`;
      glowColor = '#EF4444';
    } else if (pct > 100) {
      gradient = `gradAmber${id}`;
      glowColor = '#FFC107';
    } else {
      gradient = `gradGreen${id}`;
      glowColor = '#22C55E';
    }
  } else if (type === 'fat') {
    gradient = `gradRed${id}`;
    glowColor = '#EF4444';
  } else if (type === 'carbs') {
    gradient = `gradBlue${id}`;
    glowColor = '#3B82F6';
  } else {
    gradient = `gradGreen${id}`;
    glowColor = '#22C55E';
  }

  const pctLabel = displayPct !== null ? `${displayPct}%` : '—%';

  const accessibilityLabel = target && isFinite(pct)
    ? `${label}: ${pctLabel} от цели за выбранный день`
    : `${label}: цель не задана`;

  const AnimatedCircle = useMemo(() => Animated.createAnimatedComponent(Circle), []);

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.svgWrapper}>
        <Svg width={size} height={size} style={{ overflow: 'visible' }}>
          <Defs>
            <Filter
              id={`ringGlow${id}`}
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <FeGaussianBlur stdDeviation="6" />
            </Filter>
            <LinearGradient
              id={`gradGreen${id}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <Stop offset="0%" stopColor="#34D399" />
              <Stop offset="100%" stopColor="#22C55E" />
            </LinearGradient>
            <LinearGradient
              id={`gradAmber${id}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <Stop offset="0%" stopColor="#FFD54F" />
              <Stop offset="100%" stopColor="#FFC107" />
            </LinearGradient>
            <LinearGradient
              id={`gradRed${id}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <Stop offset="0%" stopColor="#FF6B6B" />
              <Stop offset="100%" stopColor="#EF4444" />
            </LinearGradient>
            <LinearGradient
              id={`gradBlue${id}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <Stop offset="0%" stopColor="#60A5FA" />
              <Stop offset="100%" stopColor="#3B82F6" />
            </LinearGradient>
          </Defs>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {target && isFinite(pct) && (
            <>
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={glowColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={offset}
                opacity={glowOpacity}
                filter={`url(#ringGlow${id})`}
              />
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={`url(#${gradient})`}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={offset}
              />
            </>
          )}
        </Svg>
        <View style={styles.textWrapper} pointerEvents="none">
          <Text style={styles.percent}>{pctLabel}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    overflow: 'visible',
  },
  svgWrapper: {
    padding: 12,
    overflow: 'visible',
  },
  textWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percent: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  },
});

export default MacroRing;
