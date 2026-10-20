export type EventCategory =
  | "AI & ML"
  | "Cloud"
  | "Cybersecurity"
  | "Developer"
  | "Data Science"
  | "Robotics"
  | "Quantum Computing"
  | "Startup"
  | "Networking"
  | "Workshops";

export type RegistrationStatus =
  | "open"
  | "approval_required"
  | "waitlist"
  | "full"
  | "closed"
  | "not_yet_open";

export type BenefitStatus =
  | "confirmed"
  | "limited"
  | "conditional"
  | "not_provided"
  | "unverified";

export type FoodStatus =
  | "complimentary_meals_confirmed"
  | "refreshments_confirmed"
  | "paid"
  | "unverified";

export type PublicationStatus =
  | "published"
  | "pending_review"
  | "archived"
  | "cancelled";

export type VenueType =
  | "Technology HQ / Campus"
  | "Coworking Space"
  | "University / Institute"
  | "Conference Centre"
  | "Hotel / Auditorium";

export interface EventAgendaItem {
  time: string;
  title: string;
  speaker?: string;
}

export interface OrbitEvent {
  id: string;
  slug: string;
  name: string;
  category: EventCategory;
  organizer: string;
  description: string;
  start_at: string; // ISO 8601 string
  end_at: string;   // ISO 8601 string
  timezone: string; // "Asia/Kolkata"
  venue: string;
  venue_type?: VenueType;
  area: string;     // Bengaluru area e.g. Koramangala, HSR Layout, Whitefield
  address: string | null;
  landmark?: string | null;
  metro_station?: string | null;
  map_url?: string | null;
  is_in_person: boolean;
  is_free: boolean;
  registration_url: string;
  registration_status: RegistrationStatus;
  approval_required: boolean;

  // Goodies / Swag
  goodies_status: BenefitStatus;
  goodies_details: string | null;

  // Certificates
  certificate_status: BenefitStatus;
  certificate_format: "digital" | "physical" | "none" | null;
  certificate_requirements: string | null;

  // Food / Refreshments
  food_status: FoodStatus;
  food_details: string | null;

  // Verification & Trust
  source_urls: string[];
  verification_notes?: string | null;
  last_verified_at: string | null;
  publication_status: PublicationStatus;

  // Authentic Event Thumbnail & Visual Identity
  thumbnail_url?: string | null;
  thumbnail_source_url?: string | null;
  thumbnail_alt?: string | null;
  thumbnail_verification_status?: "verified" | "fallback" | "unverified" | null;
  thumbnail_verified_at?: string | null;
  thumbnail_attribution?: string | null;

  // Rich Details
  who_should_attend?: string[];
  topics_covered?: string[];
  prerequisites?: string | null;
  agenda?: EventAgendaItem[];
  featured?: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventSuggestion {
  id: string;
  event_url: string;
  event_name?: string | null;
  organizer?: string | null;
  notes?: string | null;
  submitter_email?: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  event_id: string;
  action: "create" | "update" | "publish" | "unpublish" | "verify" | "import" | "status_change";
  details: string;
  actor: string;
  timestamp: string;
}

export interface EventFilters {
  search?: string;
  category?: EventCategory | "all";
  benefits?: "all" | "both_confirmed" | "certificates_confirmed" | "goodies_confirmed" | "complimentary_food";
  dateFilter?: "all" | "today" | "tomorrow" | "weekend" | "next_7_days" | "this_month" | "custom";
  customDate?: string;
  registrationStatus?: RegistrationStatus | "all";
  area?: string | "all";
  venueType?: VenueType | "all";
  sortBy?: "date_asc" | "date_desc" | "urgency" | "benefits";
}

export const BENGALURU_AREAS = [
  "Koramangala",
  "HSR Layout",
  "Indiranagar",
  "Whitefield",
  "Electronic City",
  "Bellandur / Outer Ring Road",
  "JP Nagar / Jayanagar",
  "Lavelle Road / Central BLR",
  "Old Madras Road",
  "Malleshwaram",
  "Hebbal / Manyata",
  "Yelahanka",
  "BTM Layout",
  "Bannerghatta Road",
] as const;

export const CATEGORIES: EventCategory[] = [
  "AI & ML",
  "Cloud",
  "Cybersecurity",
  "Developer",
  "Data Science",
  "Robotics",
  "Quantum Computing",
  "Startup",
  "Networking",
  "Workshops",
];
