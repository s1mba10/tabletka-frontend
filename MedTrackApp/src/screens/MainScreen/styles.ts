import { StyleSheet } from 'react-native';

const YELLOW = '#FFC107';
const BG_DARK = '#121212';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_DARK,
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  verticalScroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  scrollContentIOS: { paddingBottom: 90 },

  // Профиль
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 8,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#2C2C2C',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarImage: { width: 48, height: 48, borderRadius: 24 },
  avatarInitial: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  profileName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  profileNamePlaceholder: { color: '#888', fontSize: 18, fontWeight: 'normal' },
  crown: { marginLeft: 6 },
  chevron: { marginLeft: 8 },
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
  },
  loginIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginRight: 12,
  },
  loginPromptText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Фичи (на будущее)
  featuresContainer: { paddingVertical: 6, marginBottom: 14 },
  featureCard: {
    width: 96, height: 96, borderRadius: 16, backgroundColor: '#1F1F1F',
    borderWidth: 1, borderColor: YELLOW, marginRight: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 3, overflow: 'hidden',
  },
  imageBackground: { flex: 1 },
  featureCardImage: { borderRadius: 16 },
  featureOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 16 },
  featureContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  featureContentBottom: { justifyContent: 'flex-end', paddingTop: 8, paddingBottom: 8, paddingHorizontal: 2 },
  iconWrapper: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center',
  },
  featureLabel: { color: '#E0E0E0', textAlign: 'center', fontSize: 13, fontWeight: '500', marginTop: 6 },
  featureLabelImage: { marginTop: 0 },

  // Карточка прогресса недели (фон задаём динамически с инлайн-стилем)
  weeklyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 12,
  },
  weeklyLeft: { flex: 1, paddingRight: 12 },
  weeklyTitle: { color: '#F1F1F1', fontSize: 18, fontWeight: '700' },

  // Динамическая плашка
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginBottom: 6,
    gap: 6,
  },
  badgeText: { fontSize: 12 },

  // Центр маленького ринга — цвет задаём динамически
  weekRingCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringLabel: { alignItems: 'center' },
  // ringDays: { color: '#FFFFFF', fontWeight: '800', fontSize: 16, lineHeight: 18 },
  ringDays: { color: '#FFFFFF', fontWeight: '800', fontSize: 18, lineHeight: 22 },
  // ringSub: { color: 'rgba(255,255,255,0.85)', fontSize: 10, lineHeight: 12 },
  ringSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, lineHeight: 12 },

  // Быстрые метрики
  quickRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  miniStat: {
    flex: 1, backgroundColor: '#1A1A1A', borderRadius: 14, borderWidth: 1,
    paddingVertical: 10, paddingHorizontal: 12,
  },
  miniIconBubble: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  miniLabel: { color: '#BDBDBD', fontSize: 12, marginBottom: 2 },
  miniValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },

  // Календарь недели
  weekStrip: {
    flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#171717',
    borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 12,
  },
  weekCell: { width: 40, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  weekCellActive: { backgroundColor: 'rgba(255, 193, 7, 0.18)' },
  weekCellText: { color: '#9E9E9E', fontSize: 12, marginBottom: 2 },
  weekCellDay: { color: '#E0E0E0', fontSize: 16, fontWeight: '700' },
  weekCellTextActive: { color: '#FFFFFF' },

  // Приёмы пищи
  mealsBlock: {
    backgroundColor: '#151515', borderRadius: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 14,
  },
  mealRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12 },
  mealLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  mealTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  mealKcal: { color: '#BDBDBD', fontSize: 13, marginLeft: 8 },
  mealKcalWarning: { color: '#FF9800' },
  mealAddBtn: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: YELLOW,
    alignItems: 'center', justifyContent: 'center',
  },

  // 2x2
  grid4: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },

  waterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 12,
  },
  waterLeft: { width: 64, alignItems: 'center', justifyContent: 'center' },
  waterRight: { flex: 1 },
  waterTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  waterTitle: { color: '#F1F1F1', fontSize: 14, fontWeight: '700' },
  waterMainLine: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  waterHint: { color: '#9E9E9E', fontSize: 12, marginTop: 2 },
  });