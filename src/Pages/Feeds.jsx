import React, { useState, useEffect } from 'react';
import { Listing } from '@/entities/all';
import ListingCard from '@/components/marketplace/ListingCard';
import { Flame, Activity, Shuffle } from 'lucide-react';

export default function FeedsPage() {
    const [popularListings, setPopularListings] = useState([]);
    const [recentListings, setRecentListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeeds = async () => {
            setLoading(true);
            try {
                const [popular, recent] = await Promise.all([
                    Listing.list('-view_count', 9),
                    Listing.list('-created_date', 9)
                ]);
                setPopularListings(popular.filter(p => p.view_count > 0));
                setRecentListings(recent);
            } catch (error) {
                console.error("Failed to fetch feeds:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeeds();
    }, []);

    const Section = ({ title, icon, children, listings }) => (
        <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                {icon}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
            </div>
            {children}
            {listings && listings.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map(listing => <ListingCard key={listing.id} listing={listing} />)}
                </div>
            )}
             {listings && listings.length === 0 && !loading && (
                 <p className="text-gray-500">No listings to show in this category yet.</p>
             )}
        </section>
    );
    
    if (loading) {
        return (
            <div className="p-6">
                 {[...Array(2)].map((_, j) => (
                    <div key={j} className="mb-12">
                        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6 animate-pulse"></div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse border border-green-100 dark:border-gray-700">
                            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="p-6 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-black dark:to-gray-800">
            <div className="max-w-7xl mx-auto">
                <Section title="Popular Right Now" icon={<Flame className="w-7 h-7 text-orange-500" />} listings={popularListings}>
                    {popularListings.length === 0 && !loading && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-dashed">
                            <h3 className="font-semibold">Nothing is popular yet!</h3>
                            <p className="text-gray-500">Listings will appear here once they get some views.</p>
                        </div>
                    )}
                </Section>
                <Section title="Freshly Listed" icon={<Activity className="w-7 h-7 text-blue-500" />} listings={recentListings} />
            </div>
        </div>
    );
}