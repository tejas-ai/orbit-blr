"use client";

import React from "react";
import { BenefitStatus, FoodStatus, RegistrationStatus } from "@/types/event";
import { CheckCircle2, AlertCircle, HelpCircle, XCircle, Gift, Award, Coffee, Clock } from "lucide-react";

export function RegistrationBadge({ status }: { status: RegistrationStatus }) {
  switch (status) {
    case "open":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          RSVP Open
        </span>
      );
    case "approval_required":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-700" />
          Approval Required
        </span>
      );
    case "waitlist":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-[#6A38EB] border border-purple-200">
          <AlertCircle className="w-3.5 h-3.5 text-[#6A38EB]" />
          Waitlist
        </span>
      );
    case "full":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
          <XCircle className="w-3.5 h-3.5" />
          Capacity Full
        </span>
      );
    case "closed":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
          Closed
        </span>
      );
    case "not_yet_open":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
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
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
        <Gift className="w-3.5 h-3.5 text-amber-600" />
        <span>{compact ? "Swag" : "Confirmed Swag"}</span>
      </span>
    );
  }
  if (status === "limited") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50/70 text-amber-700 border border-amber-200/80">
        <Gift className="w-3.5 h-3.5 text-amber-600" />
        <span>{compact ? "Raffle Swag" : "Limited / Raffle Swag"}</span>
      </span>
    );
  }
  if (status === "not_provided") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
        <XCircle className="w-3.5 h-3.5 opacity-60" />
        <span>No Swag</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-200">
      <HelpCircle className="w-3.5 h-3.5 opacity-60" />
      <span>{compact ? "Unverified" : "Swag Unverified"}</span>
    </span>
  );
}

export function CertificateBadge({ status, compact = false }: { status: BenefitStatus; compact?: boolean }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
        <Award className="w-3.5 h-3.5 text-blue-600" />
        <span>{compact ? "Cert" : "Certificate Confirmed"}</span>
      </span>
    );
  }
  if (status === "conditional") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
        <Award className="w-3.5 h-3.5 text-purple-600" />
        <span>{compact ? "Cond. Cert" : "Conditional Certificate"}</span>
      </span>
    );
  }
  if (status === "not_provided") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
        <XCircle className="w-3.5 h-3.5 opacity-60" />
        <span>No Certificate</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-200">
      <HelpCircle className="w-3.5 h-3.5 opacity-60" />
      <span>{compact ? "Unverified" : "Cert Unverified"}</span>
    </span>
  );
}

export function FoodBadge({ status, compact = false }: { status: FoodStatus; compact?: boolean }) {
  if (status === "complimentary_meals_confirmed") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <Coffee className="w-3.5 h-3.5 text-emerald-600" />
        <span>{compact ? "Meals" : "Complimentary Meals"}</span>
      </span>
    );
  }
  if (status === "refreshments_confirmed") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50/80 text-emerald-700 border border-emerald-200/80">
        <Coffee className="w-3.5 h-3.5 text-emerald-600" />
        <span>{compact ? "Refreshments" : "Snacks & Refreshments"}</span>
      </span>
    );
  }
  if (status === "paid") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
        <span>Paid Food</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-200">
      <span>{compact ? "Unverified" : "Food Unverified"}</span>
    </span>
  );
}

export function FreeEntryPill() {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      <span>₹0 Free Entry</span>
    </span>
  );
}
