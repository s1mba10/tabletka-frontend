import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export type AdherenceDisplayProps = {
  percentage: number;
  color: string;
};

const AdherenceDisplay: React.FC<AdherenceDisplayProps> = ({ percentage, color }) => {
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;
  const roundedPercentage = Math.round(percentage);

  return (
    <View style={styles.adherenceContainer}>
      <Svg height="200" width="200" viewBox="0 0 200 200">
        <Circle
          cx="100"
          cy="100"
          r={radius}
          stroke="#2C2C2C"
          strokeWidth="15"
          fill="transparent"
        />
        <Circle
          cx="100"
          cy="100"
          r={radius}
          stroke={color}
          strokeWidth="15"
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90, 100, 100)"
        />
      </Svg>
      <View style={styles.adherenceCenterContent}>
        <Text style={[styles.adherencePercentage, { color }]}>{roundedPercentage}%</Text>
        <Text style={styles.adherenceLabel}>Соблюдения</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: color }]} />
          <Text style={styles.statusText}>
            {roundedPercentage >= 80
              ? 'Отлично'
              : roundedPercentage >= 60
              ? 'Хорошо'
              : 'Можно лучше'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  adherenceContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    width: 200,
    alignSelf: 'center',
    marginVertical: 10,
  },
  adherenceCenterContent: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  adherencePercentage: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  adherenceLabel: {
    color: '#AAA',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    color: '#DDD',
    fontSize: 12,
  },
});

export default AdherenceDisplay;
