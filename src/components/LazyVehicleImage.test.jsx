import { describe, it, expect } from 'vitest';
import React from 'react';

describe('LazyVehicleImage Tests', () => {
  it('should import LazyVehicleImage without errors', async () => {
    const mod = await import('./LazyVehicleImage');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  it('should be a valid React component with required props', async () => {
    const { default: LazyVehicleImage } = await import('./LazyVehicleImage');
    const element = React.createElement(LazyVehicleImage, {
      make: 'Nissan',
      model: 'GT-R',
      photoUrl: null,
      bodyStyle: 'sedan',
      type: 'car'
    });
    expect(element).toBeDefined();
    expect(element.props.make).toBe('Nissan');
    expect(element.props.model).toBe('GT-R');
  });

  it('should accept preset photoUrl prop', async () => {
    const { default: LazyVehicleImage } = await import('./LazyVehicleImage');
    const element = React.createElement(LazyVehicleImage, {
      make: 'Toyota',
      model: 'Supra',
      photoUrl: '/images/presets/toyota_supra.jpg',
      height: 100
    });
    expect(element.props.photoUrl).toBe('/images/presets/toyota_supra.jpg');
    expect(element.props.height).toBe(100);
  });
});
