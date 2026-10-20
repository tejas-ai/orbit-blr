"use client";

import React, { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { X, Lock, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSignIn = async (provider: "google" | "github") => {
    try {
      setLoadingProvider(provider);
      await signIn(provider, { callbackUrl: window.location.href });
    } catch (err) {
      console.error(`Sign in error for ${provider}:`, err);
      setLoadingProvider(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#151022] border border-purple-100/90 dark:border-[#2D224C] shadow-2xl p-6 sm:p-8 space-y-6 transition-all duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-[#F7F5FF] hover:bg-slate-100 dark:hover:bg-[#1E1830] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Kicker */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-purple-50 dark:bg-[#251D3D] text-[#6A38EB] dark:text-[#A78BFA] border border-purple-200/80 dark:border-[#382C58]">
            <Sparkles className="w-3.5 h-3.5 text-[#6A38EB] dark:text-[#8B5CF6]" />
            <span>ORBIT BLR Community</span>
          </div>

          <h2
            id="signin-modal-title"
            className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-[#F7F5FF] tracking-tight font-serif pt-1"
          >
            Welcome to ORBIT BLR
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] font-medium leading-relaxed italic">
            Discover events. Save your favourites. Never miss a gathering.
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3 pt-2">
          {/* Google Button */}
          <button
            type="button"
            onClick={() => handleSignIn("google")}
            disabled={Boolean(loadingProvider)}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-[#1D1B2C] hover:bg-slate-50 dark:hover:bg-[#251D3D] border border-slate-200/90 dark:border-[#382C58] text-slate-800 dark:text-[#F7F5FF] text-xs sm:text-sm font-bold shadow-sm transition-all transform active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
          >
            {loadingProvider === "google" ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#6A38EB]" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* GitHub Button */}
          <button
            type="button"
            onClick={() => handleSignIn("github")}
            disabled={Boolean(loadingProvider)}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-[#24292F] hover:bg-[#1a1f24] dark:bg-[#1E1830] dark:hover:bg-[#2A1D3D] text-white text-xs sm:text-sm font-bold border border-transparent dark:border-[#382C58] shadow-sm transition-all transform active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
          >
            {loadingProvider === "github" ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"
                />
              </svg>
            )}
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* Security & Optional Notice */}
        <div className="pt-2 border-t border-slate-100 dark:border-[#2D224C] space-y-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8]">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Official OAuth 2.0 • No passwords requested</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
            Accounts are completely optional. Read our{" "}
            <Link
              href="/privacy"
              onClick={onClose}
              className="text-[#6A38EB] dark:text-[#A78BFA] hover:underline font-semibold"
            >
              Privacy Notice
            </Link>{" "}
            to learn about minimal data usage.
          </p>
        </div>
      </div>
    </div>
  );
}
