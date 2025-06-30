
import React, { useState, useEffect } from "react";
import { Listing, User } from "@/entities/all";
import FilterAccordion from "../Components/marketplace/FilterAccordion";
import ListingCard from "../Components/marketplace/ListingCard";
import MapView from "../Components/marketplace/MapView";
import { Button } from "@/components/ui/button"; // Import Button
import { List, Map } from "lucide-react"; // Import icons
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [filters, setFilters] = useState({
    selectedCategory: "all",
    searchTerm: "",
    listingType: "all",
    organicOnly: false,
    priceRange: "all",
    location: "",
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [listings, filters]);

  const loadListings = async () => {
    try {
      const data = await Listing.filter({ status: 'active' }, '-created_date');
      setListings(data);
    } catch (error) {
      console.error("Error loading listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...listings];
    const { selectedCategory, searchTerm, listingType, organicOnly, priceRange, location } = filters;

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(listing => listing.category === selectedCategory);
    }

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Listing type filter
    if (listingType !== "all") {
      filtered = filtered.filter(listing => listing.listing_type === listingType);
    }

    // Organic filter
    if (organicOnly) {
      filtered = filtered.filter(listing => listing.organic === true);
    }

    // Price range filter
    if (priceRange !== "all") {
        const [minStr, maxStr] = priceRange.split('-');
        const min = parseFloat(minStr);
        const max = maxStr ? parseFloat(maxStr) : Infinity;
        filtered = filtered.filter(listing => {
            if (typeof listing.price !== 'number') return false;
            return listing.price >= min && listing.price <= max;
        });
    }

    // Location filter
    if (location) {
        const searchLocation = location.toLowerCase();
        filtered = filtered.filter(listing =>
            (listing.location?.city?.toLowerCase().includes(searchLocation) ||
            listing.location?.state?.toLowerCase().includes(searchLocation))
        );
    }

    setFilteredListings(filtered);
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).reduce((count, [key, value]) => {
      if (key === 'organicOnly' && value === true) return count + 1;
      if (key !== 'organicOnly' && value !== "" && value !== "all") return count + 1;
      return count;
    }, 0);
  };

  const clearAllFilters = () => {
    setFilters({
      selectedCategory: "all",
      searchTerm: "",
      listingType: "all",
      organicOnly: false,
      priceRange: "all",
      location: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-black dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fresh Marketplace</h1>
          <p className="text-gray-600">Discover fresh produce from local farmers and gardeners</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6">
            <FilterAccordion
              filters={filters}
              onFilterChange={setFilters}
              activeFiltersCount={getActiveFiltersCount()}
              onClearFilters={clearAllFilters}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* View Toggle */}
            <div className="flex justify-between items-center mb-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100 flex-grow">
                    <div className="flex items-center justify-between">
                        <p className="text-gray-600">
                        {loading ? "Loading..." : `${filteredListings.length} listings found`}
                        </p>
                        {getActiveFiltersCount() > 0 && (
                        <p className="text-sm text-green-600">
                            {getActiveFiltersCount()} filter{getActiveFiltersCount() > 1 ? 's' : ''} applied
                        </p>
                        )}
                    </div>
                </div>
                <div className="inline-flex items-center rounded-lg bg-white p-1 shadow-sm border ml-4">
                    <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')}>
                        <List className="w-4 h-4 mr-2" />
                        List
                    </Button>
                    <Button variant={viewMode === 'map' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('map')}>
                        <Map className="w-4 h-4 mr-2" />
                        Map
                    </Button>
                </div>
            </div>


            {/* Listings Grid or Map */}
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse border border-green-100 dark:border-gray-700">
                    <div className="aspect-video bg-gray-200 rounded-xl mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : viewMode === 'list' ? (
                filteredListings.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredListings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-green-100">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🥬</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your filters or search terms to find what you're looking for.
                    </p>
                    {getActiveFiltersCount() > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                )
            ) : (
              <MapView listings={filteredListings} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
