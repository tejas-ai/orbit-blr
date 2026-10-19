import React from "react";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { isValidAdminPassword, COOKIE_NAME } from "@/lib/auth";
import EventEditorForm from "@/components/admin/EventEditorForm";
import { getEventById } from "@/lib/db";

export const dynamic = "force-dynamic";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  const isAuthenticated = Boolean(session && isValidAdminPassword(session.value));

  if (!isAuthenticated) {
    redirect("/admin");
  }

  const { id } = await params;
  const event = getEventById(id);

  if (!event) {
    notFound();
  }

  return <EventEditorForm initialEvent={event} isNew={false} />;
}
