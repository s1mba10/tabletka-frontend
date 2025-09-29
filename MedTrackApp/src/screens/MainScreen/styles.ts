// styles.ts
import { StyleSheet } from 'react-native';

const YELLOW = '#FFC107';
const BG_DARK = '#121212';
const BLUE = ''

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_DARK,
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Вертикальная прокрутка
  verticalScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28, // чтобы нижние элементы не упирались в таб-бар
  },

  // ===== Профиль =====
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2C2C2C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: { width: 48, height: 48, borderRadius: 24 },
  avatarInitial: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  profileName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  profileNamePlaceholder: { color: '#888', fontSize: 18, fontWeight: 'normal' },
  crown: { marginLeft: 6 },
  chevron: { marginLeft: 8 },

  // ===== Горизонтальные фичи (с тонкой жёлтой обводкой) =====
  featuresContainer: { paddingVertical: 6, marginBottom: 14 },
  featureCard: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: '#1F1F1F',
    borderWidth: 1,                 // тонкая
    borderColor: YELLOW,            // ЖЁЛТАЯ как у «Шагов за день»
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageBackground: { flex: 1 },
  featureCardImage: { borderRadius: 16 },
  featureOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 16 },
  featureContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  featureContentBottom: { justifyContent: 'flex-end', paddingTop: 8, paddingBottom: 8, paddingHorizontal: 2 },
  iconWrapper: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center', alignItems: 'center',
  },
  featureLabel: { color: '#E0E0E0', textAlign: 'center', fontSize: 13, fontWeight: '500', marginTop: 6 },
  featureLabelImage: { marginTop: 0 },

  // ===== Быстрые метрики (Шаги/Вода) =====
  quickRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  miniStat: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  miniIconBubble: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  miniLabel: { color: '#BDBDBD', fontSize: 12, marginBottom: 2 },
  miniValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },

  // ===== Календарь недели =====
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#171717',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 12,
  },
  weekCell: {
    width: 40, height: 56, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  weekCellActive: { backgroundColor: 'rgba(255, 193, 7, 0.18)' }, // мягкий жёлтый фон для "сегодня"
  weekCellText: { color: '#9E9E9E', fontSize: 12, marginBottom: 2 },
  weekCellDay: { color: '#E0E0E0', fontSize: 16, fontWeight: '700' },
  weekCellTextActive: { color: '#FFFFFF' },

  // ===== Приёмы пищи =====
  mealsBlock: {
    backgroundColor: '#151515',
    borderRadius: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 14,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mealLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  mealTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  mealKcal: { color: '#BDBDBD', fontSize: 13, marginLeft: 8 },
  mealAddBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: YELLOW,
    alignItems: 'center', justifyContent: 'center',
  },

  // ===== Кольцо соблюдения =====
  adherenceWrapper: { alignItems: 'center', marginBottom: 16 },

  // ===== 2x2 превью статистики =====
  grid4: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },

  // ===== Нижние три карточки-саммари =====
  summaryRow: {
    flexDirection: 'row',
    marginVertical: 16,
    gap: 12,
  },
});
