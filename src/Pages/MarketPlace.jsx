import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../config/api';
import { 
  Search, 
  MapPin, 
  Leaf, 
  ShoppingBag, 
  MessageSquare,
  Calendar,
  Heart,
  Filter,
  Grid,
  List,
  Star,
  Eye,
  Clock,
  User,
  TrendingUp,
  SlidersHorizontal,
  X,
  Plus,
  Map,
  Navigation
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom markers for different listing types
const createCustomIcon = (listing) => {
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

  const color = listing.listing_type === 'for_sale' ? '#22c55e' : '#3b82f6';
  const icon = getCategoryIcon(listing.category);
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        cursor: pointer;
      ">
        ${icon}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

// Real Leaflet Map Component
const MapView = ({ listings, onListingHover, onListingClick }) => {
  // Comprehensive Swedish cities including all Stockholm suburbs
  const swedishCities = {
    // Stockholm city and central areas
    'Stockholm': [59.3293, 18.0686],
    'Gamla Stan': [59.3251, 18.0721],
    'Södermalm': [59.3165, 18.0685],
    'Östermalm': [59.3364, 18.0862],
    'Norrmalm': [59.3326, 18.0649],
    'Vasastan': [59.3431, 18.0592],
    'Kungsholmen': [59.3275, 18.0394],
    
    // Stockholm suburbs (your data likely uses these)
    'Farsta': [59.2441, 18.0974],  // Found in your data!
    'Huddinge': [59.2362, 17.9826],
    'Rinkeby': [59.3891, 17.9272],
    'Tensta': [59.3964, 17.9030],
    'Spånga': [59.3847, 17.8897],
    'Handen': [59.1676, 18.1369],
    'Jordbro': [59.1934, 18.0833],
    'Flemingsberg': [59.2195, 17.9486],
    'Skärholmen': [59.2775, 17.9067],
    'Sätra': [59.2581, 17.9325],
    'Bredäng': [59.2883, 17.9386],
    'Fruängen': [59.2994, 17.9697],
    'Hägersten': [59.3003, 17.9897],
    'Liljeholmen': [59.3111, 18.0208],
    'Aspudden': [59.3086, 18.0306],
    'Telefonplan': [59.2997, 18.0378],
    'Midsommarkransen': [59.3022, 18.0189],
    'Älvsjö': [59.2736, 18.0069],
    'Årsta': [59.2989, 18.0481],
    'Enskede': [59.2750, 18.0792],
    'Globen': [59.2931, 18.0831],
    'Bagarmossen': [59.2686, 18.1167],
    'Skarpnäck': [59.2511, 18.1331],
    'Hökarängen': [59.2561, 18.0911],
    'Rågsved': [59.2472, 18.0694],
    'Hagsätra': [59.2397, 18.0575],
    'Fagersjö': [59.2344, 18.0822],
    'Stureby': [59.2661, 18.0622],
    'Svedmyra': [59.2622, 18.0772],
    'Bandhagen': [59.2656, 18.0914],
    'Björkhagen': [59.2753, 18.1089],
    'Kärrtorp': [59.2831, 18.1222],
    'Bagarmossen': [59.2686, 18.1167],
    'Blåsut': [59.2889, 18.1278],
    'Hammarbyhöjden': [59.2925, 18.1056],
    'Johanneshov': [59.2989, 18.0778],
    'Gröndal': [59.3144, 18.0189],
    'Reimersholme': [59.3125, 18.0356],
    'Långholmen': [59.3181, 18.0364],
    'Södermalm': [59.3165, 18.0685],
    'Hornstull': [59.3139, 18.0386],
    'Zinkensdamm': [59.3178, 18.0492],
    'Mariatorget': [59.3164, 18.0658],
    'Slussen': [59.3203, 18.0722],
    'Katarina': [59.3181, 18.0783],
    'Sofia': [59.3097, 18.0831],
    'Vitabergsparken': [59.3147, 18.0789],
    'Ersta': [59.3156, 18.0836],
    
    // Northern suburbs
    'Sollentuna': [59.4281, 17.9507],
    'Täby': [59.4439, 18.0687],
    'Danderyd': [59.4065, 18.0438],
    'Lidingö': [59.3667, 18.1333],
    'Upplands Väsby': [59.5186, 17.9116],
    'Järfälla': [59.4103, 17.8313],
    'Sundbyberg': [59.3606, 17.9708],
    'Solna': [59.3599, 18.0073],
    'Sundbyberg': [59.3606, 17.9708],
    'Akalla': [59.4089, 17.9089],
    'Hallonbergen': [59.3917, 17.9167],
    'Rissne': [59.3750, 17.9250],
    'Duvbo': [59.3833, 17.9000],
    'Vällingby': [59.3667, 17.8667],
    'Råcksta': [59.3583, 17.8833],
    'Blackeberg': [59.3500, 17.8833],
    'Ängbyplan': [59.3417, 17.8750],
    'Islandstorget': [59.3333, 17.8667],
    'Hökarängen': [59.2561, 18.0911],
    
    // Eastern suburbs
    'Nacka': [59.3109, 18.1634],
    'Värmdö': [59.3500, 18.3667],
    'Gustavsberg': [59.3333, 18.3833],
    'Saltsjöbaden': [59.2833, 18.3000],
    'Fisksätra': [59.2667, 18.2833],
    'Sickla': [59.3056, 18.1556],
    'Henriksdal': [59.3056, 18.1222],
    'Finnboda': [59.3139, 18.1444],
    'Kvarnholmen': [59.3194, 18.1556],
    'Östermalm': [59.3364, 18.0862],
    'Djurgården': [59.3244, 18.1156],
    'Gärdet': [59.3433, 18.1033],
    'Ladugårdsgärdet': [59.3500, 18.1000],
    
    // Western suburbs
    'Ekerö': [59.2833, 17.7833],
    'Bromma': [59.3417, 17.9417],
    'Vällingby': [59.3667, 17.8667],
    'Rinkeby': [59.3891, 17.9272],
    'Tensta': [59.3964, 17.9030],
    'Hjulsta': [59.4028, 17.8889],
    'Kista': [59.4039, 17.9472],
    'Akalla': [59.4089, 17.9089],
    'Husby': [59.4056, 17.9194],
    
    // Southern suburbs
    'Haninge': [59.1684, 18.1447],
    'Tyresö': [59.2428, 18.2391],
    'Salem': [59.2058, 17.7928],
    'Botkyrka': [59.2000, 17.8333],
    'Södertälje': [59.1947, 17.6253],
    'Tumba': [59.1981, 17.8319],
    'Tullinge': [59.2000, 17.9000],
    'Flemingsberg': [59.2195, 17.9486],
    'Vårby': [59.2472, 17.9361],
    'Kungens Kurva': [59.2667, 17.9167],
    'Skärholmen': [59.2775, 17.9067],
    'Vårberg': [59.2583, 17.9167],
    'Fittja': [59.2500, 17.8833],
    'Alby': [59.2500, 17.8500],
    'Norsborg': [59.2417, 17.8250],
    'Hallunda': [59.2417, 17.8417],
    
    // Other major Swedish cities
    'Göteborg': [57.7089, 11.9746],
    'Gothenburg': [57.7089, 11.9746],
    'Malmö': [55.6050, 13.0038],
    'Uppsala': [59.8586, 17.6389],
    'Västerås': [59.6162, 16.5528],
    'Örebro': [59.2741, 15.2066],
    'Linköping': [58.4108, 15.6214],
    'Helsingborg': [56.0465, 12.6945],
    'Jönköping': [57.7826, 14.1618],
    'Norrköping': [58.5877, 16.1924],
    'Lund': [55.7047, 13.1910],
    'Umeå': [63.8258, 20.2630],
    'Gävle': [60.6749, 17.1413],
    'Borås': [57.7210, 12.9401],
    'Eskilstuna': [59.3717, 16.5077]
  };

  // Calculate map center based on actual listings
  const calculateMapCenter = (listings) => {
    if (!listings || listings.length === 0) {
      return [59.3293, 18.0686]; // Stockholm fallback
    }

    // Check for real coordinates first
    const listingsWithCoords = listings.filter(listing => 
      (listing.location?.latitude && listing.location?.longitude) ||
      (listing.coordinates?.lat && listing.coordinates?.lng) ||
      (listing.latitude && listing.longitude) ||
      (listing.lat && listing.lng)
    );

    if (listingsWithCoords.length > 0) {
      const avgLat = listingsWithCoords.reduce((sum, listing) => {
        const lat = listing.location?.latitude || listing.coordinates?.lat || listing.latitude || listing.lat;
        return sum + lat;
      }, 0) / listingsWithCoords.length;
      
      const avgLng = listingsWithCoords.reduce((sum, listing) => {
        const lng = listing.location?.longitude || listing.coordinates?.lng || listing.longitude || listing.lng;
        return sum + lng;
      }, 0) / listingsWithCoords.length;
      
      return [avgLat, avgLng];
    }

    // Look for cities in various possible locations
    const cities = [];
    listings.forEach(listing => {
      const city = listing.location?.city || listing.city || listing.address?.city;
      if (city) cities.push(city);
    });
    
    if (cities.length > 0) {
      // Find most common city
      const cityCount = cities.reduce((acc, city) => {
        acc[city] = (acc[city] || 0) + 1;
        return acc;
      }, {});
      
      const topCity = Object.keys(cityCount).reduce((a, b) => 
        cityCount[a] > cityCount[b] ? a : b
      );

      if (swedishCities[topCity]) {
        return swedishCities[topCity];
      }
    }

    // Default to Stockholm area
    return [59.3293, 18.0686];
  };

  const mapCenter = calculateMapCenter(listings);
  
  // Prepare listings with coordinates - try multiple data structures
  const listingsWithCoords = listings.map((listing) => {
    // Try to get coordinates from various possible locations
    let lat, lng;
    
    // Check location.latitude/longitude first (your data structure)
    if (listing.location?.latitude && listing.location?.longitude) {
      lat = listing.location.latitude;
      lng = listing.location.longitude;
    }
    // Check other possible coordinate structures
    else if (listing.coordinates?.lat && listing.coordinates?.lng) {
      lat = listing.coordinates.lat;
      lng = listing.coordinates.lng;
    } else if (listing.latitude && listing.longitude) {
      lat = listing.latitude;
      lng = listing.longitude;
    } else if (listing.lat && listing.lng) {
      lat = listing.lat;
      lng = listing.lng;
    }
    
    // If we have real coordinates, use them
    if (lat && lng && lat !== null && lng !== null) {
      return {
        ...listing,
        lat: lat,
        lng: lng
      };
    }
    
    // Get city from location.city (your data structure)
    const city = listing.location?.city || listing.city || listing.address?.city;
    
    if (city && swedishCities[city]) {
      const cityCoords = swedishCities[city];
      // Use stable offset based on listing ID
      const latOffset = ((listing.id ? listing.id.charCodeAt(0) : 0) % 7 - 3) * 0.002;
      const lngOffset = ((listing.id ? listing.id.charCodeAt(1) : 0) % 5 - 2) * 0.002;
      
      return {
        ...listing,
        lat: cityCoords[0] + latOffset,
        lng: cityCoords[1] + lngOffset
      };
    }
    
    // If no valid location found, don't include on map
    return null;
  }).filter(Boolean);

  // Calculate appropriate zoom level
  const calculateZoom = (listings) => {
    if (listings.length <= 1) return 13;
    
    const lats = listings.map(l => l.lat);
    const lngs = listings.map(l => l.lng);
    const latRange = Math.max(...lats) - Math.min(...lats);
    const lngRange = Math.max(...lngs) - Math.min(...lngs);
    const maxRange = Math.max(latRange, lngRange);
    
    if (maxRange > 5) return 6;
    if (maxRange > 2) return 8;
    if (maxRange > 0.5) return 10;
    if (maxRange > 0.1) return 12;
    return 14;
  };

  const zoomLevel = calculateZoom(listingsWithCoords);

  // Show debug info if no valid listings
  if (listingsWithCoords.length === 0) {
    const sampleCities = Object.keys(swedishCities).slice(0, 10).join(', ');
    return (
      <div className="relative w-full h-96 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No locations to display</h3>
          <p className="text-sm text-gray-500 mb-4">
            Found {listings.length} listings but none have valid location data.
          </p>
          <div className="text-xs text-gray-400 text-left bg-gray-50 p-3 rounded">
            <strong>Looking for:</strong><br/>
            • Coordinates: location.latitude/longitude<br/>
            • Cities: location.city<br/>
            <br/>
            <strong>Supported cities include:</strong><br/>
            {sampleCities}... and {Object.keys(swedishCities).length - 10} more
          </div>
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
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {listingsWithCoords.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.lat, listing.lng]}
            icon={createCustomIcon(listing)}
            eventHandlers={{
              mouseover: () => onListingHover?.(listing),
              mouseout: () => onListingHover?.(null),
              click: () => onListingClick?.(listing),
            }}
          >
            <Popup>
              <div className="w-64 p-2">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    {listing.images && listing.images[0] ? (
                      <img 
                        src={listing.images[0]} 
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                        <Leaf className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                      {listing.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                      {listing.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        listing.listing_type === 'for_sale' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {listing.listing_type === 'for_sale' ? 'For Sale' : 'Looking For'}
                      </span>
                      
                      {listing.price && (
                        <div className="text-right">
                          <p className="font-bold text-sm text-green-600">${listing.price}</p>
                          <p className="text-xs text-gray-500">{listing.price_unit?.replace('per_', '')}</p>
                        </div>
                      )}
                    </div>
                    
                    {listing.organic && (
                      <div className="flex items-center gap-1 mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <Leaf className="w-2 h-2" />
                          Organic
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">
                        {listing.location?.city || listing.city || 'Location not specified'}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => onListingClick?.(listing)}
                      className="w-full py-1 bg-gradient-to-r from-orange-400 to-red-400 text-white font-semibold text-xs rounded-lg"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
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
        </div>
      </div>
      
      {/* Dynamic Map Info */}
      <div className="absolute top-4 left-4 bg-green-100 border border-green-300 rounded-lg p-2 text-xs text-green-800 max-w-xs z-10">
        <strong>Stockholm Map:</strong> Showing {listingsWithCoords.length} of {listings.length} listings in Farsta & area
      </div>
    </div>
  );
};Level = calculateZoom(listingsWithCoords);

  // Show debug info if no valid listings
  if (listingsWithCoords.length === 0) {
    return (
      <div className="relative w-full h-96 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No locations to display</h3>
          <p className="text-sm text-gray-500 mb-4">
            Found {listings.length} listings but none have valid location data.
          </p>
          <div className="text-xs text-gray-400 text-left bg-gray-50 p-3 rounded">
            <strong>Debug info:</strong><br/>
            Looking for coordinates in: coordinates.lat/lng, latitude/longitude, lat/lng<br/>
            Looking for cities in: location.city, city, address.city<br/>
            <br/>
            <strong>Your listings structure:</strong><br/>
            {listings.length > 0 && (
              <pre className="text-xs overflow-auto max-h-32">
                {JSON.stringify(listings[0], null, 2)}
              </pre>
            )}
          </div>
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
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {listingsWithCoords.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.lat, listing.lng]}
            icon={createCustomIcon(listing)}
            eventHandlers={{
              mouseover: () => onListingHover?.(listing),
              mouseout: () => onListingHover?.(null),
              click: () => onListingClick?.(listing),
            }}
          >
            <Popup>
              <div className="w-64 p-2">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    {listing.images && listing.images[0] ? (
                      <img 
                        src={listing.images[0]} 
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                        <Leaf className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                      {listing.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                      {listing.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        listing.listing_type === 'for_sale' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {listing.listing_type === 'for_sale' ? 'For Sale' : 'Looking For'}
                      </span>
                      
                      {listing.price && (
                        <div className="text-right">
                          <p className="font-bold text-sm text-green-600">${listing.price}</p>
                          <p className="text-xs text-gray-500">{listing.price_unit?.replace('per_', '')}</p>
                        </div>
                      )}
                    </div>
                    
                    {listing.organic && (
                      <div className="flex items-center gap-1 mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <Leaf className="w-2 h-2" />
                          Organic
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">
                        {listing.location?.city || listing.city || 'Location not specified'}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => onListingClick?.(listing)}
                      className="w-full py-1 bg-gradient-to-r from-orange-400 to-red-400 text-white font-semibold text-xs rounded-lg"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
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
        </div>
      </div>
      
      {/* Dynamic Map Info */}
      <div className="absolute top-4 left-4 bg-green-100 border border-green-300 rounded-lg p-2 text-xs text-green-800 max-w-xs z-10">
        <strong>Real Data:</strong> Showing {listingsWithCoords.length} of {listings.length} listings with location data
      </div>
    </div>
  );
 

const Marketplace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    listing_type: 'all',
    location: '',
    organic_only: false,
    price_range: 'all',
    sort_by: 'created_date'
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'map'
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [hoveredListing, setHoveredListing] = useState(null);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'tomatoes_peppers', label: 'Tomatoes & Peppers' },
    { value: 'herbs', label: 'Herbs' },
    { value: 'berries', label: 'Berries' },
    { value: 'root_vegetables', label: 'Root Vegetables' },
    { value: 'leafy_greens', label: 'Leafy Greens' },
    { value: 'citrus_fruits', label: 'Citrus Fruits' },
    { value: 'stone_fruits', label: 'Stone Fruits' },
    { value: 'tropical_fruits', label: 'Tropical Fruits' },
    { value: 'apples_pears', label: 'Apples & Pears' },
    { value: 'beans_peas', label: 'Beans & Peas' },
    { value: 'squash_pumpkins', label: 'Squash & Pumpkins' },
    { value: 'other', label: 'Other' }
  ];



  useEffect(() => {
    loadListings();
    if (user) {
      loadFavorites();
    }
  }, [user]);

  useEffect(() => {
    filterListings();
  }, [listings, filters]);

  const loadListings = async () => {
    try {
      setLoading(true);
      
      // Load real listings from database
      const data = await apiClient.getListings({
        skip: 0,
        limit: 100,
        ...filters
      });
      
      setListings(data || []);
    } catch (error) {
      console.error('Error loading listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const favoritesData = await apiClient.getFavorites();
      setFavorites(favoritesData.map(fav => fav.listing_id) || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const filterListings = () => {
    let filtered = [...listings];

    if (filters.search) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        listing.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(listing => listing.category === filters.category);
    }

    if (filters.listing_type !== 'all') {
      filtered = filtered.filter(listing => listing.listing_type === filters.listing_type);
    }

    if (filters.location) {
      filtered = filtered.filter(listing =>
        listing.location?.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
        listing.location?.state?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.organic_only) {
      filtered = filtered.filter(listing => listing.organic);
    }

    if (filters.price_range !== 'all' && filters.price_range) {
      filtered = filtered.filter(listing => {
        if (!listing.price) return filters.price_range === 'free';
        const price = listing.price;
        switch (filters.price_range) {
          case '0-5': return price <= 5;
          case '5-10': return price > 5 && price <= 10;
          case '10-20': return price > 10 && price <= 20;
          case '20+': return price > 20;
          default: return true;
        }
      });
    }

    // Apply sorting
    switch (filters.sort_by) {
      case 'price':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'view_count':
        filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        break;
      case 'created_date':
      default:
        filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
    }

    setFilteredListings(filtered);
  };

  const toggleFavorite = async (listingId) => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }

    try {
      const isFavorited = favorites.includes(listingId);
      if (isFavorited) {
        setFavorites(prev => prev.filter(id => id !== listingId));
        toast.success('Removed from favorites');
      } else {
        setFavorites(prev => [...prev, listingId]);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Reload listings with new filters
    loadListings();
  };

  const clearFilters = () => {
    const defaultFilters = {
      category: 'all',
      search: '',
      listing_type: 'all',
      location: '',
      organic_only: false,
      price_range: 'all',
      sort_by: 'created_date'
    };
    setFilters(defaultFilters);
  };

  const handleMapListingClick = (listing) => {
    // Navigate to listing detail - you can implement this with your routing
    window.location.href = `/listing/${listing.id}`;
  };

  const ListingCard = ({ listing, compact = false, highlighted = false }) => {
    const isFavorited = favorites.includes(listing.id);
    
    if (compact) {
      return (
        <div className={`clay-card p-3 bg-white/60 hover:scale-[1.01] transition-all duration-300 group ${
          highlighted ? 'ring-2 ring-orange-400 bg-orange-50/60' : ''
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0">
              {listing.images && listing.images[0] ? (
                <img 
                  src={listing.images[0]} 
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <Leaf className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1 sm:mb-2">
                <div className="flex-1">
                  <Link 
                    to={`/listing/${listing.id}`}
                    className="text-sm sm:text-base font-semibold text-gray-900 hover:text-orange-600 transition-colors line-clamp-1 group-hover:text-orange-600"
                  >
                    {listing.title}
                  </Link>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{listing.description}</p>
                </div>
                {listing.price && (
                  <div className="text-right ml-2">
                    <p className="font-bold text-sm sm:text-base text-green-600">${listing.price}</p>
                    <p className="text-xs text-gray-500">{listing.price_unit?.replace('per_', '')}</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    listing.listing_type === 'for_sale' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {listing.listing_type === 'for_sale' ? 'For Sale' : 'Looking For'}
                  </span>
                  {listing.organic && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      <Leaf className="w-2 h-2" />
                      Organic
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleFavorite(listing.id)}
                    className={`p-1 rounded-lg ${isFavorited ? 'text-red-500' : 'text-gray-400'}`}
                  >
                    <Heart className={`w-3 h-3 ${isFavorited ? 'fill-red-500' : ''}`} />
                  </button>
                  <Link 
                    to={`/listing/${listing.id}`}
                    className="px-2 py-1 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-lg text-xs font-medium"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <Link to={`/listing/${listing.id}`} className="block group">
        <div className={`clay-card bg-white/60 backdrop-blur-sm overflow-hidden hover:scale-[1.02] transition-all duration-300 h-full flex flex-col ${
          highlighted ? 'ring-2 ring-orange-400 bg-orange-50/60' : ''
        }`}>
          <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-100 relative overflow-hidden">
            {listing.images && listing.images[0] ? (
              <img 
                src={listing.images[0]} 
                alt={listing.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-200 rounded-full flex items-center justify-center">
                  <Leaf className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            )}
            
            <div className="absolute top-2 left-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow-md ${
                listing.listing_type === 'for_sale' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-blue-500 text-white'
              }`}>
                {listing.listing_type === 'for_sale' ? (
                  <>
                    <ShoppingBag className="w-2 h-2" />
                    For Sale
                  </>
                ) : (
                  <>
                    <Search className="w-2 h-2" />
                    Looking For
                  </>
                )}
              </span>
            </div>
            
            <div className="absolute top-2 right-2 flex gap-1">
              {listing.organic && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  <Leaf className="w-2 h-2" />
                  Organic
                </span>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleFavorite(listing.id);
                }}
                className={`p-1 rounded-lg backdrop-blur-sm ${
                  isFavorited ? 'text-red-500 bg-white/80' : 'text-gray-400 bg-white/60'
                }`}
              >
                <Heart className={`w-3 h-3 ${isFavorited ? 'fill-red-500' : ''}`} />
              </button>
            </div>
            
            <div className="absolute bottom-2 left-2 flex items-center gap-2">
              <div className="flex items-center gap-1 text-white text-xs bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                <Eye className="w-2 h-2" />
                <span>{listing.view_count || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="p-3 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                  {listing.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{listing.category?.replace('_', ' ')}</p>
              </div>
              {listing.price && (
                <div className="text-right ml-2">
                  <p className="font-bold text-base sm:text-lg text-green-600">${listing.price}</p>
                  <p className="text-xs text-gray-500">{listing.price_unit?.replace('per_', '')}</p>
                </div>
              )}
            </div>
            
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">{listing.description}</p>
            
            <div className="mt-auto">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {listing.owner?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-xs">{listing.owner?.full_name || 'Anonymous'}</p>
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-2 h-2 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-gray-500 text-xs">(4.0)</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">
                    {listing.location?.city && listing.location?.state 
                      ? `${listing.location.city}, ${listing.location.state}`
                      : 'Location not specified'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(listing.created_date), { addSuffix: true })}</span>
                </div>
              </div>
              
              <button className="w-full py-2 bg-gradient-to-r from-orange-400 to-red-400 text-white font-semibold flex items-center justify-center gap-2 text-xs rounded-lg">
                <MessageSquare className="w-3 h-3" />
                Contact Seller
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const FilterPanel = () => (
    <div className={`clay-card p-3 sm:p-4 bg-white/60 ${showFilters ? 'block' : 'hidden lg:block'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900">Filters</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={clearFilters}
            className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Clear All
          </button>
          <button
            onClick={() => setShowFilters(false)}
            className="p-1 rounded-lg lg:hidden text-gray-600 hover:bg-gray-100"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange({...filters, category: e.target.value})}
            className="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Type</label>
          <select
            value={filters.listing_type}
            onChange={(e) => handleFilterChange({...filters, listing_type: e.target.value})}
            className="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white"
          >
            <option value="all">All Types</option>
            <option value="for_sale">For Sale</option>
            <option value="looking_for">Looking For</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Price Range</label>
          <select
            value={filters.price_range}
            onChange={(e) => handleFilterChange({...filters, price_range: e.target.value})}
            className="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white"
          >
            <option value="all">Any Price</option>
            <option value="0-5">$0 - $5</option>
            <option value="5-10">$5 - $10</option>
            <option value="10-20">$10 - $20</option>
            <option value="20+">$20+</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Location</label>
          <div className="relative">
            <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
            <input
              type="text"
              placeholder="City or State"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              className="w-full text-xs p-2 pl-7 border border-gray-200 rounded-lg bg-white"
            />
          </div>
        </div>
        
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.organic_only}
              onChange={(e) => handleFilterChange({...filters, organic_only: e.target.checked})}
              className="w-3 h-3 rounded border-gray-300"
            />
            <Leaf className="w-3 h-3 text-green-500" />
            <span className="text-xs font-medium text-gray-700">Organic Only</span>
          </label>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-3 sm:p-6">
        <div className="clay-card p-6 text-center">
          <div className="w-6 h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading fresh produce...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6">
      {/* Header */}
      <div className="clay-card p-3 sm:p-4 mb-4 bg-gradient-to-br from-white/80 to-white/60">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold mb-1 text-gray-900">Fresh Marketplace</h1>
            <p className="text-xs sm:text-sm text-gray-600">Discover fresh produce from local farmers and gardeners</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 border border-gray-200 rounded-lg ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'bg-white hover:bg-gray-50'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 border border-gray-200 rounded-lg ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'bg-white hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 border border-gray-200 rounded-lg ${viewMode === 'map' ? 'bg-orange-100 text-orange-600' : 'bg-white hover:bg-gray-50'}`}
            >
              <Map className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search for fresh produce, herbs, vegetables..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full text-sm p-2.5 pl-10 border border-gray-200 rounded-lg bg-white"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={filters.sort_by}
              onChange={(e) => handleFilterChange({...filters, sort_by: e.target.value})}
              className="text-xs p-2 border border-gray-200 rounded-lg bg-white"
            >
              <option value="created_date">Most Recent</option>
              <option value="view_count">Most Popular</option>
              <option value="price">Price: Low to High</option>
            </select>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 border border-gray-200 rounded-lg bg-white flex items-center gap-1 lg:hidden text-xs"
            >
              <SlidersHorizontal className="w-3 h-3" />
              Filters
            </button>
            
            {/* Mobile View Mode Selector */}
            <div className="flex md:hidden items-center gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 border border-gray-200 rounded-lg ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'bg-white hover:bg-gray-50'}`}
              >
                <Grid className="w-3 h-3" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 border border-gray-200 rounded-lg ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'bg-white hover:bg-gray-50'}`}
              >
                <List className="w-3 h-3" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 border border-gray-200 rounded-lg ${viewMode === 'map' ? 'bg-orange-100 text-orange-600' : 'bg-white hover:bg-gray-50'}`}
              >
                <Map className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="clay-card p-2 sm:p-3 mb-4 bg-white/60">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-600">
            {filteredListings.length} listings found
            {filters.search && ` for "${filters.search}"`}
            {viewMode === 'map' && ' - hover over map markers to see details'}
          </p>
          
          <div className="flex items-center gap-2">
            {Object.values(filters).some(value => 
              value !== 'all' && value !== '' && value !== false && value !== 'created_date'
            ) && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                Filters Active
              </span>
            )}
          </div>
        </div>
      </div>

      {viewMode === 'map' ? (
        /* Map View Layout */
        <div className="grid lg:grid-cols-4 gap-4">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <FilterPanel />
            
            {/* Quick Stats */}
            <div className="clay-card p-3 mt-4 bg-gradient-to-br from-green-50 to-emerald-50 hidden lg:block">
              <h3 className="text-sm font-semibold mb-2 text-gray-900">Marketplace Stats</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Total Listings</span>
                  <span className="font-semibold text-xs">{listings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">For Sale</span>
                  <span className="font-semibold text-xs">{listings.filter(l => l.listing_type === 'for_sale').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Looking For</span>
                  <span className="font-semibold text-xs">{listings.filter(l => l.listing_type === 'looking_for').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Organic</span>
                  <span className="font-semibold text-xs text-green-600">{listings.filter(l => l.organic).length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map and List Split View */}
          <div className="lg:col-span-3 space-y-4">
            {/* Map */}
            <div className="clay-card p-4 bg-white/60">
              <MapView 
                listings={filteredListings}
                onListingHover={setHoveredListing}
                onListingClick={handleMapListingClick}
              />
            </div>
            
            {/* Listings List Below Map */}
            <div className="clay-card p-4 bg-white/60">
              <h3 className="text-sm font-semibold mb-3 text-gray-900">
                Listings ({filteredListings.length})
              </h3>
              {filteredListings.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredListings.map(listing => (
                    <ListingCard 
                      key={listing.id} 
                      listing={listing} 
                      compact={true}
                      highlighted={hoveredListing?.id === listing.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base font-semibold mb-2 text-gray-900">No listings found</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                  <button 
                    onClick={clearFilters}
                    className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Grid/List View Layout */
        <div className="grid lg:grid-cols-4 gap-4">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <FilterPanel />
            
            {/* Quick Stats */}
            <div className="clay-card p-3 mt-4 bg-gradient-to-br from-green-50 to-emerald-50 hidden lg:block">
              <h3 className="text-sm font-semibold mb-2 text-gray-900">Marketplace Stats</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Total Listings</span>
                  <span className="font-semibold text-xs">{listings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">For Sale</span>
                  <span className="font-semibold text-xs">{listings.filter(l => l.listing_type === 'for_sale').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Looking For</span>
                  <span className="font-semibold text-xs">{listings.filter(l => l.listing_type === 'looking_for').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Organic</span>
                  <span className="font-semibold text-xs text-green-600">{listings.filter(l => l.organic).length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Mobile Filter Overlay */}
            {showFilters && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden">
                <div className="absolute right-0 top-0 h-full w-80 max-w-full">
                  <FilterPanel />
                </div>
              </div>
            )}

            {/* Listings Grid/List */}
            {filteredListings.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4' : 'space-y-3'}>
                {filteredListings.map(listing => (
                  <ListingCard 
                    key={listing.id} 
                    listing={listing} 
                    compact={viewMode === 'list'}
                  />
                ))}
              </div>
            ) : (
              <div className="clay-card p-6 sm:p-8 text-center bg-white/40">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-semibold mb-2 text-gray-900">No listings found</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {filters.search || filters.category !== 'all' || filters.listing_type !== 'all'
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "Be the first to create a listing in this marketplace!"
                  }
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {(filters.search || filters.category !== 'all' || filters.listing_type !== 'all') && (
                    <button 
                      onClick={clearFilters}
                      className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Clear Filters
                    </button>
                  )}
                  {user && (
                    <Link 
                      to="/create-listing"
                      className="px-4 py-2 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-lg text-sm font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Create Listing
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;