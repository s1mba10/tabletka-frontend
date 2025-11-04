import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BlurView } from '@react-native-community/blur';

type Props = {
  state: any;
  descriptors: any;
  navigation: any;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PADDING = 16;
const TABBAR_HEIGHT = 76;
const INDICATOR_HEIGHT = 56;

const CustomTabBar: React.FC<Props> = ({ state, descriptors, navigation }) => {
  const tabsCount = state.routes.length;
  const segmentWidth = useMemo(
    () => (SCREEN_WIDTH - H_PADDING * 2) / tabsCount,
    [tabsCount]
  );

  const translateX = useRef(new Animated.Value(state.index * segmentWidth)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * segmentWidth,
      useNativeDriver: true,
      damping: 16,
      stiffness: 180,
      mass: 0.6,
    }).start();
  }, [state.index, segmentWidth, translateX]);

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {Platform.OS === 'ios' ? (
        <BlurView style={styles.tabBar} blurType="dark" blurAmount={2} />
      ) : (
        <View style={[styles.tabBar, styles.androidGlass]} />
      )}

      <Animated.View
        style={[
          styles.indicator,
          {
            width: segmentWidth * 0.95,
            transform: [{ translateX }],
            left: H_PADDING + (segmentWidth * (1 - 0.95)) / 2,
          },
        ]}
      />

      <View style={styles.itemsRow}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel ?? options.title ?? route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const color = isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.75)';
          const iconName =
            options.tabBarIconName ||
            (route.name.includes('Главная')
              ? 'home'
              : route.name.includes('Лекар')
              ? 'pill'
              : route.name.includes('Пит')
              ? 'food-apple'
              : route.name.includes('Трен')
              ? 'dumbbell'
              : 'equalizer');

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.9}
              style={[styles.item, { width: segmentWidth }]}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              <Icon name={iconName} size={26} color={color} />
              <Text numberOfLines={1} style={[styles.label, { color }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 18,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    height: TABBAR_HEIGHT,
    width: SCREEN_WIDTH - H_PADDING * 2,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  androidGlass: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  itemsRow: {
    position: 'absolute',
    bottom: 0,
    height: TABBAR_HEIGHT,
    width: SCREEN_WIDTH - H_PADDING * 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    height: TABBAR_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    bottom: (TABBAR_HEIGHT - INDICATOR_HEIGHT) / 2,
    height: INDICATOR_HEIGHT,
    borderRadius: INDICATOR_HEIGHT / 2,
    backgroundColor: 'rgba(255,255,255,0.16)',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
});

export default CustomTabBar;
