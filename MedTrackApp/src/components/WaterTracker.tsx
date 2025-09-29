// components/WaterTracker.tsx
import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  Platform,
  Alert,
  ActionSheetIOS,
  Animated,
} from 'react-native';
import Svg, { Path, Defs, ClipPath, Rect } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/* ---------- Константы стакана ---------- */
const CUP_W = 34;
const CUP_H = 42;
const STROKE = 2;
const TOP_W = 28;
const BOT_W = 22;
const INNER_H = CUP_H - 6;

/* Animated Rect из react-native-svg (ВАЖНО: не через Svg.Rect!) */
const AnimatedSvgRect = Animated.createAnimatedComponent(Rect);

type Props = {
  value: number;                               // отмечено стаканов (0..total)
  total?: number;                              // всего стаканов
  onChange: (next: number) => void;
  glassMl?: number;                            // объём одного стакана в мл (по умолчанию 250)
  fillLevel?: number;                          // визуальная высота заливки для "полного" стакана (0..1)
  style?: ViewStyle;                           // стиль контейнера снаружи
  onChangeTotal?: (nextTotal: number) => void; // изменить дневную цель (опционально)
};

const WaterTracker: React.FC<Props> = ({
  value,
  total = 10,
  onChange,
  glassMl = 250,
  fillLevel = 0.65,
  style,
  onChangeTotal,
}) => {
  const liters = (value * glassMl) / 1000;
  const totalLiters = (total * glassMl) / 1000;

  /* ---------- Анимируемые уровни для каждого стакана ---------- */
  const levelsRef = useRef<Animated.Value[]>([]);

  useEffect(() => {
    // подгоняем массив под актуальный total
    const arr = levelsRef.current.slice(0, total);
    while (arr.length < total) {
      const i = arr.length;
      arr.push(new Animated.Value(i < value ? 1 : 0));
    }
    levelsRef.current = arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  // стартовые значения при первом монтировании
  useEffect(() => {
    levelsRef.current.forEach((lv, i) => lv.setValue(i < value ? 1 : 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // плавная синхронизация, если value меняется извне
  const prevValueRef = useRef<number>(value);
  useEffect(() => {
    const prev = prevValueRef.current;
    if (value === prev) return;

    if (value > prev) {
      const anims = [];
      for (let i = prev; i < Math.min(value, total); i++) {
        anims.push(
          Animated.timing(levelsRef.current[i], {
            toValue: 1,
            duration: 220,
            useNativeDriver: false,
          }),
        );
      }
      Animated.stagger(35, anims).start();
    } else {
      const anims = [];
      for (let i = prev - 1; i >= Math.max(value, 0); i--) {
        anims.push(
          Animated.timing(levelsRef.current[i], {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
        );
      }
      Animated.stagger(35, anims).start();
    }

    prevValueRef.current = value;
  }, [value, total]);

  /* ---------- Обработчики ---------- */
  const handleToggle = (index: number) => {
    const next = index === value - 1 ? value - 1 : index + 1;

    if (next > value) {
      const anims = [];
      for (let i = value; i < Math.min(next, total); i++) {
        anims.push(
          Animated.timing(levelsRef.current[i], {
            toValue: 1,
            duration: 220,
            useNativeDriver: false,
          }),
        );
      }
      Animated.stagger(35, anims).start();
    } else if (next < value) {
      const anims = [];
      for (let i = value - 1; i >= Math.max(next, 0); i--) {
        anims.push(
          Animated.timing(levelsRef.current[i], {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
        );
      }
      Animated.stagger(35, anims).start();
    }

    onChange(Math.max(0, Math.min(total, next)));
  };

  const waterBlue = 'rgba(0,186,255,0.95)';
  const gearGray = 'rgba(255,255,255,0.65)';

  const openTotalPicker = () => {
    if (!onChangeTotal) return;

    const presets = [6, 8, 10, 12, 14];
    const options = presets.map(n => `${n} стак.`);

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Дневная цель по воде',
          options: [...options, 'Отмена'],
          cancelButtonIndex: options.length,
          userInterfaceStyle: 'dark',
        },
        idx => {
          if (idx != null && idx >= 0 && idx < options.length) {
            const nextTotal = presets[idx];
            onChangeTotal(nextTotal);
            if (value > nextTotal) onChange(nextTotal);
          }
        },
      );
    } else {
      Alert.alert('Дневная цель по воде', 'Выбери количество стаканов в день:', [
        ...presets.map(v => ({
          text: `${v} стак.`,
          onPress: () => {
            onChangeTotal(v);
            if (value > v) onChange(v);
          },
        })),
        { text: 'Отмена', style: 'cancel' },
      ]);
    }
  };

  const rightInfo = useMemo(() => {
    const content = (
      <>
        <View style={styles.counterRow}>
          {onChangeTotal && <Icon name="pencil-outline" size={14} color={gearGray} />}
          <Text style={styles.counter}>{value}/{total} ст.</Text>
        </View>
        <Text style={styles.liters}>
          {value} ст. = {liters.toFixed(liters < 1 ? 2 : 1)} л
        </Text>
        <Text style={styles.totalLitersHint}>
          {total} ст. = {totalLiters.toFixed(1)} л
        </Text>
      </>
    );

    if (!onChangeTotal) return <View style={styles.rightInfoStatic}>{content}</View>;

    return (
      <Pressable
        onPress={openTotalPicker}
        hitSlop={8}
        style={({ pressed }) => [styles.rightInfoPressable, pressed && { opacity: 0.85 }]}
        accessibilityRole="button"
        accessibilityLabel="Изменить дневную цель по воде"
      >
        {content}
      </Pressable>
    );
  }, [onChangeTotal, value, total, liters, totalLiters]);

  return (
    <View style={[styles.card, style]}>
      {/* Шапка */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Стаканы воды</Text>
          <Icon name="water" size={18} color={waterBlue} style={{ marginLeft: 4 }} />
        </View>
        {rightInfo}
      </View>

      {/* Сетка стаканов */}
      <View style={styles.row}>
        {Array.from({ length: total }).map((_, i) => {
          const level = levelsRef.current[i] || new Animated.Value(i < value ? 1 : 0);
          // высота заливки (0.. fullLevel * INNER_H)
          const height = level.interpolate({
            inputRange: [0, 1],
            outputRange: [0, fillLevel * INNER_H],
          });
          // y = yBot - height
          const yTop = CUP_H - 3;
          const yAnim = Animated.subtract(yTop, height);
          const showPlusOpacity = Animated.subtract(1, level);

          return (
            <Pressable
              key={i}
              onPress={() => handleToggle(i)}
              android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
              style={({ pressed }) => [styles.cupTouch, pressed && { opacity: 0.9 }]}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={`Стакан ${i + 1} из ${total}${i < value ? ', заполнен' : ', пустой'}`}
              accessibilityHint={
                i < value
                  ? 'Нажмите, чтобы убрать этот стакан из счёта'
                  : 'Нажмите, чтобы добавить этот стакан'
              }
            >
              <CupBaseSvg filled={i < value} />

              {/* Анимируемая заливка */}
              <Svg width={CUP_W} height={CUP_H} style={StyleSheet.absoluteFill}>
                <Defs>
                  <ClipPath id={`cupClip-${i}`}>
                    <Path d={cupPath()} />
                  </ClipPath>
                </Defs>
                <AnimatedSvgRect
                  x={0 as any}
                  y={yAnim as any}
                  width={CUP_W as any}
                  height={Animated.add(height, 2) as any}
                  fill={'rgba(0,186,255,0.7)'}
                  clipPath={`url(#cupClip-${i})`}
                />
              </Svg>

              {/* Плюс исчезает при заполнении */}
              <Animated.View pointerEvents="none" style={[styles.plusWrap, { opacity: showPlusOpacity }]}>
                <Text style={styles.plus}>＋</Text>
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default WaterTracker;

/* ---------- Статический контур стакана и вспомогалки ---------- */

const cupPath = () => {
  const xTopL = (CUP_W - TOP_W) / 2;
  const xTopR = xTopL + TOP_W;
  const xBotL = (CUP_W - BOT_W) / 2;
  const xBotR = xBotL + BOT_W;
  const yTop = 3;
  const yBot = CUP_H - 3;
  return `M ${xTopL} ${yTop}
          L ${xTopR} ${yTop}
          L ${xBotR} ${yBot}
          L ${xBotL} ${yBot}
          Z`;
};

const CupBaseSvg: React.FC<{ filled: boolean }> = ({ filled }) => {
  const strokeColor = filled ? 'rgba(0,186,255,0.95)' : 'rgba(255,255,255,0.28)';
  const path = cupPath();
  const xTopL = (CUP_W - TOP_W) / 2;
  const xTopR = xTopL + TOP_W;
  const yTop = 3;

  return (
    <Svg width={CUP_W} height={CUP_H}>
      <Path d={path} stroke={strokeColor} strokeWidth={STROKE} fill="transparent" />
      <Path
        d={`M ${xTopL + 1} ${yTop + 1} L ${xTopR - 1} ${yTop + 1}`}
        stroke={strokeColor}
        strokeWidth={1}
        opacity={filled ? 0.8 : 0.4}
      />
    </Svg>
  );
};

/* --------------------- Стили ---------------------- */
const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    alignSelf: 'stretch',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center' },

  rightInfoPressable: { alignItems: 'flex-end' },
  rightInfoStatic: { alignItems: 'flex-end' },
  counterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  title: { color: '#fff', fontSize: 16, fontWeight: '600' },
  counter: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600', marginLeft: 6 },
  liters: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  totalLitersHint: { color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2 },

  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cupTouch: {
    width: CUP_W,
    height: CUP_H,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  plusWrap: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  plus: {
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
  },
});