"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Sparkles, AlertTriangle, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";

function SignInContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const existingProvider = searchParams.get("provider");
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSignIn = async (provider: "google" | "github") => {
    try {
      setLoadingProvider(provider);
      await signIn(provider, { callbackUrl });
    } catch (err) {
      console.error(`Sign in error for ${provider}:`, err);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#151022] border border-purple-100/90 dark:border-[#2D224C] shadow-2xl p-6 sm:p-8 space-y-6 transition-all duration-300">
      {/* Brand Kicker */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-purple-50 dark:bg-[#251D3D] text-[#6A38EB] dark:text-[#A78BFA] border border-purple-200/80 dark:border-[#382C58]">
          <Sparkles className="w-3.5 h-3.5 text-[#6A38EB] dark:text-[#8B5CF6]" />
          <span>ORBIT BLR Community</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-[#F7F5FF] tracking-tight font-serif pt-1">
          Welcome to ORBIT BLR
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] font-medium leading-relaxed italic">
          Discover events. Save your favourites. Never miss a gathering.
        </p>
      </div>

      {/* Account Linking Security Warning */}
      {error === "OAuthAccountNotLinked" && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs sm:text-sm space-y-1.5"
        >
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Account Security Notice</span>
          </div>
          <p className="leading-relaxed">
            An account with this email address already exists using{" "}
            <strong className="capitalize">{existingProvider || "another provider"}</strong>.
            To protect your account from unauthorized takeover, please sign in using your original provider.
          </p>
        </div>
      )}

      {error && error !== "OAuthAccountNotLinked" && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-900 dark:text-red-200 text-xs sm:text-sm space-y-1"
        >
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>Authentication Failed</span>
          </div>
          <p>Please try signing in again or choose an alternative method.</p>
        </div>
      )}

      {/* OAuth Buttons */}
      <div className="space-y-3 pt-2">
        {/* Google Button */}
        <button
          type="button"
          onClick={() => handleSignIn("google")}
          disabled={Boolean(loadingProvider)}
          className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-[#1D1B2C] hover:bg-slate-50 dark:hover:bg-[#251D3D] border ${
            existingProvider === "google"
              ? "border-[#6A38EB] ring-2 ring-purple-500/30"
              : "border-slate-200/90 dark:border-[#382C58]"
          } text-slate-800 dark:text-[#F7F5FF] text-xs sm:text-sm font-bold shadow-sm transition-all transform active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]`}
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
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
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
          className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-[#1D1B2C] hover:bg-slate-50 dark:hover:bg-[#251D3D] border ${
            existingProvider === "github"
              ? "border-[#6A38EB] ring-2 ring-purple-500/30"
              : "border-slate-200/90 dark:border-[#382C58]"
          } text-slate-800 dark:text-[#F7F5FF] text-xs sm:text-sm font-bold shadow-sm transition-all transform active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]`}
        >
          {loadingProvider === "github" ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#6A38EB]" />
          ) : (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
              />
            </svg>
          )}
          <span>Continue with GitHub</span>
        </button>
      </div>

      {/* Back Link */}
      <div className="pt-2 text-center border-t border-slate-100 dark:border-[#2D224C]/60">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#6A38EB] dark:text-[#94A3B8] dark:hover:text-[#A78BFA] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Orbit Bengaluru</span>
        </Link>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#FFFFFF] dark:bg-[#0B0813] transition-colors">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#6A38EB]" />
          </div>
        }
      >
        <SignInContent />
      </Suspense>
    </div>
  );
}
