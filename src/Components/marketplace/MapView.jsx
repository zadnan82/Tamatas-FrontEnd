// src/components/marketplace/MapView.jsx - FIXED VERSION
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, ShoppingBag, UserSearch, Gift } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = ({ listings, onListingHover, onListingClick, userLocation }) => {
  const mapRef = useRef(null);
  const [activePopup, setActivePopup] = useState(null);

  // Get category icon for markers
  const getCategoryIcon = (category) => {
    const iconMap = {
      'tomatoes_peppers': '🍅',
      'herbs': '🌿',
      'berries': '🫐',
      'root_vegetables': '🥕',
      'leafy_greens': '🥬',
      'citrus_fruits': '🍊',
      'stone_fruits': '🍑',
      'tropical_fruits': '🥭',
      'apples_pears': '🍎',
      'beans_peas': '🫘',
      'squash_pumpkins': '🎃',
      'other': '🥒'
    };
    return iconMap[category] || '🥒';
  };

  // Get color for listing type
  const getTypeColor = (type) => {
    switch(type) {
      case 'for_sale': return '#22c55e';
      case 'looking_for': return '#3b82f6';
      case 'give_away': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  // Custom icon creation
  const createCustomIcon = useCallback((listing) => {
    const color = getTypeColor(listing.listing_type);
    const icon = getCategoryIcon(listing.category);
    
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          position: relative;
        ">
          ${icon}
          ${listing.listing_type === 'give_away' ? 
            '<div style="position:absolute;top:-2px;right:-2px;background:#f59e0b;color:white;font-size:8px;padding:1px 3px;border-radius:6px;font-weight:bold;">FREE</div>' : ''}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  }, []);

  // Filter listings with valid coordinates
  const listingsWithCoords = useMemo(() => {
    if (!listings || !Array.isArray(listings)) {
      return [];
    }
    
    return listings.filter(listing => 
      listing && 
      listing.location && 
      listing.location.latitude && 
      listing.location.longitude &&
      !isNaN(parseFloat(listing.location.latitude)) &&
      !isNaN(parseFloat(listing.location.longitude))
    ).map(listing => ({
      ...listing,
      lat: parseFloat(listing.location.latitude),
      lng: parseFloat(listing.location.longitude)
    }));
  }, [listings]);

  // Calculate map center
  const mapCenter = useMemo(() => {
    // First priority: user location
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      return [userLocation.latitude, userLocation.longitude];
    }
    
    // Second priority: center of listings
    if (listingsWithCoords.length > 0) {
      const avgLat = listingsWithCoords.reduce((sum, listing) => 
        sum + listing.lat, 0) / listingsWithCoords.length;
      const avgLng = listingsWithCoords.reduce((sum, listing) => 
        sum + listing.lng, 0) / listingsWithCoords.length;
      return [avgLat, avgLng];
    }
    
    // Default: Stockholm, Sweden
    return [59.3293, 18.0686];
  }, [userLocation, listingsWithCoords]);

  // Calculate zoom level based on context
  const zoomLevel = useMemo(() => {
    if (userLocation && userLocation.search_radius) {
      const radius = userLocation.search_radius;
      if (radius <= 10) return 12;
      if (radius <= 25) return 10;
      if (radius <= 50) return 9;
      return 8;
    }
    
    if (listingsWithCoords.length === 0) return 10;
    if (listingsWithCoords.length === 1) return 12;
    
    // Calculate bounds-based zoom
    const lats = listingsWithCoords.map(l => l.lat);
    const lngs = listingsWithCoords.map(l => l.lng);
    const latRange = Math.max(...lats) - Math.min(...lats);
    const lngRange = Math.max(...lngs) - Math.min(...lngs);
    const maxRange = Math.max(latRange, lngRange);
    
    if (maxRange > 2) return 8;
    if (maxRange > 0.5) return 10;
    if (maxRange > 0.1) return 12;
    return 14;
  }, [userLocation, listingsWithCoords]);

  // Handle marker interactions with better error handling
  const handleMarkerHover = useCallback((listing, e) => {
    try {
      if (mapRef.current && e && e.target) {
        // Temporarily disable map movement during hover
        const map = mapRef.current;
        if (map.dragging) map.dragging.disable();
        if (map.scrollWheelZoom) map.scrollWheelZoom.disable();
        
        // Open popup and set active listing
        e.target.openPopup();
        setActivePopup(listing.id);
        
        // Call parent hover handler
        if (onListingHover) {
          onListingHover(listing);
        }
      }
    } catch (error) {
      console.error('Error handling marker hover:', error);
    }
  }, [onListingHover]);

  const handleMarkerLeave = useCallback((e) => {
    try {
      if (mapRef.current && e && e.target) {
        // Re-enable map movement
        const map = mapRef.current;
        if (map.dragging) map.dragging.enable();
        if (map.scrollWheelZoom) map.scrollWheelZoom.enable();
        
        // Close popup and clear active listing
        e.target.closePopup();
        setActivePopup(null);
        
        // Call parent hover handler with null
        if (onListingHover) {
          onListingHover(null);
        }
      }
    } catch (error) {
      console.error('Error handling marker leave:', error);
    }
  }, [onListingHover]);

  const handleMarkerClick = useCallback((listing) => {
    try {
      if (onListingClick) {
        onListingClick(listing);
      }
    } catch (error) {
      console.error('Error handling marker click:', error);
    }
  }, [onListingClick]);

  // Show empty state if no valid coordinates
  if (!listingsWithCoords || listingsWithCoords.length === 0) {
    return (
      <div className="relative w-full h-96 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No locations to display</h3>
          <p className="text-sm text-gray-500 mb-4">
            {listings && listings.length > 0 
              ? `Found ${listings.length} listings but none have valid location coordinates.`
              : 'No listings available to show on the map.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        className="z-0"
        key={`${mapCenter[0]}-${mapCenter[1]}-${zoomLevel}`} // Force re-render on center/zoom change
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* User location marker */}
        {userLocation && userLocation.latitude && userLocation.longitude && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={L.divIcon({
              html: `
                <div style="
                  background:#3b82f6;
                  width:20px;
                  height:20px;
                  border-radius:50%;
                  border:3px solid white;
                  box-shadow:0 2px 4px rgba(0,0,0,0.3);
                ">
                  <div style="
                    width:8px;
                    height:8px;
                    background:white;
                    border-radius:50%;
                    margin:3px;
                  "></div>
                </div>
              `,
              className: 'user-location-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          >
            <Popup>
              <div className="text-center p-2">
                <p className="font-semibold text-blue-600">Your Location</p>
                <p className="text-xs text-gray-500">
                  {userLocation.location && userLocation.location.city && userLocation.location.country 
                    ? `${userLocation.location.city}, ${userLocation.location.country}`
                    : 'Current location'
                  }
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Listing markers */}
        {listingsWithCoords.map((listing) => {
          // Extra safety check
          if (!listing || !listing.id || !listing.lat || !listing.lng) {
            return null;
          }

          return (
            <Marker
              key={listing.id}
              position={[listing.lat, listing.lng]}
              icon={createCustomIcon(listing)}
              eventHandlers={{
                mouseover: (e) => handleMarkerHover(listing, e),
                mouseout: handleMarkerLeave,
                click: () => handleMarkerClick(listing)
              }}
            >
              <Popup className="custom-popup">
                <div className="w-72 p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-1 flex-1">
                      {listing.title || 'Untitled Listing'}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                      listing.listing_type === 'for_sale' 
                        ? 'bg-green-500 text-white' 
                        : listing.listing_type === 'looking_for'
                        ? 'bg-blue-500 text-white'
                        : 'bg-orange-500 text-white'
                    }`}>
                      {listing.listing_type === 'for_sale' && <ShoppingBag className="w-2 h-2" />}
                      {listing.listing_type === 'looking_for' && <UserSearch className="w-2 h-2" />}
                      {listing.listing_type === 'give_away' && <Gift className="w-2 h-2" />}
                      {listing.listing_type === 'for_sale' && 'For Sale'}
                      {listing.listing_type === 'looking_for' && 'Looking For'}
                      {listing.listing_type === 'give_away' && 'FREE'}
                    </span>
                  </div>

                  {/* Popup content */}
                  <div className="space-y-2">
                    {listing.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{listing.description}</p>
                    )}
                    
                    {listing.listing_type === 'for_sale' && listing.price && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Price:</span>
                        <span className="font-semibold text-green-600">
                          ${listing.price}
                          {listing.price_unit && ` ${listing.price_unit.replace('per_', '/')}`}
                        </span>
                      </div>
                    )}
                    
                    {listing.listing_type === 'give_away' && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Price:</span>
                        <span className="font-semibold text-orange-600">FREE</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Owner:</span>
                      <span className="text-sm font-medium">
                        {listing.owner?.full_name || 'Anonymous'}
                      </span>
                    </div>
                    
                    {listing.distance && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Distance:</span>
                        <span className="text-sm">{listing.distance} miles away</span>
                      </div>
                    )}

                    {listing.organic && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Organic:</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          🌱 Yes
                        </span>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => handleMarkerClick(listing)}
                      className="w-full mt-2 px-3 py-1 bg-orange-500 text-white rounded text-xs font-medium hover:bg-orange-600 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 z-10">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Legend</h4>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">For Sale</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Looking For</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Give Away (FREE)</span>
          </div>
          {userLocation && userLocation.latitude && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white"></div>
              <span className="text-xs text-gray-600">Your Location</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Search radius indicator */}
      {userLocation && userLocation.search_radius && (
        <div className="absolute top-4 left-4 bg-blue-100 border border-blue-300 rounded-lg p-2 text-xs text-blue-800 max-w-xs z-10">
          <strong>Search Radius:</strong> {userLocation.search_radius} miles
        </div>
      )}

      {/* Listings count indicator */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-2 text-xs text-gray-700 z-10">
        <strong>{listingsWithCoords.length}</strong> listing{listingsWithCoords.length !== 1 ? 's' : ''} on map
      </div>
    </div>
  );
};

export default MapView;