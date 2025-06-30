import React, { useState, useEffect } from 'react';
import { Favorite, Listing, User } from '@/entities/all';
import ListingCard from '@/components/marketplace/ListingCard';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
    const [favoriteListings, setFavoriteListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const user = await User.me();
                const favoriteRecords = await Favorite.filter({ user_id: user.id });
                const listingIds = favoriteRecords.map(fav => fav.listing_id);

                if (listingIds.length > 0) {
                    const listings = await Listing.filter({ id: { '$in': listingIds } });
                    setFavoriteListings(listings);
                }
            } catch (error) {
                console.error("Failed to fetch favorites:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, []);

    if (loading) return <div>Loading your favorites...</div>;

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorite Listings</h1>
                    <p className="text-gray-600">The items you've saved for later.</p>
                </div>

                {favoriteListings.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {favoriteListings.map(listing => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                         <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-12 h-12 text-red-500"/>
                        </div>
                        <h2 className="text-2xl font-semibold">No favorites yet</h2>
                        <p className="text-gray-500 mt-2">Browse the marketplace and click the heart icon to save items.</p>
                    </div>
                )}
            </div>
        </div>
    );
}