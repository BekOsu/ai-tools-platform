"use client";
import AIFeatures, { aiFeatures } from "@/components/AIFeatures";
import { edenAITools } from "@/data/edenAITools";
import { useState } from "react";
import { 
  FiMic, FiFileText, FiImage, FiType, FiVideo, FiSearch, 
  FiCode, FiTrendingUp, FiStar, FiFilter,
  FiGrid, FiList, FiRefreshCw, FiUsers
} from "react-icons/fi";

type FilterCategory = "all" | "audio" | "document" | "image" | "text" | "video" | "code" | "trading";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"popular" | "rating" | "recent" | "name">("popular");

  // Dynamically calculate counts for each category using EdenAI tools
  const getCategoryCount = (category: FilterCategory) => {
    if (category === "all") return edenAITools.length;
    if (category === "audio") return edenAITools.filter(t => t.category === "Audio").length;
    if (category === "document") return edenAITools.filter(t => t.category === "Document").length;
    if (category === "image") return edenAITools.filter(t => t.category === "Image").length;
    if (category === "text") return edenAITools.filter(t => t.category === "Text").length;
    if (category === "video") return edenAITools.filter(t => t.category === "Video").length;
    if (category === "code") return edenAITools.filter(t => t.subcategory === "Code").length;
    if (category === "trading") return 0; // No trading tools in EdenAI data
    return 0;
  };

  const filterCategories = [
    { key: "all" as FilterCategory, label: "All Tools", icon: <FiGrid className="text-gray-500" />, count: getCategoryCount("all") },
    { key: "code" as FilterCategory, label: "Code", icon: <FiCode className="text-gray-500" />, count: getCategoryCount("code") },
    { key: "trading" as FilterCategory, label: "Trading", icon: <FiTrendingUp className="text-gray-500" />, count: getCategoryCount("trading") },
    { key: "audio" as FilterCategory, label: "Audio", icon: <FiMic className="text-gray-500" />, count: getCategoryCount("audio") },
    { key: "document" as FilterCategory, label: "Document", icon: <FiFileText className="text-gray-500" />, count: getCategoryCount("document") },
    { key: "image" as FilterCategory, label: "Image", icon: <FiImage className="text-gray-500" />, count: getCategoryCount("image") },
    { key: "text" as FilterCategory, label: "Text", icon: <FiType className="text-gray-500" />, count: getCategoryCount("text") },
    { key: "video" as FilterCategory, label: "Video", icon: <FiVideo className="text-gray-500" />, count: getCategoryCount("video") },
  ];

  const handleFilterClick = (category: FilterCategory) => {
    setActiveFilter(category);
  };

  const clearFilters = () => {
    setSearch("");
    setActiveFilter("all");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Exact GCP Vertex AI Style */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-normal text-gray-900 mb-4">
              AI Tools Platform
            </h1>
            <p className="text-gray-600 mb-8 max-w-4xl text-lg leading-relaxed">
              Discover powerful AI tools for code generation, trading analysis, content creation, and more.
            </p>
            <div className="flex items-center space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <FiStar className="text-gray-400 w-4 h-4" />
                <span className="text-gray-600">4.8/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiUsers className="text-gray-400 w-4 h-4" />
                <span className="text-gray-600">50K+ Users</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiGrid className="text-gray-400 w-4 h-4" />
                <span className="text-gray-600">{edenAITools.length}+ Tools</span>
              </div>
            </div>
          </div>

          {/* GCP Vertex AI Style Search Bar */}
          <div className="max-w-3xl">
            <div className="relative">
              <FiSearch className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search AI tools, features, or categories"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filter Tabs - GCP Style */}
        <div className="mb-10">
          <div className="flex flex-wrap gap-3 mb-8">
            {filterCategories.map((category) => (
              <button
                key={category.key}
                onClick={() => handleFilterClick(category.key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeFilter === category.key
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {category.icon}
                <span>{category.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeFilter === category.key
                    ? "bg-blue-200 text-blue-800"
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>

          {/* Controls - GCP Style */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center space-x-4">
              {(search || activeFilter !== "all") && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-6">
              {/* Sort Dropdown */}
              <div className="flex items-center space-x-3">
                <FiFilter className="w-4 h-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="recent">Recently Added</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors rounded-l-lg ${
                    viewMode === "grid" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-200"></div>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors rounded-r-lg ${
                    viewMode === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Features */}
        <AIFeatures 
          search={search} 
          activeFilter={activeFilter} 
          viewMode={viewMode} 
          sortBy={sortBy}
          useEdenAIData={true}
        />
      </div>
    </div>
  );    
}