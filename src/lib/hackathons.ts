import { OrbitEvent } from "@/types/event";

export interface HackathonMetadata {
  isHackathon: boolean;
  teamSize?: string | null;
  registrationDeadline?: string | null;
  isDeadlinePassed?: boolean;
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

  const name = (event.name || "").toLowerCase();
  const desc = (event.description || "").toLowerCase();

  return (
    name.includes("hackathon") ||
    name.includes("hackman") ||
    name.includes("devforge") ||
    desc.includes("hackathon") ||
    desc.includes("offline hackathon")
  );
}

/**
 * Extracts verified hackathon metadata (deadline, team size, eligibility, duration)
 * strictly from verified event facts. Never invents unsupported details.
 */
export function extractHackathonDetails(event: OrbitEvent): HackathonMetadata {
  const isHack = isHackathonEvent(event);
  if (!isHack) {
    return { isHackathon: false };
  }

  const desc = event.description || "";
  const notes = event.verification_notes || "";
  const fullText = `${desc} ${notes}`;

  // 1. Team size: only if explicitly stated in verified text (e.g. "Teams of 2–4")
  let teamSize: string | null = null;
  const teamMatch = fullText.match(/(?:teams?\s+of\s+|teams?:\s*|members\s*:\s*)(\d+\s*[-–to]\s*\d+)/i);
  if (teamMatch) {
    teamSize = `${teamMatch[1].replace(/to/i, "–").trim()} members`;
  }

  // 2. Registration deadline: check for explicit date/time in description
  let registrationDeadline: string | null = null;
  let isDeadlinePassed = false;

  let deadlineMatch = fullText.match(
    /(?:applications?\s+close|registration\s+deadline|closes?)\s*(?:on|at|:)?\s*([0-9]{1,2}\s+[A-Za-z]{3,9}(?:\s+[0-9]{4})?(?:\s+(?:at\s+)?[0-9]{1,2}:[0-9]{2}\s*(?:[AP]M)?(?:\s*IST)?)?)/i
  );
  if (!deadlineMatch) {
    deadlineMatch = fullText.match(
      /([0-9]{1,2}\s+[A-Za-z]{3,9}(?:\s+[0-9]{4})?(?:\s+(?:at\s+)?[0-9]{1,2}:[0-9]{2}\s*(?:[AP]M)?(?:\s*IST)?)?)\s+(?:registration\s+deadline|application\s+deadline)/i
    );
  }

  if (deadlineMatch && deadlineMatch[1]) {
    registrationDeadline = deadlineMatch[1].trim();
    try {
      // Clean string for standard Date parsing (strip 'at', map IST to +05:30)
      const cleaned = registrationDeadline
        .replace(/\bat\b/gi, "")
        .replace(/\bIST\b/gi, "+05:30")
        .replace(/\s+/g, " ")
        .trim();
      const parsedDate = new Date(cleaned);
      if (!isNaN(parsedDate.getTime()) && parsedDate.getTime() < Date.now()) {
        isDeadlinePassed = true;
      }
    } catch {
      // Fallback: rely on official status
    }
  }

  // 3. Eligibility: only if verified in text or who_should_attend
  let eligibility: string | null = null;
  if (event.who_should_attend && event.who_should_attend.length > 0) {
    eligibility = event.who_should_attend[0];
  } else if (/student|college/i.test(desc)) {
    eligibility = "College / University Students";
  }

  // 4. Duration: strictly from verified description or exact start/end hours
  let duration: string | null = null;
  if (/24[- ]?hour/i.test(desc)) {
    duration = "24-Hour Offline Sprint";
  } else if (/overnight/i.test(desc)) {
    duration = "Overnight Sprint";
  } else if (event.start_at && event.end_at) {
    const diffHours = Math.round(
      (new Date(event.end_at).getTime() - new Date(event.start_at).getTime()) / (1000 * 60 * 60)
    );
    if (diffHours >= 20) {
      duration = `${diffHours} Hours`;
    }
  }

  return {
    isHackathon: true,
    teamSize,
    registrationDeadline,
    isDeadlinePassed,
    eligibility,
    tracks: event.topics_covered && event.topics_covered.length > 0 ? event.topics_covered : undefined,
    duration,
  };
}
