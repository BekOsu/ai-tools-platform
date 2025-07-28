"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  FiSearch, FiFilter, FiGrid, FiList, FiStar, FiTrendingUp, 
  FiClock, FiDollarSign, FiChevronDown, FiTag, FiZap
} from "react-icons/fi";
import { edenAITools, categoryGroups, popularTools, newTools, EdenAITool } from "@/data/edenAITools";
import { getIcon } from "@/utils/iconMapping";

type FilterType = "all" | "free" | "paid" | "freemium";
type SortType = "popularity" | "name" | "accuracy" | "newest";
type ViewType = "grid" | "list";

export default function CatalogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [priceFilter, setPriceFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("popularity");
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort tools
  const filteredTools = useMemo(() => {
    let filtered = edenAITools;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tool => 
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.features.some(feature => feature.toLowerCase().includes(query)) ||
        tool.useCases.some(useCase => useCase.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }

    // Subcategory filter
    if (selectedSubcategory !== "all") {
      filtered = filtered.filter(tool => tool.subcategory === selectedSubcategory);
    }

    // Price filter
    if (priceFilter !== "all") {
      filtered = filtered.filter(tool => tool.pricing === priceFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "popularity":
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          return b.accuracy - a.accuracy;
        case "name":
          return a.name.localeCompare(b.name);
        case "accuracy":
          return b.accuracy - a.accuracy;
        case "newest":
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return 0;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedSubcategory, priceFilter, sortBy]);

  // Get subcategories for selected category
  const availableSubcategories = useMemo(() => {
    if (selectedCategory === "all") return [];
    return categoryGroups[selectedCategory as keyof typeof categoryGroups]?.subcategories || [];
  }, [selectedCategory]);

  const getPricingBadgeColor = (pricing: string) => {
    switch (pricing) {
      case "free": return "bg-green-100 text-green-800";
      case "paid": return "bg-blue-100 text-blue-800";
      case "freemium": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case "fast": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "slow": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const ToolCard = ({ tool }: { tool: EdenAITool }) => {
    if (viewType === "list") {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="p-3 bg-gray-50 rounded-lg">
                {getIcon(tool.icon, tool.iconColor)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{tool.name}</h3>
                  {tool.isPopular && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      <FiStar className="w-3 h-3 mr-1" />
                      Popular
                    </span>
                  )}
                  {tool.isNew && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FiZap className="w-3 h-3 mr-1" />
                      New
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{tool.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Accuracy: {tool.accuracy}%</span>
                  <span className={`capitalize ${getSpeedColor(tool.speed)}`}>
                    {tool.speed}
                  </span>
                  <span>{tool.provider}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2 ml-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPricingBadgeColor(tool.pricing)}`}>
                {tool.pricing}
              </span>
              <div className="flex space-x-2">
                <Link
                  href={`/catalog/${tool.id}`}
                  className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Details
                </Link>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                  Try Now
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            {getIcon(tool.icon, tool.iconColor)}
          </div>
          <div className="flex items-center space-x-2">
            {tool.isPopular && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                <FiStar className="w-3 h-3 mr-1" />
                Popular
              </span>
            )}
            {tool.isNew && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <FiZap className="w-3 h-3 mr-1" />
                New
              </span>
            )}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{tool.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Accuracy</span>
            <span className="font-medium">{tool.accuracy}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Speed</span>
            <span className={`font-medium capitalize ${getSpeedColor(tool.speed)}`}>
              {tool.speed}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Provider</span>
            <span className="font-medium text-xs">{tool.provider}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPricingBadgeColor(tool.pricing)}`}>
            {tool.pricing}
          </span>
          <div className="flex space-x-2">
            <Link
              href={`/catalog/${tool.id}`}
              className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              Details
            </Link>
            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
              Try Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Tools Catalog</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover 60+ powerful AI APIs for document processing, text analysis, 
              image recognition, audio transcription, and video analysis.
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{edenAITools.length}+</div>
              <div className="text-sm text-gray-600">AI Tools</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Object.keys(categoryGroups).length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{popularTools.length}</div>
              <div className="text-sm text-gray-600">Popular Tools</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{newTools.length}</div>
              <div className="text-sm text-gray-600">New Tools</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search AI tools, features, use cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiFilter className="w-5 h-5" />
              <span>Filters</span>
              <FiChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* View Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewType("grid")}
                className={`p-3 rounded-l-lg transition-colors ${
                  viewType === "grid" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewType("list")}
                className={`p-3 rounded-r-lg transition-colors ${
                  viewType === "list" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedSubcategory("all");
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {Object.entries(categoryGroups).map(([key, group]) => (
                      <option key={key} value={key}>{group.name}</option>
                    ))}
                  </select>
                </div>

                {/* Subcategory Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    disabled={selectedCategory === "all"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="all">All Subcategories</option>
                    {availableSubcategories.map((subcategory) => (
                      <option key={subcategory} value={subcategory}>{subcategory}</option>
                    ))}
                  </select>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pricing</label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value as FilterType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Pricing</option>
                    <option value="free">Free</option>
                    <option value="freemium">Freemium</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="name">Name</option>
                    <option value="accuracy">Accuracy</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {filteredTools.length} of {edenAITools.length} tools
          </p>
          {(searchQuery || selectedCategory !== "all" || priceFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedSubcategory("all");
                setPriceFilter("all");
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Tools Grid/List */}
        {filteredTools.length > 0 ? (
          <div className={`grid gap-6 ${
            viewType === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          }`}>
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FiSearch className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tools found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filter criteria to find what you&apos;re looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedSubcategory("all");
                setPriceFilter("all");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}