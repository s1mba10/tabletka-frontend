import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { NutritionSummary } from '../src/components';

describe('NutritionSummary', () => {
  it('displays correct calorie percentage', async () => {
    let component: renderer.ReactTestRenderer;
    await act(async () => {
      component = renderer.create(
        <NutritionSummary
          proteinConsumed={45}
          proteinTarget={120}
          fatConsumed={60}
          fatTarget={70}
          carbsConsumed={150}
          carbsTarget={250}
          caloriesConsumed={1200}
          caloriesTarget={2000}
        />,
      );
    });
    const percent = component.root.findByProps({ testID: 'calorie-percent' })
      .props.children;
    expect(percent).toBe('60%');
  });

  it('shows placeholder when calorie target missing', async () => {
    let component: renderer.ReactTestRenderer;
    await act(async () => {
      component = renderer.create(
        <NutritionSummary
          proteinConsumed={10}
          proteinTarget={20}
          fatConsumed={5}
          fatTarget={10}
          carbsConsumed={15}
          carbsTarget={30}
          caloriesConsumed={500}
        />,
      );
    });
    const percent = component.root.findByProps({ testID: 'calorie-percent' })
      .props.children;
    expect(percent).toBe('—');
  });
});

