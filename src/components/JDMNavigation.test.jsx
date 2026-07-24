import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import JDMNavigation from './JDMNavigation';

// Mock Lucide icons to avoid ESM import issues in test environment
vi.mock('lucide-react', () => ({
  ArrowLeft: () => 'ArrowLeft',
  Compass: () => 'Compass',
  ShieldAlert: () => 'ShieldAlert',
  Sparkles: () => 'Sparkles',
  MapPin: () => 'MapPin',
  Navigation: () => 'Navigation',
  Info: () => 'Info',
  Clock: () => 'Clock',
  Calendar: () => 'Calendar',
  Truck: () => 'Truck',
  CheckCircle2: () => 'CheckCircle2',
  MessageSquare: () => 'MessageSquare',
  AlertTriangle: () => 'AlertTriangle',
  Send: () => 'Send',
  Check: () => 'Check',
  CornerUpLeft: () => 'CornerUpLeft',
  CornerUpRight: () => 'CornerUpRight',
  ArrowUp: () => 'ArrowUp',
  Play: () => 'Play',
  Pause: () => 'Pause',
  Locate: () => 'Locate',
  Car: () => 'Car',
  Bike: () => 'Bike',
  Plus: () => 'Plus',
  Trash2: () => 'Trash2',
  Bookmark: () => 'Bookmark',
  X: () => 'X',
  Save: () => 'Save',
  ChevronDown: () => 'ChevronDown',
  ChevronUp: () => 'ChevronUp'
}));

// Mock react-i18next translation hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, defaultValue) => defaultValue || key,
    i18n: { language: 'uz', changeLanguage: vi.fn() }
  })
}));

// Mock leaflet library to avoid DOM reference crashes during test execution
vi.mock('leaflet', () => {
  const LMock = {
    map: () => ({
      setView: vi.fn(),
      fitBounds: vi.fn(),
      panTo: vi.fn(),
      remove: vi.fn()
    }),
    tileLayer: () => ({
      addTo: vi.fn()
    }),
    featureGroup: () => ({
      addTo: vi.fn(),
      clearLayers: vi.fn()
    }),
    divIcon: (obj) => obj,
    marker: () => ({
      addTo: vi.fn(),
      setLatLng: vi.fn(),
      remove: vi.fn()
    }),
    latLngBounds: () => ({}),
    polyline: () => ({
      addTo: vi.fn(),
      getBounds: () => ({}),
      remove: vi.fn()
    })
  };
  return { default: LMock };
});

describe('JDMNavigation Component Tests', () => {
  it('renders successfully without crashing', () => {
    const html = renderToString(<JDMNavigation onBack={() => {}} />);
    expect(html).toContain('Route Settings');
    expect(html).toContain('Matsudo');
  });

  it('supports fallback translations when no props are provided', () => {
    const html = renderToString(<JDMNavigation />);
    expect(html).toBeTruthy();
  });
});
