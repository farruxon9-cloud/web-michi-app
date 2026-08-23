import React, { useState, useEffect, useRef } from 'react';
import { getThumbnailPhoto } from '../services/vehicleApiService';
import VehicleGradientCard from './VehicleGradientCard';

/**
 * LazyVehicleImage — Loads vehicle photo only when card scrolls into viewport.
 * Uses IntersectionObserver for performance. Shows VehicleGradientCard while loading.
 *
 * @param {Object} props
 * @param {string} props.make - Vehicle manufacturer
 * @param {string} props.model - Vehicle model
 * @param {string|null} props.photoUrl - Pre-existing photo URL (from preset DB)
 * @param {string} [props.bodyStyle] - Body style for gradient card fallback
 * @param {string} [props.type] - Vehicle type for gradient card fallback
 * @param {number} [props.height=75] - Image container height in pixels
 * @param {function} [props.onPhotoLoaded] - Callback when photo URL is resolved
 */
export default function LazyVehicleImage({ make, model, photoUrl, bodyStyle = 'sedan', type = 'car', height = 75, onPhotoLoaded }) {
  const [src, setSrc] = useState(photoUrl || null);
  const [loadState, setLoadState] = useState(photoUrl ? 'loaded' : 'idle');
  const containerRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    // If preset photo exists, no need to observe
    if (photoUrl) {
      setSrc(photoUrl);
      setLoadState('loaded');
      return;
    }

    // Create IntersectionObserver to detect when card enters viewport
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadState('loading');
          loadPhoto();
          observerRef.current?.disconnect();
        }
      },
      { rootMargin: '150px' } // Start loading 150px before visible
    );

    if (containerRef.current) {
      observerRef.current.observe(containerRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [make, model, photoUrl]);

  async function loadPhoto() {
    try {
      const realPhoto = await getThumbnailPhoto(make, model);
      if (realPhoto) {
        setSrc(realPhoto);
        setLoadState('loaded');
        if (onPhotoLoaded) onPhotoLoaded(realPhoto);
      } else {
        setLoadState('fallback');
      }
    } catch {
      setLoadState('fallback');
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        height: `${height}px`,
        width: '100%',
        borderRadius: '10px',
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid rgba(255,255,255,0.08)'
      }}
    >
      {/* State: Photo loaded — show image */}
      {src && loadState === 'loaded' && (
        <img
          src={src}
          alt={`${make} ${model}`}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
          onError={() => {
            setSrc(null);
            setLoadState('fallback');
          }}
        />
      )}

      {/* State: Loading — show gradient card with subtle pulse */}
      {loadState === 'loading' && (
        <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
          <VehicleGradientCard
            make={make}
            model={model}
            bodyStyle={bodyStyle}
            type={type}
            height={height}
          />
        </div>
      )}

      {/* State: Idle (not yet in viewport) or Fallback — show gradient card */}
      {(loadState === 'idle' || loadState === 'fallback') && (
        <VehicleGradientCard
          make={make}
          model={model}
          bodyStyle={bodyStyle}
          type={type}
          height={height}
        />
      )}
    </div>
  );
}
