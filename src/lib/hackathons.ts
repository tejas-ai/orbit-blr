import { OrbitEvent } from "@/types/event";

export interface HackathonMetadata {
  isHackathon: boolean;
  teamSize?: string | null;
  registrationDeadline?: string | null;
  eligibility?: string | null;
  tracks?: string[];
  duration?: string | null;
}

/**
 * Reliably classifies whether an event is an in-person Hackathon
 * without needing to alter database schemas.
 */
export function isHackathonEvent(event: Partial<OrbitEvent>): boolean {
  if (!event) return false;
  if (event.category === "Hackathons") return true;

  const combinedText = [
    event.name || "",
    event.description || "",
    event.slug || "",
    ...(event.topics_covered || []),
  ].join(" ").toLowerCase();

  return /hackathon|hackman|devforge|hack2skill|build sprint|codefest|overnight hack/i.test(combinedText);
}

/**
 * Extracts structured hackathon metadata (deadline, team size, eligibility, duration)
 * from verified event details.
 */
export function extractHackathonDetails(event: OrbitEvent): HackathonMetadata {
  const isHack = isHackathonEvent(event);
  if (!isHack) {
    return { isHackathon: false };
  }

  const desc = event.description || "";
  const notes = event.verification_notes || "";
  const fullText = `${desc} ${notes}`;

  // Extract team size (e.g. "2-4 members", "Teams of 2–4")
  let teamSize: string | null = null;
  const teamMatch = fullText.match(/(?:team(?:s)?\s*(?:of)?\s*|members\s*:\s*)(\d+\s*[-–to]\s*\d+\s*(?:members)?|\d+\s*members)/i);
  if (teamMatch) {
    teamSize = teamMatch[1].replace(/members/i, "").trim() + " members";
  } else if (/solo\s*or\s*team/i.test(fullText)) {
    teamSize = "Solo or Team (up to 4)";
  }

  // Extract registration deadline
  let registrationDeadline: string | null = null;
  const deadlineMatch = fullText.match(/(?:applications?|registrations?|deadline|closes?)(?:\s*(?:on|by|at|before))?\s*([0-9]{1,2}\s+[A-Za-z]{3,9}(?:\s+[0-9]{4})?(?:[,\s]+[0-9]{1,2}:[0-9]{2}\s*(?:[AP]M)?(?:\s*IST)?)?)/i);
  if (deadlineMatch) {
    registrationDeadline = deadlineMatch[1].trim();
  }

  // Extract eligibility (e.g. students, open track)
  let eligibility: string | null = null;
  if (/student|college|university|undergrad/i.test(fullText)) {
    eligibility = "College & University Students";
  } else if (/open(?:\s*-|\s*)track|open to all|all developers/i.test(fullText)) {
    eligibility = "Open to all developers";
  } else if (event.who_should_attend && event.who_should_attend.length > 0) {
    eligibility = event.who_should_attend[0];
  }

  // Extract duration
  let duration: string | null = null;
  if (/24[- ]?hour/i.test(fullText)) {
    duration = "24-Hour Sprint";
  } else if (/36[- ]?hour/i.test(fullText)) {
    duration = "36-Hour Sprint";
  } else if (/overnight/i.test(fullText)) {
    duration = "Overnight Hackathon";
  } else if (event.start_at && event.end_at) {
    const diffHours = Math.round((new Date(event.end_at).getTime() - new Date(event.start_at).getTime()) / (1000 * 60 * 60));
    if (diffHours >= 20) {
      duration = `${diffHours} Hours`;
    }
  }

  return {
    isHackathon: true,
    teamSize,
    registrationDeadline,
    eligibility,
    tracks: event.topics_covered && event.topics_covered.length > 0 ? event.topics_covered : undefined,
    duration,
  };
}
