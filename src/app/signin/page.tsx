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

  const handleSignIn = async (provider: "github" = "github") => {
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
        {/* GitHub Button */}
        <button
          type="button"
          onClick={() => handleSignIn("github")}
          disabled={Boolean(loadingProvider)}
          className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-slate-950 dark:bg-[#6A38EB] hover:bg-slate-900 dark:hover:bg-[#5826D4] text-white text-sm sm:text-base font-bold shadow-lg shadow-purple-950/20 dark:shadow-purple-900/30 transition-all transform active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
        >
          {loadingProvider === "github" ? (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
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
    <div className="flex items-center justify-center px-4 py-8 sm:py-12 bg-[#FFFFFF] dark:bg-[#0B0813] transition-colors">
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
