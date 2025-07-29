"use client";
import { useState } from "react";
import Link from "next/link";
import {
  FiMic,
  FiFileText,
  FiImage,
  FiType,
  FiVideo,
  FiStar,
  FiUsers,
  FiTrendingUp,
  FiPlay,
  FiHeart,
  FiCode,
} from "react-icons/fi";
import { edenAITools } from "@/data/edenAITools";
import { getIcon } from "@/utils/iconMapping";

interface AIFeature {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  rating: number;
  users: string;
  trending: boolean;
  featured: boolean;
  comingSoon?: boolean;
}

export const aiFeatures: AIFeature[] = [
  // ====== CODE TOOLS ======
  { 
    id: "code-playground",
    title: "AI Code Playground", 
    description: "Generate, edit, and test code with Claude AI in a powerful online IDE with multi-language support.", 
    category: "Code", 
    icon: <FiCode className="text-green-500" />,
    rating: 4.9,
    users: "25K+",
    trending: true,
    featured: true
  },
  { 
    id: "code-reviewer",
    title: "AI Code Reviewer", 
    description: "Get intelligent code reviews, bug detection, and optimization suggestions from AI.", 
    category: "Code", 
    icon: <FiCode className="text-blue-500" />,
    rating: 4.7,
    users: "12K+",
    trending: true,
    featured: false,
    comingSoon: true
  },
  { 
    id: "api-generator",
    title: "API Generator", 
    description: "Generate REST APIs, database schemas, and documentation automatically.", 
    category: "Code", 
    icon: <FiCode className="text-purple-500" />,
    rating: 4.6,
    users: "8K+",
    trending: false,
    featured: false,
    comingSoon: true
  },

  // ====== TRADING TOOLS ======
  { 
    id: "trading-assistant",
    title: "AI Trading Assistant", 
    description: "Get real-time market analysis, trading signals, and portfolio optimization with AI.", 
    category: "Trading", 
    icon: <FiTrendingUp className="text-green-500" />,
    rating: 4.5,
    users: "18K+",
    trending: true,
    featured: true,
    comingSoon: true
  },
  { 
    id: "risk-analyzer",
    title: "Portfolio Risk Analyzer", 
    description: "Analyze portfolio risk, diversification, and get AI-powered investment recommendations.", 
    category: "Trading", 
    icon: <FiTrendingUp className="text-red-500" />,
    rating: 4.3,
    users: "9K+",
    trending: false,
    featured: false,
    comingSoon: true
  },

  // ====== TEXT TOOLS ======
  { 
    id: "resume-booster",
    title: "AI Resume Builder", 
    description: "Create ATS-optimized resumes with AI suggestions and professional templates.", 
    category: "Text", 
    icon: <FiFileText className="text-purple-500" />,
    rating: 4.8,
    users: "35K+",
    trending: true,
    featured: true,
    comingSoon: true
  },
  { 
    id: "content-writer",
    title: "AI Content Writer", 
    description: "Generate blog posts, articles, social media content, and marketing copy with AI.", 
    category: "Text", 
    icon: <FiType className="text-blue-500" />,
    rating: 4.7,
    users: "28K+",
    trending: true,
    featured: true,
    comingSoon: true
  },
  { 
    id: "text-analyzer",
    title: "Text Analysis Suite", 
    description: "Sentiment analysis, entity recognition, summarization, and language detection.", 
    category: "Text", 
    icon: <FiType className="text-indigo-500" />,
    rating: 4.6,
    users: "15K+",
    trending: false,
    featured: false,
    comingSoon: true
  },
  { 
    id: "translator",
    title: "AI Language Translator", 
    description: "Translate text between 100+ languages with context-aware AI translation.", 
    category: "Text", 
    icon: <FiType className="text-green-500" />,
    rating: 4.5,
    users: "22K+",
    trending: false,
    featured: false,
    comingSoon: true
  },

  // ====== IMAGE TOOLS ======
  { 
    id: "image-enhancer",
    title: "AI Image Enhancer", 
    description: "Upscale, enhance, and restore images using advanced AI algorithms.", 
    category: "Image", 
    icon: <FiImage className="text-pink-500" />,
    rating: 4.6,
    users: "20K+",
    trending: true,
    featured: true,
    comingSoon: true
  },
  { 
    id: "object-detector",
    title: "Object Detection AI", 
    description: "Detect and classify objects, faces, and scenes in images with high accuracy.", 
    category: "Image", 
    icon: <FiImage className="text-blue-500" />,
    rating: 4.4,
    users: "12K+",
    trending: false,
    featured: false,
    comingSoon: true
  },
  { 
    id: "background-remover",
    title: "AI Background Remover", 
    description: "Remove backgrounds from images instantly with AI-powered precision.", 
    category: "Image", 
    icon: <FiImage className="text-purple-500" />,
    rating: 4.7,
    users: "30K+",
    trending: true,
    featured: true,
    comingSoon: true
  },

  // ====== AUDIO TOOLS ======
  { 
    id: "voice-synthesis",
    title: "AI Voice Generator", 
    description: "Generate natural-sounding speech from text with customizable voices.", 
    category: "Audio", 
    icon: <FiMic className="text-orange-500" />,
    rating: 4.5,
    users: "16K+",
    trending: true,
    featured: false,
    comingSoon: true
  },
  { 
    id: "audio-transcriber",
    title: "Audio Transcription", 
    description: "Convert speech to text with high accuracy and speaker identification.", 
    category: "Audio", 
    icon: <FiMic className="text-blue-500" />,
    rating: 4.6,
    users: "14K+",
    trending: false,
    featured: false,
    comingSoon: true
  },

  // ====== VIDEO TOOLS ======
  { 
    id: "video-generator",
    title: "AI Video Creator", 
    description: "Generate videos from text, images, and audio with AI-powered editing.", 
    category: "Video", 
    icon: <FiVideo className="text-purple-600" />,
    rating: 4.4,
    users: "8K+",
    trending: true,
    featured: true,
    comingSoon: true
  },
  { 
    id: "video-editor",
    title: "Smart Video Editor", 
    description: "Edit videos automatically with AI: cut scenes, add transitions, and effects.", 
    category: "Video", 
    icon: <FiVideo className="text-red-500" />,
    rating: 4.3,
    users: "6K+",
    trending: false,
    featured: false,
    comingSoon: true
  },

  // ====== DOCUMENT TOOLS ======
  { 
    id: "pdf-analyzer",
    title: "PDF Document Analyzer", 
    description: "Extract, analyze, and summarize content from PDF documents using AI.", 
    category: "Document", 
    icon: <FiFileText className="text-red-500" />,
    rating: 4.5,
    users: "11K+",
    trending: false,
    featured: false,
    comingSoon: true
  },
  { 
    id: "study-helper",
    title: "AI Study Assistant", 
    description: "Get homework help, explanations, and study guides powered by AI.", 
    category: "Document", 
    icon: <FiFileText className="text-blue-500" />,
    rating: 4.8,
    users: "32K+",
    trending: true,
    featured: true,
    comingSoon: true
  },
  { 
    id: "document-generator",
    title: "Document Generator", 
    description: "Generate contracts, reports, and business documents from templates.", 
    category: "Document", 
    icon: <FiFileText className="text-green-500" />,
    rating: 4.4,
    users: "9K+",
    trending: false,
    featured: false,
    comingSoon: true
  },
  // ====== BUSINESS & ANALYTICS TOOLS ======
  {
    id: "customer-support-chatbot",
    title: "AI Customer Support Chatbot",
    description: "24/7 AI-powered chatbot for customer service, FAQs, and lead qualification.",
    category: "Text",
    icon: <FiMic className="text-green-500" />,
    rating: 4.9,
    users: "40K+",
    trending: true,
    featured: true,
    comingSoon: true
  },
  {
    id: "ai-data-analyst",
    title: "AI Data Analyst",
    description: "Upload CSV/Excel, ask questions in natural language, and get instant charts and insights.",
    category: "Document",
    icon: <FiFileText className="text-blue-500" />,
    rating: 4.8,
    users: "22K+",
    trending: true,
    featured: true,
    comingSoon: true
  },
  {
    id: "seo-blog-generator",
    title: "SEO Blog/Article Generator",
    description: "Generate SEO-optimized blog posts and articles tailored for your business or niche.",
    category: "Text",
    icon: <FiType className="text-green-600" />,
    rating: 4.7,
    users: "30K+",
    trending: true,
    featured: true,
    comingSoon: true
  },
];

type FilterCategory = "all" | "audio" | "document" | "image" | "text" | "video" | "code" | "trading";
type SortBy = "popular" | "rating" | "recent" | "name";

interface AIFeaturesProps {
  search?: string;
  activeFilter?: FilterCategory;
  viewMode?: "grid" | "list";
  sortBy?: SortBy;
  useEdenAIData?: boolean;
}

export default function AIFeatures({ 
  search = "", 
  activeFilter = "all", 
  viewMode = "grid", 
  sortBy = "popular",
  useEdenAIData = false
}: AIFeaturesProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Convert EdenAI tools to AIFeature format if needed
  const convertEdenAIToFeatures = (tools: typeof edenAITools): AIFeature[] => {
    return tools.map(tool => ({
      id: tool.id,
      title: tool.name,
      description: tool.description,
      category: tool.category === "Audio" ? "audio" :
                 tool.category === "Document" ? "document" :
                 tool.category === "Image" ? "image" :
                 tool.category === "Text" ? "text" :
                 tool.category === "Video" ? "video" :
                 tool.subcategory === "Code" ? "code" : "text",
      icon: getIcon(tool.icon, tool.iconColor),
      rating: tool.accuracy / 20, // Convert 0-100 accuracy to 0-5 rating
      users: tool.isPopular ? "15K+" : tool.isNew ? "5K+" : "8K+",
      trending: tool.isPopular || false,
      featured: tool.isPopular || false,
      comingSoon: false
    }));
  };

  // Choose data source based on prop
  const dataToUse = useEdenAIData ? convertEdenAIToFeatures(edenAITools) : aiFeatures;

  // Filter and sort AI Features
  const filteredFeatures = dataToUse
    .filter((feature) => {
      // Text search filter
      const matchesSearch = search === "" || 
        feature.title.toLowerCase().includes(search.toLowerCase()) ||
        feature.description.toLowerCase().includes(search.toLowerCase()) ||
        feature.category.toLowerCase().includes(search.toLowerCase());
      
      // Category filter
      const matchesCategory = activeFilter === "all" || 
        feature.category.toLowerCase() === activeFilter.toLowerCase();
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "name":
          return a.title.localeCompare(b.title);
        case "recent":
          // Simulate recent by featuring newer items first
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        case "popular":
        default:
          // Sort by users count (extract number from string)
          const aUsers = parseInt(a.users.replace(/[^0-9]/g, ''));
          const bUsers = parseInt(b.users.replace(/[^0-9]/g, ''));
          return bUsers - aUsers;
      }
    });

  const toggleFavorite = (featureId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(featureId)) {
      newFavorites.delete(featureId);
    } else {
      newFavorites.add(featureId);
    }
    setFavorites(newFavorites);
  };

  const handleFeatureClick = (feature: AIFeature) => {
    if (feature.comingSoon) {
      // Show a more elegant coming soon modal instead of alert
      const message = `🚀 ${feature.title} is coming soon!\n\n${feature.description}\n\nWe're working hard to bring you this amazing tool. Stay tuned for updates!`;
      alert(message);
    } else if (feature.id === "code-playground") {
      window.location.href = "/playground";
    } else if (useEdenAIData) {
      // For EdenAI tools, navigate to the catalog detail page
      window.location.href = `/catalog/${feature.id}`;
    } else {
      // For implemented features without a dedicated route, fallback to catalog page
      window.location.href = `/catalog/${feature.id}`;
    }
  };

  const FeatureCard = ({ feature, isListView = false }: { feature: AIFeature; isListView?: boolean }) => (
    <div 
      className={`bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer group ${
        feature.comingSoon ? "opacity-80" : ""
      } ${
        isListView ? "flex items-center p-6" : "flex flex-col p-6"
      }`}
      onClick={() => handleFeatureClick(feature)}
    >
      
      <div className={`${isListView ? "flex items-center space-x-4 flex-1" : ""}`}>
        {/* Icon and Title Section */}
        <div className={`${isListView ? "flex items-center space-x-4" : "mb-4"}`}>
          <div className={`${isListView ? "flex items-center space-x-4" : "flex items-start space-x-3"}`}>
            <div className={`${isListView ? "text-2xl" : "text-xl"} p-3 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors flex-shrink-0`}>
              {feature.icon}
            </div>
            <div className={`${isListView ? "" : "flex-1 min-w-0"}`}>
              {/* Title Row */}
              <div className="flex items-start justify-between mb-2">
                <h3 className={`font-medium text-gray-900 group-hover:text-blue-600 transition-colors ${
                  isListView ? "text-base" : "text-sm"
                } flex-1 pr-2`}>
                  {feature.title}
                </h3>
                {!isListView && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(feature.id);
                    }}
                    className={`p-1.5 rounded-full transition-all duration-200 hover:scale-110 flex-shrink-0 ${
                      favorites.has(feature.id) 
                        ? "text-red-500 hover:text-red-600 bg-red-50" 
                        : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                    }`}
                  >
                    <FiHeart className={`w-4 h-4 ${favorites.has(feature.id) ? "fill-current" : ""}`} />
                  </button>
                )}
              </div>
              
              {/* Badges Row */}
              <div className="flex flex-wrap gap-1 mb-2">
                {feature.trending && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                    Trending
                  </span>
                )}
                {feature.featured && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    Featured
                  </span>
                )}
                {feature.comingSoon && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                    Coming Soon
                  </span>
                )}
              </div>
              
              {isListView && (
                <p className="text-gray-600 text-sm">{feature.description}</p>
              )}
            </div>
          </div>
        </div>

        {!isListView && (
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">{feature.description}</p>
        )}

        {/* Stats and Category Section */}
        <div className={`${isListView ? "flex items-center space-x-4 ml-auto" : "flex items-center justify-between pt-4 border-t border-gray-100"}`}>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <FiStar className="w-3 h-3" />
              <span>{feature.rating}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiUsers className="w-3 h-3" />
              <span>{feature.users}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-md font-medium ${
              feature.category === "Code" ? "bg-gray-100 text-gray-700" :
              feature.category === "Trading" ? "bg-gray-100 text-gray-700" :
              feature.category === "Text" ? "bg-gray-100 text-gray-700" :
              feature.category === "Image" ? "bg-gray-100 text-gray-700" :
              feature.category === "Audio" ? "bg-gray-100 text-gray-700" :
              feature.category === "Video" ? "bg-gray-100 text-gray-700" :
              feature.category === "Document" ? "bg-gray-100 text-gray-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {feature.category}
            </span>
            
            {!isListView && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(feature.id);
                }}
                className={`p-1 rounded transition-colors ${
                  favorites.has(feature.id) 
                    ? "text-red-500 hover:text-red-600" 
                    : "text-gray-400 hover:text-red-500"
                }`}
              >
                <FiHeart className={`w-4 h-4 ${favorites.has(feature.id) ? "fill-current" : ""}`} />
              </button>
            )}
            
            {isListView && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(feature.id);
                }}
                className={`p-1 rounded transition-colors ${
                  favorites.has(feature.id) 
                    ? "text-red-500 hover:text-red-600" 
                    : "text-gray-400 hover:text-red-500"
                }`}
              >
                <FiHeart className={`w-4 h-4 ${favorites.has(feature.id) ? "fill-current" : ""}`} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (filteredFeatures.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Features Found</h3>
        <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Summary - GCP Style */}
      <div className="flex justify-between items-center bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div>
          <p className="text-sm font-medium text-gray-800">
            {filteredFeatures.length === 0 ? "No tools found" : 
             filteredFeatures.length === 1 ? "1 result" :
             `${filteredFeatures.length} results`}
          </p>
          <p className="text-xs text-gray-500">
            {search || activeFilter !== "all" ? 
              `Showing filtered results from ${aiFeatures.length} total tools` :
              `Showing all available AI tools`
            }
          </p>
        </div>
        
        {filteredFeatures.length > 0 && (
          <div className="text-xs text-gray-500">
            Sorted by {sortBy === "popular" ? "popularity" : sortBy === "rating" ? "rating" : sortBy === "recent" ? "recently added" : "name"}
          </div>
        )}
      </div>

      {/* Features Grid/List */}
      {filteredFeatures.length > 0 ? (
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "space-y-4"
        }>
          {filteredFeatures.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} isListView={viewMode === "list"} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-md border border-gray-300">
          <div className="text-gray-300 text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tools found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
            {search ? 
              `No tools match "${search}". Try different keywords or browse all categories.` :
              `No tools found in the ${activeFilter} category. Try selecting a different category.`
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {search && (
              <button 
                onClick={() => window.location.href = "/?search="}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Clear Search
              </button>
            )}
            <button 
              onClick={() => window.location.href = "/"}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Browse All Tools
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
