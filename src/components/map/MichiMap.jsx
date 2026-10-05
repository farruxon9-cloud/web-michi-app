import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Map, { GeolocateControl, Marker, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ArrowLeft, Search, X, LocateFixed, Navigation2, MapPin, Clock, RotateCcw, Loader2 } from 'lucide-react';
import { searchPlaces, distanceKm, directionsLinks } from '../../services/geocodeService';
import './MichiMap.css';

/**
 * Real map page (stage 1): live map, current location, place/address search,
 * hand-off to Google/Apple Maps for turn-by-turn navigation.
 * Free services: OpenFreeMap vector tiles (OSM data), Photon + GSI search.
 */
const STYLE = {
  light: 'https://tiles.openfreemap.org/styles/liberty',
  dark: 'https://tiles.openfreemap.org/styles/dark',
};
const TOKYO = { lat: 35.6812, lng: 139.7671 };
const LAST_POS_KEY = 'michi_map_last_pos';
const RECENT_KEY = 'michi_map_recent';

const T = {
  title: { ja: 'マップ', uz: 'Xarita', en: 'Map', ru: 'Карта', zh: '地图', vi: 'Bản đồ', ne: 'नक्सा' },
  back: { ja: '戻る', uz: 'Orqaga', en: 'Back', ru: 'Назад', zh: '返回', vi: 'Quay lại', ne: 'पछाडि' },
  search: { ja: '住所・駅・施設を検索', uz: 'Manzil, bekat yoki joy qidiring', en: 'Search address, station, place', ru: 'Адрес, станция, место', zh: '搜索地址、车站、地点', vi: 'Tìm địa chỉ, ga, địa điểm', ne: 'ठेगाना, स्टेशन, स्थान खोज्नुहोस्' },
  clear: { ja: 'クリア', uz: 'Tozalash', en: 'Clear', ru: 'Очистить', zh: '清除', vi: 'Xóa', ne: 'खाली गर्नुहोस्' },
  searching: { ja: '検索中…', uz: 'Qidirilmoqda…', en: 'Searching…', ru: 'Поиск…', zh: '搜索中…', vi: 'Đang tìm…', ne: 'खोज्दै…' },
  noResults: { ja: '見つかりませんでした', uz: 'Hech narsa topilmadi', en: 'No results', ru: 'Ничего не найдено', zh: '未找到结果', vi: 'Không tìm thấy', ne: 'केही भेटिएन' },
  searchFailed: { ja: '検索できません。接続を確認してください', uz: "Qidirib bo'lmadi. Internetni tekshiring", en: "Search failed. Check your connection", ru: 'Поиск недоступен. Проверьте сеть', zh: '搜索失败，请检查网络', vi: 'Không tìm được. Kiểm tra kết nối', ne: 'खोज असफल। इन्टरनेट जाँच गर्नुहोस्' },
  recent: { ja: '最近の検索', uz: 'Oxirgi qidiruvlar', en: 'Recent', ru: 'Недавние', zh: '最近搜索', vi: 'Gần đây', ne: 'हालैका' },
  myLocation: { ja: '現在地', uz: 'Mening joyim', en: 'My location', ru: 'Моё местоположение', zh: '我的位置', vi: 'Vị trí của tôi', ne: 'मेरो स्थान' },
  locDenied: { ja: '位置情報がオフです。設定で許可してください', uz: "Joylashuvga ruxsat yo'q. Sozlamalarda yoqing", en: 'Location is off. Allow it in settings', ru: 'Геолокация выключена. Разрешите в настройках', zh: '位置权限已关闭，请在设置中允许', vi: 'Vị trí đang tắt. Hãy cho phép trong cài đặt', ne: 'स्थान बन्द छ। सेटिङमा अनुमति दिनुहोस्' },
  loading: { ja: '地図を読み込み中…', uz: 'Xarita yuklanmoqda…', en: 'Loading map…', ru: 'Загрузка карты…', zh: '地图加载中…', vi: 'Đang tải bản đồ…', ne: 'नक्सा लोड हुँदैछ…' },
  mapError: { ja: '地図を読み込めませんでした', uz: "Xaritani yuklab bo'lmadi", en: "Couldn't load the map", ru: 'Не удалось загрузить карту', zh: '无法加载地图', vi: 'Không tải được bản đồ', ne: 'नक्सा लोड भएन' },
  retry: { ja: '再試行', uz: 'Qayta urinish', en: 'Retry', ru: 'Повторить', zh: '重试', vi: 'Thử lại', ne: 'फेरि प्रयास' },
  google: { ja: 'Googleマップでナビ', uz: "Google Maps'da yo'l", en: 'Navigate in Google Maps', ru: 'Маршрут в Google Maps', zh: '用Google地图导航', vi: 'Chỉ đường Google Maps', ne: 'Google Maps मा जानुहोस्' },
  apple: { ja: 'Appleマップ', uz: 'Apple Maps', en: 'Apple Maps', ru: 'Apple Maps', zh: 'Apple地图', vi: 'Apple Maps', ne: 'Apple Maps' },
  away: { ja: '現在地から', uz: 'sizdan', en: 'from you', ru: 'от вас', zh: '距您', vi: 'từ bạn', ne: 'तपाईंबाट' },
  closeCard: { ja: '閉じる', uz: 'Yopish', en: 'Close', ru: 'Закрыть', zh: '关闭', vi: 'Đóng', ne: 'बन्द' },
};

const readJson = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fb; } catch { return fb; } };
const writeJson = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };
const fmtKm = (km) => (km == null ? '' : km < 1 ? `${Math.round(km * 1000)} m` : `${km < 10 ? km.toFixed(1) : Math.round(km)} km`);

export default function MichiMap({ onBack, darkMode = false, isOpen = true }) {
  const { i18n } = useTranslation();
  const lang = (i18n?.language || 'ja').slice(0, 2);
  const tx = useCallback((k) => T[k]?.[lang] || T[k]?.en, [lang]);

  const mapRef = useRef(null);
  const geoRef = useRef(null);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const startPos = useMemo(() => readJson(LAST_POS_KEY, TOKYO), []);

  const [mapState, setMapState] = useState('loading'); // loading | ready | error
  const [styleKey, setStyleKey] = useState(0);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState([]);
  const [searchState, setSearchState] = useState('idle'); // idle | loading | done | failed
  const [selected, setSelected] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [locError, setLocError] = useState(false);
  const [recent, setRecent] = useState(() => readJson(RECENT_KEY, []));
  const userPosRef = useRef(null);
  useEffect(() => { userPosRef.current = userPos; }, [userPos]);

  // Keep the canvas sized to its container (no blank / half map after the overlay opens or rotates)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => mapRef.current?.resize());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    if (isOpen) requestAnimationFrame(() => mapRef.current?.resize());
  }, [isOpen]);

  // Debounced search; a newer query aborts the older request
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setResults([]); setSearchState('idle'); return undefined; }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setSearchState('loading');
      try {
        const c = mapRef.current?.getCenter?.();
        const near = userPosRef.current || (c ? { lat: c.lat, lng: c.lng } : null);
        const r = await searchPlaces(q, { signal: ctrl.signal, near });
        setResults(r.results);
        setSearchState(r.failed ? 'failed' : 'done');
      } catch (e) {
        if (e?.name !== 'AbortError') setSearchState('failed');
      }
    }, 350);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [query]);

  // Auto-show location only if permission was already granted (never prompt on open)
  const onMapLoad = useCallback(() => {
    setMapState('ready');
    navigator.permissions?.query?.({ name: 'geolocation' })
      .then((p) => { if (p.state === 'granted') geoRef.current?.trigger(); })
      .catch(() => {});
  }, []);

  const onGeolocate = useCallback((e) => {
    const pos = { lat: e.coords.latitude, lng: e.coords.longitude };
    setUserPos(pos);
    setLocError(false);
    writeJson(LAST_POS_KEY, pos);
  }, []);

  const locate = useCallback(() => {
    setLocError(false);
    if (!geoRef.current?.trigger()) {
      if (userPos) mapRef.current?.flyTo({ center: [userPos.lng, userPos.lat], zoom: 15 });
    }
  }, [userPos]);

  const choose = useCallback((r) => {
    setSelected(r);
    setQuery(r.name);
    setFocused(false);
    inputRef.current?.blur();
    mapRef.current?.flyTo({ center: [r.lng, r.lat], zoom: 16, duration: 900, essential: true });
    setRecent((prev) => {
      const next = [r, ...prev.filter((x) => x.id !== r.id)].slice(0, 5);
      writeJson(RECENT_KEY, next);
      return next;
    });
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setSelected(null);
    setSearchState('idle');
    inputRef.current?.focus();
  }, []);

  const showList = focused && (query.trim().length >= 2 || recent.length > 0);
  const listItems = query.trim().length >= 2 ? results : recent;
  const dist = selected && userPos ? distanceKm(userPos, selected) : null;
  const links = selected ? directionsLinks(selected) : null;

  return (
    <div className={`michi-map${darkMode ? ' is-dark' : ''}`} role="dialog" aria-label={tx('title')}>
      <div className="michi-map-canvas" ref={wrapRef}>
        <Map
          key={styleKey}
          ref={mapRef}
          initialViewState={{ longitude: startPos.lng, latitude: startPos.lat, zoom: 13 }}
          mapStyle={darkMode ? STYLE.dark : STYLE.light}
          style={{ width: '100%', height: '100%' }}
          onLoad={onMapLoad}
          onError={(e) => { if (mapState !== 'ready') setMapState('error'); console.warn('[MichiMap]', e?.error?.message || e); }}
          attributionControl={{ compact: true }}
          dragRotate
          touchPitch={false}
          maxBounds={[[118, 18], [158, 48]]}
          minZoom={4}
          maxZoom={19}
        >
          <NavigationControl position="bottom-right" showCompass visualizePitch={false} style={{ marginBottom: 96 }} />
          <GeolocateControl
            ref={geoRef}
            position="bottom-right"
            trackUserLocation
            showUserHeading
            showAccuracyCircle
            positionOptions={{ enableHighAccuracy: true, timeout: 10000 }}
            fitBoundsOptions={{ maxZoom: 15 }}
            onGeolocate={onGeolocate}
            onError={() => setLocError(true)}
            style={{ display: 'none' }}
          />
          {selected && (
            <Marker longitude={selected.lng} latitude={selected.lat} anchor="bottom">
              <div className="michi-map-pin" aria-hidden="true"><MapPin size={30} strokeWidth={2.4} /></div>
            </Marker>
          )}
        </Map>

        {mapState === 'loading' && (
          <div className="michi-map-veil" aria-live="polite">
            <Loader2 size={26} className="michi-map-spin" aria-hidden="true" />
            <span>{tx('loading')}</span>
          </div>
        )}
        {mapState === 'error' && (
          <div className="michi-map-veil" role="alert">
            <span>{tx('mapError')}</span>
            <button type="button" className="michi-map-btn" onClick={() => { setMapState('loading'); setStyleKey((k) => k + 1); }}>
              <RotateCcw size={16} /> {tx('retry')}
            </button>
          </div>
        )}
      </div>

      {/* Top bar: back + search */}
      <div className="michi-map-top">
        <button type="button" className="michi-map-round" onClick={onBack} aria-label={tx('back')} data-testid="map-back">
          <ArrowLeft size={20} />
        </button>
        <div className={`michi-map-search${focused ? ' is-focused' : ''}`}>
          <Search size={17} className="michi-map-search-ic" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            enterKeyHint="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) choose(results[0]); if (e.key === 'Escape') inputRef.current?.blur(); }}
            placeholder={tx('search')}
            aria-label={tx('search')}
            autoComplete="off"
            data-testid="map-search"
          />
          {searchState === 'loading' && <Loader2 size={16} className="michi-map-spin" aria-label={tx('searching')} />}
          {query && (
            <button type="button" className="michi-map-clear" onMouseDown={(e) => e.preventDefault()} onClick={clearSearch} aria-label={tx('clear')}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {showList && (
        <div className="michi-map-results" role="listbox" aria-label={tx('search')} data-testid="map-results">
          {query.trim().length < 2 && <div className="michi-map-results-head"><Clock size={13} /> {tx('recent')}</div>}
          {listItems.map((r) => (
            <button
              key={r.id}
              type="button"
              role="option"
              aria-selected={selected?.id === r.id}
              className="michi-map-result"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(r)}
            >
              <span className="michi-map-result-ic" aria-hidden="true"><MapPin size={16} /></span>
              <span className="michi-map-result-text">
                <strong>{r.name}</strong>
                {r.address && r.address !== r.name && <small>{r.address}</small>}
              </span>
              {userPos && <span className="michi-map-result-dist">{fmtKm(distanceKm(userPos, r))}</span>}
            </button>
          ))}
          {query.trim().length >= 2 && searchState === 'done' && results.length === 0 && (
            <div className="michi-map-results-empty">{tx('noResults')}</div>
          )}
          {searchState === 'failed' && <div className="michi-map-results-empty is-error">{tx('searchFailed')}</div>}
        </div>
      )}

      {locError && <div className="michi-map-toast" role="alert">{tx('locDenied')}</div>}

      {/* My location FAB */}
      <button type="button" className={`michi-map-fab${userPos ? ' is-active' : ''}`} onClick={locate} aria-label={tx('myLocation')} data-testid="map-locate">
        <LocateFixed size={22} />
      </button>

      {/* Selected place sheet */}
      {selected && (
        <div className="michi-map-sheet" data-testid="map-sheet">
          <div className="michi-map-sheet-grip" aria-hidden="true" />
          <div className="michi-map-sheet-head">
            <div className="michi-map-sheet-title">
              <h2>{selected.name}</h2>
              {selected.address && selected.address !== selected.name && <p>{selected.address}</p>}
              {dist != null && <span className="michi-map-sheet-dist">{fmtKm(dist)} {tx('away')}</span>}
            </div>
            <button type="button" className="michi-map-round is-small" onClick={() => setSelected(null)} aria-label={tx('closeCard')}>
              <X size={16} />
            </button>
          </div>
          <div className="michi-map-sheet-actions">
            <a className="michi-map-cta" href={links.google} target="_blank" rel="noopener noreferrer">
              <Navigation2 size={17} /> {tx('google')}
            </a>
            <a className="michi-map-cta is-secondary" href={links.apple} target="_blank" rel="noopener noreferrer">
              {tx('apple')}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
