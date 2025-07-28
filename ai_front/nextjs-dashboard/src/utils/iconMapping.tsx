import React from 'react';
import { 
  FiFileText, FiImage, FiMic, FiVideo, FiType, FiCode, 
  FiTrendingUp, FiEye, FiCamera, FiHeadphones, FiEdit3,
  FiSearch, FiShield, FiHeart, FiGrid, FiMapPin, FiClock,
  FiTag, FiUser, FiMessageSquare, FiGlobe, FiLock, FiZap,
  FiShuffle, FiCheckCircle, FiAlertTriangle, FiRefreshCw
} from "react-icons/fi";

// Icon mapping object
const iconMap = {
  FiFileText,
  FiImage,
  FiMic,
  FiVideo,
  FiType,
  FiCode,
  FiTrendingUp,
  FiEye,
  FiCamera,
  FiHeadphones,
  FiEdit3,
  FiSearch,
  FiShield,
  FiHeart,
  FiGrid,
  FiMapPin,
  FiClock,
  FiTag,
  FiUser,
  FiMessageSquare,
  FiGlobe,
  FiLock,
  FiZap,
  FiShuffle,
  FiCheckCircle,
  FiAlertTriangle,
  FiRefreshCw
};

export function getIcon(iconName: string, className?: string): React.ReactNode {
  const IconComponent = iconMap[iconName as keyof typeof iconMap];
  
  if (!IconComponent) {
    // Fallback to a default icon if the specified icon doesn't exist
    return <FiGrid className={className || "text-gray-500"} />;
  }
  
  return <IconComponent className={className} />;
}

export default iconMap;