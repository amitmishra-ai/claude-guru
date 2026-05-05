/**
 * Demo Session objects for the Components showcase page.
 * These are dispatched into Redux (sessionFocus) to open the shared drawers
 * (SessionDetailsModal, CompletedSessionDetailDialog) with realistic data.
 */
import { minutes } from "@/lib/helpers";
import type { Session } from "@/lib/types";

const GROUP_MEMBERS = [
  { name: "Aarav Sharma", email: "aarav.sharma@example.com" },
  { name: "Priya Patel", email: "priya.patel@example.com" },
  { name: "Rohan Gupta", email: "rohan.gupta@example.com" },
  { name: "Sneha Reddy", email: "sneha.reddy@example.com" },
  { name: "Vikram Singh", email: "vikram.singh@example.com" },
  { name: "Ananya Iyer", email: "ananya.iyer@example.com" },
  { name: "Karthik Nair", email: "karthik.nair@example.com" },
];

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
  groupMembers: GROUP_MEMBERS,
  dateYmd: "2026-04-27",
  start: minutes(10),
  end: minutes(12),
  location: "Online",
  sessionType: "Mentored Learning session",
  contentReady: true,
  audienceType: "Group",
  scheduledByName: "Bhargavi CS",
  scheduledByEmail: "bhargavi.cs@greatlearning.in",
  scheduledOnYmd: "2026-04-17",
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
  groupMembers: GROUP_MEMBERS,
  dateYmd: "2026-04-27",
  start: minutes(10),
  end: minutes(12),
  location: "Online",
  sessionType: "Mentored Learning session",
  contentReady: true,
  audienceType: "Group",
  scheduledByName: "Bhargavi CS",
  scheduledByEmail: "bhargavi.cs@greatlearning.in",
  scheduledOnYmd: "2026-04-17",
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
  dateYmd: "2026-04-28",
  start: minutes(10),
  end: minutes(12),
  location: "Online",
  sessionType: "Mentored Learning session",
  contentReady: true,
  audienceType: "Group",
  scheduledByName: "Bhargavi CS",
  scheduledByEmail: "bhargavi.cs@greatlearning.in",
  scheduledOnYmd: "2026-04-19",
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
  groupMembers: GROUP_MEMBERS,
  dateYmd: "2026-04-07",
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
  scheduledOnYmd: "2026-04-01",
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
  dateYmd: "2026-02-12",
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
  scheduledOnYmd: "2026-02-05",
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
  groupMembers: GROUP_MEMBERS,
  dateYmd: "2026-03-05",
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
  scheduledOnYmd: "2026-02-27",
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
  title: "Career mentoring session",
  topic: "Career Guidance, Interview Preparation",
  batch: "Mtech SRM Chennai- WAI July 24- Sem 1-Section B",
  program: "PGP-DS",
  cohort: "Mtech SRM Chennai- WAI July 24- Sem 1-Section B",
  group: "1:1 Session",
  dateYmd: "2026-04-29",
  start: minutes(14),
  end: minutes(15),
  location: "Online",
  sessionType: "Career mentoring session",
  contentReady: true,
  audienceType: "Individual",
  scheduledByName: "Learners Success",
  scheduledByEmail: "learners_success@greatlearning.in",
  scheduledOnYmd: "2026-04-22",
  timeZone: "Asia/Kolkata",
  learnerContext: {
    learnerName: "Aarav Mehta",
    resumeUrl: "https://example.com/resume/aarav.pdf",
    linkedInUrl: "https://linkedin.com/in/aaravmehta",
    learnerProfileUrl: "https://learn.greatlearning.in/profile/aaravmehta",
    designation: "Marketing Analyst",
    companyName: "HUL",
    experience: 3,
    imageUrl: "https://i.pravatar.cc/96?img=12",
    agenda: "Looking for a transition from marketing analytics to data science. I have 3 years in Excel and SQL and am currently learning Python. Would love a review of my current projects and suggestions on what to focus on for the next 3 months.",
  },
};

export const demoCareerScheduled: Session = {
  ...demoCareerConfirmed,
  id: "comp-career-sched",
  dateYmd: "2026-05-01",
  start: minutes(11),
  end: minutes(12),
};

export const demoCareerCompletedGathering: Session = {
  id: "comp-career-comp-gath",
  title: "Career mentoring session",
  topic: "Career Guidance, Interview Preparation",
  batch: "AIML Online March 25",
  program: "PGP-DS",
  cohort: "AIML Online March 25",
  group: "1:1 Session",
  dateYmd: "2026-04-05",
  start: minutes(14),
  end: minutes(15),
  location: "Online",
  sessionType: "Career mentoring session",
  contentReady: true,
  audienceType: "Individual",
  paymentAmountInr: 5000,
  paymentStatus: "invoice_pending",
  recordingUrl: "https://example.com/recording/career-gath",
  scheduledByName: "Learners Success",
  scheduledByEmail: "learners_success@greatlearning.in",
  paymentModel: "fixed",
  totalEarningsInr: 5000,
  timeZone: "Asia/Kolkata",
  learnerContext: {
    learnerName: "Priya Sharma",
    resumeUrl: "https://example.com/resume/priya.pdf",
    linkedInUrl: "https://linkedin.com/in/priyasharma",
    designation: "Senior Analyst",
    companyName: "Infosys",
    experience: 4,
    imageUrl: "https://i.pravatar.cc/96?img=47",
    agenda: "Help me prepare for data science interviews. I want a mock interview round and feedback on my resume for analyst-to-DS transition roles.",
  },
};

export const demoCareerCompletedWithRating: Session = {
  ...demoCareerCompletedGathering,
  id: "comp-career-comp-rated",
  title: "Career mentoring session",
  topic: "Career Guidance, Interview Preparation",
  batch: "PGPDSBA.O.OCT24.A",
  cohort: "PGPDSBA.O.OCT24.A",
  dateYmd: "2026-03-20",
  paymentStatus: "paid",
  transactionId: "TXN-GL-C4R1",
  invoiceId: "INV-2026-0220-001",
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MOCK INTERVIEW                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */

export const demoMockConfirmed: Session = {
  id: "comp-mock-conf",
  title: "Career mentoring session",
  topic: "Career Guidance, Interview Preparation",
  batch: "JAIN-MBA-Sem-1_July22A",
  program: "PGP-DS",
  cohort: "JAIN-MBA-Sem-1_July22A",
  group: "1:1 Session",
  dateYmd: "2026-04-30",
  start: minutes(16),
  end: minutes(17),
  location: "Online",
  sessionType: "Career mentoring session",
  contentReady: true,
  audienceType: "Individual",
  scheduledByName: "Learners Success",
  scheduledByEmail: "learners_success@greatlearning.in",
  scheduledOnYmd: "2026-04-23",
  timeZone: "Asia/Kolkata",
  learnerContext: {
    learnerName: "Rohan Gupta",
    resumeUrl: "https://example.com/resume/rohan.pdf",
    linkedInUrl: "https://linkedin.com/in/rohangupta",
    designation: "Software Engineer",
    companyName: "Wipro",
    experience: 2,
    imageUrl: "https://i.pravatar.cc/96?img=33",
    agenda: "Mock interview for data scientist roles. Focus on ML fundamentals, SQL and a quick case study round. Please grade me strictly.",
  },
};

export const demoMockCompleted: Session = {
  ...demoMockConfirmed,
  id: "comp-mock-comp",
  dateYmd: "2026-04-02",
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
  dateYmd: "2026-05-08",
  start: minutes(9),
  end: minutes(17),
  endDateYmd: "2026-05-10",
  location: "Bangalore, Karnataka",
  sessionType: "Residency",
  contentReady: true,
  audienceType: "Batch",
  scheduledByName: "Program Office",
  scheduledByEmail: "pm.contact@greatlearning.in",
  scheduledOnYmd: "2026-03-29",
  timeZone: "Asia/Kolkata",
  residencySchedule: [
    { dateYmd: "2026-05-08", start: minutes(9), end: minutes(17) },
    { dateYmd: "2026-05-09", start: minutes(9), end: minutes(13) },
    { dateYmd: "2026-05-10", start: minutes(10), end: minutes(14) },
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
  dateYmd: "2026-05-16",
  endDateYmd: "2026-05-18",
  residencySchedule: [
    { dateYmd: "2026-05-16", start: minutes(9), end: minutes(17) },
    { dateYmd: "2026-05-17", start: minutes(9), end: minutes(13) },
    { dateYmd: "2026-05-18", start: minutes(10), end: minutes(14) },
  ],
};

export const demoResidencyCompletedGathering: Session = {
  id: "comp-res-comp-gath",
  title: "Program Overview (All)",
  batch: "AIML Online March 26 A",
  program: "PGP-AIML",
  cohort: "AIML Online March 26 A",
  group: "All Groups",
  dateYmd: "2026-04-02",
  start: minutes(9),
  end: minutes(17),
  endDateYmd: "2026-04-04",
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
    { dateYmd: "2026-04-02", start: minutes(9), end: minutes(17) },
    { dateYmd: "2026-04-03", start: minutes(9), end: minutes(13) },
    { dateYmd: "2026-04-04", start: minutes(10), end: minutes(14) },
  ],
};

export const demoResidencyCompletedWithRating: Session = {
  ...demoResidencyCompletedGathering,
  id: "comp-res-comp-rated",
  dateYmd: "2026-03-15",
  endDateYmd: "2026-03-17",
  paymentStatus: "paid",
  transactionId: "TXN-GL-RES1",
  invoiceId: "INV-2026-0215-001",
  recordingUrl: "https://example.com/recording/residency-rated",
  residencySchedule: [
    { dateYmd: "2026-03-15", start: minutes(9), end: minutes(17) },
    { dateYmd: "2026-03-16", start: minutes(9), end: minutes(13) },
    { dateYmd: "2026-03-17", start: minutes(10), end: minutes(14) },
  ],
};
