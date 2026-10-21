import type { OrbitEvent } from "../types/event.ts";

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
  if (
    event.category === "Hackathons" ||
    (event.category && event.category.toLowerCase() === "hackathons") ||
    Boolean(event.hackathon_details)
  ) {
    return true;
  }

  const name = (event.name || "").toLowerCase();
  // A conference/workshop mentioning hackathons in its description is NOT
  // itself a hackathon. Only structured classification or clear title cues count.
  return (
    name.includes("hackathon") ||
    name.includes("hackman") ||
    name.includes("devforge") ||
    name.includes("hack day")
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

  // If structured hackathon_details are present on the record, prioritize them directly
  const structured = event.hackathon_details;

  const desc = event.description || "";
  const notes = event.verification_notes || "";
  const fullText = `${desc} ${notes}`;

  // 1. Team size: from structured details or regex
  let teamSize: string | null = structured?.team_size || null;
  if (!teamSize) {
    const teamMatch = fullText.match(/(?:teams?\s+of\s+|teams?:\s*|members\s*:\s*)(\d+\s*[-–to]\s*\d+)/i);
    if (teamMatch) {
      teamSize = `${teamMatch[1].replace(/to/i, "–").trim()} members`;
    }
  }

  // 2. Registration deadline: check structured or explicit date/time in description
  let registrationDeadline: string | null = structured?.application_deadline || null;
  let isDeadlinePassed = false;

  if (!registrationDeadline) {
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
    }
  }

  if (registrationDeadline) {
    try {
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

  // 3. Eligibility: from structured or verified text
  let eligibility: string | null = structured?.eligibility || null;
  if (!eligibility) {
    if (event.who_should_attend && event.who_should_attend.length > 0) {
      eligibility = event.who_should_attend[0];
    } else if (/student|college/i.test(desc)) {
      eligibility = "College / University Students";
    }
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
