import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

// Fix for default icon issue with webpack/vite builders
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


export default function MapView({ listings }) {
  const listingsWithGeo = listings.filter(l => l.location?.latitude && l.location?.longitude);
  
  if (listingsWithGeo.length === 0) {
    return (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-green-100 dark:bg-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No listings with location data</h3>
            <p className="text-gray-600 dark:text-gray-300">We couldn't find any listings that have been geotagged to show on the map.</p>
        </div>
    );
  }

  const position = [39.8283, -98.5795]; // Center of the US
  const zoom = listingsWithGeo.length > 1 ? 4 : 6;

  return (
    <div className="h-[600px] w-full rounded-2xl overflow-hidden shadow-lg border border-green-100 dark:border-gray-700">
      <MapContainer center={position} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {listingsWithGeo.map(listing => (
          <Marker key={listing.id} position={[listing.location.latitude, listing.location.longitude]}>
            <Popup>
              <div className="w-48">
                {listing.images && listing.images[0] && (
                    <img src={listing.images[0]} alt={listing.title} className="w-full h-24 object-cover rounded-md mb-2" />
                )}
                <h4 className="font-bold text-base mb-1">{listing.title}</h4>
                {listing.price && <p className="text-sm text-green-600 font-semibold mb-2">${listing.price} {listing.price_unit?.replace('per_','')}</p>}
                <Link to={createPageUrl(`ListingDetails?id=${listing.id}`)}>
                    <Button size="sm" className="w-full">View Details</Button>
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}