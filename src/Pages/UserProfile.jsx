
import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Listing, User, Favorite } from '@/entities/all';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Calendar, Leaf, DollarSign, MessageSquare, Heart, Star, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';
import { getCategoryLabel } from '@/components/config/categories';

export default function ListingDetailsPage() {
    const [listing, setListing] = useState(null);
    const [seller, setSeller] = useState(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [favoriteRecord, setFavoriteRecord] = useState(null);
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const navigate = useNavigate();
    const listingId = new URLSearchParams(location.search).get('id');

    useEffect(() => {
        if (!listingId) {
            setLoading(false);
            return;
        }
        const fetchData = async () => {
            try {
                // Increment view count first
                try {
                    const currentListing = await Listing.get(listingId);
                    const newViewCount = (currentListing.view_count || 0) + 1;
                    await Listing.update(listingId, { view_count: newViewCount });
                } catch (e) {
                    // Fail silently if view count update fails, main data is more important
                    console.warn("Could not update view count", e);
                }

                const [listingData, userData] = await Promise.all([
                    Listing.get(listingId),
                    User.me().catch(() => null) // Handle case where user is not logged in
                ]);
                setListing(listingData);
                setCurrentUser(userData);

                if (listingData.created_by) {
                    const sellerData = await User.filter({ email: listingData.created_by });
                    if (sellerData.length > 0) {
                        setSeller(sellerData[0]);
                    }
                }
                
                if (userData) {
                    const favs = await Favorite.filter({ listing_id: listingId, user_id: userData.id });
                    if (favs.length > 0) {
                        setIsFavorited(true);
                        setFavoriteRecord(favs[0]);
                    }
                }

            } catch (error) {
                console.error("Error fetching listing details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [listingId]);

    const handleToggleFavorite = async () => {
        if (!currentUser) return;
        try {
            if (isFavorited) {
                await Favorite.delete(favoriteRecord.id);
                setIsFavorited(false);
                setFavoriteRecord(null);
            } else {
                const newFav = await Favorite.create({ user_id: currentUser.id, listing_id: listing.id });
                setIsFavorited(true);
                setFavoriteRecord(newFav);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };
    
    if (loading) return <div className="p-6 text-center">Loading...</div>;
    if (!listing) return <div className="p-6 text-center">Listing not found.</div>;

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="max-w-5xl mx-auto">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to listings
                </Button>
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Side: Images */}
                    <div>
                        {listing.images && listing.images.length > 0 ? (
                            <Carousel className="w-full">
                                <CarouselContent>
                                    {listing.images.map((img, index) => (
                                        <CarouselItem key={index}>
                                            <div className="aspect-video relative">
                                                <img src={img} alt={`${listing.title} image ${index + 1}`} className="object-cover w-full h-full rounded-lg" />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                {listing.images.length > 1 && (
                                    <>
                                        <CarouselPrevious />
                                        <CarouselNext />
                                    </>
                                )}
                            </Carousel>
                        ) : (
                            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-500">No image available</span>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Details */}
                    <div>
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Badge className="mb-2">{getCategoryLabel(listing.category)}</Badge>
                                        <CardTitle className="text-3xl">{listing.title}</CardTitle>
                                    </div>
                                    {currentUser && (
                                        <Button variant="ghost" size="icon" onClick={handleToggleFavorite}>
                                            <Heart className={`w-6 h-6 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                                        </Button>
                                    )}
                                </div>
                                 <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                                    {listing.organic && <Badge variant="outline" className="text-green-600 border-green-200"><Leaf className="w-3 h-3 mr-1"/>Organic</Badge>}
                                    {listing.harvest_date && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Harvested on {format(new Date(listing.harvest_date), 'MMM d, yyyy')}</span>}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className="text-gray-600 dark:text-gray-300">{listing.description}</p>
                                
                                {listing.listing_type === 'for_sale' && listing.price && (
                                    <div className="bg-green-50 dark:bg-green-900/50 p-4 rounded-lg flex items-center justify-between">
                                        <span className="text-lg font-semibold text-green-700 dark:text-green-300">Price</span>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-green-600">${listing.price}</p>
                                            <p className="text-sm text-gray-500">{listing.price_unit?.replace(/_/g, ' ')}</p>
                                        </div>
                                    </div>
                                )}
                                
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Seller Information</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {seller ? (
                                            <div className="flex items-center justify-between">
                                                <Link to={createPageUrl(`UserProfile?id=${seller.id}`)} className="flex items-center gap-3 group">
                                                    <Avatar>
                                                        <AvatarImage src={seller.profile_image} />
                                                        <AvatarFallback>{seller.full_name?.[0] || 'U'}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold group-hover:text-green-600">{seller.full_name || 'User'}</p>
                                                        <p className="text-sm text-gray-500">{seller.location?.city}, {seller.location?.state}</p>
                                                    </div>
                                                </Link>
                                                <Button onClick={() => navigate(createPageUrl(`Messages?recipient=${listing.created_by}&listingId=${listing.id}`))}>
                                                    <MessageSquare className="w-4 h-4 mr-2" />
                                                    Contact Seller
                                                </Button>
                                            </div>
                                        ) : <p>Loading seller...</p>}
                                    </CardContent>
                                </Card>

                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
