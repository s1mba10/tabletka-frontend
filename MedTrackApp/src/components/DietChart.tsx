import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

export type ChartData = {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    colors?: ((opacity: number) => string)[];
  }[];
};

const DEFAULT_DATA: ChartData = {
  labels: [],
  datasets: [{ data: [] }],
};

interface DietChartProps {
  data?: ChartData;
  loading?: boolean;
  width: number;
  height: number;
}

const DietChart: React.FC<DietChartProps> = ({
  data = DEFAULT_DATA,
  loading = false,
  width,
  height,
}) => {
  const hasData =
    data.labels.length > 0 &&
    data.datasets.length > 0 &&
    data.datasets[0].data.length > 0;

  if (loading) {
    return (
      <View style={[styles.placeholder, { width, height }]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!hasData) {
    return <View style={[styles.placeholder, { width, height }]} />;
  }

  const useShadowColor = data.datasets.every(ds => typeof ds.color === 'function');

  return (
    <BarChart
      style={{ borderRadius: 16 }}
      data={data}
      width={width}
      height={height}
      fromZero
      chartConfig={{
        backgroundGradientFrom: '#000',
        backgroundGradientTo: '#000',
        color: opacity => `rgba(255,255,255,${opacity})`,
        barPercentage: 0.6,
      }}
      withInnerLines={false}
      showValuesOnTopOfBars
      flatColor
      useShadowColorFromDataset={useShadowColor}
    />
  );
};

const styles = StyleSheet.create({
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export { DEFAULT_DATA };
export default DietChart;
