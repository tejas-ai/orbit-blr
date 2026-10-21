import { z } from "zod";
import { CATEGORIES, BENGALURU_AREAS } from "../types/event.ts";

/**
 * Standardize and sanitize URLs
 */
function cleanUrl(val: string): string {
  try {
    const parsed = new URL(val.trim());
    return parsed.toString();
  } catch {
    return val.trim();
  }
}

/**
 * Event Category Enum Schema with case-insensitive normalization
 */
export const EventCategorySchema = z
  .string()
  .transform((val) => {
    const trimmed = val.trim();
    // Normalize to exact casing from CATEGORIES
    const match = CATEGORIES.find(
      (c) => c.toLowerCase() === trimmed.toLowerCase()
    );
    if (match) return match;
    // Map common aliases
    const lower = trimmed.toLowerCase();
    if (lower.includes("hack")) return "Hackathons";
    if (lower.includes("ai") || lower.includes("ml")) return "AI & ML";
    if (lower.includes("cloud") || lower.includes("devops")) return "Cloud";
    if (lower.includes("sec")) return "Cybersecurity";
    if (lower.includes("data")) return "Data Science";
    if (lower.includes("robot")) return "Robotics";
    if (lower.includes("start")) return "Startup";
    if (lower.includes("meetup") || lower.includes("network")) return "Networking";
    if (lower.includes("workshop") || lower.includes("bootcamp")) return "Workshops";
    return "Developer";
  })
  .pipe(z.enum([
    "Hackathons",
    "AI & ML",
    "Cloud",
    "Cybersecurity",
    "Developer",
    "Data Science",
    "Robotics",
    "Quantum Computing",
    "Startup",
    "Networking",
    "Workshops"
  ]));

/**
 * Benefit Status Schema
 */
export const BenefitStatusSchema = z.enum([
  "confirmed",
  "limited",
  "conditional",
  "not_provided",
  "unverified",
]);

/**
 * Food Status Schema
 */
export const FoodStatusSchema = z.enum([
  "complimentary_meals_confirmed",
  "refreshments_confirmed",
  "paid",
  "unverified",
]);

/**
 * Registration Status Schema
 */
export const RegistrationStatusSchema = z.enum([
  "open",
  "approval_required",
  "waitlist",
  "full",
  "closed",
  "not_yet_open",
]);

/**
 * Structured Hackathon Details Schema
 */
export const HackathonDetailsSchema = z.object({
  team_size: z.string().max(100).optional().nullable(),
  application_deadline: z.string().optional().nullable(),
  eligibility: z.string().max(255).optional().nullable(),
  offline_bangalore_round: z.boolean().default(true),
  tracks: z.array(z.string()).default([]),
  prizes_details: z.string().max(500).optional().nullable(),
  required_equipment: z.string().max(255).optional().nullable(),
}).optional().nullable();

/**
 * Machine-Readable Event Submission Contract (Zod)
 * Validates external AI assistant and automated service payloads before ingestion.
 */
export const EventSubmissionSchema = z.object({
  name: z
    .string()
    .min(5, "Event title must be at least 5 characters")
    .max(200, "Event title cannot exceed 200 characters")
    .trim(),
  category: EventCategorySchema.default("Developer"),
  organizer: z
    .string()
    .min(2, "Organizer name must be at least 2 characters")
    .max(150, "Organizer name cannot exceed 150 characters")
    .trim(),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .trim(),
  start_at: z
    .string()
    .datetime({ message: "start_at must be a valid ISO 8601 timestamp" }),
  end_at: z
    .string()
    .datetime({ message: "end_at must be a valid ISO 8601 timestamp" }),
  timezone: z.string().default("Asia/Kolkata"),
  
  // Location
  venue: z.string().min(2, "Venue name is required").trim(),
  venue_type: z
    .enum([
      "Technology HQ / Campus",
      "Coworking Space",
      "University / Institute",
      "Conference Centre",
      "Hotel / Auditorium",
    ])
    .optional()
    .nullable(),
  area: z
    .string()
    .min(2, "Bengaluru area is required")
    .trim()
    .refine(
      (val) => {
        const lower = val.toLowerCase();
        return (
          lower.includes("bengaluru") ||
          lower.includes("bangalore") ||
          BENGALURU_AREAS.some((a) => lower.includes(a.toLowerCase())) ||
          ["koramangala", "hsr", "indiranagar", "whitefield", "electronic city", "bellandur", "marathahalli", "hebbal", "manyata", "mg road", "rajajinagar", "jayanagar", "jp nagar", "btm", "yelahanka"].some(k => lower.includes(k))
        );
      },
      { message: "Event area must be a recognized locality in Bengaluru / Bangalore" }
    ),
  address: z.string().max(500).optional().nullable(),
  landmark: z.string().max(255).optional().nullable(),
  metro_station: z.string().max(255).optional().nullable(),
  map_url: z.string().url("map_url must be a valid URL").optional().nullable(),
  is_in_person: z.boolean().default(true),

  // Strictly Free Admission
  is_free: z
    .literal(true, {
      message: "Only 100% free events (₹0 admission) qualify for publication on ORBIT BLR",
    })
    .default(true),

  // Registration
  registration_url: z
    .string()
    .url("registration_url must be a valid HTTPS URL")
    .transform(cleanUrl)
    .refine((url) => url.startsWith("https://"), {
      message: "registration_url must use secure HTTPS",
    }),
  registration_status: RegistrationStatusSchema.default("open"),
  approval_required: z.boolean().default(false),

  // Benefits
  goodies_status: BenefitStatusSchema.default("unverified"),
  goodies_details: z.string().max(500).optional().nullable(),
  certificate_status: BenefitStatusSchema.default("unverified"),
  certificate_format: z.enum(["digital", "physical", "none"]).optional().nullable(),
  certificate_requirements: z.string().max(500).optional().nullable(),
  food_status: FoodStatusSchema.default("unverified"),
  food_details: z.string().max(500).optional().nullable(),

  // Rich Details
  who_should_attend: z.array(z.string()).default([]),
  topics_covered: z.array(z.string()).default([]),
  prerequisites: z.string().max(500).optional().nullable(),
  agenda: z
    .array(
      z.object({
        time: z.string(),
        title: z.string(),
        speaker: z.string().optional(),
      })
    )
    .default([]),
  featured: z.boolean().default(false),

  // Hackathon Details
  hackathon_details: HackathonDetailsSchema,

  // Visuals
  thumbnail_url: z.string().url().optional().nullable(),
  thumbnail_source_url: z.string().url().optional().nullable(),
  thumbnail_alt: z.string().max(255).optional().nullable(),

  // Provenance & Verification Evidence
  source_urls: z
    .array(z.string().url())
    .min(1, "At least one authentic source URL is mandatory for evidence tracking"),
  verification_notes: z
    .string()
    .min(10, "verification_notes must detail the evidence gathered (min 10 chars)")
    .trim(),
  last_verified_at: z
    .string()
    .datetime()
    .default(() => new Date().toISOString()),
  publication_status: z
    .enum(["published", "pending_review"])
    .default("published"),

  // Client / Ingestion Metadata
  verified_by: z.string().default("automated-ingestion-engine"),
  forceVerifiedWithEvidence: z.boolean().default(false),
}).refine(
  (data) => new Date(data.end_at).getTime() >= new Date(data.start_at).getTime(),
  {
    message: "end_at must be equal to or later than start_at",
    path: ["end_at"],
  }
);

export type EventSubmissionInput = z.infer<typeof EventSubmissionSchema>;

/**
 * Batch Ingestion Request Schema
 */
export const BatchEventSubmissionSchema = z.object({
  events: z.array(EventSubmissionSchema).min(1, "Must submit at least 1 event").max(50, "Batch limit is 50 events"),
  skipLiveLinkCheck: z.boolean().default(false),
});

export type BatchEventSubmissionInput = z.infer<typeof BatchEventSubmissionSchema>;
