"use client";

import React from "react";
import { BenefitStatus, FoodStatus, RegistrationStatus } from "@/types/event";
import { CheckCircle2, AlertCircle, HelpCircle, XCircle, Gift, Award, Coffee, Clock } from "lucide-react";

export function RegistrationBadge({ status }: { status: RegistrationStatus }) {
  switch (status) {
    case "open":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          RSVP Open
        </span>
      );
    case "approval_required":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/15 text-amber-300 border border-amber-500/35">
          <Clock className="w-3 h-3 text-amber-300" />
          Approval Required
        </span>
      );
    case "waitlist":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-purple-500/20 text-purple-300 border border-purple-500/40">
          <AlertCircle className="w-3 h-3 text-purple-300" />
          Waitlist Active
        </span>
      );
    case "full":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-rose-500/15 text-rose-300 border border-rose-500/35">
          <XCircle className="w-3 h-3" />
          Capacity Full
        </span>
      );
    case "closed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60">
          Closed
        </span>
      );
    case "not_yet_open":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
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
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-orbit-pink/20 text-orbit-pink border border-orbit-pink/40 font-semibold shadow-[0_0_10px_rgba(255,45,141,0.2)]">
        <Gift className="w-3 h-3" />
        {compact ? "Swag" : "Confirmed Swag"}
      </span>
    );
  }
  if (status === "limited") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
        <Gift className="w-3 h-3" />
        {compact ? "Raffle Swag" : "Limited Swag"}
      </span>
    );
  }
  if (status === "not_provided") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900/60 text-slate-400 border border-slate-800/70">
        <XCircle className="w-3 h-3 opacity-60" />
        {compact ? "No Swag" : "No Swag"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900/40 text-slate-500 border border-slate-800/50">
      <HelpCircle className="w-3 h-3 opacity-60" />
      {compact ? "Unverified" : "Swag Unverified"}
    </span>
  );
}

export function CertificateBadge({ status, compact = false }: { status: BenefitStatus; compact?: boolean }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-orbit-signal/20 text-orbit-signal border border-orbit-signal/40 font-semibold shadow-[0_0_10px_rgba(0,229,255,0.2)]">
        <Award className="w-3 h-3" />
        {compact ? "Cert" : "Certificate Confirmed"}
      </span>
    );
  }
  if (status === "conditional") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/35">
        <Award className="w-3 h-3" />
        {compact ? "Cond. Cert" : "Conditional Cert"}
      </span>
    );
  }
  if (status === "not_provided") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900/60 text-slate-400 border border-slate-800/70">
        <XCircle className="w-3 h-3 opacity-60" />
        {compact ? "No Cert" : "No Certificate"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900/40 text-slate-500 border border-slate-800/50">
      <HelpCircle className="w-3 h-3 opacity-60" />
      {compact ? "Unverified" : "Cert Unverified"}
    </span>
  );
}

export function FoodBadge({ status, compact = false }: { status: FoodStatus; compact?: boolean }) {
  if (status === "complimentary_meals_confirmed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
        <Coffee className="w-3 h-3" />
        {compact ? "Free Meals" : "Complimentary Meals"}
      </span>
    );
  }
  if (status === "refreshments_confirmed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-orbit-sunset/20 text-orbit-sunset border border-orbit-sunset/40 font-semibold">
        <Coffee className="w-3 h-3" />
        {compact ? "Refreshments" : "Snacks & Refreshments"}
      </span>
    );
  }
  if (status === "paid") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900/60 text-slate-400 border border-slate-800/70">
        {compact ? "Paid Food" : "Paid Dining"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900/40 text-slate-500 border border-slate-800/50">
      {compact ? "Unverified" : "Food Unverified"}
    </span>
  );
}

export function FreeEntryPill() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-extrabold bg-gradient-to-r from-emerald-400 to-emerald-500 text-orbit-bg shadow-[0_0_15px_rgba(16,185,129,0.4)]">
      <CheckCircle2 className="w-3.5 h-3.5" />
      100% FREE ENTRY
    </span>
  );
}
