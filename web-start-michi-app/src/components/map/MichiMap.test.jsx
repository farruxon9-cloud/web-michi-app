import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { forwardRef, useEffect, useImperativeHandle } from 'react';

const flyTo = vi.fn();
vi.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}));
vi.mock('react-map-gl/maplibre', () => {
  const Map = forwardRef(function MockMap({ children, onLoad }, ref) {
    useImperativeHandle(ref, () => ({ flyTo, resize: () => {}, getCenter: () => ({ lat: 35.68, lng: 139.76 }) }));
    useEffect(() => { onLoad?.(); }, [onLoad]);
    return <div data-testid="mock-map">{children}</div>;
  });
  return {
    default: Map,
    GeolocateControl: forwardRef(function Geo(_p, ref) { useImperativeHandle(ref, () => ({ trigger: () => true })); return null; }),
    NavigationControl: () => null,
    Marker: ({ children }) => <div data-testid="mock-marker">{children}</div>,
  };
});
const searchPlaces = vi.fn();
vi.mock('../../services/geocodeService', async (orig) => {
  const real = await orig();
  return { ...real, searchPlaces: (...a) => searchPlaces(...a) };
});

import MichiMap from './MichiMap';

const SHIBUYA = { id: 'p1', name: '渋谷駅', address: '東京都渋谷区', lat: 35.658, lng: 139.7016 };

describe('MichiMap', () => {
  beforeEach(() => { localStorage.clear(); flyTo.mockClear(); searchPlaces.mockReset(); vi.useFakeTimers(); });
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it('renders the map and the back button works', () => {
    const onBack = vi.fn();
    render(<MichiMap onBack={onBack} />);
    expect(screen.getByTestId('mock-map')).toBeTruthy();
    fireEvent.click(screen.getByTestId('map-back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('searches with debounce, selects a result, shows the sheet and directions links', async () => {
    searchPlaces.mockResolvedValue({ results: [SHIBUYA], failed: false });
    render(<MichiMap onBack={() => {}} />);
    const input = screen.getByTestId('map-search');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '渋谷' } });
    expect(searchPlaces).not.toHaveBeenCalled();
    await act(async () => { await vi.advanceTimersByTimeAsync(400); });
    expect(searchPlaces).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText('渋谷駅'));
    expect(flyTo).toHaveBeenCalledWith(expect.objectContaining({ center: [SHIBUYA.lng, SHIBUYA.lat] }));
    const sheet = screen.getByTestId('map-sheet');
    const google = sheet.querySelector('a[href*="google.com/maps"]');
    expect(google).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('michi_map_recent'))[0].id).toBe('p1');
  });

  it('shows an honest error when search fails', async () => {
    searchPlaces.mockResolvedValue({ results: [], failed: true });
    render(<MichiMap onBack={() => {}} />);
    const input = screen.getByTestId('map-search');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'zzzz' } });
    await act(async () => { await vi.advanceTimersByTimeAsync(400); });
    expect(screen.getByTestId('map-results').querySelector('.is-error')).toBeTruthy();
  });
});
