// v1.1 Faza E: Profile.jsx dagi yordamchi render funksiyalari o'zgarishsiz ko'chirildi.
// Profile ichidagi holatga bog'liq qiymatlar `ctx` orqali keladi.

export function createProfileRenderers(ctx) {
  const { i18n } = ctx;
  const renderVehicleSVG = (type, bodyStyle, color) => {
    const paintColor = color || '#5E5CE6';
    
    // Helper to calculate highlights and shadows from hex color dynamically
    const adjustBrightness = (hex, percent) => {
      try {
        let R = parseInt(hex.substring(1, 3), 16);
        let G = parseInt(hex.substring(3, 5), 16);
        let B = parseInt(hex.substring(5, 7), 16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;

        R = (R > 0) ? R : 0;
        G = (G > 0) ? G : 0;
        B = (B > 0) ? B : 0;

        const rHex = R.toString(16).padStart(2, '0');
        const gHex = G.toString(16).padStart(2, '0');
        const bHex = B.toString(16).padStart(2, '0');

        return `#${rHex}${gHex}${bHex}`;
      } catch (e) {
        return hex;
      }
    };

    const paintColorLight = adjustBrightness(paintColor, 40);
    const paintColorDark = adjustBrightness(paintColor, -30);
    const paintColorDarker = adjustBrightness(paintColor, -55);
    
    // Create unique ID based on color to prevent duplicate gradient collision
    const colId = paintColor.replace('#', '');
    const gId = `${bodyStyle}-paint-${colId}`;

    switch (bodyStyle) {
      // 🚗 PASSENGER CAR BODIES
      case 'minivan':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <defs>
              <linearGradient id={gId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={paintColorLight} />
                <stop offset="45%" stopColor={paintColor} />
                <stop offset="85%" stopColor={paintColorDark} />
                <stop offset="100%" stopColor={paintColorDarker} />
              </linearGradient>
              <linearGradient id="mini-glass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#121d2c" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="43" rx="42" ry="4.2" fill="rgba(0,0,0,0.22)" />
            <circle cx="28" cy="38" r="9" fill="rgba(0,0,0,0.3)" />
            <circle cx="72" cy="38" r="9" fill="rgba(0,0,0,0.3)" />
            
            {/* Boxy Minivan body (Toyota Alphard / Freed style) */}
            <path fill={`url(#${gId})`} d="M12,37 L10,33 C10,29 11,20 16,19 L72,19 C75,19 78,20 80,24 L85,31 C87,35 86,37 84,37 Z" />
            
            {/* Side Window Glass */}
            <path fill="url(#mini-glass)" d="M22,21 L35,21 L35,27 L22,27 Z" />
            <path fill="url(#mini-glass)" d="M38,21 L55,21 L55,27 L38,27 Z" />
            <path fill="url(#mini-glass)" d="M58,21 L72,21 L70,27 L58,27 Z" />
            <path fill="url(#mini-glass)" d="M75,22 L80,27 L76,27 Z" />
            
            {/* Seams and door trims */}
            <path fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" d="M36,20 L36,36 M56,36 L56,20" />
            <rect x="52" y="28" width="3" height="1" fill="#d1d1d6" />
            <rect x="33" y="28" width="3" height="1" fill="#d1d1d6" />
            
            {/* Headlights and taillights */}
            <path fill="#ffffff" d="M83,30 L85,32 L83,34 Z" />
            <path fill="#FFD60A" opacity="0.8" d="M84,31 L85,32 L84,33 Z" />
            <path fill="#FF3B30" d="M10,23 L12,23 L12,28 L10,28 Z" />
            
            {/* Detailed alloy wheels */}
            <circle cx="28" cy="38" r="8" fill="#1c1c1e" />
            <circle cx="28" cy="38" r="5.5" fill="#8e8e93" />
            <path d="M28,33 L28,43 M23,38 L33,38 M25,35 L31,41 M25,41 L31,35" stroke="#ffffff" strokeWidth="0.7" />
            <circle cx="28" cy="38" r="2" fill="#545456" />

            <circle cx="72" cy="38" r="8" fill="#1c1c1e" />
            <circle cx="72" cy="38" r="5.5" fill="#8e8e93" />
            <path d="M72,33 L72,43 M67,38 L77,38 M69,35 L75,41 M69,41 L75,35" stroke="#ffffff" strokeWidth="0.7" />
            <circle cx="72" cy="38" r="2" fill="#545456" />
          </svg>
        );

      case 'suv':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <defs>
              <linearGradient id={gId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={paintColorLight} />
                <stop offset="40%" stopColor={paintColor} />
                <stop offset="80%" stopColor={paintColorDark} />
                <stop offset="100%" stopColor={paintColorDarker} />
              </linearGradient>
              <linearGradient id="suv-glass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#121a24" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="43" rx="42" ry="4.5" fill="rgba(0,0,0,0.22)" />
            <circle cx="28" cy="38" r="9" fill="rgba(0,0,0,0.3)" />
            <circle cx="72" cy="38" r="9" fill="rgba(0,0,0,0.3)" />
            
            {/* Harrier SUV Body */}
            <path fill={`url(#${gId})`} d="M12,35 L10,31 C9,27 12,20 18,19 C25,18 36,12 48,12 C62,12 76,15 82,22 C88,27 88,31 85,34 L83,38 L14,38 Z" />
            
            {/* Bottom plastic protection skirt */}
            <path fill="#2c2c2e" d="M10,34 L12,38 L83,38 L85,34 L82,35 L74,35 C74,33 70,30 66,32 L60,35 L34,35 C32,32 26,32 24,35 L12,35 Z" />
            
            {/* Window Glass */}
            <path fill="url(#suv-glass)" d="M30,20 L44,15 L56,15 L66,20 L64,26 L30,26 Z" />
            <rect x="43" y="15" width="2" height="11" fill="#1c1c1e" />
            <rect x="55" y="15" width="2" height="11" fill="#1c1c1e" />
            
            {/* Details */}
            <path fill="none" stroke="#d1d1d6" strokeWidth="0.8" d="M29,20 L44,14.5 L56,14.5 L67,20" />
            <rect x="36" y="28" width="5" height="1.5" rx="0.5" fill="#d1d1d6" />
            <rect x="48" y="28" width="5" height="1.5" rx="0.5" fill="#d1d1d6" />
            
            {/* Xenon Glow lights */}
            <path fill="#ffffff" d="M82,23 L85,25 L83,28 Z" />
            <path fill="#0A84FF" opacity="0.75" d="M83,24 L86,26 L84,28 Z" />
            <path fill="#FF453A" d="M10,24 L12,24 L13,28 L11,28 Z" />
            
            {/* Rims */}
            <circle cx="28" cy="38" r="8" fill="#1c1c1e" />
            <circle cx="28" cy="38" r="6" fill="#8e8e93" />
            <path d="M28,32 L28,44 M22,38 L34,38 M24,34 L32,42 M24,42 L32,34" stroke="#ffffff" strokeWidth="0.7" />
            <circle cx="28" cy="38" r="2" fill="#545456" />

            <circle cx="72" cy="38" r="8" fill="#1c1c1e" />
            <circle cx="72" cy="38" r="6" fill="#8e8e93" />
            <path d="M72,32 L72,44 M66,38 L78,38 M68,34 L76,42 M68,42 L76,34" stroke="#ffffff" strokeWidth="0.7" />
            <circle cx="72" cy="38" r="2" fill="#545456" />
          </svg>
        );

      case 'hatchback':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <defs>
              <linearGradient id={gId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={paintColorLight} />
                <stop offset="40%" stopColor={paintColor} />
                <stop offset="85%" stopColor={paintColorDark} />
                <stop offset="100%" stopColor={paintColorDarker} />
              </linearGradient>
              <linearGradient id="hatch-glass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#121820" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="43" rx="38" ry="3.8" fill="rgba(0,0,0,0.18)" />
            <circle cx="28" cy="37" r="8.5" fill="rgba(0,0,0,0.25)" />
            <circle cx="68" cy="37" r="8.5" fill="rgba(0,0,0,0.25)" />
            
            {/* Honda Fit style body */}
            <path fill={`url(#${gId})`} d="M16,36 L12,33 C12,31 14,24 22,23 C30,22 38,16 46,16 C54,16 70,18 78,25 C86,32 84,35 80,36 Z" />
            
            {/* Windows */}
            <path fill="url(#hatch-glass)" d="M34,22 L45,18 L55,18 L65,22 L63,26 L34,26 Z" />
            <rect x="46" y="18" width="2" height="8" fill="#1c1c1e" />
            
            <rect x="36" y="28" width="4" height="1.2" rx="0.4" fill="#d1d1d6" />
            
            {/* Lights */}
            <path fill="#ffffff" d="M78,25 L81,27 L79,30 Z" />
            <path fill="#FFD60A" opacity="0.8" d="M79,26 L80,27 L79,28 Z" />
            <path fill="#FF3B30" d="M12,28 L14,28 L14,31 L12,31 Z" />
            
            {/* Rims */}
            <circle cx="28" cy="37" r="7" fill="#1c1c1e" />
            <circle cx="28" cy="37" r="5" fill="#8e8e93" />
            <path d="M28,32 L28,42 M23,37 L33,37" stroke="#ffffff" strokeWidth="0.6" />
            <circle cx="28" cy="37" r="2" fill="#545456" />

            <circle cx="68" cy="37" r="7" fill="#1c1c1e" />
            <circle cx="68" cy="37" r="5" fill="#8e8e93" />
            <path d="M68,32 L68,42 M63,37 L73,37" stroke="#ffffff" strokeWidth="0.6" />
            <circle cx="68" cy="37" r="2" fill="#545456" />
          </svg>
        );

      case 'sedan':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <defs>
              <linearGradient id={gId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={paintColorLight} />
                <stop offset="45%" stopColor={paintColor} />
                <stop offset="85%" stopColor={paintColorDark} />
                <stop offset="100%" stopColor={paintColorDarker} />
              </linearGradient>
              <linearGradient id="sedan-glass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#121820" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="43" rx="40" ry="4" fill="rgba(0,0,0,0.18)" />
            <circle cx="28" cy="38" r="9.2" fill="rgba(0,0,0,0.25)" />
            <circle cx="72" cy="38" r="9.2" fill="rgba(0,0,0,0.25)" />
            
            {/* Aerodynamic Prius style sedan body */}
            <path fill={`url(#${gId})`} d="M15,35 L12,32 C12,32 15,26 22,25 C29,24 38,15 48,15 C58,15 78,17 84,26 C90,32 88,37 84,39 L15,39 Z" />
            
            {/* Windows */}
            <path fill="url(#sedan-glass)" d="M32,24 L45,17 L58,17 L68,24 L65,28 L32,28 Z" />
            <rect x="46" y="17" width="2" height="11" fill="#1c1c1e" />
            <rect x="58" y="17" width="1.5" height="11" fill="#1c1c1e" />
            
            <rect x="36" y="29" width="4" height="1.2" rx="0.4" fill="#d1d1d6" />
            <rect x="49" y="29" width="4" height="1.2" rx="0.4" fill="#d1d1d6" />
            
            {/* Lights */}
            <path fill="#ffffff" d="M83,27 L86,29 L84,32 Z" />
            <path fill="#0A84FF" opacity="0.8" d="M84,28 L85,29 L84,30 Z" />
            <path fill="#FF3B30" d="M11,31 L14,31 L14,35 L11,35 Z" />
            
            {/* Wheels */}
            <circle cx="28" cy="38" r="8" fill="#1c1c1e" />
            <circle cx="28" cy="38" r="6" fill="#8e8e93" />
            <path d="M28,32 L28,44 M22,38 L34,38 M24,34 L32,42 M24,42 L32,34" stroke="#ffffff" strokeWidth="0.7" />
            <circle cx="28" cy="38" r="2" fill="#545456" />

            <circle cx="72" cy="38" r="8" fill="#1c1c1e" />
            <circle cx="72" cy="38" r="6" fill="#8e8e93" />
            <path d="M72,32 L72,44 M66,38 L78,38 M68,34 L76,42 M68,42 L76,34" stroke="#ffffff" strokeWidth="0.7" />
            <circle cx="72" cy="38" r="2" fill="#545456" />
          </svg>
        );

      // 🏍️ MOTORCYCLE BODIES
      case 'scooter':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <defs>
              <linearGradient id={gId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={paintColorLight} />
                <stop offset="100%" stopColor={paintColorDark} />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="43" rx="35" ry="3.5" fill="rgba(0,0,0,0.18)" />
            {/* Frame parts */}
            <path d="M22,38 L30,34 L46,34 L52,24 L56,16" stroke="#8e8e93" strokeWidth="2.5" fill="none" />
            <path fill="url(#gId)" d="M52,38 L58,24 L54,16 L48,16 L44,24 Z" />
            {/* Body covers */}
            <path fill="url(#gId)" d="M22,34 C25,28 35,26 44,28 L40,36 Z" />
            {/* Engine / Mechanical parts */}
            <rect x="36" y="34" width="12" height="6" fill="#3a3a3c" rx="1" />
            <circle cx="40" cy="37" r="2" fill="#8e8e93" />
            
            {/* Wheels with realistic thin spokes (Honda Cub classic) */}
            <circle cx="22" cy="38" r="10" fill="#1c1c1e" />
            <circle cx="22" cy="38" r="7.5" fill="#e5e5ea" />
            <path d="M22,30.5 L22,45.5 M14.5,38 L29.5,38 M16.7,32.7 L27.3,43.3 M16.7,43.3 L27.3,32.7" stroke="#8e8e93" strokeWidth="0.5" />
            <circle cx="22" cy="38" r="3" fill="#8e8e93" />

            <circle cx="78" cy="38" r="10" fill="#1c1c1e" />
            <circle cx="78" cy="38" r="7.5" fill="#e5e5ea" />
            <path d="M78,30.5 L78,45.5 M70.5,38 L85.5,38 M72.7,32.7 L83.3,43.3 M72.7,43.3 L83.3,32.7" stroke="#8e8e93" strokeWidth="0.5" />
            <circle cx="78" cy="38" r="3" fill="#8e8e93" />
          </svg>
        );

      case 'sportbike':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <defs>
              <linearGradient id={gId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={paintColorLight} />
                <stop offset="100%" stopColor={paintColorDark} />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="43" rx="35" ry="3.5" fill="rgba(0,0,0,0.2)" />
            {/* Mechanical details */}
            <path d="M25,38 L45,25 L65,25 L75,38" stroke="#3a3a3c" strokeWidth="3.5" fill="none" />
            <path d="M45,25 L50,15 L70,38" stroke="#1c1c1e" strokeWidth="3" fill="none" />
            <rect x="42" y="28" width="16" height="9" fill="#2c2c2e" rx="1.5" />
            
            {/* Painted Sport fairing */}
            <path fill="url(#gId)" d="M35,28 C32,25 35,22 45,21 C55,20 65,23 68,28 L56,33 Z" />
            <path fill="url(#gId)" d="M72,21 L78,21 L74,27 Z" />
            
            {/* Wheels */}
            <circle cx="22" cy="38" r="10" fill="#1c1c1e" />
            <circle cx="22" cy="38" r="6.5" fill="#8e8e93" />
            <path d="M22,31.5 L22,44.5 M15.5,38 L28.5,38" stroke="#ffffff" strokeWidth="1" />
            <circle cx="22" cy="38" r="3.5" fill="#1c1c1e" />

            <circle cx="78" cy="38" r="10" fill="#1c1c1e" />
            <circle cx="78" cy="38" r="6.5" fill="#8e8e93" />
            <path d="M78,31.5 L78,44.5 M71.5,38 L84.5,38" stroke="#ffffff" strokeWidth="1" />
            <circle cx="78" cy="38" r="3.5" fill="#1c1c1e" />
          </svg>
        );

      // 🚲 BICYCLE
      case 'velo':
      case 'standard':
        if (type === 'velo') {
          return (
            <svg viewBox="0 0 100 50" width="100%" height="100%">
              <ellipse cx="50" cy="43" rx="32" ry="3" fill="rgba(0,0,0,0.12)" />
              {/* Detailed bike frame */}
              <path d="M22,38 L45,38 L60,25 L35,25 Z" stroke={paintColor} strokeWidth="2" fill="none" />
              <path d="M22,38 L35,25 M45,38 L52,18" stroke={paintColor} strokeWidth="2" fill="none" />
              <path d="M28,21 L36,21" stroke="#1c1c1e" strokeWidth="1.8" fill="none" />
              <path d="M50,16 L56,16" stroke="#1c1c1e" strokeWidth="1.8" fill="none" />
              <circle cx="45" cy="38" r="3" fill="none" stroke="#e5e5ea" strokeWidth="1.2" />
              {/* Thin spoke wheels */}
              <circle cx="22" cy="38" r="10" stroke="#8e8e93" strokeWidth="1.2" fill="none" />
              <path d="M22,28 L22,48 M12,38 L32,38 M15,31 L29,45 M15,45 L29,31" stroke="#aeaeaf" strokeWidth="0.4" />
              <circle cx="78" cy="38" r="10" stroke="#8e8e93" strokeWidth="1.2" fill="none" />
              <path d="M78,28 L78,48 M68,38 L88,38 M71,31 L85,45 M71,45 L85,31" stroke="#aeaeaf" strokeWidth="0.4" />
            </svg>
          );
        } else if (type === 'bus') {
          return (
            <svg viewBox="0 0 100 50" width="100%" height="100%">
              <defs>
                <linearGradient id={gId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={paintColorLight} />
                  <stop offset="50%" stopColor={paintColor} />
                  <stop offset="100%" stopColor={paintColorDark} />
                </linearGradient>
                <linearGradient id="bus-glass" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#73a6e4" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#192330" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              <ellipse cx="50" cy="43" rx="42" ry="4" fill="rgba(0,0,0,0.22)" />
              <circle cx="28" cy="38" r="9" fill="rgba(0,0,0,0.3)" />
              <circle cx="72" cy="38" r="9" fill="rgba(0,0,0,0.3)" />
              
              {/* Isuzu Gala Highway Coach Bus body */}
              <path fill={`url(#${gId})`} d="M12,36 L12,16 Q12,14 15,14 L82,14 Q88,14 88,18 L88,36 Z" />
              
              {/* Windows */}
              <rect x="18" y="17" width="10" height="8" fill="url(#bus-glass)" />
              <rect x="31" y="17" width="10" height="8" fill="url(#bus-glass)" />
              <rect x="44" y="17" width="10" height="8" fill="url(#bus-glass)" />
              <rect x="57" y="17" width="10" height="8" fill="url(#bus-glass)" />
              <rect x="70" y="17" width="12" height="8" fill="url(#bus-glass)" />
              
              {/* Decal Lines */}
              <rect x="12" y="29" width="76" height="2.5" fill="#ffffff" opacity="0.8" />
              <rect x="12" y="32" width="76" height="1.2" fill="#FF9F0A" />
              
              <rect x="84" y="30" width="4" height="2" fill="#FFD60A" />
              <rect x="12" y="27" width="2" height="4" fill="#FF3B30" />
              
              {/* Axles */}
              <circle cx="28" cy="38" r="8" fill="#1c1c1e" />
              <circle cx="28" cy="38" r="4.5" fill="#8e8e93" stroke="#545456" strokeWidth="1" />
              
              <circle cx="72" cy="38" r="8" fill="#1c1c1e" />
              <circle cx="72" cy="38" r="4.5" fill="#8e8e93" stroke="#545456" strokeWidth="1" />
            </svg>
          );
        }
        break;
 
      // 🚚 TRUCK BODIES
      case 'flatbed':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <defs>
              <linearGradient id={gId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={paintColorLight} />
                <stop offset="50%" stopColor={paintColor} />
                <stop offset="100%" stopColor={paintColorDark} />
              </linearGradient>
              <linearGradient id="truck-glass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#121820" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="43" rx="42" ry="4" fill="rgba(0,0,0,0.22)" />
            
            {/* Chassis */}
            <rect x="10" y="34" width="78" height="4.5" fill="#1c1c1e" />
            
            {/* Cabin (Painted Isuzu Elf Cabin) */}
            <path fill={`url(#${gId})`} d="M64,34 L64,16 L76,16 Q84,16 84,23 L84,34 Z" />
            <path fill="url(#truck-glass)" d="M68,19 L76,19 L79,25 L68,25 Z" />
            
            {/* Flatbed Rails */}
            <rect x="12" y="26" width="51" height="8" fill="#d1d1d6" stroke="#8e8e93" strokeWidth="0.8" />
            <line x1="28" y1="26" x2="28" y2="34" stroke="#8e8e93" strokeWidth="0.8" />
            <line x1="44" y1="26" x2="44" y2="34" stroke="#8e8e93" strokeWidth="0.8" />
            
            {/* Wheels */}
            <circle cx="24" cy="38" r="7" fill="#1c1c1e" />
            <circle cx="24" cy="38" r="4" fill="#aeaeaf" />
            <circle cx="42" cy="38" r="7" fill="#1c1c1e" />
            <circle cx="42" cy="38" r="4" fill="#aeaeaf" />
            <circle cx="72" cy="38" r="7" fill="#1c1c1e" />
            <circle cx="72" cy="38" r="4" fill="#aeaeaf" />
          </svg>
        );

      case 'box_truck':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <defs>
              <linearGradient id={gId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={paintColorLight} />
                <stop offset="50%" stopColor={paintColor} />
                <stop offset="100%" stopColor={paintColorDark} />
              </linearGradient>
              <linearGradient id="container-sides" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e5e5ea" />
              </linearGradient>
              <linearGradient id="truck-glass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#121820" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="43" rx="44" ry="4.5" fill="rgba(0,0,0,0.22)" />
            <rect x="10" y="35" width="80" height="5" fill="#1c1c1e" />
            
            {/* Cabin (Painted) */}
            <path fill={`url(#${gId})`} d="M64,35 L64,15 L78,15 Q86,15 86,24 L86,35 Z" />
            <path fill="url(#truck-glass)" d="M68,18 L76,18 L81,25 L68,25 Z" />
            
            {/* Closed Aluminium Container Box */}
            <rect x="11" y="11" width="52" height="24" fill="url(#container-sides)" stroke="#8e8e93" strokeWidth="1" />
            <line x1="28" y1="11" x2="28" y2="35" stroke="#aeaeaf" strokeWidth="0.8" />
            <line x1="45" y1="11" x2="45" y2="35" stroke="#aeaeaf" strokeWidth="0.8" />
            
            {/* Wheels */}
            <circle cx="22" cy="39" r="7.5" fill="#1c1c1e" />
            <circle cx="22" cy="39" r="4.2" fill="#aeaeaf" />
            <circle cx="38" cy="39" r="7.5" fill="#1c1c1e" />
            <circle cx="38" cy="39" r="4.2" fill="#aeaeaf" />
            <circle cx="74" cy="39" r="7.5" fill="#1c1c1e" />
            <circle cx="74" cy="39" r="4.2" fill="#aeaeaf" />
          </svg>
        );

      case 'wing_body':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <defs>
              <linearGradient id={gId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={paintColorLight} />
                <stop offset="50%" stopColor={paintColor} />
                <stop offset="100%" stopColor={paintColorDark} />
              </linearGradient>
              <linearGradient id="wing-container" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f2f2f7" />
                <stop offset="100%" stopColor="#d1d1d6" />
              </linearGradient>
              <linearGradient id="truck-glass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#121820" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="43" rx="44" ry="4.5" fill="rgba(0,0,0,0.22)" />
            <rect x="10" y="35" width="80" height="5" fill="#1c1c1e" />
            
            {/* Cabin (Painted Hino Ranger style) */}
            <path fill={`url(#${gId})`} d="M64,35 L64,15 L78,15 Q86,15 86,24 L86,35 Z" />
            <path fill="url(#truck-glass)" d="M68,18 L76,18 L81,25 L68,25 Z" />
            
            {/* Wing Container (Hino Wing Body side details) */}
            <rect x="11" y="11" width="52" height="24" fill="url(#wing-container)" stroke="#8e8e93" strokeWidth="1" />
            <line x1="11" y1="22" x2="63" y2="22" stroke="#8e8e93" strokeWidth="1.5" />
            <line x1="28" y1="11" x2="28" y2="35" stroke="#aeaeaf" strokeWidth="0.8" />
            <line x1="45" y1="11" x2="45" y2="35" stroke="#aeaeaf" strokeWidth="0.8" />
            
            {/* Wing hydraulic rod lines */}
            <line x1="14" y1="22" x2="14" y2="35" stroke="#8e8e93" strokeWidth="1" />
            <line x1="60" y1="22" x2="60" y2="35" stroke="#8e8e93" strokeWidth="1" />
            
            {/* Wheels */}
            <circle cx="22" cy="39" r="7.5" fill="#1c1c1e" />
            <circle cx="22" cy="39" r="4.2" fill="#aeaeaf" />
            <circle cx="38" cy="39" r="7.5" fill="#1c1c1e" />
            <circle cx="38" cy="39" r="4.2" fill="#aeaeaf" />
            <circle cx="74" cy="39" r="7.5" fill="#1c1c1e" />
            <circle cx="74" cy="39" r="4.2" fill="#aeaeaf" />
          </svg>
        );

      case 'dump_truck':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <defs>
              <linearGradient id={gId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={paintColorLight} />
                <stop offset="50%" stopColor={paintColor} />
                <stop offset="100%" stopColor={paintColorDark} />
              </linearGradient>
              <linearGradient id="truck-glass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#121820" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="43" rx="40" ry="4" fill="rgba(0,0,0,0.22)" />
            <rect x="12" y="34" width="74" height="5.5" fill="#1c1c1e" />
            
            {/* Cabin (Painted) */}
            <path fill={`url(#${gId})`} d="M60,34 L60,18 L72,18 Q78,18 78,25 L78,34 Z" />
            <path fill="url(#truck-glass)" d="M64,21 L72,21 L74,27 L64,27 Z" />
            
            {/* Metal Cargo Bed (Realistic details, angle bars) */}
            <path fill="#8e8e93" d="M14,16 L56,16 L56,34 L14,34 Z" stroke="#3a3a3c" strokeWidth="1" />
            <line x1="20" y1="16" x2="20" y2="34" stroke="#545456" strokeWidth="1.2" />
            <line x1="32" y1="16" x2="32" y2="34" stroke="#545456" strokeWidth="1.2" />
            <line x1="44" y1="16" x2="44" y2="34" stroke="#545456" strokeWidth="1.2" />
            
            {/* Wheels */}
            <circle cx="26" cy="38" r="7.5" fill="#1c1c1e" />
            <circle cx="26" cy="38" r="4.2" fill="#aeaeaf" />
            <circle cx="44" cy="38" r="7.5" fill="#1c1c1e" />
            <circle cx="44" cy="38" r="4.2" fill="#aeaeaf" />
            <circle cx="69" cy="38" r="7.5" fill="#1c1c1e" />
            <circle cx="69" cy="38" r="4.2" fill="#aeaeaf" />
          </svg>
        );

      case 'trailer_container':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <defs>
              <linearGradient id={gId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={paintColorLight} />
                <stop offset="50%" stopColor={paintColor} />
                <stop offset="100%" stopColor={paintColorDark} />
              </linearGradient>
              <linearGradient id="container-body" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e5e5ea" />
              </linearGradient>
              <linearGradient id="truck-glass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#121820" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="43" rx="46" ry="4.8" fill="rgba(0,0,0,0.25)" />
            <rect x="6" y="36" width="88" height="5" fill="#1c1c1e" />
            
            {/* Cabin/Tractor (Paint color) */}
            <path fill={`url(#${gId})`} d="M68,36 L68,14 L82,14 Q88,14 88,22 L88,36 Z" />
            <path fill="url(#truck-glass)" d="M72,17 L80,17 L84,24 L72,24 Z" />
            <path fill={`url(#${gId})`} opacity="0.8" d="M68,14 L80,11 L82,14 Z" />
            
            {/* Long Trailer Box (Container seams) */}
            <rect x="8" y="13" width="56" height="23" fill="url(#container-body)" stroke="#8e8e93" strokeWidth="1" />
            <line x1="22" y1="13" x2="22" y2="36" stroke="#d1d1d6" strokeWidth="0.8" />
            <line x1="36" y1="13" x2="36" y2="36" stroke="#d1d1d6" strokeWidth="0.8" />
            <line x1="50" y1="13" x2="50" y2="36" stroke="#d1d1d6" strokeWidth="0.8" />
            
            {/* Wheels */}
            <circle cx="16" cy="39" r="7.5" fill="#1c1c1e" />
            <circle cx="16" cy="39" r="4.2" fill="#aeaeaf" />
            <circle cx="32" cy="39" r="7.5" fill="#1c1c1e" />
            <circle cx="32" cy="39" r="4.2" fill="#aeaeaf" />
            <circle cx="48" cy="39" r="7.5" fill="#1c1c1e" />
            <circle cx="48" cy="39" r="4.2" fill="#aeaeaf" />
            <circle cx="73" cy="39" r="7.5" fill="#1c1c1e" />
            <circle cx="73" cy="39" r="4.2" fill="#aeaeaf" />
            <circle cx="83" cy="39" r="7.5" fill="#1c1c1e" />
            <circle cx="83" cy="39" r="4.2" fill="#aeaeaf" />
          </svg>
        );

      default: {
        let fallbackBodyStyle = 'sedan';
        if (type === 'moto') fallbackBodyStyle = 'scooter';
        else if (type === 'velo') fallbackBodyStyle = 'standard';
        else if (type === 'truck_3t') fallbackBodyStyle = 'box_truck';
        else if (type === 'truck_4t') fallbackBodyStyle = 'wing_body';
        else if (type === 'trailer') fallbackBodyStyle = 'trailer_container';
        else if (type === 'bus') fallbackBodyStyle = 'standard';
        
        if (bodyStyle !== fallbackBodyStyle) {
          return renderVehicleSVG(type, fallbackBodyStyle, color);
        }
        return null;
      }
    }
  };

  const renderJDMPlateBox = (plate, isPreview = false) => {
    const prefecture = plate.platePrefecture || '練馬';
    const classCode = plate.plateClass || '300';
    const hira = plate.plateHira || 'あ';
    const number = plate.plateNumber || '12-34';
    const plateType = plate.plateType || (plate.isCommercial ? 'commercial' : 'private');

    let bg = 'linear-gradient(135deg, #f8f9fa, #ffffff)';
    let border = '2.5px solid #2c3e2d';
    let textColor = '#24522a';
    let boltBg = '#8e8e93';
    let hasBgGraphic = false;
    let bgGraphicSvg = null;
    let shadow = '0.5px 0.5px 0px rgba(255,255,255,0.8), -0.5px -0.5px 0px rgba(0,0,0,0.15)';

    if (plateType === 'commercial') {
      bg = 'linear-gradient(135deg, #1b3d20, #24522a)';
      border = '2.5px solid #ffffff';
      textColor = '#ffffff';
      shadow = '0.5px 0.5px 0px rgba(0,0,0,0.4), -0.5px -0.5px 0px rgba(255,255,255,0.2)';
    } else if (plateType === 'kei_private') {
      bg = 'linear-gradient(135deg, #ffd83b, #ffd60a)';
      border = '2.5px solid #1c1c1e';
      textColor = '#1c1c1e';
    } else if (plateType === 'kei_commercial') {
      bg = 'linear-gradient(135deg, #2c2c2e, #1c1c1e)';
      border = '2.5px solid #ffd60a';
      textColor = '#ffd60a';
      shadow = '0.5px 0.5px 0px rgba(0,0,0,0.4), -0.5px -0.5px 0px rgba(255,255,255,0.2)';
    } else if (plateType === 'illustrated_fuji') {
      bg = 'linear-gradient(to bottom, #b3e5fc, #e1f5fe, #ffffff)';
      border = '2.5px solid #24522a';
      textColor = '#24522a';
      hasBgGraphic = true;
      bgGraphicSvg = (
        <svg viewBox="0 0 100 50" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '80%', opacity: 0.85, pointerEvents: 'none' }}>
          {/* Mount Fuji silhouette */}
          <path d="M10,50 L42,24 L58,24 L90,50 Z" fill="#7bb9e8" />
          {/* White Snowcap */}
          <path d="M42,24 L48,18 Q50,16 52,18 L58,24 L54,28 Q50,26 46,28 Z" fill="#ffffff" />
        </svg>
      );
    } else if (plateType === 'illustrated_expo') {
      bg = 'linear-gradient(135deg, #f8f9fa, #ffffff)';
      border = '2.5px solid #ff3b30';
      textColor = '#1c1c1e';
      hasBgGraphic = true;
      bgGraphicSvg = (
        <svg viewBox="0 0 100 50" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.8, pointerEvents: 'none' }}>
          {/* Expo mascot red bubbles on borders */}
          <circle cx="8" cy="8" r="5" fill="#ff3b30" />
          <circle cx="18" cy="6" r="4" fill="#ff3b30" />
          <circle cx="92" cy="12" r="6" fill="#ff3b30" />
          <circle cx="91" cy="22" r="4" fill="#ff3b30" />
          <circle cx="10" cy="42" r="5" fill="#ffffff" stroke="#ff3b30" strokeWidth="2" />
          <circle cx="88" cy="42" r="5" fill="#ff3b30" />
          {/* Mascot eye dots */}
          <circle cx="92" cy="12" r="1.5" fill="#ffffff" />
          <circle cx="92" cy="12" r="0.5" fill="#007aff" />
        </svg>
      );
    } else if (plateType === 'illustrated_flower') {
      bg = 'linear-gradient(135deg, #fff0f5, #ffe4e1)';
      border = '2.5px solid #ff2d55';
      textColor = '#881b37';
      hasBgGraphic = true;
      bgGraphicSvg = (
        <svg viewBox="0 0 100 50" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.9, pointerEvents: 'none' }}>
          {/* Pink cherry blossoms in corners */}
          <g transform="translate(12, 12)">
            <circle cx="0" cy="0" r="4" fill="#ff6b8b" />
            <circle cx="-3" cy="-3" r="3.5" fill="#ff8da1" opacity="0.9" />
            <circle cx="3" cy="-3" r="3.5" fill="#ff8da1" opacity="0.9" />
            <circle cx="3" cy="3" r="3.5" fill="#ff8da1" opacity="0.9" />
            <circle cx="-3" cy="3" r="3.5" fill="#ff8da1" opacity="0.9" />
            <circle cx="0" cy="0" r="1" fill="#ffd60a" />
          </g>
          <g transform="translate(88, 38)">
            <circle cx="0" cy="0" r="4.5" fill="#ff6b8b" />
            <circle cx="-3.5" cy="-3.5" r="4" fill="#ff8da1" opacity="0.9" />
            <circle cx="3.5" cy="-3.5" r="4" fill="#ff8da1" opacity="0.9" />
            <circle cx="3.5" cy="3.5" r="4" fill="#ff8da1" opacity="0.9" />
            <circle cx="-3.5" cy="3.5" r="4" fill="#ff8da1" opacity="0.9" />
            <circle cx="0" cy="0" r="1" fill="#ffd60a" />
          </g>
          <path d="M50,8 Q52,5 50,2 Q48,5 50,8 Z" fill="#ffb7c5" transform="rotate(15 50 8)" />
          <path d="M70,15 Q72,12 70,9 Q68,12 70,15 Z" fill="#ffb7c5" transform="rotate(-30 70 15)" />
        </svg>
      );
    } else if (plateType === 'illustrated_matsudo') {
      bg = 'linear-gradient(135deg, #fff0f5 0%, #e0f2f1 100%)';
      border = '2.5px solid #2e7d32';
      textColor = '#1c4224';
      hasBgGraphic = true;
      bgGraphicSvg = (
        <svg viewBox="0 0 100 50" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.9, pointerEvents: 'none' }}>
          {/* Tokiwadaira Sakura (Top Left pink branch) */}
          <g transform="translate(12, 10)">
            <circle cx="0" cy="0" r="3.5" fill="#ff6b8b" />
            <circle cx="-2.5" cy="-2.5" r="3" fill="#ff8da1" opacity="0.85" />
            <circle cx="2.5" cy="-2.5" r="3" fill="#ff8da1" opacity="0.85" />
            <circle cx="2.5" cy="2.5" r="3" fill="#ff8da1" opacity="0.85" />
            <circle cx="-2.5" cy="2.5" r="3" fill="#ff8da1" opacity="0.85" />
            <circle cx="0" cy="0" r="0.75" fill="#ffd60a" />
          </g>
          <g transform="translate(24, 7)">
            <circle cx="0" cy="0" r="2.5" fill="#ff8da1" opacity="0.8" />
            <circle cx="-2" cy="-2" r="2" fill="#ffccd5" opacity="0.8" />
            <circle cx="2" cy="-2" r="2" fill="#ffccd5" opacity="0.8" />
            <circle cx="2" cy="2" r="2" fill="#ffccd5" opacity="0.8" />
            <circle cx="-2" cy="2" r="2" fill="#ffccd5" opacity="0.8" />
          </g>
          {/* Hondo-ji Ajisai Hydrangeas (Bottom Right) */}
          <g transform="translate(88, 38)">
            <circle cx="-3" cy="-3" r="2.5" fill="#8c9eff" opacity="0.85" />
            <circle cx="2" cy="-3" r="2.5" fill="#b388ff" opacity="0.85" />
            <circle cx="-2" cy="2" r="2.5" fill="#80d8ff" opacity="0.85" />
            <circle cx="2" cy="2" r="2.5" fill="#b388ff" opacity="0.85" />
            <circle cx="0" cy="0" r="3" fill="#8c9eff" opacity="0.9" />
          </g>
          {/* Yagiri no Watashi Boat (Bottom Left/Center) */}
          <g transform="translate(45, 41)">
            {/* Water Waves */}
            <path d="M-25,3 Q-15,1 -5,3 Q5,1 15,3 Q25,1 35,3" fill="none" stroke="#4fc3f7" strokeWidth="0.75" />
            {/* Simple rowboat */}
            <path d="M-8,1 L8,1 L11,-1 L-6,-1 Z" fill="#8d6e63" />
            {/* Boatman / Passenger silhouette */}
            <circle cx="0" cy="-4" r="1.5" fill="#5d4037" />
            <path d="M-1.5,-2.5 L1.5,-2.5 L1,1 L-1,1 Z" fill="#5d4037" />
            <line x1="-3" y1="-1" x2="-8" y2="4" stroke="#3e2723" strokeWidth="0.5" />
          </g>
        </svg>
      );
    }

    const scale = isPreview ? 'scale(1.1)' : 'scale(1.2)';

    return (
      <div className={`jdm-plate-box ${plateType}`} style={{
        width: '124px',
        height: '74px',
        border: border,
        borderRadius: '6px',
        background: bg,
        color: textColor,
        padding: '4px 6px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        boxShadow: '0 6px 18px rgba(0,0,0,0.22), inset 0 0 0 1.5px rgba(255,255,255,0.65)',
        fontFamily: '"Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
        transform: scale,
        overflow: 'hidden'
      }}>
        {hasBgGraphic && bgGraphicSvg}
        
        {/* Realistic Metallic Sheen Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.06) 100%)',
          pointerEvents: 'none',
          zIndex: 1
        }} />

        {/* 3D Left Screw Slotted Bolt */}
        <svg className="jdm-screw-bolt" viewBox="0 0 10 10" style={{ position: 'absolute', top: '6px', left: '14px', width: '7px', height: '7px', zIndex: 3 }}>
          <defs>
            <radialGradient id="bolt-metallic-left" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#b0b0b8" />
              <stop offset="100%" stopColor="#48484a" />
            </radialGradient>
          </defs>
          <circle cx="5" cy="5" r="4.5" fill="url(#bolt-metallic-left)" stroke="#3a3a3c" strokeWidth="0.75" />
          <line x1="2.5" y1="5" x2="7.5" y2="5" stroke="#1c1c1e" strokeWidth="1" strokeLinecap="round" />
        </svg>

        {/* 3D Right Screw Slotted Bolt */}
        <svg className="jdm-screw-bolt" viewBox="0 0 10 10" style={{ position: 'absolute', top: '6px', right: '14px', width: '7px', height: '7px', zIndex: 3 }}>
          <defs>
            <radialGradient id="bolt-metallic-right" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#b0b0b8" />
              <stop offset="100%" stopColor="#48484a" />
            </radialGradient>
          </defs>
          <circle cx="5" cy="5" r="4.5" fill="url(#bolt-metallic-right)" stroke="#3a3a3c" strokeWidth="0.75" />
          <line x1="5" y1="2.5" x2="5" y2="7.5" stroke="#1c1c1e" strokeWidth="1" strokeLinecap="round" />
        </svg>

        {/* JDM Top Row (Prefecture and Class Code spaced between bolts) */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '9.5px', 
          lineHeight: 1, 
          padding: '0 26px', 
          marginTop: '3px', 
          zIndex: 2, 
          position: 'relative',
          fontWeight: '900',
          textShadow: '0.5px 0.5px 0px rgba(0,0,0,0.25), -0.5px -0.5px 0.5px rgba(255,255,255,0.9)'
        }}>
          <span>{prefecture}</span>
          <span>{classCode}</span>
        </div>

        {/* JDM Main Row (Hiragana Calligraphy Left, 4-digit number Right) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 6px', 
          marginBottom: '2px', 
          zIndex: 2, 
          position: 'relative',
          textShadow: '0.5px 0.5px 0px rgba(0,0,0,0.25), -0.5px -0.5px 0.5px rgba(255,255,255,0.9)'
        }}>
          <span style={{ 
            fontSize: '14px', 
            fontFamily: '"Hiragino Mincho ProN", serif', 
            fontWeight: 'bold' 
          }}>{hira}</span>
          <span style={{ 
            fontSize: '19px', 
            letterSpacing: '1px', 
            fontWeight: '900' 
          }}>{number}</span>
        </div>
      </div>
    );
  };

  const getProfileLangText = (key) => {
    const lang = i18n.language || 'uz';
    const dict = {
      plateDesignLabel: {
        uz: "🖼️ Avtoraqam turi",
        ja: "🖼️ ナンバープレートデザイン",
        en: "🖼️ License Plate Design"
      },
      driverBadgeLabel: {
        uz: "🔰 Haydovchi belgisi",
        ja: "🔰 運転者マーク",
        en: "🔰 Driver Badge"
      },
      prefectureLabel: {
        uz: "Prefektura (Hudud)",
        ja: "地名 (陸運局)",
        en: "Prefecture (LTO)"
      },
      classCodeLabel: {
        uz: "Klass kodi",
        ja: "分類番号",
        en: "Class Code"
      },
      hiraLabel: {
        uz: "Hiragana",
        ja: "ひらがな",
        en: "Hiragana"
      },
      numLabel: {
        uz: "Raqam (masalan, 12-34)",
        ja: "一連指定番号 (例 12-34)",
        en: "Number (e.g. 12-34)"
      },
      constructorTitle: {
        uz: "🇯🇵 Yaponiya Standartidagi Avtoraqam (JDM Plate Constructor):",
        ja: "🇯🇵 日本のナンバープレート作成 (JDM Constructor):",
        en: "🇯🇵 Japanese License Plate Constructor (JDM):"
      },
      opt_private: {
        uz: "⬜ Shaxsiy standart (Oq rangli)",
        ja: "⬜ 自家用・普通車 (白色)",
        en: "⬜ Private Standard (White)"
      },
      opt_commercial: {
        uz: "🟩 Tijoriy standart (Yashil rangli)",
        ja: "🟩 事業用・普通車 (緑色)",
        en: "🟩 Commercial Standard (Green)"
      },
      opt_kei_private: {
        uz: "🟨 Kei-car shaxsiy (Sariq rangli)",
        ja: "🟨 自家用・軽自動車 (黄色)",
        en: "🟨 Kei-car Private (Yellow)"
      },
      opt_kei_commercial: {
        uz: "⬛ Kei-car tijoriy (Qora rangli)",
        ja: "⬛ 事業用・軽自動車 (黒色)",
        en: "⬛ Kei-car Commercial (Black)"
      },
      opt_illustrated_fuji: {
        uz: "🗻 Fuji tog'i tasvirli (Art Plate)",
        ja: "🗻 富士山 図柄入りプレート (Art Plate)",
        en: "🗻 Mount Fuji Art Plate"
      },
      opt_illustrated_expo: {
        uz: "🔴 Osaka Expo 2025 esdalik raqami",
        ja: "🔴 大阪・関西万博 記念プレート (EXPO 2025)",
        en: "🔴 Osaka Expo 2025 Commemorative"
      },
      opt_illustrated_flower: {
        uz: "🌸 Sakura va Nanohana gullari (Milliy)",
        ja: "🌸 全国花柄図柄入りプレート (桜と菜の花)",
        en: "🌸 National Sakura & Canola Flowers"
      },
      opt_illustrated_matsudo: {
        uz: "🏞️ Matsudo mahalliy tasvirli raqami (Sakura, Ajisai & Yagiri boat)",
        ja: "🏞️ 松戸版図柄入りナンバー (桜・あじさい・矢切の渡し)",
        en: "🏞️ Matsudo Local Plate (Sakura, Ajisai & Yagiri)"
      },
      opt_badge_none: {
        uz: "❌ Maxsus belgisiz (Standart)",
        ja: "❌ 特殊マークなし (標準)",
        en: "❌ No Special Badge (Standard)"
      },
      opt_badge_beginner: {
        uz: "🔰 Shoshinsha (Yangi haydovchi)",
        ja: "🔰 初心者マーク (若葉マーク)",
        en: "🔰 Beginner Mark (Wakaba)"
      },
      opt_badge_elderly: {
        uz: "🍀 Koreisha (Yoshi katta)",
        ja: "🍀 高齢運転者マーク (もみじ)",
        en: "🍀 Elderly Driver Mark (Yotsuba)"
      },
      opt_badge_disabled: {
        uz: "♿ Nogironligi bor",
        ja: "♿ 身体障害者マーク (車椅子)",
        en: "♿ Physical Disability Mark"
      },
      opt_badge_hearing: {
        uz: "🦋 Eshitish cheklangan",
        ja: "🦋 聴覚障害者マーク (蝶マーク)",
        en: "🦋 Hearing Impaired Mark"
      },
      myVehicleTitle: {
        uz: "Mening Mashinam",
        ja: "マイカー (登録車両)",
        en: "My Vehicle"
      },
      editVehicle: {
        uz: "Tahrirlash",
        ja: "編集",
        en: "Edit"
      },
      vehicleTypeLabel: {
        uz: "Transport turi",
        ja: "車種・カテゴリー",
        en: "Vehicle Category"
      },
      vehicleModelLabel: {
        uz: "Rusumi / Modeli",
        ja: "メーカー・モデル",
        en: "Make & Model"
      },
      vehicleBodyStyleLabel: {
        uz: "Kuzov shakli",
        ja: "ボディタイプ",
        en: "Body Style"
      },
      vehicleYearLabel: {
        uz: "Yili",
        ja: "年式",
        en: "Year"
      },
      vehicleColorLabel: {
        uz: "Moshina rangi",
        ja: "ボディカラー",
        en: "Vehicle Color"
      },
      vehicleDimensionsLabel: {
        uz: "Avtotransport o'lchamlari (Navigatsiya uchun)",
        ja: "車両寸法 (ナビゲーション用)",
        en: "Vehicle Dimensions (for Navigation)"
      },
      heightLabel: {
        uz: "Balandlik",
        ja: "車高 (高さ)",
        en: "Height"
      },
      widthLabel: {
        uz: "Eni",
        ja: "車幅 (幅)",
        en: "Width"
      },
      lengthLabel: {
        uz: "Uzunlik",
        ja: "全長 (長さ)",
        en: "Length"
      },
      weightLabel: {
        uz: "Vazni",
        ja: "車両重量 (重さ)",
        en: "Weight"
      },
      // Vehicle types
      type_car: {
        uz: "Yengil avto",
        ja: "乗用車 (普通・軽)",
        en: "Passenger Car"
      },
      type_moto: {
        uz: "Motosikl",
        ja: "二輪車 (バイク)",
        en: "Motorcycle"
      },
      type_velo: {
        uz: "Velosiped",
        ja: "自転車",
        en: "Bicycle"
      },
      type_truck_3t: {
        uz: "3t Yuk mashinasi",
        ja: "3t トラック",
        en: "3t Truck"
      },
      type_truck_4t: {
        uz: "4t Yuk mashinasi",
        ja: "4t トラック",
        en: "4t Truck"
      },
      type_trailer: {
        uz: "Trailer (Katta yuk)",
        ja: "大型トレーラー",
        en: "Trailer (Heavy Cargo)"
      },
      type_bus: {
        uz: "Avtobus",
        ja: "バス",
        en: "Bus"
      },
      type_kei_truck: {
        uz: "軽トラ (Kei Truck)",
        ja: "軽トラック",
        en: "Kei Truck"
      },
      type_truck_2t: {
        uz: "2t Yuk mashinasi",
        ja: "2t トラック",
        en: "2t Truck"
      },
      type_truck_10t: {
        uz: "10t Yuk mashinasi",
        ja: "10t トラック (大型)",
        en: "10t Truck"
      },
      type_tanker: {
        uz: "Tanker (Avtosisterna)",
        ja: "タンクローリー",
        en: "Tanker Truck"
      },
      axleLoadLabel: {
        uz: "O'q yuki",
        ja: "軸重",
        en: "Axle Load"
      },
      minTurnRadiusLabel: {
        uz: "Burilish radiusi",
        ja: "最小回転半径",
        en: "Turn Radius"
      },

      // Body styles
      body_sedan: {
        uz: "Sedan",
        ja: "セダン",
        en: "Sedan"
      },
      body_hatchback: {
        uz: "Hatchback",
        ja: "ハッチバック",
        en: "Hatchback"
      },
      body_suv: {
        uz: "SUV (Krossover)",
        ja: "SUV (クロスカントリー)",
        en: "SUV"
      },
      body_minivan: {
        uz: "Minivan / MPV",
        ja: "ミニバン (ワンボックス)",
        en: "Minivan / MPV"
      },
      body_scooter: {
        uz: "Motoroller",
        ja: "スクーター (カブ)",
        en: "Scooter"
      },
      body_sportbike: {
        uz: "Sportbayk",
        ja: "スポーツバイク",
        en: "Sportbike"
      },
      body_flatbed: {
        uz: "Ochiq bortli",
        ja: "平ボディ",
        en: "Flatbed"
      },
      body_box_truck: {
        uz: "Furgon (Yopiq)",
        ja: "バン・箱型",
        en: "Box Truck"
      },
      body_wing_body: {
        uz: "Wing Body",
        ja: "ウィングボディ",
        en: "Wing Body"
      },
      body_dump_truck: {
        uz: "Samosval",
        ja: "ダンプ",
        en: "Dump Truck"
      },
      body_trailer_container: {
        uz: "Tirkamali",
        ja: "コンテナトレーラー",
        en: "Container Trailer"
      },
      body_standard: {
        uz: "Standart",
        ja: "標準仕様",
        en: "Standard"
      }
    };
    if (dict[key]) {
      return dict[key][lang] || dict[key]['uz'];
    }
    return '';
  };

  const renderDriverMarkBadge = (mark) => {
    switch (mark) {
      case 'beginner':
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(52, 199, 89, 0.1)', border: '1px solid rgba(52, 199, 89, 0.3)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: '#34c759', fontWeight: 'bold' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" style={{ verticalAlign: 'middle' }}>
              <path d="M12,2 L4,8 L4,15 C4,19 8,22 12,23 C16,22 20,19 20,15 L20,8 Z" fill="#ffd60a" />
              <path d="M12,2 L4,8 L4,15 C4,19 8,22 12,23 Z" fill="#30d158" />
            </svg>
            <span>{getProfileLangText('opt_badge_beginner')}</span>
          </div>
        );
      case 'elderly':
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 159, 10, 0.1)', border: '1px solid rgba(255, 159, 10, 0.3)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: '#ff9f0a', fontWeight: 'bold' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" style={{ verticalAlign: 'middle' }}>
              <circle cx="9" cy="9" r="4.5" fill="#FF9F0A" />
              <circle cx="15" cy="9" r="4.5" fill="#FFD60A" />
              <circle cx="15" cy="15" r="4.5" fill="#30D158" />
              <circle cx="9" cy="15" r="4.5" fill="#30B0C7" />
              <path d="M12,7 L12,17 M7,12 L17,12" stroke="#ffffff" strokeWidth="1.2" />
            </svg>
            <span>{getProfileLangText('opt_badge_elderly')}</span>
          </div>
        );
      case 'disabled':
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(10, 132, 255, 0.1)', border: '1px solid rgba(10, 132, 255, 0.3)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: '#0a84ff', fontWeight: 'bold' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" style={{ verticalAlign: 'middle' }}>
              <circle cx="12" cy="12" r="10" fill="#0A84FF" />
              <circle cx="12" cy="8" r="2" fill="#ffffff" />
              <path d="M14,13 H11 V10 H13 M9,16 A3,3 0 1,1 12,13" stroke="#ffffff" strokeWidth="1.5" fill="none" />
            </svg>
            <span>{getProfileLangText('opt_badge_disabled')}</span>
          </div>
        );
      case 'hearing':
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(48, 176, 199, 0.1)', border: '1px solid rgba(48, 176, 199, 0.3)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: '#30b0c7', fontWeight: 'bold' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" style={{ verticalAlign: 'middle' }}>
              <circle cx="12" cy="12" r="10" fill="#ffd60a" />
              <path d="M12,8 C9,5 7,12 12,15 C17,12 15,5 12,8 Z" fill="#30d158" />
              <path d="M12,16 C9,19 7,12 12,9 C17,12 15,19 12,16 Z" fill="#30d158" />
              <circle cx="12" cy="12" r="2" fill="#ffd60a" />
            </svg>
            <span>{getProfileLangText('opt_badge_hearing')}</span>
          </div>
        );
      default:
        return null;
    }
  };

  


const getLicenseLabel = (type) => {
    const labels = {
      'Oogata': 'Large Truck (Oogata)',
      'Chugata': 'Medium Truck (Chugata)',
      'JunChugata': 'Semi-Medium (Jun-Chugata)',
      'Tokushu': 'Special Vehicle (Tokushu)',
      'Futsu': 'Ordinary Vehicle (Futsu)',
    };
    return labels[type] || type;
  };

  return { renderVehicleSVG, renderJDMPlateBox, getProfileLangText, renderDriverMarkBadge, getLicenseLabel };
}
