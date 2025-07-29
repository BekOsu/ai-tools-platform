"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { FiUser, FiSettings, FiLogOut, FiBell, FiChevronDown } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from 'next-auth/react';

export default function TopNav() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
      {/* Left - Search or breadcrumbs could go here */}
      <div className="flex items-center space-x-4">
        {isAuthenticated && (
          <div className="text-sm text-gray-600">
            Welcome back, <span className="font-medium text-gray-900">{session?.user?.name || user?.name}</span>
          </div>
        )}
      </div>

      {/* Right - Navigation & User Menu */}
      <div className="flex items-center space-x-4">
        {/* Navigation Links */}
        <Link href="/catalog" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">
          AI Tools
        </Link>
        <Link href="/docs" className="text-gray-700 hover:text-gray-900 transition-colors">
          Docs
        </Link>
        <Link href="/api-reference" className="text-gray-500 hover:text-gray-700 transition-colors">
          API reference
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <FiBell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {(session?.user?.name || user?.name || 'U')[0].toUpperCase()}
                </div>
                <FiChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{session?.user?.name || user?.name}</p>
                    <p className="text-xs text-gray-500">{session?.user?.email || user?.email}</p>
                  </div>
                  
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiUser className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiUser className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  
                  <Link
                    href="/settings"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiSettings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      handleLogout();
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
