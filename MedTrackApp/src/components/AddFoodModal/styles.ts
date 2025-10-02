import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1E1E' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerButton: { color: '#22C55E', fontSize: 16 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerSubtitle: { color: '#ccc', fontSize: 12 },

  // carousel header
  tabsCarouselRow: {
    height: 44,
    backgroundColor: '#101010',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#2A2A2A',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabSideBoxLeft: { flex: 1, alignItems: 'flex-start', justifyContent: 'center' },
  tabSideBoxRight: { flex: 1, alignItems: 'flex-end', justifyContent: 'center' },
  tabSideSpacer: { height: 20, width: 1 },
  tabSide: { color: '#9AA0A6', fontSize: 13, opacity: 0.8 },
  tabCenter: { color: '#fff', fontSize: 14, fontWeight: '700', paddingHorizontal: 8 },

  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 8,
    color: '#fff',
    margin: 8,
  },
  listItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  itemName: { color: '#fff', fontSize: 16 },
  itemBrand: { color: '#aaa', fontSize: 16 },
  itemDetails: { color: '#aaa', fontSize: 12, marginTop: 2 },
  empty: { color: '#aaa', padding: 16, textAlign: 'center' },

  // Фиксированный нижний лист деталей
  detailsSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#151515',
    borderTopColor: '#2A2A2A',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  detailsSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  closeText: { color: '#9AA0A6' },

  detailsTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', flex: 1 },

  label: { color: '#fff', marginHorizontal: 8, marginTop: 8 },
  helper: { color: '#aaa', margin: 8, fontSize: 12 },

  favRow: { flexDirection: 'row', alignItems: 'center', margin: 8 },
  favLabel: { color: '#fff', marginLeft: 4 },
  starButton: { padding: 8 },
  star: { color: '#777', fontSize: 18 },

  segment: {
    flexDirection: 'row',
    margin: 8,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segmentBtn: { flex: 1, padding: 8, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: '#333' },
  segmentText: { color: '#fff', fontSize: 14 },

  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ingredientName: { color: '#fff', fontSize: 16 },
  ingredientInfo: { color: '#aaa', fontSize: 12 },
  smallBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  smallBtnText: { color: '#22C55E', fontSize: 12 },
  addIngredientBtn: {
    margin: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#22C55E',
    borderRadius: 8,
  },
  totalsBlock: { margin: 8 },
  totalsLine: { color: '#fff', fontSize: 12, marginVertical: 2 },

  dishButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 16,
  },
  saveDishButton: {
    backgroundColor: '#22C55E',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  saveDishText: { color: '#000', fontWeight: 'bold' },
  cancelDishButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#777',
    minWidth: 120,
    alignItems: 'center',
  },
  cancelDishText: { color: '#fff' },

  // нижний фиксированный бар
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderTopColor: '#2A2A2A',
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#1E1E1E',
  },
  toAddTitle: { color: '#9AA0A6', fontSize: 12 },
  toAddVals: { color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 2 },

  // использовалось в модалке ингредиента
  favToggle: {
    margin: 8,
    alignItems: 'center',
  },
});
