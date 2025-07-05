import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Leaf, X } from "lucide-react";
import { CATEGORIES } from "@/components/config/categories";

export default function FilterAccordion({ filters, onFilterChange, activeFiltersCount, onClearFilters }) {
  const handleValueChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };
  
  const handleOrganicToggle = () => {
    onFilterChange({ ...filters, organicOnly: !filters.organicOnly });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-green-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Search & Filters</h3>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="w-4 h-4 mr-1" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>

      <Accordion type="multiple" defaultValue={['search', 'category']} className="w-full">
        <AccordionItem value="search">
          <AccordionTrigger>Search</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search for products..."
                value={filters.searchTerm}
                onChange={(e) => handleValueChange('searchTerm', e.target.value)}
                className="pl-10 rounded-xl border-green-200 dark:bg-gray-700 dark:border-gray-600 focus:border-green-500"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="City, State"
                value={filters.location}
                onChange={(e) => handleValueChange('location', e.target.value)}
                className="pl-10 rounded-xl border-green-200 dark:bg-gray-700 dark:border-gray-600 focus:border-green-500"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="category">
          <AccordionTrigger>Category</AccordionTrigger>
          <AccordionContent className="pt-2">
            <Select value={filters.selectedCategory} onValueChange={(value) => handleValueChange('selectedCategory', value)}>
              <SelectTrigger className="rounded-xl border-green-200 dark:bg-gray-700 dark:border-gray-600">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="type_price">
            <AccordionTrigger>Type & Price</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
                <div>
                    <label className="text-sm font-medium mb-2 block">Listing Type</label>
                    <Select value={filters.listingType} onValueChange={(value) => handleValueChange('listingType', value)}>
                        <SelectTrigger className="rounded-xl border-green-200 dark:bg-gray-700 dark:border-gray-600">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="for_sale">For Sale</SelectItem>
                            <SelectItem value="looking_for">Looking For</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-sm font-medium mb-2 block">Price Range</label>
                    <Select value={filters.priceRange} onValueChange={(value) => handleValueChange('priceRange', value)}>
                        <SelectTrigger className="rounded-xl border-green-200 dark:bg-gray-700 dark:border-gray-600">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Any Price</SelectItem>
                            <SelectItem value="0-5">$0 - $5</SelectItem>
                            <SelectItem value="5-10">$5 - $10</SelectItem>
                            <SelectItem value="10-20">$10 - $20</SelectItem>
                            <SelectItem value="20">$20+</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </AccordionContent>
        </AccordionItem>

        <AccordionItem value="special">
          <AccordionTrigger>Special Options</AccordionTrigger>
          <AccordionContent className="pt-2">
            <Button
              variant={filters.organicOnly ? "default" : "outline"}
              onClick={handleOrganicToggle}
              className="w-full rounded-xl"
            >
              <Leaf className="w-4 h-4 mr-2" />
              Organic Only
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}