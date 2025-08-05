import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  containerLight: {
    backgroundColor: '#FFFFFF',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2C2C2C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarInitial: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileNamePlaceholder: {
    color: '#888',
    fontSize: 20,
    fontWeight: 'normal',
  },
  crown: {
    marginLeft: 5,
  },
  chevron: {
    marginLeft: 10,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 10,
    marginBottom: 20,
  },
  featurePressable: {
    borderRadius: 16,
    marginRight: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  featureCard: {
    width: 96,
    height: 96,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  featureCardDark: {
    backgroundColor: '#1E1E1E',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  featureCardLight: {
    backgroundColor: '#F2F2F2',
    borderColor: 'rgba(0,0,0,0.2)',
  },
  featureContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureCardImage: {
    borderRadius: 16,
  },
  featureIcon: {
    marginBottom: 6,
  },
  featureLabel: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  featureLabelDark: {
    color: '#fff',
  },
  featureLabelLight: {
    color: '#000',
  },
  adherenceWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
});
