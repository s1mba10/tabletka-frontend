// components/WaterTracker.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Rect, Defs, ClipPath } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


type Props = {
  value: number;                  // отмечено стаканов (0..total)
  total?: number;                 // всего стаканов
  onChange: (next: number) => void;
  glassMl?: number;               // объём одного стакана в мл (по умолчанию 250)
  fillLevel?: number;             // визуальная высота заливки 0..1
  style?: ViewStyle;              // стиль контейнера снаружи
};

const WaterTracker: React.FC<Props> = ({
  value,
  total = 10,
  onChange,
  glassMl = 250,
  fillLevel = 0.65,
  style,
}) => {
  const liters = (value * glassMl) / 1000;
  const totalLiters = (total * glassMl) / 1000;

  const handleToggle = (index: number) => {
    // Тап по тому же последнему заполненному — «отменяем» его.
    // Иначе заполняем до index+1 (последовательная логика).
    const next = index === value - 1 ? value - 1 : index + 1;
    onChange(Math.max(0, Math.min(total, next)));
  };

  return (
  <View style={[styles.card, style]}>
    <View style={styles.headerRow}>
      {/* Заголовок + иконка капли */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.title}>Стаканы воды</Text>
        <Icon
          name="water"              // можно заменить на water-outline или water-plus
          size={18}
          color="rgba(0,186,255,0.95)" // тот же цвет, что у заливки стакана
          style={{ marginLeft: 2 }}
        />
      </View>

      {/* Правая часть (счётчики) */}
      <View style={styles.rightInfo}>
        <Text style={styles.counter}>{value}/{total} ст.</Text>
        <Text style={styles.liters}>
          {value} ст. = {liters.toFixed(liters < 1 ? 2 : 1)} л
        </Text>
      </View>
    </View>

      <View style={styles.row}>
        {Array.from({ length: total }).map((_, i) => {
          const filled = i < value;
          return (
            <Pressable
              key={i}
              onPress={() => handleToggle(i)}
              android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
              style={({ pressed }) => [styles.cupTouch, pressed && { opacity: 0.9 }]}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={`Стакан ${i + 1} из ${total}${filled ? ', заполнен' : ', пустой'}`}
              accessibilityHint={filled ? 'Нажмите, чтобы убрать этот стакан из счёта' : 'Нажмите, чтобы добавить этот стакан'}
            >
              <CupSvg filled={filled} fillLevel={fillLevel} />
              {!filled && (
                <View pointerEvents="none" style={styles.plusWrap}>
                  <Text style={styles.plus}>＋</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default WaterTracker;

/* ---------- SVG-«стакан»: верх шире низа (нормальная форма) ---------- */

const CUP_W = 34;
const CUP_H = 42;
const STROKE = 2;
const TOP_W = 28;   // ширина горлышка (шире)
const BOT_W = 22;   // ширина донышка (уже)
const INNER_H = CUP_H - 6;

const CupSvg: React.FC<{ filled: boolean; fillLevel: number }> = ({ filled, fillLevel }) => {
  const xTopL = (CUP_W - TOP_W) / 2;
  const xTopR = xTopL + TOP_W;
  const xBotL = (CUP_W - BOT_W) / 2;
  const xBotR = xBotL + BOT_W;
  const yTop = 3;
  const yBot = CUP_H - 3;

  const cupPath = `M ${xTopL} ${yTop}
                   L ${xTopR} ${yTop}
                   L ${xBotR} ${yBot}
                   L ${xBotL} ${yBot}
                   Z`;

  const fillHeight = Math.max(0, Math.min(1, fillLevel)) * INNER_H;
  const fillY = yBot - fillHeight;

  const strokeColor = filled ? 'rgba(0,186,255,0.95)' : 'rgba(255,255,255,0.28)';
  const waterColor  = filled ? 'rgba(0,186,255,0.7)'  : 'transparent';

  return (
    <Svg width={CUP_W} height={CUP_H}>
      <Defs>
        <ClipPath id="cupClip">
          <Path d={cupPath} />
        </ClipPath>
      </Defs>

      {/* Контур стакана */}
      <Path d={cupPath} stroke={strokeColor} strokeWidth={STROKE} fill="transparent" />

      {/* Заливка снизу */}
      <Rect
        x={0}
        y={fillY}
        width={CUP_W}
        height={fillHeight + 2}
        fill={waterColor}
        clipPath="url(#cupClip)"
      />

      {/* тонкий верхний «ободок» */}
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
  title: { color: '#fff', fontSize: 16, fontWeight: '600' },
  rightInfo: { alignItems: 'flex-end' },
  counter: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' },
  liters: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  totalLitersHint: { color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2 },

  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cupTouch: {
    width: CUP_W,
    height: CUP_H,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // для абсолютного позиционирования плюса
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