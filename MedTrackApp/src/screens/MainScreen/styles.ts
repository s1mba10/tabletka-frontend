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
  placeholderName: {
    color: '#888',
    fontSize: 20,
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
    width: 110,
    height: 110,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  featureContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureCardImage: {
    borderRadius: 10,
  },
  featureIcon: {
    marginBottom: 8,
  },
  featureLabel: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
  },
  adherenceWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
});
