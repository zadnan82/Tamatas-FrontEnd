export const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'apples_pears', label: 'Apples & Pears' },
  { value: 'citrus_fruits', label: 'Citrus Fruits (Oranges, Lemons, Limes)' },
  { value: 'berries', label: 'Berries (Strawberries, Blueberries, Raspberries)' },
  { value: 'stone_fruits', label: 'Stone Fruits (Peaches, Plums, Cherries)' },
  { value: 'tropical_fruits', label: 'Tropical Fruits (Bananas, Mangoes, Pineapples)' },
  { value: 'leafy_greens', label: 'Leafy Greens (Lettuce, Spinach, Kale)' },
  { value: 'root_vegetables', label: 'Root Vegetables (Carrots, Potatoes, Onions)' },
  { value: 'tomatoes_peppers', label: 'Tomatoes & Peppers' },
  { value: 'beans_peas', label: 'Beans & Peas' },
  { value: 'squash_pumpkins', label: 'Squash & Pumpkins' },
  { value: 'herbs', label: 'Herbs (Basil, Mint, Parsley)' },
  { value: 'other', label: 'Other' }
];

export const PRICE_UNITS = [
  { value: 'per_lb', label: 'per pound' },
  { value: 'per_kg', label: 'per kilogram' },
  { value: 'per_piece', label: 'per piece' },
  { value: 'per_dozen', label: 'per dozen' },
  { value: 'per_bag', label: 'per bag' }
];

export const TRADE_PREFERENCES = [
  { value: 'both', label: 'Sell or Trade' },
  { value: 'sale_only', label: 'Sell for Money Only' },
  { value: 'trade_only', label: 'Trade for Goods Only' }
];

export const FORUM_CATEGORIES = [
  { value: 'gardening_tips', label: 'Gardening Tips' },
  { value: 'trading_ideas', label: 'Trading Ideas' },
  { value: 'general_discussion', label: 'General Discussion' },
  { value: 'site_feedback', label: 'Site Feedback' }
];

export const getCategoryLabel = (value) => {
  const category = CATEGORIES.find(cat => cat.value === value);
  return category ? category.label : value;
};

export const formatPrice = (price, unit) => {
  if (!price) return 'Price on request';
  return `$${price} ${unit?.replace('per_', '') || ''}`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};