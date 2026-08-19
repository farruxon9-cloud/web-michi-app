// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import JDMNavigation from './JDMNavigation';

// Mock Lucide icons
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
  Minus: () => 'Minus',
  Layers: () => 'Layers',
  Trash2: () => 'Trash2',
  Bookmark: () => 'Bookmark',
  X: () => 'X',
  Save: () => 'Save',
  ChevronDown: () => 'ChevronDown',
  ChevronUp: () => 'ChevronUp',
  Volume2: () => 'Volume2',
  VolumeX: () => 'VolumeX',
  Menu: () => 'Menu',
  Search: () => 'Search',
  Share2: () => 'Share2',
  Star: () => 'Star',
  Cloud: () => 'Cloud',
  Sun: () => 'Sun',
  Binoculars: () => 'Binoculars',
  Train: () => 'Train',
  Footprints: () => 'Footprints',
  ArrowUpDown: () => 'ArrowUpDown',
  User: () => 'User'
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, defaultValue) => defaultValue || key,
    i18n: { language: 'uz', changeLanguage: vi.fn() }
  })
}));

// Mock maplibre-gl and react-map-gl
vi.mock('maplibre-gl', () => ({
  Marker: class {
    setLngLat() { return this; }
    setRotation() { return this; }
    addTo() { return this; }
    remove() { return this; }
    getElement() {
      const el = document.createElement('div');
      el.innerHTML = 'mock-marker';
      return el;
    }
  },
  NavigationControl: class {},
  GeolocateControl: class {},
  Map: class {
    on() {}
    off() {}
    remove() {}
  }
}));

vi.mock('react-map-gl/maplibre', () => {
  return {
    default: function MockReactMap({ children, onLoad }) {
      // Trigger onLoad immediately with a mock map instance
      React.useEffect(() => {
        if (onLoad) {
          const mockMap = {
            easeTo: vi.fn(),
            fitBounds: vi.fn(),
            getCenter: () => ({ lat: 35.6841, lng: 139.7741 }),
            getStyle: () => ({ layers: [] }),
            on: vi.fn(),
            off: vi.fn(),
            getSource: vi.fn(() => null),
            addSource: vi.fn(),
            addLayer: vi.fn(),
            getLayer: vi.fn(() => null),
            removeLayer: vi.fn(),
            removeSource: vi.fn(),
            setTerrain: vi.fn(),
            setLayoutProperty: vi.fn(),
            isStyleLoaded: vi.fn(() => true),
            getBearing: vi.fn(() => 0),
            setBearing: vi.fn(),
            setPitch: vi.fn()
          };
          onLoad({ target: mockMap });
        }
      }, [onLoad]);
      return <div data-testid="mock-map">{children}</div>;
    },
    NavigationControl: () => 'NavigationControl',
    GeolocateControl: () => 'GeolocateControl',
    Marker: ({ children }) => <div data-testid="react-map-gl-marker">{children}</div>
  };
});

// Mock haptics
vi.mock('../utils/haptics', () => ({
  playHapticClick: vi.fn()
}));

// Mock offline tile downloader
vi.mock('../utils/offlineTileDownloader', () => ({
  downloadRegionTiles: vi.fn(),
  isRegionCached: vi.fn(() => false),
  getPrefectureTilePresets: vi.fn(() => [])
}));

// Mock voice guidance
vi.mock('../utils/voiceGuidance', () => ({
  initVoiceGuidance: vi.fn(),
  speakManeuver: vi.fn(),
  speakArrival: vi.fn(),
  speakRerouting: vi.fn(),
  toggleMute: vi.fn(),
  isSpeechMuted: vi.fn(() => false),
  stopSpeech: vi.fn(),
  setSpeechLanguage: vi.fn(),
  setSpeechVolume: vi.fn(),
  setSpeechRate: vi.fn(),
  setSpeechPitch: vi.fn(),
  setWarningOnlyMode: vi.fn(),
  translateWarningToUz: vi.fn(s => s)
}));

describe('JDMNavigation Search Interaction Tests', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders coming soon location map banner successfully without crashing', async () => {
    render(<JDMNavigation onBack={() => {}} />);

    const locationBanner = screen.getByText('• JDM Location Map');
    expect(locationBanner).toBeDefined();
  });

  it('displays coming soon status notice and map container', async () => {
    render(<JDMNavigation onBack={() => {}} />);

    const comingSoonBadge = screen.getByText('Tez orada');
    expect(comingSoonBadge).toBeDefined();
  });
});
