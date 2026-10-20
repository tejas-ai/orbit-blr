"use client";

import React from "react";
import { BenefitStatus, FoodStatus, RegistrationStatus } from "@/types/event";
import { CheckCircle2, AlertCircle, HelpCircle, XCircle, Gift, Award, Coffee, Clock } from "lucide-react";

export function RegistrationBadge({ status }: { status: RegistrationStatus }) {
  switch (status) {
    case "open":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
          RSVP Open
        </span>
      );
    case "approval_required":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
          <Clock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
          Approval Required
        </span>
      );
    case "waitlist":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-[#6A38EB] dark:text-[#A78BFA] border border-purple-200 dark:border-purple-800/40">
          <AlertCircle className="w-3.5 h-3.5 text-[#6A38EB] dark:text-[#A78BFA]" />
          Waitlist
        </span>
      );
    case "full":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
          <XCircle className="w-3.5 h-3.5" />
          Capacity Full
        </span>
      );
    case "closed":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#151522] text-slate-700 dark:text-[#CBD5E1] border border-slate-200 dark:border-[#302B43]">
          Closed
        </span>
      );
    case "not_yet_open":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
          Opening Soon
        </span>
      );
    default:
      return null;
  }
}

export function GoodiesBadge({ status, compact = false }: { status: BenefitStatus; compact?: boolean }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
        <Gift className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        <span>{compact ? "Swag" : "Confirmed Swag"}</span>
      </span>
    );
  }
  if (status === "limited") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/30">
        <Gift className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        <span>{compact ? "Raffle Swag" : "Limited / Raffle Swag"}</span>
      </span>
    );
  }
  if (status === "not_provided") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-[#151522] text-slate-600 dark:text-[#CBD5E1] border border-slate-200 dark:border-[#302B43]">
        <XCircle className="w-3.5 h-3.5 opacity-60" />
        <span>No Swag</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 dark:bg-[#151522] text-slate-500 dark:text-[#CBD5E1] border border-slate-200 dark:border-[#302B43]">
      <HelpCircle className="w-3.5 h-3.5 opacity-60" />
      <span>{compact ? "Unverified" : "Swag Unverified"}</span>
    </span>
  );
}

export function CertificateBadge({ status, compact = false }: { status: BenefitStatus; compact?: boolean }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
        <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span>{compact ? "Cert" : "Certificate Confirmed"}</span>
      </span>
    );
  }
  if (status === "conditional") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
        <Award className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
        <span>{compact ? "Cond. Cert" : "Conditional Certificate"}</span>
      </span>
    );
  }
  if (status === "not_provided") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-[#151522] text-slate-600 dark:text-[#CBD5E1] border border-slate-200 dark:border-[#302B43]">
        <XCircle className="w-3.5 h-3.5 opacity-60" />
        <span>No Certificate</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 dark:bg-[#151522] text-slate-500 dark:text-[#CBD5E1] border border-slate-200 dark:border-[#302B43]">
      <HelpCircle className="w-3.5 h-3.5 opacity-60" />
      <span>{compact ? "Unverified" : "Cert Unverified"}</span>
    </span>
  );
}

export function FoodBadge({ status, compact = false }: { status: FoodStatus; compact?: boolean }) {
  if (status === "complimentary_meals_confirmed") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
        <Coffee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>{compact ? "Meals" : "Complimentary Meals"}</span>
      </span>
    );
  }
  if (status === "refreshments_confirmed") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/30">
        <Coffee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>{compact ? "Refreshments" : "Snacks & Refreshments"}</span>
      </span>
    );
  }
  if (status === "paid") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-[#151522] text-slate-600 dark:text-[#CBD5E1] border border-slate-200 dark:border-[#302B43]">
        <span>Paid Food</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 dark:bg-[#151522] text-slate-500 dark:text-[#CBD5E1] border border-slate-200 dark:border-[#302B43]">
      <span>{compact ? "Unverified" : "Food Unverified"}</span>
    </span>
  );
}

export function FreeEntryPill() {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      <span>₹0 Free Entry</span>
    </span>
  );
}
