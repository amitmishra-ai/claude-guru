// ─── Payment & Session Types ────────────────────────────────────────────────

export type PaymentStatus = "invoice_not_raised" | "invoice_pending" | "paid";

export type SessionType =
  | "Online session"
  | "Career mentoring session"
  | "Capstone project mentoring session"
  | "Schedule a call"
  | "Industry session"
  | "Online class"
  | "Mentored Learning session"
  | "Residency"
  | "Evaluation"
  | "Moderation"
  | "CV Review"
  | "Others";

export type AudienceType = "Individual" | "Group" | "Batch" | "Webinar";

export type PaymentModel = "hourly" | "fixed";

export type SessionPrepMaterial = {
  id: string;
  label: string;
  url: string;
  type: "slides" | "document" | "video" | "link";
};

export type LearnerContext = {
  learnerName?: string;
  resumeUrl?: string;
  linkedInUrl?: string;
  learnerProfileUrl?: string;
  notes?: string;
  /** Career-mentor learner profile fields (sourced from career_session API) */
  imageUrl?: string;
  designation?: string;
  companyName?: string;
  /** Years of professional experience */
  experience?: number;
  /** What the learner wants help with for this session */
  agenda?: string;
};

export type Session = {
  id: string;
  title: string;
  topic?: string;
  batch?: string;
  program: string;
  cohort: string;
  group: string;
  groupMembers?: { name: string; email: string }[];
  dateYmd: string;
  start: number;
  end: number;
  location: string;
  sessionType: SessionType;
  contentReady: boolean;
  paymentAmountInr?: number;
  paymentStatus?: PaymentStatus;
  transactionId?: string;
  invoiceId?: string;
  recordingUrl?: string;
  // Session details fields
  scheduledByName?: string;
  scheduledByEmail?: string;
  scheduledByPhone?: string;
  scheduledOnYmd?: string;
  audienceType?: AudienceType;
  predictedGroups?: string[];
  timeZone?: string;
  linkedCourseId?: string;
  prepMaterials?: SessionPrepMaterial[];
  learnerContext?: LearnerContext;
  paymentModel?: PaymentModel;
  hourlyRateInr?: number;
  totalEarningsInr?: number;
  /** Residency end date for multi-day residencies (YYYY-MM-DD) */
  endDateYmd?: string;
  /** Evaluation / Moderation only — the due date passed before the Guru
      finished grading, so the activity is completed-but-incomplete (overdue).
      Surfaced in a pinned "Overdue" section at the top of the Completed tab. */
  overdue?: boolean;
  /** Residency day-level schedule (date + time per day) */
  residencySchedule?: { dateYmd: string; start: number; end: number }[];
  /** Combined session - lists the batches merged into this session */
  combinedBatches?: {
    batch: string;
    group: string;
    audienceType?: "Group" | "Batch" | "Individual";
    learnerCount?: number;
    proficiency?: string;
    progress?: string;
    learnerName?: string;
    learnerEmail?: string;
    programManager?: { name: string; email: string; phone?: string };
    members?: { name: string; email: string }[];
  }[];
};

// ─── Planned Event Types ────────────────────────────────────────────────────

export type PlannedEvent = {
  id: string;
  sessionType: SessionType;
  title: string;
  batch: string;
  program: string;
  contactEmail: string;
  startDateYmd: string;
  endDateYmd: string;
  status: "to_be_confirmed" | "confirmed";
};

// ─── Request Types ──────────────────────────────────────────────────────────

export type RequestSlot = {
  id: string;
  title: string;
  program: string;
  cohort: string;
  groupHint: string;
  dateYmd: string;
  start: number;
  end: number;
  location: string;
  response: "pending" | "available" | "unavailable";
};

// ─── Availability Types ─────────────────────────────────────────────────────

export type Pattern = {
  id: string;
  label: string;
  days: string[];
  start: number;
  end: number;
};

export type Block = {
  id: string;
  dateYmd: string;
  start: number;
  end: number;
  source?: "pattern" | "request";
  requestId?: string;
  patternId?: string;
};

export type NA = {
  id: string;
  dateYmd: string;
  start: number;
  end: number;
  reason?: string;
  sessionId?: string;
  createdAt?: number;
  groupId?: string;
};

export type Busy = {
  id: string;
  title: string;
  dateYmd: string;
  start: number;
  end: number;
};

// ─── Cohort & Course Types ──────────────────────────────────────────────────

export type CohortStart = {
  id: string;
  program: string;
  cohort: string;
  dateYmd: string;
  note?: string;
};

export type CourseCatalogItem = {
  id: string;
  title: string;
  program: string;
  batch: string;
  role: string;
  topics: string[];
  isNew: boolean;
  status: "current" | "past";
  color?: string;
  pattern?: number;
  /** "teach" = enrolled as Teacher/TA, "learn" = enrolled as Student */
  enrollment?: "teach" | "learn";
};

// ─── Poll Types ─────────────────────────────────────────────────────────────

export type Poll = {
  id: string;
  sessionId: string;
  question: string;
  options: string[];
  status: "draft" | "queued";
};

// ─── Toast Types ────────────────────────────────────────────────────────────

export type ToastVariant = "default" | "destructive";

export type ToastMsg = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  titleTone?: "default" | "danger";
};

// ─── Notification Types ─────────────────────────────────────────────────────

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  createdAtYmd: string;
  read: boolean;
  happeningNow?: boolean;
  sessionDateYmd?: string;
  sessionEnd?: number;
  ctaLabel?: string;
  ctaAction?: string; // action key for dispatch (e.g., "openSession", "goCalendar")
};

// ─── Rating Types ───────────────────────────────────────────────────────────

export type ParameterRating = {
  label: string;
  fiveStar: number;
  fourStar: number;
  threeAndBelow: number;
};

export type LearnerRating = {
  learnerName: string;
  rating: number;
  feedback?: string;
};

export type SessionFeedbackSummary = {
  totalResponses: number;
  totalEnrolled: number;
  parameterRatings: ParameterRating[];
};

export type RatingHistoryEntry = {
  id: string;
  title: string;
  group: string;
  dateYmd: string;
  score: number;
  feedback?: string;
};

export type QualitativeFeedback = {
  rating: number;
  positiveTags?: string[];
  negativeTags?: string[];
  comments?: string[];
};

export type MonthlyEarning = {
  key: string;
  label: string;
  amount: number;
};

export type DeclinedSession = {
  id: string;
  title: string;
  topic?: string;
  batch?: string;
  program: string;
  cohort: string;
  sessionType: SessionType;
  dateYmd: string;
  start: number;
  end: number;
  declinedOnYmd: string;
  declineReason?: string;
};

// ─── Preferences Type ───────────────────────────────────────────────────────

export type Preferences = {
  essential: boolean;
  learnerCC: boolean;
  batchChatter: boolean;
  systemNoise: boolean;
  reminders: boolean;
};

// ─── Availability Builder Types ─────────────────────────────────────────────

export type BuilderPreset = "weekends" | "weekendAfternoons" | "weekdayEvenings" | "custom";

export type PresetCard = {
  key: "weekends" | "weekendAfternoons" | "weekdayEvenings";
  label: string;
  days: string[];
  start: string;
  end: string;
  enabled: boolean;
};

// ─── Course Module Types ─────────────────────────────────────────────────────

export type CourseVideoItem = {
  id: string;
  number: number;
  title: string;
  duration: string;
  viewed?: boolean;
};

export type CoursePresentationItem = {
  id: string;
  title: string;
  sizeKb: string;
  viewed?: boolean;
};

export type CourseSection = {
  id: string;
  title: string;
  progress: number; // 0–100
  isNew?: boolean;
  videos: CourseVideoItem[];
  presentations: CoursePresentationItem[];
};

export type CourseModuleData = {
  courseId: string;
  sections: CourseSection[];
};

// ─── Support Tickets ─────────────────────────────────────────────────────────

export type TicketStatus = "open" | "awaiting_reply" | "closed" | "escalated";
export type TicketCategory = "Learning Material" | "Projects" | "Assignments" | "Technical Issue" | "Other";

export type TicketComment = {
  id: string;
  author: string;
  authorRole: "student" | "guru" | "support";
  content: string;
  timestamp: string;
};

export type TicketActivity = {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
};

export type SupportTicket = {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  category: TicketCategory;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  batchName: string;
  assignedTo: string;
  assignedToEmail: string;
  createdAt: string;
  lastActivityAt: string;
  isBookmarked: boolean;
  isUnread: boolean;
  comments: TicketComment[];
  activities: TicketActivity[];
};
