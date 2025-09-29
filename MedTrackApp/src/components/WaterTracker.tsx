// components/WaterTracker.tsx
import React, { useMemo, useRef, useEffect, useState } from 'react';
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

/* Пороговые значения поведения воды */
const LOW_EPS = 0.02;   // ниже — воду не рисуем совсем
const FULL_EPS = 0.995; // выше (с учётом fullLevel) — волна замирает и поверхность ровная

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

  // ВАЖНО: больше НИКОГДА не укорачиваем массив уровней — только расширяем
  useEffect(() => {
    const arr = levelsRef.current;
    while (arr.length < total) {
      const i = arr.length;
      arr.push(new Animated.Value(i < value ? 1 : 0));
    }
    // arr остаётся той же ссылкой; не делаем slice()
  }, [total, value]);

  // стартовые значения при первом монтировании
  useEffect(() => {
    levelsRef.current.forEach((lv, i) => lv.setValue(i < value ? 1 : 0));
  }, []);

  // если родитель по какой-то причине не обрезал значение — обрежем сами мягко
  useEffect(() => {
    if (value > total) {
      // отложим на следующий тик, чтобы не конфликтовать с ререндером
      const id = setTimeout(() => onChange(total), 0);
      return () => clearTimeout(id);
    }
  }, [value, total, onChange]);

  // плавная синхронизация, если value меняется извне
  const prevValueRef = useRef<number>(value);
  useEffect(() => {
    let prev = prevValueRef.current;

    // гарантируем, что prev в допустимых пределах текущих буферов
    const maxIndex = Math.min(levelsRef.current.length, total);

    prev = Math.min(prev, maxIndex);
    const nextVal = Math.min(value, maxIndex);

    if (nextVal === prev) {
      prevValueRef.current = value;
      return;
    }

    if (nextVal > prev) {
      const anims: Animated.CompositeAnimation[] = [];
      for (let i = prev; i < nextVal; i++) {
        const v = levelsRef.current[i];
        if (!v) continue;
        anims.push(
          Animated.timing(v, { toValue: 1, duration: 220, useNativeDriver: false }),
        );
      }
      Animated.stagger(35, anims).start();
    } else {
      const anims: Animated.CompositeAnimation[] = [];
      for (let i = prev - 1; i >= nextVal; i--) {
        const v = levelsRef.current[i];
        if (!v) continue;
        anims.push(
          Animated.timing(v, { toValue: 0, duration: 200, useNativeDriver: false }),
        );
      }
      Animated.stagger(35, anims).start();
    }

    prevValueRef.current = value;
  }, [value, total]);

  /* ---------- Обработчики ---------- */
  const handleToggle = (index: number) => {
    const next = index === value - 1 ? value - 1 : index + 1;

    // локальная анимация только в рамках существующих буферов
    const maxIndex = Math.min(levelsRef.current.length, total);
    const safeNext = Math.min(Math.max(0, next), maxIndex);

    if (safeNext > value) {
      const anims: Animated.CompositeAnimation[] = [];
      for (let i = value; i < safeNext; i++) {
        const v = levelsRef.current[i];
        if (!v) continue;
        anims.push(
          Animated.timing(v, { toValue: 1, duration: 220, useNativeDriver: false }),
        );
      }
      Animated.stagger(35, anims).start();
    } else if (safeNext < value) {
      const anims: Animated.CompositeAnimation[] = [];
      for (let i = value - 1; i >= safeNext; i--) {
        const v = levelsRef.current[i];
        if (!v) continue;
        anims.push(
          Animated.timing(v, { toValue: 0, duration: 200, useNativeDriver: false }),
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
            // на всякий случай подстрахуемся и здесь
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
        {Array.from({ length: total }).map((_, i) => (
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
            <CupWithWave
              index={i}
              level={levelsRef.current[i] || new Animated.Value(i < value ? 1 : 0)}
              fullLevel={fillLevel}
              isFilledTarget={i < value}
            />

            {/* Плюс исчезает при заполнении */}
            <CupPlus level={levelsRef.current[i] || new Animated.Value(i < value ? 1 : 0)} />
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default WaterTracker;

/* ---------- SVG path стакана ---------- */
const cupPathString = () => {
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

/* ---------- Плюс ---------- */
const CupPlus: React.FC<{ level: Animated.Value }> = ({ level }) => {
  const [lvl, setLvl] = useState(0);
  useEffect(() => {
    const id = level.addListener(({ value }) => setLvl(value as number));
    return () => level.removeListener(id);
  }, [level]);
  return (
    <View pointerEvents="none" style={[styles.plusWrap, { opacity: 1 - lvl }]}>
      <Text style={styles.plus}>＋</Text>
    </View>
  );
};

/* ---------- Стакан с волной и режимами (нет воды / волна / ровно) ---------- */
const CupWithWave: React.FC<{
  index: number;
  level: Animated.Value;   // 0..1
  fullLevel: number;       // доля высоты, которая считается «полной»
  isFilledTarget: boolean; // влияет на цвет контура
}> = ({ index, level, fullLevel, isFilledTarget }) => {
  const [lvl, setLvl] = useState(0);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id = level.addListener(({ value }) => setLvl(value as number));
    return () => level.removeListener(id);
  }, [level]);

  const yBot = CUP_H - 3;
  const topHeight = fullLevel * INNER_H * Math.min(1, Math.max(0, lvl));
  const surfaceY = yBot - topHeight;

  const fullness = Math.min(1, Math.max(0, lvl * fullLevel));
  const baseAmp = 3;
  const amp = fullness > FULL_EPS ? 0 : baseAmp * (1 - fullness);

  // ДВИЖЕНИЕ ВОЛНЫ — только если есть вода и не «полный верх»
  const shouldAnimate = lvl > LOW_EPS && fullness < FULL_EPS;

  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!shouldAnimate) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    let last = Date.now();
    const tick = () => {
      const now = Date.now();
      const dt = now - last;
      last = now;
      const speed = 30;
      setPhase(p => (p + (speed * dt) / 1000) % (CUP_W * 2));
      rafRef.current = requestAnimationFrame(tick);
    };
    last = Date.now();
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [shouldAnimate]);

  const strokeColor = isFilledTarget ? 'rgba(0,186,255,0.95)' : 'rgba(255,255,255,0.28)';
  const waterColor = 'rgba(0,186,255,0.7)';
  const cupPath = cupPathString();

  const xTopL = (CUP_W - TOP_W) / 2;
  const xTopR = xTopL + TOP_W;
  const yTop = 3;

  return (
    <View style={{ width: CUP_W, height: CUP_H }}>
      {/* Контур стакана */}
      <Svg width={CUP_W} height={CUP_H} style={StyleSheet.absoluteFill}>
        <Path d={cupPath} stroke={strokeColor} strokeWidth={STROKE} fill="transparent" />
        <Path
          d={`M ${xTopL + 1} ${yTop + 1} L ${xTopR - 1} ${yTop + 1}`}
          stroke={strokeColor}
          strokeWidth={1}
          opacity={isFilledTarget ? 0.8 : 0.4}
        />
      </Svg>

      {/* Вода */}
      <Svg width={CUP_W} height={CUP_H} style={StyleSheet.absoluteFill}>
        <Defs>
          <ClipPath id={`cupClip-${index}`}>
            <Path d={cupPath} />
          </ClipPath>
        </Defs>

        {/* НИЗКИЙ УРОВЕНЬ — вообще ничего не рисуем */}
        {lvl <= LOW_EPS ? null : (
          <>
            {/* Почти полный — ровная поверхность, без волны */}
            {fullness >= FULL_EPS ? (
              <Rect
                x={0}
                y={surfaceY}
                width={CUP_W}
                height={yBot - surfaceY + 3}
                fill={waterColor}
                clipPath={`url(#cupClip-${index})`}
              />
            ) : (
              <Path
                d={buildWavePath(surfaceY, amp, phase)}
                fill={waterColor}
                clipPath={`url(#cupClip-${index})`}
              />
            )}
          </>
        )}
      </Svg>
    </View>
  );
};

function buildWavePath(surfaceY: number, amp: number, phase: number) {
  const yBot = CUP_H - 3;
  const wavelength = 24;
  const samples = 24;
  const xStart = -CUP_W;
  const xEnd = CUP_W * 2;
  const width = xEnd - xStart;

  const pts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const x = xStart + (width * i) / samples;
    const y = surfaceY + amp * Math.sin(((x + phase) / wavelength) * 2 * Math.PI);
    pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  pts.push(`L ${xEnd} ${yBot + 3}`);
  pts.push(`L ${xStart} ${yBot + 3} Z`);
  return pts.join(' ');
}

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