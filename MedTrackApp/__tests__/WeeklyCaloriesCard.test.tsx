import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text, Animated } from 'react-native';
import WeeklyCaloriesCard from '../src/screens/NutritionStats/WeeklyCaloriesCard';

Animated.timing = (value: any, config: any) => ({
  start: (cb?: () => void) => {
    value.setValue(config.toValue);
    cb && cb();
  },
}) as any;
Animated.stagger = (_time: number, anims: any[]) => ({
  start: () => anims.forEach(a => a.start()),
}) as any;

test('shows min and max chips', () => {
  const days = [
    { label: 'Пн', calories: 400 },
    { label: 'Вт', calories: 0 },
    { label: 'Ср', calories: 450 },
    { label: 'Чт', calories: 300 },
    { label: 'Пт', calories: 700 },
    { label: 'Сб', calories: 0 },
    { label: 'Вс', calories: 400 },
  ];

  let component: renderer.ReactTestRenderer;
  act(() => {
    component = renderer.create(<WeeklyCaloriesCard days={days} />);
  });

  const texts = component.root
    .findAllByType(Text)
    .map(n => n.props.children)
    .flat()
    .join(' ');

  expect(texts).toContain('Чт · 300 ккал');
  expect(texts).toContain('Пт · 700 ккал');
});
