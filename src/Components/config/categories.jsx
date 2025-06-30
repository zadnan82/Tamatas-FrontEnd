export const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "apples_pears", label: "Apples & Pears" },
  { value: "citrus_fruits", label: "Citrus Fruits (Oranges, Lemons, Limes)" },
  { value: "berries", label: "Berries (Strawberries, Blueberries, Raspberries)" },
  { value: "stone_fruits", label: "Stone Fruits (Peaches, Plums, Cherries)" },
  { value: "tropical_fruits", label: "Tropical Fruits (Bananas, Mangoes, Pineapples)" },
  { value: "leafy_greens", label: "Leafy Greens (Lettuce, Spinach, Kale)" },
  { value: "root_vegetables", label: "Root Vegetables (Carrots, Potatoes, Onions)" },
  { value: "tomatoes_peppers", label: "Tomatoes & Peppers" },
  { value: "beans_peas", label: "Beans & Peas" },
  { value: "squash_pumpkins", label: "Squash & Pumpkins" },
  { value: "herbs", label: "Herbs (Basil, Mint, Parsley)" },
  { value: "other", label: "Other" }
];

export const getCategoryLabel = (value) => {
  const category = CATEGORIES.find(cat => cat.value === value);
  return category ? category.label : value;
};