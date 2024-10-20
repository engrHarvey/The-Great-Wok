import React, { useState, useEffect } from 'react';

interface Category {
  category_id: number;
  category_name: string;
}

interface SearchAndFilterProps<T extends Record<string, unknown>> {
  items: T[];
  categories: Category[];
  onFilter: (filteredItems: T[]) => void; // Handler to pass the filtered items back
  searchField: keyof T; // Field in the item to search (e.g., 'dish_name')
}

const SearchAndFilter = <T extends { category_id?: number }>({
  items,
  categories,
  onFilter,
  searchField,
}: SearchAndFilterProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Effect to filter items when search term or category changes
  useEffect(() => {
    const filterItems = (search: string, categoryId: number | null) => {
      const filtered = items.filter((item) => {
        const value = item[searchField];

        // Ensure value is a valid string or number before calling toLowerCase()
        const matchesSearch =
          value != null && typeof value !== 'object' && String(value).toLowerCase().includes(search);

        // Handle category filtering safely using type narrowing
        const matchesCategory = categoryId ? item.category_id === categoryId : true;
        return matchesSearch && matchesCategory;
      });

      onFilter(filtered);
    };

    filterItems(searchTerm, selectedCategory);
  }, [searchTerm, selectedCategory, items, searchField, onFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className="p-4 bg-neutral rounded-xl shadow-lg">
      {/* Search Bar */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search for a dish..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full sm:max-w-md px-4 py-2 border border-dark rounded-full shadow-sm focus:outline-none focus:ring-4 focus:ring-primary focus:border-transparent transition duration-300 ease-in-out bg-white text-dark"
        />
      </div>

      {/* Category Buttons */}
      <div className="mb-6 flex justify-center flex-wrap space-x-2 gap-y-4 sm:space-x-3">
        {/* Show All Button */}
        <button
          className={`px-4 py-2 text-sm rounded-full shadow-md transition-colors duration-300 ease-in-out ${
            selectedCategory === null
              ? 'bg-primary text-white shadow-lg'
              : 'bg-background text-dark hover:bg-secondary hover:text-white'
          }`}
          onClick={() => handleCategorySelect(null)}
        >
          All
        </button>

        {/* Category Buttons */}
        {categories.map((category) => (
          <button
            key={category.category_id}
            className={`px-4 py-2 text-sm rounded-full shadow-md transition-colors duration-300 ease-in-out ${
              selectedCategory === category.category_id
                ? 'bg-primary text-white shadow-lg'
                : 'bg-background text-dark hover:bg-secondary hover:text-white'
            }`}
            onClick={() => handleCategorySelect(category.category_id)}
          >
            {category.category_name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchAndFilter;
