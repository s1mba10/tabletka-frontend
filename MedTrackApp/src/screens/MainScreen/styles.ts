import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 20,
    paddingTop: 10,
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
    paddingVertical: 10,
    marginBottom: 20,
  },
  featureCard: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: '#1F1F1F',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageBackground: {
    flex: 1,
  },
  featureCardImage: {
    borderRadius: 16,
  },
  featureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
  },
  featureContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContentBottom: {
    justifyContent: 'flex-end',
    padding: 8,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureLabel: {
    color: '#E0E0E0',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
  },
  featureLabelImage: {
    marginTop: 0,
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
