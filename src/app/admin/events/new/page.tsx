import React, { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidAdminPassword, COOKIE_NAME } from "@/lib/auth";
import EventEditorForm from "@/components/admin/EventEditorForm";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  const isAuthenticated = Boolean(session && isValidAdminPassword(session.value));

  if (!isAuthenticated) {
    redirect("/admin");
  }

  return (
    <Suspense fallback={<div className="p-12 text-center text-orbit-muted font-mono">Loading form...</div>}>
      <EventEditorForm isNew />
    </Suspense>
  );
}
