"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  FiMenu, FiSearch, FiKey, FiGrid, FiBookOpen, FiTrendingUp, FiUser,
  FiZap, FiDatabase, FiShield, FiCode, FiMonitor, FiDollarSign, FiFileText, FiMessageSquare
} from "react-icons/fi";
import { AiOutlineRobot } from "react-icons/ai"; // AI Platform Logo Icon
import { useAuth } from "@/contexts/AuthContext";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  // Helper to show 'Coming Soon' for unimplemented features
  const handleComingSoon = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("🚀 This feature is coming soon! Stay tuned.");
  };

  return (
    <div className={`h-screen bg-white border-r p-3 transition-all duration-300 
      ${collapsed ? "w-16" : "w-56"} flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 
      ${collapsed ? "md:w-16" : "md:w-56"} 
      ${collapsed ? "max-md:w-0 max-md:p-0 max-md:border-r-0" : "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:w-64 max-md:shadow-lg"}`}>

      {/* Sidebar Toggle Button */}
      <button onClick={() => setCollapsed(!collapsed)} className="mb-3 flex items-center">
        <FiMenu className="text-gray-600 text-lg" />
      </button>

      {/* AI Platform Logo (Icon when Collapsed, Full Text when Expanded) */}
      <div className="flex justify-center items-center mb-6">
        <Link href="/" className="flex items-center space-x-2">
          {collapsed ? (
            <AiOutlineRobot className="text-2xl text-gray-700" /> // Show Icon when Collapsed
          ) : (
            <span className="text-xl font-bold">AI Platform</span> // Full Text when Expanded
          )}
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Search..."
          className={`w-full pl-8 pr-2 py-1 border rounded-md bg-gray-50 text-xs ${collapsed ? "hidden" : "block"}`}
        />
        <FiSearch className="absolute left-2 top-2 text-gray-400 text-sm" />
      </div>

      {/* Sidebar Items */}
      <nav className="space-y-3 text-xs">
        {/* Products Section */}
        <p className={`text-gray-500 font-semibold text-[10px] uppercase ${collapsed ? "hidden" : "block"}`}>Products</p>
        <Link href="/playground">
          <SidebarItem icon={<FiCode />} text="Code Playground" collapsed={collapsed} badge="New" />
        </Link>
        <Link href="/catalog">
          <SidebarItem icon={<FiGrid />} text="AI Tools Catalog" collapsed={collapsed} />
        </Link>
        <button onClick={handleComingSoon} className="w-full text-left">
          <SidebarItem icon={<FiTrendingUp />} text="Workflows" collapsed={collapsed} />
        </button>
        <button onClick={handleComingSoon} className="w-full text-left">
          <SidebarItem icon={<FiZap />} text="RAG Chatbot" collapsed={collapsed} />
        </button>
        <button onClick={handleComingSoon} className="w-full text-left">
          <SidebarItem icon={<FiDatabase />} text="Batch Processing" collapsed={collapsed} />
        </button>
        <button onClick={handleComingSoon} className="w-full text-left">
          <SidebarItem icon={<FiTrendingUp />} text="Finetuning" collapsed={collapsed} badge="Demo" />
        </button>
        <button onClick={handleComingSoon} className="w-full text-left">
          <SidebarItem icon={<FiShield />} text="Guardrails" collapsed={collapsed} badge="Demo" />
        </button>

        {/* Usage Section */}
        <p className={`text-gray-500 font-semibold text-[10px] uppercase mt-3 ${collapsed ? "hidden" : "block"}`}>Usage</p>
        <button onClick={handleComingSoon} className="w-full text-left">
          <SidebarItem icon={<FiMonitor />} text="Monitoring" collapsed={collapsed} />
        </button>
        <button onClick={handleComingSoon} className="w-full text-left">
          <SidebarItem icon={<FiKey />} text="API Keys" collapsed={collapsed} />
        </button>
        <button onClick={handleComingSoon} className="w-full text-left">
          <SidebarItem icon={<FiUser />} text="Account Management" collapsed={collapsed} />
        </button>
        <button onClick={handleComingSoon} className="w-full text-left">
          <SidebarItem icon={<FiFileText />} text="Billing" collapsed={collapsed} />
        </button>

        {/* Developers Section */}
        <p className={`text-gray-500 font-semibold text-[10px] uppercase mt-3 ${collapsed ? "hidden" : "block"}`}>Developers</p>
        <Link href="/docs">
          <SidebarItem icon={<FiBookOpen />} text="Documentation" collapsed={collapsed} />
        </Link>
        <Link href="/changelog">
          <SidebarItem icon={<FiCode />} text="Change Log" collapsed={collapsed} />
        </Link>
        <Link href="/tutorials">
          <SidebarItem icon={<FiFileText />} text="Tutorials" collapsed={collapsed} />
        </Link>
        <Link href="/discord">
          <SidebarItem icon={<FiDollarSign />} text="Discord" collapsed={collapsed} />
        </Link>

        {/* Admin Section */}
        <p className={`text-gray-500 font-semibold text-[10px] uppercase mt-3 ${collapsed ? "hidden" : "block"}`}>Admin</p>
        <Link href="/admin">
          <SidebarItem icon={<FiGrid />} text="Dashboard" collapsed={collapsed} />
        </Link>
        <Link href="/admin/customers">
          <SidebarItem icon={<FiUser />} text="Customers" collapsed={collapsed} />
        </Link>
        <Link href="/admin/support">
          <SidebarItem icon={<FiMessageSquare />} text="Support" collapsed={collapsed} />
        </Link>
        <Link href="/admin/analytics">
          <SidebarItem icon={<FiTrendingUp />} text="Analytics" collapsed={collapsed} />
        </Link>
      </nav>

      {/* Credits Section */}
      <div className="mt-6 p-2 border-t">
        <p className={`text-gray-500 text-[10px] ${collapsed ? "hidden" : "block"}`}>Credits left</p>
        <p className="text-md font-semibold">{user?.credits !== undefined ? `$${user.credits.toFixed(2)}` : "$0.00"}</p>
      </div>
    </div>
  );
}

// Sidebar Item Component
function SidebarItem({ icon, text, collapsed, badge }: { icon: React.ReactNode; text: string; collapsed: boolean; badge?: string }) {
  return (
    <div className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-gray-100 transition">
      <div className="flex items-center space-x-2">
        {icon}
        {!collapsed && <span className="text-gray-700">{text}</span>}
      </div>
      {badge && !collapsed && <span className="text-[10px] text-orange-500 font-semibold">{badge}</span>}
    </div>
  );
}
