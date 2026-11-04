/**
 * Geolocation & Distance Calculation Utility
 * Uses Haversine spherical geometry formula to compute shortest distance between
 * customers and dhobi partners.
 */

// Well-known coordinates for common city zones / landmarks (Default: Mumbai metropolitan region)
const ZONE_COORDINATES = {
  'colaba': { lat: 18.9067, lng: 72.8147 },
  'nariman point': { lat: 18.9260, lng: 72.8230 },
  'marine lines': { lat: 18.9438, lng: 72.8234 },
  'worli': { lat: 19.0166, lng: 72.8174 },
  'dadar': { lat: 19.0178, lng: 72.8478 },
  'bandra': { lat: 19.0596, lng: 72.8295 },
  'khar': { lat: 19.0700, lng: 72.8339 },
  'santacruz': { lat: 19.0843, lng: 72.8360 },
  'juhu': { lat: 19.1075, lng: 72.8263 },
  'andheri': { lat: 19.1136, lng: 72.8697 },
  'andheri west': { lat: 19.1363, lng: 72.8277 },
  'andheri east': { lat: 19.1158, lng: 72.8564 },
  'kurla': { lat: 19.0726, lng: 72.8845 },
  'powai': { lat: 19.1176, lng: 72.9060 },
  'ghatkopar': { lat: 19.0860, lng: 72.9090 },
  'chembur': { lat: 19.0522, lng: 72.8994 },
  'malad': { lat: 19.1874, lng: 72.8484 },
  'borivali': { lat: 19.2307, lng: 72.8567 },
  'kandivali': { lat: 19.2062, lng: 72.8525 },
  'goregaon': { lat: 19.1663, lng: 72.8526 },
  'thane': { lat: 19.2183, lng: 72.9781 },
  'navi mumbai': { lat: 19.0330, lng: 73.0297 },
  'vashi': { lat: 19.0771, lng: 72.9986 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'south mumbai': { lat: 18.9300, lng: 72.8300 },
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'bangalore': { lat: 12.9716, lng: 77.5946 }
};

const DEFAULT_CENTER = { lat: 19.0760, lng: 72.8777 }; // Mumbai Central

/**
 * Calculate Great-Circle distance in kilometers between two coordinates using Haversine formula
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return 5.0; // fallback reasonable distance
  }

  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Deterministically generate coordinate offsets based on string hash
 * Ensures the same address or dhobi always resolves to the exact same position
 */
function hashToOffset(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 1000) / 1000 - 0.5) * 0.15; // ~+/- 8 km
  const lngOffset = (((Math.abs(hash >> 3)) % 1000) / 1000 - 0.5) * 0.15;
  return { latOffset, lngOffset };
}

/**
 * Resolve coordinates for an address string or user profile
 */
export function resolveCoordinates(addressOrArea = '', explicitCoords = null) {
  if (explicitCoords && typeof explicitCoords.lat === 'number' && typeof explicitCoords.lng === 'number') {
    return { lat: explicitCoords.lat, lng: explicitCoords.lng };
  }

  const lower = (addressOrArea || '').toLowerCase().trim();
  if (!lower) return { ...DEFAULT_CENTER };

  // Look for zone keyword matches
  for (const [zone, coords] of Object.entries(ZONE_COORDINATES)) {
    if (lower.includes(zone)) {
      const { latOffset, lngOffset } = hashToOffset(lower);
      return {
        lat: Math.round((coords.lat + latOffset * 0.2) * 10000) / 10000,
        lng: Math.round((coords.lng + lngOffset * 0.2) * 10000) / 10000
      };
    }
  }

  // Fallback to deterministic coordinates around center based on address string
  const { latOffset, lngOffset } = hashToOffset(lower);
  return {
    lat: Math.round((DEFAULT_CENTER.lat + latOffset) * 10000) / 10000,
    lng: Math.round((DEFAULT_CENTER.lng + lngOffset) * 10000) / 10000
  };
}

/**
 * Get coordinates for an Order's pickup point
 */
export function getOrderPickupCoords(order) {
  if (order.pickup_coordinates?.lat != null && order.pickup_coordinates?.lng != null) {
    return order.pickup_coordinates;
  }
  return resolveCoordinates(order.pickup_address || order.delivery_address || '');
}

/**
 * Get coordinates for a Dhobi provider
 */
export function getDhobiCoords(dhobi) {
  if (dhobi.dhobiProfile?.location?.lat != null && dhobi.dhobiProfile?.location?.lng != null) {
    return dhobi.dhobiProfile.location;
  }
  if (dhobi.location?.lat != null && dhobi.location?.lng != null) {
    return dhobi.location;
  }
  const area = dhobi.dhobiProfile?.service_area || dhobi.address || dhobi.name || '';
  return resolveCoordinates(area);
}

