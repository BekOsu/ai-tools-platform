"use client";
import { useState } from "react";
import { FiLoader } from "react-icons/fi";
import { signIn } from 'next-auth/react';

interface MicrosoftAuthProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  buttonText?: string;
  disabled?: boolean;
}

export default function MicrosoftAuth({
  onSuccess,
  onError,
  buttonText = "Sign in with Microsoft",
  disabled = false,
}: MicrosoftAuthProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('azure-ad');
    } catch (error) {
      onError?.('Failed to sign in with Microsoft.');
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
          <path fill="#F35325" d="M1 1h10v10H1z" />
          <path fill="#81BC06" d="M13 1h10v10H13z" />
          <path fill="#05A6F0" d="M1 13h10v10H1z" />
          <path fill="#FFBA08" d="M13 13h10v10H13z" />
        </svg>
      )}
      <span className="text-gray-700 font-medium">
        {isLoading ? "Signing in..." : buttonText}
      </span>
    </button>
  );
}
