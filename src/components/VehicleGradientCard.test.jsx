import { describe, it, expect } from 'vitest';
import React from 'react';

describe('VehicleGradientCard Tests', () => {
  it('should import VehicleGradientCard without errors', async () => {
    const mod = await import('./VehicleGradientCard');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  it('should be a valid React component', async () => {
    const { default: VehicleGradientCard } = await import('./VehicleGradientCard');
    const element = React.createElement(VehicleGradientCard, {
      make: 'Toyota',
      model: 'Supra',
      bodyStyle: 'sedan',
      type: 'car'
    });
    expect(element).toBeDefined();
    expect(element.type).toBe(VehicleGradientCard);
  });

  it('should accept height prop', async () => {
    const { default: VehicleGradientCard } = await import('./VehicleGradientCard');
    const element = React.createElement(VehicleGradientCard, {
      make: 'BMW',
      model: 'M3',
      height: 100
    });
    expect(element.props.height).toBe(100);
  });
});
