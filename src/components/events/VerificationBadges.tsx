"use client";

import React from "react";
import { BenefitStatus, FoodStatus, RegistrationStatus } from "@/types/event";
import { CheckCircle2, AlertCircle, HelpCircle, XCircle, Gift, Award, Coffee, Clock } from "lucide-react";

export function RegistrationBadge({ status }: { status: RegistrationStatus }) {
  switch (status) {
    case "open":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Registration Open
        </span>
      );
    case "approval_required":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-orbit-highlight/15 text-orbit-highlight border border-orbit-highlight/30">
          <Clock className="w-3 h-3" />
          Approval Required
        </span>
      );
    case "waitlist":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <AlertCircle className="w-3 h-3" />
          Waitlist Active
        </span>
      );
    case "full":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <XCircle className="w-3 h-3" />
          Capacity Full
        </span>
      );
    case "closed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-slate-500/15 text-slate-400 border border-slate-500/30">
          Registration Closed
        </span>
      );
    case "not_yet_open":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
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
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-orbit-signal/15 text-orbit-signal border border-orbit-signal/30 font-medium">
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
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800/60 text-slate-400 border border-slate-700/50">
        <XCircle className="w-3 h-3 opacity-60" />
        {compact ? "No Swag" : "No Swag"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800/40 text-slate-500 border border-slate-700/30">
      <HelpCircle className="w-3 h-3 opacity-60" />
      {compact ? "Unverified" : "Swag Unverified"}
    </span>
  );
}

export function CertificateBadge({ status, compact = false }: { status: BenefitStatus; compact?: boolean }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-orbit-secondary/20 text-orbit-secondary border border-orbit-secondary/35 font-medium">
        <Award className="w-3 h-3" />
        {compact ? "Cert" : "Certificate Confirmed"}
      </span>
    );
  }
  if (status === "conditional") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
        <Award className="w-3 h-3" />
        {compact ? "Cond. Cert" : "Conditional Cert"}
      </span>
    );
  }
  if (status === "not_provided") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800/60 text-slate-400 border border-slate-700/50">
        <XCircle className="w-3 h-3 opacity-60" />
        {compact ? "No Cert" : "No Certificate"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800/40 text-slate-500 border border-slate-700/30">
      <HelpCircle className="w-3 h-3 opacity-60" />
      {compact ? "Unverified" : "Cert Unverified"}
    </span>
  );
}

export function FoodBadge({ status, compact = false }: { status: FoodStatus; compact?: boolean }) {
  if (status === "complimentary_meals_confirmed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
        <Coffee className="w-3 h-3" />
        {compact ? "Free Meals" : "Complimentary Meals"}
      </span>
    );
  }
  if (status === "refreshments_confirmed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-teal-500/15 text-teal-300 border border-teal-500/30">
        <Coffee className="w-3 h-3" />
        {compact ? "Refreshments" : "Snacks & Refreshments"}
      </span>
    );
  }
  if (status === "paid") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800/60 text-slate-400 border border-slate-700/50">
        {compact ? "Paid Food" : "Paid Dining"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800/40 text-slate-500 border border-slate-700/30">
      {compact ? "Unverified" : "Food Unverified"}
    </span>
  );
}

export function FreeEntryPill() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-orbit-signal text-orbit-bg shadow-sm">
      <CheckCircle2 className="w-3.5 h-3.5" />
      100% FREE ENTRY
    </span>
  );
}
