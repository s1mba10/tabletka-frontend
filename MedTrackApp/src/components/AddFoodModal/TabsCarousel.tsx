import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';

type Props = {
  titles: string[];
  index: number;
  onPrev: () => void;
  onNext: () => void;
};

const TabsCarousel: React.FC<Props> = ({ titles, index, onPrev, onNext }) => {
  return (
    <View style={styles.tabsCarouselRow}>
      <View style={styles.tabSideBoxLeft}>
        {index > 0 ? (
          <TouchableOpacity onPress={onPrev} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.tabSide}>{titles[index - 1]}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.tabSideSpacer} />
        )}
      </View>

      <Text style={styles.tabCenter}>{titles[index]}</Text>

      <View style={styles.tabSideBoxRight}>
        {index < titles.length - 1 ? (
          <TouchableOpacity onPress={onNext} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.tabSide}>{titles[index + 1]}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.tabSideSpacer} />
        )}
      </View>
    </View>
  );
};

export default TabsCarousel;
