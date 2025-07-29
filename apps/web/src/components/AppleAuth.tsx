"use client";
import { useState } from "react";
import { FiLoader } from "react-icons/fi";
import { signIn } from 'next-auth/react';

interface AppleAuthProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  buttonText?: string;
  disabled?: boolean;
}

export default function AppleAuth({
  onSuccess,
  onError,
  buttonText = "Sign in with Apple",
  disabled = false,
}: AppleAuthProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('apple');
    } catch (error) {
      onError?.('Failed to sign in with Apple.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={disabled || isLoading}
      className="w-full flex items-center justify-center space-x-3 px-6 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
    >
      {isLoading ? (
        <FiLoader className="w-5 h-5 animate-spin text-gray-600" />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M16.365 1.43c0 1.14-.468 2.273-1.255 3.076-.804.819-2.1 1.44-3.233 1.344-.06-1.203.468-2.422 1.255-3.24.78-.9 2.16-1.56 3.233-1.18zM21.104 17.433c-.749 1.64-1.115 2.33-2.074 3.774-1.355 2.093-3.27 4.703-5.66 4.717-2.205.023-2.766-1.39-5.142-1.376-2.377.016-2.987 1.41-5.183 1.388-2.39-.015-4.308-2.428-5.664-4.52C.459 19.018-1.22 14.745.57 11.176c1.023-2.095 2.858-3.436 4.82-3.436 2.257 0 3.685 1.487 5.142 1.487 1.431 0 2.578-1.487 5.142-1.487 1.947 0 4.002 1.04 5.026 3.097-4.456 2.264-3.72 8.192-.596 11.596z"
            fill="currentColor"
          />
        </svg>
      )}
      <span className="text-gray-700 font-medium">
        {isLoading ? "Signing in..." : buttonText}
      </span>
    </button>
  );
}
