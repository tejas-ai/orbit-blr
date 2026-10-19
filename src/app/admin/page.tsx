import React from "react";
import { cookies } from "next/headers";
import { isValidAdminPassword, COOKIE_NAME } from "@/lib/auth";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import { getAllEvents, getAllSuggestions, getAuditLogs, getMetrics } from "@/lib/db";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard — ORBIT BLR",
  description: "Master event verification and inventory dashboard for ORBIT BLR.",
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  const isAuthenticated = Boolean(session && isValidAdminPassword(session.value));

  if (!isAuthenticated) {
    return <AdminLoginForm />;
  }

  const events = getAllEvents({ includeUnpublished: true });
  const suggestions = getAllSuggestions();
  const auditLogs = getAuditLogs(50);
  const metrics = getMetrics();

  return (
    <AdminDashboardClient
      initialEvents={events}
      suggestions={suggestions}
      auditLogs={auditLogs}
      metrics={metrics}
    />
  );
}
