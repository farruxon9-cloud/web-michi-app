import React from 'react';
import { Car, Truck, Bus } from 'lucide-react';

/**
 * Brand-specific gradient colors for vehicle cards.
 * Each brand has [primaryColor, secondaryColor] for gradient.
 */
const BRAND_GRADIENTS = {
  toyota:           ['#EB0A1E', '#CC0000'],
  nissan:           ['#C3002F', '#8B0020'],
  honda:            ['#CC0000', '#990000'],
  mazda:            ['#910000', '#5C0000'],
  subaru:           ['#013B8C', '#002A6B'],
  mitsubishi:       ['#E60012', '#B3000E'],
  suzuki:           ['#003399', '#002266'],
  lexus:            ['#1A1A1A', '#333333'],
  isuzu:            ['#DA251D', '#A81C16'],
  hino:             ['#E60012', '#990000'],
  'mitsubishi fuso': ['#003366', '#002244'],
  'ud trucks':      ['#005BAC', '#003D73'],
  daihatsu:         ['#007EC7', '#005B8E'],
  infiniti:         ['#1A1A2E', '#16213E'],
  acura:            ['#1A1A1A', '#2D2D2D'],
  bmw:              ['#0066B1', '#004A80'],
  'mercedes-benz':  ['#222222', '#444444'],
  audi:             ['#BB0A30', '#8A0724'],
  hyundai:          ['#002C5F', '#001E3F'],
  kia:              ['#05141F', '#0C2233'],
  chevrolet:        ['#D4AF37', '#B8941F'],
  ford:             ['#003478', '#00264D'],
  tesla:            ['#CC0000', '#990000'],
  volkswagen:       ['#001E50', '#001436'],
  porsche:          ['#A6192E', '#7A1222'],
  ferrari:          ['#DC0000', '#A80000'],
  lamborghini:      ['#DAA520', '#B8860B'],
};

/**
 * Get the appropriate vehicle icon based on body style.
 */
function getBodyIcon(bodyStyle, type) {
  if (type === 'truck_4t' || type === 'truck_10t' || type === 'truck_trailer') {
    return <Truck size={28} color="rgba(255,255,255,0.6)" />;
  }
  if (bodyStyle === 'van' || bodyStyle === 'minivan' || bodyStyle === 'bus') {
    return <Bus size={28} color="rgba(255,255,255,0.6)" />;
  }
  return <Car size={28} color="rgba(255,255,255,0.6)" />;
}

/**
 * VehicleGradientCard — Beautiful fallback card when no real photo is available.
 * Shows brand-colored gradient background with vehicle body type icon.
 *
 * @param {Object} props
 * @param {string} props.make - Vehicle manufacturer name (e.g. "Toyota")
 * @param {string} props.model - Vehicle model name (e.g. "Supra")
 * @param {string} [props.bodyStyle] - Body style (sedan, suv, truck, van, etc.)
 * @param {string} [props.type] - Vehicle type (car, truck_4t, truck_10t, etc.)
 * @param {number} [props.height=75] - Card height in pixels
 */
export default function VehicleGradientCard({ make, model, bodyStyle = 'sedan', type = 'car', height = 75 }) {
  const brandKey = make ? make.toLowerCase() : '';
  const colors = BRAND_GRADIENTS[brandKey] || ['#2C2C2E', '#1C1C1E'];

  return (
    <div style={{
      width: '100%',
      height: `${height}px`,
      borderRadius: '10px',
      background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative circles */}
      <div style={{
        position: 'absolute',
        top: '-15px',
        right: '-15px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10px',
        left: '-10px',
        width: '35px',
        height: '35px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)'
      }} />

      {/* Vehicle icon */}
      {getBodyIcon(bodyStyle, type)}

      {/* Brand name */}
      <div style={{
        fontSize: '10px',
        fontWeight: '800',
        color: 'rgba(255,255,255,0.9)',
        letterSpacing: '0.5px',
        textTransform: 'uppercase'
      }}>
        {make}
      </div>

      {/* Model name */}
      <div style={{
        fontSize: '8px',
        fontWeight: '600',
        color: 'rgba(255,255,255,0.6)',
        maxWidth: '90%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textAlign: 'center'
      }}>
        {model}
      </div>
    </div>
  );
}
