/**
 * Demo Session objects for the Components showcase page.
 * These are dispatched into Redux (sessionFocus) to open the shared drawers
 * (SessionDetailsModal, CompletedSessionDetailDialog) with realistic data.
 */
import { minutes } from "@/lib/helpers";
import type { Session } from "@/lib/types";

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MENTORED LEARNING / ONLINE SESSION                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */

export const demoMentoringConfirmed: Session = {
  id: "comp-ment-conf",
  title: "EDA Walkthrough",
  topic: "Exploratory Data Analysis with Python & Pandas",
  batch: "PGPDS Online March 26 A",
  program: "PGP-DS",
  cohort: "PGPDS Online March 26 A",
  group: "Group 07",
  dateYmd: "2026-03-30",
  start: minutes(10),
  end: minutes(12),
  location: "Online",
  sessionType: "Mentored Learning session",
  contentReady: true,
  audienceType: "Group",
  scheduledByName: "Bhargavi CS",
  scheduledByEmail: "bhargavi.cs@greatlearning.in",
  scheduledOnYmd: "2026-03-20",
  timeZone: "Asia/Kolkata",
  linkedCourseId: "c1",
  prepMaterials: [
    { id: "pm-1", label: "EDA Slides", url: "#", type: "slides" },
    { id: "pm-2", label: "Pandas Cheatsheet", url: "#", type: "document" },
    { id: "pm-3", label: "EDA Walkthrough Video", url: "#", type: "video" },
  ],
};

export const demoMentoringCombinedConfirmed: Session = {
  id: "comp-ment-comb-conf",
  title: "EDA Walkthrough",
  topic: "Exploratory Data Analysis with Python & Pandas",
  batch: "PGPDS Online March 26 A",
  program: "PGP-DS",
  cohort: "PGPDS Online March 26 A",
  group: "Group 07",
  dateYmd: "2026-03-30",
  start: minutes(10),
  end: minutes(12),
  location: "Online",
  sessionType: "Mentored Learning session",
  contentReady: true,
  audienceType: "Group",
  scheduledByName: "Bhargavi CS",
  scheduledByEmail: "bhargavi.cs@greatlearning.in",
  scheduledOnYmd: "2026-03-20",
  timeZone: "Asia/Kolkata",
  linkedCourseId: "c1",
  combinedBatches: [
    {
      batch: "PGPDS Online March 26 A",
      group: "Group 07",
      audienceType: "Group",
      learnerCount: 28,
      proficiency: "Intermediate",
      progress: "Module 3 of 8",
      programManager: { name: "Ravi Kumar", email: "ravi.kumar@greatlearning.in", phone: "+91-9876543210" },
      members: [
        { name: "Aarav Mehta", email: "aarav.m@example.com" },
        { name: "Priya Sharma", email: "priya.s@example.com" },
        { name: "Rohan Gupta", email: "rohan.g@example.com" },
        { name: "Sneha Reddy", email: "sneha.r@example.com" },
        { name: "Vikram Patel", email: "vikram.p@example.com" },
      ],
    },
    {
      batch: "PGPDS Online March 26 B",
      group: "Group 03",
      audienceType: "Group",
      learnerCount: 22,
      proficiency: "Beginner",
      progress: "Module 2 of 8",
      programManager: { name: "Anita Desai", email: "anita.desai@greatlearning.in" },
      members: [
        { name: "Kiran Rao", email: "kiran.r@example.com" },
        { name: "Meera Nair", email: "meera.n@example.com" },
        { name: "Arjun Das", email: "arjun.d@example.com" },
      ],
    },
  ],
  prepMaterials: [
    { id: "pm-1", label: "EDA Slides", url: "#", type: "slides" },
    { id: "pm-2", label: "Pandas Cheatsheet", url: "#", type: "document" },
  ],
};

export const demoMentoringScheduled: Session = {
  id: "comp-ment-sched",
  title: "Introduction to Clustering",
  topic: "K-Means & Hierarchical Clustering",
  batch: "PGPDS Online March 26 A",
  program: "PGP-DS",
  cohort: "PGPDS Online March 26 A",
  group: "Group 07",
  dateYmd: "2026-03-31",
  start: minutes(10),
  end: minutes(12),
  location: "Online",
  sessionType: "Mentored Learning session",
  contentReady: true,
  audienceType: "Group",
  scheduledByName: "Bhargavi CS",
  scheduledByEmail: "bhargavi.cs@greatlearning.in",
  scheduledOnYmd: "2026-03-22",
  timeZone: "Asia/Kolkata",
};

export const demoMentoringCombinedScheduled: Session = {
  ...demoMentoringScheduled,
  id: "comp-ment-comb-sched",
  combinedBatches: demoMentoringCombinedConfirmed.combinedBatches,
};

export const demoMentoringCompletedGathering: Session = {
  id: "comp-ment-comp-gath",
  title: "Statistics Foundations",
  topic: "Descriptive Stats & Distributions",
  batch: "PGPDS Online March 26 A",
  program: "PGP-DS",
  cohort: "PGPDS Online March 26 A",
  group: "Group 06",
  dateYmd: "2026-03-10",
  start: minutes(10),
  end: minutes(12),
  location: "Online",
  sessionType: "Mentored Learning session",
  contentReady: true,
  paymentAmountInr: 12000,
  paymentStatus: "invoice_pending",
  recordingUrl: "https://example.com/recording/comp-gath",
  scheduledByName: "Bhargavi CS",
  scheduledByEmail: "bhargavi.cs@greatlearning.in",
  scheduledOnYmd: "2026-03-04",
  paymentModel: "fixed",
  totalEarningsInr: 12000,
  timeZone: "Asia/Kolkata",
};

export const demoMentoringCompletedNoFeedback: Session = {
  id: "comp-ment-comp-nofb",
  title: "Python Fundamentals",
  topic: "Python Basics & Data Structures",
  batch: "PGPDS Online January 26 A",
  program: "PGP-DS",
  cohort: "PGPDS Online January 26 A",
  group: "Group 06",
  dateYmd: "2026-01-15",
  start: minutes(10),
  end: minutes(12),
  location: "Online",
  sessionType: "Mentored Learning session",
  contentReady: true,
  paymentAmountInr: 12000,
  paymentStatus: "paid",
  transactionId: "TXN-GL-3K9M2P",
  invoiceId: "INV-2026-0115-001",
  recordingUrl: "https://example.com/recording/comp-nofb",
  scheduledByName: "Bhargavi CS",
  scheduledByEmail: "bhargavi.cs@greatlearning.in",
  scheduledOnYmd: "2026-01-08",
  paymentModel: "fixed",
  totalEarningsInr: 12000,
  timeZone: "Asia/Kolkata",
};

export const demoMentoringCompletedWithRating: Session = {
  id: "comp-ment-comp-rated",
  title: "Deep Learning Workshop",
  topic: "Neural Networks & Backpropagation",
  batch: "AIML Online February 26 A",
  program: "PGP-AIML",
  cohort: "AIML Online February 26 A",
  group: "Group 03",
  dateYmd: "2026-02-05",
  start: minutes(18),
  end: minutes(21),
  location: "Online",
  sessionType: "Mentored Learning session",
  contentReady: true,
  paymentAmountInr: 18000,
  paymentStatus: "paid",
  transactionId: "TXN-GL-8F3K2Q",
  invoiceId: "INV-2026-0205-001",
  recordingUrl: "https://example.com/recording/comp-rated",
  scheduledByName: "Bhargavi CS",
  scheduledByEmail: "bhargavi.cs@greatlearning.in",
  scheduledOnYmd: "2026-01-30",
  paymentModel: "fixed",
  totalEarningsInr: 18000,
  timeZone: "Asia/Kolkata",
};

export const demoMentoringCombinedCompleted: Session = {
  ...demoMentoringCompletedWithRating,
  id: "comp-ment-comb-comp",
  combinedBatches: demoMentoringCombinedConfirmed.combinedBatches,
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  CAREER MENTORING                                                         */
/* ═══════════════════════════════════════════════════════════════════════════ */

export const demoCareerConfirmed: Session = {
  id: "comp-career-conf",
  title: "Career Guidance - Resume Review",
  batch: "PGPDS Online March 26 A",
  program: "PGP-DS",
  cohort: "PGPDS Online March 26 A",
  group: "1:1 Session",
  dateYmd: "2026-04-01",
  start: minutes(14),
  end: minutes(15),
  location: "Online",
  sessionType: "Career mentoring session",
  contentReady: true,
  audienceType: "Individual",
  scheduledByName: "Bhargavi CS",
  scheduledByEmail: "bhargavi.cs@greatlearning.in",
  scheduledOnYmd: "2026-03-25",
  timeZone: "Asia/Kolkata",
  learnerContext: {
    learnerName: "Aarav Mehta",
    resumeUrl: "https://example.com/resume/aarav.pdf",
    linkedInUrl: "https://linkedin.com/in/aaravmehta",
    learnerProfileUrl: "https://learn.greatlearning.in/profile/aaravmehta",
    notes: "Looking for a transition from marketing analytics to data science. Has 3 years of experience in Excel/SQL, currently learning Python.",
  },
};

export const demoCareerScheduled: Session = {
  ...demoCareerConfirmed,
  id: "comp-career-sched",
  dateYmd: "2026-04-03",
  start: minutes(11),
  end: minutes(12),
};

export const demoCareerCompletedGathering: Session = {
  id: "comp-career-comp-gath",
  title: "Career Guidance - Interview Prep",
  batch: "PGPDS Online March 26 A",
  program: "PGP-DS",
  cohort: "PGPDS Online March 26 A",
  group: "1:1 Session",
  dateYmd: "2026-03-08",
  start: minutes(14),
  end: minutes(15),
  location: "Online",
  sessionType: "Career mentoring session",
  contentReady: true,
  audienceType: "Individual",
  paymentAmountInr: 5000,
  paymentStatus: "invoice_pending",
  recordingUrl: "https://example.com/recording/career-gath",
  scheduledByName: "Bhargavi CS",
  scheduledByEmail: "bhargavi.cs@greatlearning.in",
  paymentModel: "fixed",
  totalEarningsInr: 5000,
  timeZone: "Asia/Kolkata",
  learnerContext: {
    learnerName: "Priya Sharma",
    resumeUrl: "https://example.com/resume/priya.pdf",
    linkedInUrl: "https://linkedin.com/in/priyasharma",
  },
};

export const demoCareerCompletedWithRating: Session = {
  ...demoCareerCompletedGathering,
  id: "comp-career-comp-rated",
  title: "Career Guidance - Portfolio Review",
  dateYmd: "2026-02-20",
  paymentStatus: "paid",
  transactionId: "TXN-GL-C4R1",
  invoiceId: "INV-2026-0220-001",
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MOCK INTERVIEW                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */

export const demoMockConfirmed: Session = {
  id: "comp-mock-conf",
  title: "Mock Interview - Data Science",
  batch: "PGPDS Online March 26 A",
  program: "PGP-DS",
  cohort: "PGPDS Online March 26 A",
  group: "1:1 Session",
  dateYmd: "2026-04-02",
  start: minutes(16),
  end: minutes(17),
  location: "Online",
  sessionType: "Career mentoring session",
  contentReady: true,
  audienceType: "Individual",
  scheduledByName: "Bhargavi CS",
  scheduledByEmail: "bhargavi.cs@greatlearning.in",
  scheduledOnYmd: "2026-03-26",
  timeZone: "Asia/Kolkata",
  learnerContext: {
    learnerName: "Rohan Gupta",
    resumeUrl: "https://example.com/resume/rohan.pdf",
    linkedInUrl: "https://linkedin.com/in/rohangupta",
  },
};

export const demoMockCompleted: Session = {
  ...demoMockConfirmed,
  id: "comp-mock-comp",
  dateYmd: "2026-03-05",
  paymentAmountInr: 5000,
  paymentStatus: "paid",
  transactionId: "TXN-GL-M0CK",
  invoiceId: "INV-2026-0305-001",
  recordingUrl: "https://example.com/recording/mock-comp",
  paymentModel: "fixed",
  totalEarningsInr: 5000,
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  RESIDENCY                                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */

export const demoResidencyConfirmed: Session = {
  id: "comp-res-conf",
  title: "Program Overview (All)",
  batch: "AIML Online March 26 A",
  program: "PGP-AIML",
  cohort: "AIML Online March 26 A",
  group: "All Groups",
  dateYmd: "2026-04-10",
  start: minutes(9),
  end: minutes(17),
  endDateYmd: "2026-04-12",
  location: "Bangalore, Karnataka",
  sessionType: "Residency",
  contentReady: true,
  audienceType: "Batch",
  scheduledByName: "Program Office",
  scheduledByEmail: "pm.contact@greatlearning.in",
  scheduledOnYmd: "2026-03-01",
  timeZone: "Asia/Kolkata",
  residencySchedule: [
    { dateYmd: "2026-04-10", start: minutes(9), end: minutes(17) },
    { dateYmd: "2026-04-11", start: minutes(9), end: minutes(13) },
    { dateYmd: "2026-04-12", start: minutes(10), end: minutes(14) },
  ],
  prepMaterials: [
    { id: "pm-r1", label: "Residency Handbook", url: "#", type: "document" },
    { id: "pm-r2", label: "Location & Travel Guide", url: "#", type: "link" },
  ],
};

export const demoResidencyCombined: Session = {
  ...demoResidencyConfirmed,
  id: "comp-res-comb",
  combinedBatches: [
    {
      batch: "AIML Online March 26 A",
      group: "All Groups",
      audienceType: "Batch",
      learnerCount: 120,
      programManager: { name: "Ravi Kumar", email: "ravi.kumar@greatlearning.in" },
    },
    {
      batch: "AIML Online Feb 26 B",
      group: "All Groups",
      audienceType: "Batch",
      learnerCount: 95,
      programManager: { name: "Anita Desai", email: "anita.desai@greatlearning.in" },
    },
  ],
};

export const demoResidencyScheduled: Session = {
  ...demoResidencyConfirmed,
  id: "comp-res-sched",
  dateYmd: "2026-04-18",
  endDateYmd: "2026-04-20",
  residencySchedule: [
    { dateYmd: "2026-04-18", start: minutes(9), end: minutes(17) },
    { dateYmd: "2026-04-19", start: minutes(9), end: minutes(13) },
    { dateYmd: "2026-04-20", start: minutes(10), end: minutes(14) },
  ],
};

export const demoResidencyCompletedGathering: Session = {
  id: "comp-res-comp-gath",
  title: "Program Overview (All)",
  batch: "AIML Online March 26 A",
  program: "PGP-AIML",
  cohort: "AIML Online March 26 A",
  group: "All Groups",
  dateYmd: "2026-03-05",
  start: minutes(9),
  end: minutes(17),
  endDateYmd: "2026-03-07",
  location: "Bangalore, Karnataka",
  sessionType: "Residency",
  contentReady: true,
  audienceType: "Batch",
  paymentAmountInr: 45000,
  paymentStatus: "invoice_pending",
  scheduledByName: "Program Office",
  scheduledByEmail: "pm.contact@greatlearning.in",
  paymentModel: "fixed",
  totalEarningsInr: 45000,
  timeZone: "Asia/Kolkata",
  residencySchedule: [
    { dateYmd: "2026-03-05", start: minutes(9), end: minutes(17) },
    { dateYmd: "2026-03-06", start: minutes(9), end: minutes(13) },
    { dateYmd: "2026-03-07", start: minutes(10), end: minutes(14) },
  ],
};

export const demoResidencyCompletedWithRating: Session = {
  ...demoResidencyCompletedGathering,
  id: "comp-res-comp-rated",
  dateYmd: "2026-02-15",
  endDateYmd: "2026-02-17",
  paymentStatus: "paid",
  transactionId: "TXN-GL-RES1",
  invoiceId: "INV-2026-0215-001",
  recordingUrl: "https://example.com/recording/residency-rated",
  residencySchedule: [
    { dateYmd: "2026-02-15", start: minutes(9), end: minutes(17) },
    { dateYmd: "2026-02-16", start: minutes(9), end: minutes(13) },
    { dateYmd: "2026-02-17", start: minutes(10), end: minutes(14) },
  ],
};
