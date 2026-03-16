import { minutes } from "@/lib/helpers";
import type { Session, LearnerRating, SessionFeedbackSummary, RatingHistoryEntry, MonthlyEarning, DeclinedSession, Busy, CohortStart, CourseCatalogItem, CourseModuleData } from "@/lib/types";

export const demoSessions: Session[] = [
  {
    id: "s0",
    title: "Mentor Session: Intro & Orientation",
    program: "PGP-DS",
    cohort: "Cohort Feb",
    group: "Group 02 (Mixed work, beginner prog)",
    dateYmd: "2026-02-14",
    start: minutes(10),
    end: minutes(12),
    location: "Online",
    sessionType: "Online session",
    contentReady: true,
    paymentAmountInr: 18000,
    paymentStatus: "paid",
    transactionId: "TXN-GL-8F3K2Q",
    invoiceId: "INV-2026-0214-001",
    recordingUrl: "https://example.com/recording/s0",
  },
  {
    id: "s0b",
    title: "Mentor Session: Excel Foundations",
    program: "PGP-DS",
    cohort: "Cohort Feb",
    group: "Group 03 (Mixed)",
    dateYmd: "2026-02-15",
    start: minutes(18),
    end: minutes(20),
    location: "Online",
    sessionType: "Career mentoring session",
    contentReady: true,
    paymentAmountInr: 16000,
    paymentStatus: "invoice_pending",
    invoiceId: "INV-2026-0215-004",
    recordingUrl: "https://example.com/recording/s0b",
  },
  {
    id: "s1",
    title: "Mentor Session: Statistics",
    program: "PGP-DS",
    cohort: "Cohort Feb",
    group: "Group 07 (High work, mixed prog)",
    dateYmd: "2026-02-21",
    start: minutes(18),
    end: minutes(20),
    location: "Online",
    sessionType: "Capstone project mentoring session",
    contentReady: true,
    paymentAmountInr: 22000,
    recordingUrl: "https://example.com/recording/s1",
  },
  {
    id: "s2",
    title: "Mentor Session: Python Q&A",
    program: "PGP-DS",
    cohort: "Cohort Feb",
    group: "Group 05 (Low work, high prog)",
    dateYmd: "2026-02-22",
    start: minutes(10),
    end: minutes(12),
    location: "Online",
    sessionType: "Schedule a call",
    contentReady: true,
    paymentAmountInr: 12000,
    recordingUrl: "https://example.com/recording/s2",
  },
  {
    id: "s3",
    title: "Mentor Session: Data Visualization",
    program: "PGP-DS",
    cohort: "Cohort Feb",
    group: "Group 09 (Mixed work, mixed prog)",
    dateYmd: "2026-02-23",
    start: minutes(18),
    end: minutes(20),
    location: "Online",
    sessionType: "Industry session",
    contentReady: false,
    paymentAmountInr: 25000,
    recordingUrl: "https://example.com/recording/s3",
  },
  {
    id: "s4",
    title: "Mentor Session: SQL Basics",
    program: "PGP-DS",
    cohort: "Cohort Feb",
    group: "Group 04 (High work, beginner prog)",
    dateYmd: "2026-02-28",
    start: minutes(10),
    end: minutes(12),
    location: "Online",
    sessionType: "Online class",
    contentReady: true,
    paymentAmountInr: 20000,
    recordingUrl: "https://example.com/recording/s4",
  },
  {
    id: "s5",
    title: "Mentor Session: Capstone Review",
    program: "PGP-DS",
    cohort: "Cohort Feb",
    group: "Group 01 (Mixed)",
    dateYmd: "2026-03-01",
    start: minutes(18),
    end: minutes(20),
    location: "Online",
    sessionType: "Others",
    contentReady: false,
    paymentAmountInr: 14000,
    recordingUrl: "https://example.com/recording/s5",
  },
];

export const demoLearnerRatingsBySessionId: Record<string, LearnerRating[]> = {
  s0: [
    { learnerName: "Aarav", rating: 4.8, feedback: "Very clear session structure." },
    { learnerName: "Nisha", rating: 4.9, feedback: "Great pace and examples." },
    { learnerName: "Rohan", rating: 4.7, feedback: "Helpful Q&A at the end." },
  ],
  s0b: [
    { learnerName: "Meera", rating: 4.9, feedback: "Practical and engaging." },
    { learnerName: "Kabir", rating: 4.8, feedback: "Good walkthrough." },
    { learnerName: "Isha", rating: 5.0, feedback: "Excellent explanation style." },
  ],
  s1: [
    { learnerName: "Arjun", rating: 4.6, feedback: "Statistics concepts explained well." },
    { learnerName: "Priya", rating: 4.7, feedback: "Good examples with real data." },
    { learnerName: "Karan", rating: 4.5, feedback: "Helpful session, could use more examples." },
  ],
  s2: [
    { learnerName: "Sanya", rating: 4.8, feedback: "Python Q&A was very interactive." },
    { learnerName: "Vivek", rating: 4.9, feedback: "Cleared all my doubts." },
    { learnerName: "Deepa", rating: 4.7, feedback: "Great pace and depth." },
  ],
  s3: [
    { learnerName: "Rahul", rating: 4.7, feedback: "Visualisation techniques were eye-opening." },
    { learnerName: "Ananya", rating: 4.6, feedback: "Very practical session." },
  ],
  s4: [
    { learnerName: "Nikhil", rating: 4.8, feedback: "SQL basics covered thoroughly." },
    { learnerName: "Tanvi", rating: 4.9, feedback: "Loved the live examples." },
    { learnerName: "Amit", rating: 4.7, feedback: "Clear and concise." },
  ],
  s5: [
    { learnerName: "Pooja", rating: 4.6, feedback: "Capstone review was very structured." },
    { learnerName: "Suresh", rating: 4.5, feedback: "Helpful feedback on my project." },
  ],
};

export const demoFeedbackSummaryBySessionId: Record<string, SessionFeedbackSummary> = {
  s0: {
    totalResponses: 31,
    totalEnrolled: 69,
    parameterRatings: [
      { label: "Concepts explanation", fiveStar: 16, fourStar: 12, threeAndBelow: 3 },
      { label: "Pace of teaching", fiveStar: 15, fourStar: 13, threeAndBelow: 3 },
      { label: "Clearing doubts & interaction", fiveStar: 15, fourStar: 14, threeAndBelow: 2 },
    ],
  },
  s0b: {
    totalResponses: 28,
    totalEnrolled: 55,
    parameterRatings: [
      { label: "Concepts explanation", fiveStar: 18, fourStar: 8, threeAndBelow: 2 },
      { label: "Pace of teaching", fiveStar: 16, fourStar: 10, threeAndBelow: 2 },
      { label: "Clearing doubts & interaction", fiveStar: 17, fourStar: 9, threeAndBelow: 2 },
    ],
  },
  s1: {
    totalResponses: 24,
    totalEnrolled: 48,
    parameterRatings: [
      { label: "Concepts explanation", fiveStar: 12, fourStar: 9, threeAndBelow: 3 },
      { label: "Pace of teaching", fiveStar: 11, fourStar: 10, threeAndBelow: 3 },
      { label: "Clearing doubts & interaction", fiveStar: 13, fourStar: 8, threeAndBelow: 3 },
    ],
  },
  s2: {
    totalResponses: 30,
    totalEnrolled: 62,
    parameterRatings: [
      { label: "Concepts explanation", fiveStar: 17, fourStar: 10, threeAndBelow: 3 },
      { label: "Pace of teaching", fiveStar: 16, fourStar: 11, threeAndBelow: 3 },
      { label: "Clearing doubts & interaction", fiveStar: 18, fourStar: 10, threeAndBelow: 2 },
    ],
  },
  s3: {
    totalResponses: 18,
    totalEnrolled: 40,
    parameterRatings: [
      { label: "Concepts explanation", fiveStar: 10, fourStar: 6, threeAndBelow: 2 },
      { label: "Pace of teaching", fiveStar: 9, fourStar: 7, threeAndBelow: 2 },
      { label: "Clearing doubts & interaction", fiveStar: 11, fourStar: 5, threeAndBelow: 2 },
    ],
  },
  s4: {
    totalResponses: 26,
    totalEnrolled: 52,
    parameterRatings: [
      { label: "Concepts explanation", fiveStar: 15, fourStar: 9, threeAndBelow: 2 },
      { label: "Pace of teaching", fiveStar: 14, fourStar: 10, threeAndBelow: 2 },
      { label: "Clearing doubts & interaction", fiveStar: 16, fourStar: 8, threeAndBelow: 2 },
    ],
  },
  s5: {
    totalResponses: 15,
    totalEnrolled: 35,
    parameterRatings: [
      { label: "Concepts explanation", fiveStar: 8, fourStar: 5, threeAndBelow: 2 },
      { label: "Pace of teaching", fiveStar: 7, fourStar: 6, threeAndBelow: 2 },
      { label: "Clearing doubts & interaction", fiveStar: 9, fourStar: 4, threeAndBelow: 2 },
    ],
  },
};

export const demoRatingHistory: RatingHistoryEntry[] = [
  { id: "s0", title: "Mentor Session: Intro & Orientation", group: "Group 02 (Mixed work, beginner prog)", dateYmd: "2026-02-14", score: 4.85, feedback: "Great clarity and pacing." },
  { id: "s0b", title: "Mentor Session: Excel Foundations", group: "Group 03 (Mixed)", dateYmd: "2026-02-15", score: 4.9, feedback: "Helpful examples and Q&A." },
  { id: "rh1", title: "Mentor Session: Python Basics", group: "Group 06 (Beginner)", dateYmd: "2026-02-08", score: 4.8, feedback: "Good walkthrough with practical examples." },
  { id: "rh2", title: "Mentor Session: SQL Practice", group: "Group 04 (High work, beginner prog)", dateYmd: "2026-02-01", score: 4.7, feedback: "Clear explanations, needed more time for doubts." },
  { id: "rh3", title: "Mentor Session: Statistics Foundations", group: "Group 08 (Mixed)", dateYmd: "2026-01-25", score: 4.65, feedback: "Excellent session flow and engagement." },
  { id: "rh4", title: "Mentor Session: Data Viz Deep Dive", group: "Group 09 (Mixed work, mixed prog)", dateYmd: "2026-01-18", score: 4.6, feedback: "Loved the real-world dashboard examples." },
  { id: "rh5", title: "Mentor Session: Regression Essentials", group: "Group 10 (Advanced)", dateYmd: "2026-01-11", score: 4.5, feedback: "Good pacing and practical intuition." },
  { id: "rh6", title: "Mentor Session: Probability Refresher", group: "Group 07 (High work, mixed prog)", dateYmd: "2026-01-04", score: 4.45, feedback: "Concepts were clear; wanted more solved examples." },
  { id: "rh7", title: "Mentor Session: Exploratory Data Analysis", group: "Group 05 (Low work, high prog)", dateYmd: "2025-12-28", score: 4.4, feedback: "Very interactive and easy to follow." },
  { id: "rh8", title: "Mentor Session: Feature Engineering", group: "Group 03 (Mixed)", dateYmd: "2025-12-21", score: 4.35, feedback: "Great tips for real projects." },
  { id: "rh9", title: "Mentor Session: Model Evaluation", group: "Group 02 (Mixed work, beginner prog)", dateYmd: "2025-12-14", score: 4.3, feedback: "Excellent explanation of metrics and tradeoffs." },
  { id: "rh10", title: "Mentor Session: Time Series Basics", group: "Group 11 (Mixed)", dateYmd: "2025-12-07", score: 4.2, feedback: "Good foundations and clear examples." },
  { id: "rh11", title: "Mentor Session: Data Storytelling", group: "Group 01 (Mixed)", dateYmd: "2025-11-16", score: 4.28, feedback: "Strong narrative and practical examples." },
  { id: "rh12", title: "Mentor Session: SQL Foundations", group: "Group 04 (Beginner)", dateYmd: "2025-10-19", score: 4.33, feedback: "Concepts explained clearly with good pacing." },
  { id: "rh13", title: "Mentor Session: Python Refresher", group: "Group 06 (Mixed)", dateYmd: "2025-09-14", score: 4.25, feedback: "Useful recap and structured exercises." },
];

export const demoMonthlyEarnings: MonthlyEarning[] = [
  { key: "2025-09", label: "Sep 25", amount: 62000 },
  { key: "2025-10", label: "Oct 25", amount: 58000 },
  { key: "2025-11", label: "Nov 25", amount: 69000 },
  { key: "2025-12", label: "Dec 25", amount: 64000 },
  { key: "2026-01", label: "Jan 26", amount: 98000 },
  { key: "2026-02", label: "Feb 26", amount: 76000 },
];

export const demoPreviouslyDeclinedSessions: DeclinedSession[] = [
  {
    id: "pd1",
    title: "Mentor Session: SQL Revision",
    program: "PGP-DS",
    cohort: "Cohort Jan",
    dateYmd: "2026-01-12",
    start: minutes(10),
    end: minutes(12),
    declinedOnYmd: "2026-01-08",
  },
  {
    id: "pd2",
    title: "Mentor Session: Python Practice Lab",
    program: "PGP-DS",
    cohort: "Cohort Jan",
    dateYmd: "2026-01-19",
    start: minutes(18),
    end: minutes(20),
    declinedOnYmd: "2026-01-15",
  },
];

export const demoCourseModules: Record<string, CourseModuleData> = {
  c1: {
    courseId: "c1",
    sections: [
      {
        id: "c1-s1", title: "Section 1: Core Python", progress: 75,
        videos: [
          { id: "c1-s1-v1", number: 1, title: "Python environment setup", duration: "12 Mins 30 Secs", viewed: true },
          { id: "c1-s1-v2", number: 2, title: "Variables, types & operators", duration: "18 Mins 15 Secs", viewed: true },
          { id: "c1-s1-v3", number: 3, title: "Control flow: if, loops", duration: "21 Mins 40 Secs", viewed: true },
          { id: "c1-s1-v4", number: 4, title: "Functions & scope", duration: "19 Mins 20 Secs" },
        ],
        presentations: [
          { id: "c1-s1-p1", title: "Python cheatsheet", sizeKb: "842 KB", viewed: true },
          { id: "c1-s1-p2", title: "Exercise set 1", sizeKb: "310 KB" },
        ],
      },
      {
        id: "c1-s2", title: "Section 2: Data Structures", progress: 40,
        videos: [
          { id: "c1-s2-v1", number: 5, title: "Lists & tuples in depth", duration: "22 Mins 10 Secs", viewed: true },
          { id: "c1-s2-v2", number: 6, title: "Dictionaries & sets", duration: "17 Mins 55 Secs" },
          { id: "c1-s2-v3", number: 7, title: "Comprehensions & generators", duration: "20 Mins 00 Secs" },
          { id: "c1-s2-v4", number: 8, title: "File I/O basics", duration: "14 Mins 30 Secs" },
          { id: "c1-s2-v5", number: 9, title: "Error handling", duration: "16 Mins 45 Secs" },
        ],
        presentations: [
          { id: "c1-s2-p1", title: "Data structures reference", sizeKb: "755 KB" },
          { id: "c1-s2-p2", title: "Exercise set 2", sizeKb: "289 KB" },
        ],
      },
    ],
  },
  c2: {
    courseId: "c2",
    sections: [
      {
        id: "c2-s1", title: "Section 1: SQL Fundamentals", progress: 90,
        videos: [
          { id: "c2-s1-v1", number: 1, title: "SELECT, WHERE & ORDER BY", duration: "15 Mins 20 Secs", viewed: true },
          { id: "c2-s1-v2", number: 2, title: "GROUP BY & aggregate functions", duration: "18 Mins 10 Secs", viewed: true },
          { id: "c2-s1-v3", number: 3, title: "INNER, LEFT & RIGHT JOINs", duration: "23 Mins 45 Secs", viewed: true },
        ],
        presentations: [
          { id: "c2-s1-p1", title: "SQL quick reference", sizeKb: "612 KB", viewed: true },
          { id: "c2-s1-p2", title: "Join types diagram", sizeKb: "204 KB", viewed: true },
        ],
      },
      {
        id: "c2-s2", title: "Section 2: Advanced SQL", progress: 30,
        videos: [
          { id: "c2-s2-v1", number: 4, title: "Subqueries & CTEs", duration: "26 Mins 30 Secs", viewed: true },
          { id: "c2-s2-v2", number: 5, title: "Window functions: ROW_NUMBER, RANK", duration: "24 Mins 15 Secs" },
          { id: "c2-s2-v3", number: 6, title: "Window frames: ROWS vs RANGE", duration: "19 Mins 00 Secs" },
          { id: "c2-s2-v4", number: 7, title: "Performance & indexing basics", duration: "21 Mins 40 Secs" },
        ],
        presentations: [
          { id: "c2-s2-p1", title: "Window functions reference", sizeKb: "780 KB" },
          { id: "c2-s2-p2", title: "Query optimisation guide", sizeKb: "540 KB" },
          { id: "c2-s2-p3", title: "Practice problem set", sizeKb: "320 KB" },
        ],
      },
    ],
  },
  c3: {
    courseId: "c3",
    sections: [
      {
        id: "c3-s1", title: "Section 1: Probability & Distributions", progress: 60,
        videos: [
          { id: "c3-s1-v1", number: 1, title: "Probability fundamentals", duration: "17 Mins 00 Secs", viewed: true },
          { id: "c3-s1-v2", number: 2, title: "Normal & binomial distributions", duration: "22 Mins 30 Secs", viewed: true },
          { id: "c3-s1-v3", number: 3, title: "Central limit theorem", duration: "19 Mins 45 Secs" },
          { id: "c3-s1-v4", number: 4, title: "Sampling techniques", duration: "16 Mins 20 Secs" },
        ],
        presentations: [
          { id: "c3-s1-p1", title: "Distribution cheatsheet", sizeKb: "920 KB", viewed: true },
          { id: "c3-s1-p2", title: "Probability exercises", sizeKb: "445 KB" },
        ],
      },
      {
        id: "c3-s2", title: "Section 2: Hypothesis Testing", progress: 20,
        videos: [
          { id: "c3-s2-v1", number: 5, title: "Null & alternative hypotheses", duration: "14 Mins 50 Secs", viewed: true },
          { id: "c3-s2-v2", number: 6, title: "t-tests & z-tests", duration: "25 Mins 10 Secs" },
          { id: "c3-s2-v3", number: 7, title: "Chi-square & ANOVA", duration: "28 Mins 00 Secs" },
          { id: "c3-s2-v4", number: 8, title: "p-values & significance levels", duration: "18 Mins 30 Secs" },
        ],
        presentations: [
          { id: "c3-s2-p1", title: "Hypothesis testing guide", sizeKb: "680 KB" },
          { id: "c3-s2-p2", title: "Statistical test selector", sizeKb: "315 KB" },
        ],
      },
    ],
  },
  c4: {
    courseId: "c4",
    sections: [
      {
        id: "c4-s1", title: "Section 1: Evaluation Metrics", progress: 80,
        videos: [
          { id: "c4-s1-v1", number: 1, title: "Accuracy, precision & recall", duration: "18 Mins 20 Secs", viewed: true },
          { id: "c4-s1-v2", number: 2, title: "ROC curves & AUC", duration: "22 Mins 10 Secs", viewed: true },
          { id: "c4-s1-v3", number: 3, title: "Confusion matrix deep dive", duration: "16 Mins 45 Secs", viewed: true },
        ],
        presentations: [
          { id: "c4-s1-p1", title: "Metrics reference card", sizeKb: "558 KB", viewed: true },
          { id: "c4-s1-p2", title: "ROC exercise set", sizeKb: "280 KB" },
        ],
      },
      {
        id: "c4-s2", title: "Section 2: Overfitting & Regularisation", progress: 50,
        videos: [
          { id: "c4-s2-v1", number: 4, title: "Bias-variance tradeoff", duration: "20 Mins 30 Secs", viewed: true },
          { id: "c4-s2-v2", number: 5, title: "L1 & L2 regularisation", duration: "24 Mins 00 Secs", viewed: true },
          { id: "c4-s2-v3", number: 6, title: "Cross-validation techniques", duration: "19 Mins 15 Secs" },
          { id: "c4-s2-v4", number: 7, title: "Early stopping & dropout", duration: "17 Mins 40 Secs" },
        ],
        presentations: [
          { id: "c4-s2-p1", title: "Regularisation guide", sizeKb: "720 KB" },
          { id: "c4-s2-p2", title: "Cross-validation notebook", sizeKb: "490 KB" },
        ],
      },
      {
        id: "c4-s3", title: "Section 3: Advanced Model Selection", progress: 0, isNew: true,
        videos: [
          { id: "c4-s3-v1", number: 8, title: "Hyperparameter tuning strategies", duration: "25 Mins 10 Secs" },
          { id: "c4-s3-v2", number: 9, title: "Bayesian optimisation intro", duration: "22 Mins 35 Secs" },
          { id: "c4-s3-v3", number: 10, title: "AutoML & model pipelines", duration: "20 Mins 00 Secs" },
        ],
        presentations: [
          { id: "c4-s3-p1", title: "Hyperparameter tuning cheatsheet", sizeKb: "610 KB" },
        ],
      },
    ],
  },
  c5: {
    courseId: "c5",
    sections: [
      {
        id: "c5-s1", title: "Section 1: Session Design", progress: 100,
        videos: [
          { id: "c5-s1-v1", number: 1, title: "Learning objectives & session flow", duration: "14 Mins 00 Secs", viewed: true },
          { id: "c5-s1-v2", number: 2, title: "Structuring your 60-minute session", duration: "17 Mins 30 Secs", viewed: true },
          { id: "c5-s1-v3", number: 3, title: "Adapting to different learner levels", duration: "19 Mins 20 Secs", viewed: true },
        ],
        presentations: [
          { id: "c5-s1-p1", title: "Session planning template", sizeKb: "388 KB", viewed: true },
          { id: "c5-s1-p2", title: "Effective questions bank", sizeKb: "255 KB", viewed: true },
        ],
      },
      {
        id: "c5-s2", title: "Section 2: Facilitating Discussions", progress: 65,
        videos: [
          { id: "c5-s2-v1", number: 4, title: "Asking Socratic questions", duration: "16 Mins 10 Secs", viewed: true },
          { id: "c5-s2-v2", number: 5, title: "Handling off-track conversations", duration: "13 Mins 45 Secs", viewed: true },
          { id: "c5-s2-v3", number: 6, title: "Managing group dynamics", duration: "18 Mins 00 Secs" },
          { id: "c5-s2-v4", number: 7, title: "Giving constructive feedback", duration: "20 Mins 25 Secs" },
        ],
        presentations: [
          { id: "c5-s2-p1", title: "Facilitation techniques guide", sizeKb: "492 KB" },
          { id: "c5-s2-p2", title: "Feedback frameworks handout", sizeKb: "310 KB" },
        ],
      },
    ],
  },
  c6: {
    courseId: "c6",
    sections: [
      {
        id: "c6-s1", title: "Section 1: Chart Fundamentals", progress: 70,
        videos: [
          { id: "c6-s1-v1", number: 1, title: "Choosing the right chart type", duration: "16 Mins 40 Secs", viewed: true },
          { id: "c6-s1-v2", number: 2, title: "Bar, line & scatter charts", duration: "21 Mins 00 Secs", viewed: true },
          { id: "c6-s1-v3", number: 3, title: "Pie, donut & area charts", duration: "15 Mins 30 Secs", viewed: true },
          { id: "c6-s1-v4", number: 4, title: "Colour theory for data", duration: "13 Mins 50 Secs" },
        ],
        presentations: [
          { id: "c6-s1-p1", title: "Chart type selector", sizeKb: "1.1 MB", viewed: true },
          { id: "c6-s1-p2", title: "Colour palette reference", sizeKb: "480 KB" },
          { id: "c6-s1-p3", title: "Exercise: chart critique", sizeKb: "220 KB" },
        ],
      },
      {
        id: "c6-s2", title: "Section 2: Storytelling with Data", progress: 35,
        videos: [
          { id: "c6-s2-v1", number: 5, title: "Building a data narrative", duration: "19 Mins 20 Secs", viewed: true },
          { id: "c6-s2-v2", number: 6, title: "Annotation & callouts", duration: "14 Mins 45 Secs" },
          { id: "c6-s2-v3", number: 7, title: "Dashboard layout principles", duration: "22 Mins 30 Secs" },
          { id: "c6-s2-v4", number: 8, title: "Presenting to non-technical audiences", duration: "17 Mins 10 Secs" },
        ],
        presentations: [
          { id: "c6-s2-p1", title: "Storytelling framework", sizeKb: "870 KB" },
          { id: "c6-s2-p2", title: "Dashboard design checklist", sizeKb: "340 KB" },
        ],
      },
      {
        id: "c6-s3", title: "Section 3: Interactive Dashboards", progress: 0, isNew: true,
        videos: [
          { id: "c6-s3-v1", number: 9, title: "Intro to Tableau Public", duration: "23 Mins 15 Secs" },
          { id: "c6-s3-v2", number: 10, title: "Filters, parameters & actions", duration: "26 Mins 00 Secs" },
          { id: "c6-s3-v3", number: 11, title: "Publishing & embedding dashboards", duration: "18 Mins 50 Secs" },
        ],
        presentations: [
          { id: "c6-s3-p1", title: "Tableau starter guide", sizeKb: "740 KB" },
          { id: "c6-s3-p2", title: "Dashboard project brief", sizeKb: "295 KB" },
        ],
      },
    ],
  },
  c7: {
    courseId: "c7",
    sections: [
      {
        id: "c7-s1", title: "Section 1: Problem Framing", progress: 85,
        videos: [
          { id: "c7-s1-v1", number: 1, title: "Defining a strong problem statement", duration: "15 Mins 00 Secs", viewed: true },
          { id: "c7-s1-v2", number: 2, title: "Scoping your dataset", duration: "18 Mins 40 Secs", viewed: true },
          { id: "c7-s1-v3", number: 3, title: "Capstone rubric walkthrough", duration: "12 Mins 20 Secs", viewed: true },
        ],
        presentations: [
          { id: "c7-s1-p1", title: "Problem statement template", sizeKb: "415 KB", viewed: true },
          { id: "c7-s1-p2", title: "Capstone rubric PDF", sizeKb: "620 KB", viewed: true },
        ],
      },
      {
        id: "c7-s2", title: "Section 2: Milestone Reviews", progress: 45,
        videos: [
          { id: "c7-s2-v1", number: 4, title: "Milestone 1: EDA & data prep", duration: "20 Mins 30 Secs", viewed: true },
          { id: "c7-s2-v2", number: 5, title: "Milestone 2: Model baseline", duration: "22 Mins 15 Secs" },
          { id: "c7-s2-v3", number: 6, title: "Milestone 3: Improvement iterations", duration: "24 Mins 00 Secs" },
          { id: "c7-s2-v4", number: 7, title: "Final presentation tips", duration: "16 Mins 10 Secs" },
        ],
        presentations: [
          { id: "c7-s2-p1", title: "Review feedback template", sizeKb: "380 KB" },
          { id: "c7-s2-p2", title: "Milestone checklist", sizeKb: "245 KB" },
        ],
      },
    ],
  },

  // ── Past courses ────────────────────────────────────────────────────────
  p1: {
    courseId: "p1",
    sections: [
      {
        id: "p1-s1", title: "Section 1: Core Python", progress: 100,
        videos: [
          { id: "p1-s1-v1", number: 1, title: "Python environment setup", duration: "12 Mins 30 Secs", viewed: true },
          { id: "p1-s1-v2", number: 2, title: "Variables, types & operators", duration: "18 Mins 15 Secs", viewed: true },
          { id: "p1-s1-v3", number: 3, title: "Control flow: if, loops", duration: "21 Mins 40 Secs", viewed: true },
        ],
        presentations: [
          { id: "p1-s1-p1", title: "Python cheatsheet", sizeKb: "842 KB", viewed: true },
        ],
      },
      {
        id: "p1-s2", title: "Section 2: Data Structures", progress: 100,
        videos: [
          { id: "p1-s2-v1", number: 4, title: "Lists, tuples & dictionaries", duration: "22 Mins 10 Secs", viewed: true },
          { id: "p1-s2-v2", number: 5, title: "Comprehensions & generators", duration: "20 Mins 00 Secs", viewed: true },
          { id: "p1-s2-v3", number: 6, title: "File I/O & error handling", duration: "16 Mins 45 Secs", viewed: true },
        ],
        presentations: [
          { id: "p1-s2-p1", title: "Data structures reference", sizeKb: "755 KB", viewed: true },
          { id: "p1-s2-p2", title: "Exercise set", sizeKb: "289 KB", viewed: true },
        ],
      },
    ],
  },
  p2: {
    courseId: "p2",
    sections: [
      {
        id: "p2-s1", title: "Section 1: SQL Fundamentals", progress: 100,
        videos: [
          { id: "p2-s1-v1", number: 1, title: "SELECT, WHERE & ORDER BY", duration: "15 Mins 20 Secs", viewed: true },
          { id: "p2-s1-v2", number: 2, title: "GROUP BY & aggregate functions", duration: "18 Mins 10 Secs", viewed: true },
          { id: "p2-s1-v3", number: 3, title: "INNER, LEFT & RIGHT JOINs", duration: "23 Mins 45 Secs", viewed: true },
        ],
        presentations: [
          { id: "p2-s1-p1", title: "SQL quick reference", sizeKb: "612 KB", viewed: true },
        ],
      },
      {
        id: "p2-s2", title: "Section 2: Advanced SQL", progress: 100,
        videos: [
          { id: "p2-s2-v1", number: 4, title: "Subqueries & CTEs", duration: "26 Mins 30 Secs", viewed: true },
          { id: "p2-s2-v2", number: 5, title: "Window functions: ROW_NUMBER, RANK", duration: "24 Mins 15 Secs", viewed: true },
          { id: "p2-s2-v3", number: 6, title: "Performance & indexing basics", duration: "21 Mins 40 Secs", viewed: true },
        ],
        presentations: [
          { id: "p2-s2-p1", title: "Window functions reference", sizeKb: "780 KB", viewed: true },
          { id: "p2-s2-p2", title: "Practice problem set", sizeKb: "320 KB", viewed: true },
        ],
      },
    ],
  },
  p3: {
    courseId: "p3",
    sections: [
      {
        id: "p3-s1", title: "Section 1: EDA Foundations", progress: 100,
        videos: [
          { id: "p3-s1-v1", number: 1, title: "Understanding your dataset", duration: "16 Mins 00 Secs", viewed: true },
          { id: "p3-s1-v2", number: 2, title: "Descriptive statistics in practice", duration: "20 Mins 30 Secs", viewed: true },
          { id: "p3-s1-v3", number: 3, title: "Handling missing values & outliers", duration: "22 Mins 15 Secs", viewed: true },
        ],
        presentations: [
          { id: "p3-s1-p1", title: "EDA checklist", sizeKb: "520 KB", viewed: true },
        ],
      },
      {
        id: "p3-s2", title: "Section 2: Visualisation & Insights", progress: 100,
        videos: [
          { id: "p3-s2-v1", number: 4, title: "Histograms, box plots & scatter plots", duration: "19 Mins 40 Secs", viewed: true },
          { id: "p3-s2-v2", number: 5, title: "Correlation & heatmaps", duration: "17 Mins 10 Secs", viewed: true },
          { id: "p3-s2-v3", number: 6, title: "Communicating findings", duration: "14 Mins 50 Secs", viewed: true },
        ],
        presentations: [
          { id: "p3-s2-p1", title: "EDA slide deck template", sizeKb: "680 KB", viewed: true },
          { id: "p3-s2-p2", title: "Visualisation exercise", sizeKb: "310 KB", viewed: true },
        ],
      },
    ],
  },
  p4: {
    courseId: "p4",
    sections: [
      {
        id: "p4-s1", title: "Section 1: Probability & Distributions", progress: 100,
        videos: [
          { id: "p4-s1-v1", number: 1, title: "Probability fundamentals", duration: "17 Mins 00 Secs", viewed: true },
          { id: "p4-s1-v2", number: 2, title: "Normal & binomial distributions", duration: "22 Mins 30 Secs", viewed: true },
          { id: "p4-s1-v3", number: 3, title: "Central limit theorem", duration: "19 Mins 45 Secs", viewed: true },
        ],
        presentations: [
          { id: "p4-s1-p1", title: "Distribution cheatsheet", sizeKb: "920 KB", viewed: true },
        ],
      },
      {
        id: "p4-s2", title: "Section 2: Hypothesis Testing", progress: 100,
        videos: [
          { id: "p4-s2-v1", number: 4, title: "t-tests & z-tests", duration: "25 Mins 10 Secs", viewed: true },
          { id: "p4-s2-v2", number: 5, title: "Chi-square & ANOVA", duration: "28 Mins 00 Secs", viewed: true },
          { id: "p4-s2-v3", number: 6, title: "p-values & significance levels", duration: "18 Mins 30 Secs", viewed: true },
        ],
        presentations: [
          { id: "p4-s2-p1", title: "Statistical test selector", sizeKb: "315 KB", viewed: true },
          { id: "p4-s2-p2", title: "Hypothesis testing guide", sizeKb: "680 KB", viewed: true },
        ],
      },
    ],
  },
  p5: {
    courseId: "p5",
    sections: [
      {
        id: "p5-s1", title: "Section 1: Feature Engineering", progress: 100,
        videos: [
          { id: "p5-s1-v1", number: 1, title: "Encoding categorical variables", duration: "18 Mins 20 Secs", viewed: true },
          { id: "p5-s1-v2", number: 2, title: "Feature scaling & normalisation", duration: "16 Mins 00 Secs", viewed: true },
          { id: "p5-s1-v3", number: 3, title: "Dimensionality reduction: PCA", duration: "24 Mins 10 Secs", viewed: true },
        ],
        presentations: [
          { id: "p5-s1-p1", title: "Feature engineering playbook", sizeKb: "640 KB", viewed: true },
        ],
      },
      {
        id: "p5-s2", title: "Section 2: Model Selection", progress: 100,
        videos: [
          { id: "p5-s2-v1", number: 4, title: "Comparing classifiers & regressors", duration: "22 Mins 45 Secs", viewed: true },
          { id: "p5-s2-v2", number: 5, title: "Cross-validation strategies", duration: "20 Mins 30 Secs", viewed: true },
          { id: "p5-s2-v3", number: 6, title: "Pipelines in scikit-learn", duration: "19 Mins 15 Secs", viewed: true },
        ],
        presentations: [
          { id: "p5-s2-p1", title: "Model comparison worksheet", sizeKb: "490 KB", viewed: true },
          { id: "p5-s2-p2", title: "sklearn pipeline guide", sizeKb: "360 KB", viewed: true },
        ],
      },
    ],
  },
  p6: {
    courseId: "p6",
    sections: [
      {
        id: "p6-s1", title: "Section 1: Excel Essentials", progress: 100,
        videos: [
          { id: "p6-s1-v1", number: 1, title: "Formulas & functions overview", duration: "14 Mins 30 Secs", viewed: true },
          { id: "p6-s1-v2", number: 2, title: "VLOOKUP, INDEX & MATCH", duration: "19 Mins 00 Secs", viewed: true },
          { id: "p6-s1-v3", number: 3, title: "Conditional formatting", duration: "12 Mins 20 Secs", viewed: true },
        ],
        presentations: [
          { id: "p6-s1-p1", title: "Excel formula cheatsheet", sizeKb: "480 KB", viewed: true },
        ],
      },
      {
        id: "p6-s2", title: "Section 2: Pivot Tables & Dashboards", progress: 100,
        videos: [
          { id: "p6-s2-v1", number: 4, title: "Building pivot tables", duration: "21 Mins 40 Secs", viewed: true },
          { id: "p6-s2-v2", number: 5, title: "Charts & slicers", duration: "17 Mins 55 Secs", viewed: true },
          { id: "p6-s2-v3", number: 6, title: "Dashboard layout best practices", duration: "16 Mins 10 Secs", viewed: true },
        ],
        presentations: [
          { id: "p6-s2-p1", title: "Dashboard template", sizeKb: "1.2 MB", viewed: true },
          { id: "p6-s2-p2", title: "Pivot table exercise", sizeKb: "340 KB", viewed: true },
        ],
      },
    ],
  },
  p7: {
    courseId: "p7",
    sections: [
      {
        id: "p7-s1", title: "Section 1: Pandas Fundamentals", progress: 100,
        videos: [
          { id: "p7-s1-v1", number: 1, title: "DataFrames & Series", duration: "17 Mins 00 Secs", viewed: true },
          { id: "p7-s1-v2", number: 2, title: "Filtering, sorting & groupby", duration: "21 Mins 30 Secs", viewed: true },
          { id: "p7-s1-v3", number: 3, title: "Merging & reshaping data", duration: "19 Mins 45 Secs", viewed: true },
        ],
        presentations: [
          { id: "p7-s1-p1", title: "Pandas quick reference", sizeKb: "760 KB", viewed: true },
        ],
      },
      {
        id: "p7-s2", title: "Section 2: NumPy & Data Wrangling", progress: 100,
        videos: [
          { id: "p7-s2-v1", number: 4, title: "NumPy arrays & broadcasting", duration: "18 Mins 20 Secs", viewed: true },
          { id: "p7-s2-v2", number: 5, title: "Handling missing data", duration: "14 Mins 50 Secs", viewed: true },
          { id: "p7-s2-v3", number: 6, title: "Data cleaning pipelines", duration: "22 Mins 00 Secs", viewed: true },
        ],
        presentations: [
          { id: "p7-s2-p1", title: "NumPy reference card", sizeKb: "540 KB", viewed: true },
          { id: "p7-s2-p2", title: "Wrangling exercises", sizeKb: "295 KB", viewed: true },
        ],
      },
    ],
  },
  p8: {
    courseId: "p8",
    sections: [
      {
        id: "p8-s1", title: "Section 1: Neural Network Basics", progress: 100,
        videos: [
          { id: "p8-s1-v1", number: 1, title: "Perceptrons & activation functions", duration: "20 Mins 00 Secs", viewed: true },
          { id: "p8-s1-v2", number: 2, title: "Backpropagation explained", duration: "24 Mins 30 Secs", viewed: true },
          { id: "p8-s1-v3", number: 3, title: "Training with Keras & TensorFlow", duration: "26 Mins 10 Secs", viewed: true },
        ],
        presentations: [
          { id: "p8-s1-p1", title: "Neural networks primer", sizeKb: "980 KB", viewed: true },
        ],
      },
      {
        id: "p8-s2", title: "Section 2: CNNs & RNNs", progress: 100,
        videos: [
          { id: "p8-s2-v1", number: 4, title: "Convolutional layers & pooling", duration: "28 Mins 00 Secs", viewed: true },
          { id: "p8-s2-v2", number: 5, title: "Recurrent networks & LSTMs", duration: "25 Mins 40 Secs", viewed: true },
          { id: "p8-s2-v3", number: 6, title: "Transfer learning in practice", duration: "22 Mins 15 Secs", viewed: true },
        ],
        presentations: [
          { id: "p8-s2-p1", title: "Deep learning architecture guide", sizeKb: "1.4 MB", viewed: true },
          { id: "p8-s2-p2", title: "CNN/RNN exercise notebook", sizeKb: "420 KB", viewed: true },
        ],
      },
    ],
  },
  p9: {
    courseId: "p9",
    sections: [
      {
        id: "p9-s1", title: "Section 1: KPIs & Metrics", progress: 100,
        videos: [
          { id: "p9-s1-v1", number: 1, title: "Defining business KPIs", duration: "15 Mins 30 Secs", viewed: true },
          { id: "p9-s1-v2", number: 2, title: "Funnel analysis & cohort metrics", duration: "20 Mins 00 Secs", viewed: true },
          { id: "p9-s1-v3", number: 3, title: "Revenue & retention analytics", duration: "18 Mins 45 Secs", viewed: true },
        ],
        presentations: [
          { id: "p9-s1-p1", title: "KPI framework template", sizeKb: "570 KB", viewed: true },
        ],
      },
      {
        id: "p9-s2", title: "Section 2: Dashboards & Storytelling", progress: 100,
        videos: [
          { id: "p9-s2-v1", number: 4, title: "Dashboard design principles", duration: "17 Mins 20 Secs", viewed: true },
          { id: "p9-s2-v2", number: 5, title: "Storytelling with data", duration: "19 Mins 50 Secs", viewed: true },
          { id: "p9-s2-v3", number: 6, title: "Presenting to stakeholders", duration: "16 Mins 00 Secs", viewed: true },
        ],
        presentations: [
          { id: "p9-s2-p1", title: "Business analytics slide deck", sizeKb: "890 KB", viewed: true },
          { id: "p9-s2-p2", title: "Storytelling framework", sizeKb: "410 KB", viewed: true },
        ],
      },
    ],
  },
  p10: {
    courseId: "p10",
    sections: [
      {
        id: "p10-s1", title: "Section 1: Linear Regression", progress: 100,
        videos: [
          { id: "p10-s1-v1", number: 1, title: "OLS & assumptions", duration: "19 Mins 00 Secs", viewed: true },
          { id: "p10-s1-v2", number: 2, title: "Interpreting coefficients", duration: "16 Mins 30 Secs", viewed: true },
          { id: "p10-s1-v3", number: 3, title: "Residual analysis & diagnostics", duration: "21 Mins 10 Secs", viewed: true },
        ],
        presentations: [
          { id: "p10-s1-p1", title: "Linear regression guide", sizeKb: "620 KB", viewed: true },
        ],
      },
      {
        id: "p10-s2", title: "Section 2: Logistic Regression", progress: 100,
        videos: [
          { id: "p10-s2-v1", number: 4, title: "Binary & multiclass classification", duration: "23 Mins 00 Secs", viewed: true },
          { id: "p10-s2-v2", number: 5, title: "Odds ratios & decision thresholds", duration: "18 Mins 45 Secs", viewed: true },
          { id: "p10-s2-v3", number: 6, title: "Regularised logistic regression", duration: "20 Mins 20 Secs", viewed: true },
        ],
        presentations: [
          { id: "p10-s2-p1", title: "Logistic regression reference", sizeKb: "540 KB", viewed: true },
          { id: "p10-s2-p2", title: "Regression exercise set", sizeKb: "380 KB", viewed: true },
        ],
      },
    ],
  },
  p11: {
    courseId: "p11",
    sections: [
      {
        id: "p11-s1", title: "Section 1: Time Series Fundamentals", progress: 100,
        videos: [
          { id: "p11-s1-v1", number: 1, title: "Stationarity & decomposition", duration: "20 Mins 15 Secs", viewed: true },
          { id: "p11-s1-v2", number: 2, title: "Autocorrelation & partial ACF", duration: "17 Mins 40 Secs", viewed: true },
          { id: "p11-s1-v3", number: 3, title: "ARIMA model building", duration: "25 Mins 00 Secs", viewed: true },
        ],
        presentations: [
          { id: "p11-s1-p1", title: "Time series cheatsheet", sizeKb: "700 KB", viewed: true },
        ],
      },
      {
        id: "p11-s2", title: "Section 2: Forecasting with Prophet", progress: 100,
        videos: [
          { id: "p11-s2-v1", number: 4, title: "Prophet model setup", duration: "18 Mins 30 Secs", viewed: true },
          { id: "p11-s2-v2", number: 5, title: "Seasonality & holidays", duration: "16 Mins 00 Secs", viewed: true },
          { id: "p11-s2-v3", number: 6, title: "Evaluating forecast accuracy", duration: "14 Mins 50 Secs", viewed: true },
        ],
        presentations: [
          { id: "p11-s2-p1", title: "Prophet quick start guide", sizeKb: "460 KB", viewed: true },
          { id: "p11-s2-p2", title: "Forecasting project brief", sizeKb: "290 KB", viewed: true },
        ],
      },
    ],
  },
  p12: {
    courseId: "p12",
    sections: [
      {
        id: "p12-s1", title: "Section 1: NLP Preprocessing", progress: 100,
        videos: [
          { id: "p12-s1-v1", number: 1, title: "Tokenisation & stopwords", duration: "15 Mins 00 Secs", viewed: true },
          { id: "p12-s1-v2", number: 2, title: "Stemming & lemmatisation", duration: "13 Mins 30 Secs", viewed: true },
          { id: "p12-s1-v3", number: 3, title: "TF-IDF & bag of words", duration: "19 Mins 20 Secs", viewed: true },
        ],
        presentations: [
          { id: "p12-s1-p1", title: "NLP preprocessing guide", sizeKb: "580 KB", viewed: true },
        ],
      },
      {
        id: "p12-s2", title: "Section 2: Text Classification", progress: 100,
        videos: [
          { id: "p12-s2-v1", number: 4, title: "Naive Bayes for text", duration: "18 Mins 10 Secs", viewed: true },
          { id: "p12-s2-v2", number: 5, title: "Word embeddings: Word2Vec", duration: "22 Mins 45 Secs", viewed: true },
          { id: "p12-s2-v3", number: 6, title: "Intro to transformer models", duration: "26 Mins 00 Secs", viewed: true },
        ],
        presentations: [
          { id: "p12-s2-p1", title: "Text classification notebook", sizeKb: "510 KB", viewed: true },
          { id: "p12-s2-p2", title: "NLP resources list", sizeKb: "240 KB", viewed: true },
        ],
      },
    ],
  },
  p13: {
    courseId: "p13",
    sections: [
      {
        id: "p13-s1", title: "Section 1: Cloud & AWS Basics", progress: 100,
        videos: [
          { id: "p13-s1-v1", number: 1, title: "Cloud computing overview", duration: "14 Mins 00 Secs", viewed: true },
          { id: "p13-s1-v2", number: 2, title: "S3, EC2 & IAM fundamentals", duration: "22 Mins 30 Secs", viewed: true },
          { id: "p13-s1-v3", number: 3, title: "Setting up a data pipeline on AWS", duration: "25 Mins 10 Secs", viewed: true },
        ],
        presentations: [
          { id: "p13-s1-p1", title: "AWS services reference", sizeKb: "840 KB", viewed: true },
        ],
      },
      {
        id: "p13-s2", title: "Section 2: Data Engineering on AWS", progress: 100,
        videos: [
          { id: "p13-s2-v1", number: 4, title: "Glue, Athena & Redshift intro", duration: "23 Mins 00 Secs", viewed: true },
          { id: "p13-s2-v2", number: 5, title: "Lambda functions for data processing", duration: "19 Mins 40 Secs", viewed: true },
          { id: "p13-s2-v3", number: 6, title: "Cost optimisation strategies", duration: "16 Mins 20 Secs", viewed: true },
        ],
        presentations: [
          { id: "p13-s2-p1", title: "AWS data engineering guide", sizeKb: "960 KB", viewed: true },
          { id: "p13-s2-p2", title: "Architecture diagram templates", sizeKb: "520 KB", viewed: true },
        ],
      },
    ],
  },
  p14: {
    courseId: "p14",
    sections: [
      {
        id: "p14-s1", title: "Section 1: Tableau Foundations", progress: 100,
        videos: [
          { id: "p14-s1-v1", number: 1, title: "Connecting data sources", duration: "16 Mins 40 Secs", viewed: true },
          { id: "p14-s1-v2", number: 2, title: "Building charts & maps", duration: "21 Mins 00 Secs", viewed: true },
          { id: "p14-s1-v3", number: 3, title: "Filters, parameters & actions", duration: "19 Mins 30 Secs", viewed: true },
        ],
        presentations: [
          { id: "p14-s1-p1", title: "Tableau starter guide", sizeKb: "740 KB", viewed: true },
        ],
      },
      {
        id: "p14-s2", title: "Section 2: Power BI & Dashboard Design", progress: 100,
        videos: [
          { id: "p14-s2-v1", number: 4, title: "Power BI desktop walkthrough", duration: "23 Mins 15 Secs", viewed: true },
          { id: "p14-s2-v2", number: 5, title: "DAX basics for calculated fields", duration: "20 Mins 00 Secs", viewed: true },
          { id: "p14-s2-v3", number: 6, title: "Publishing & sharing reports", duration: "14 Mins 50 Secs", viewed: true },
        ],
        presentations: [
          { id: "p14-s2-p1", title: "Power BI quick reference", sizeKb: "680 KB", viewed: true },
          { id: "p14-s2-p2", title: "Dashboard design checklist", sizeKb: "330 KB", viewed: true },
        ],
      },
    ],
  },
  p15: {
    courseId: "p15",
    sections: [
      {
        id: "p15-s1", title: "Section 1: Probability Theory", progress: 100,
        videos: [
          { id: "p15-s1-v1", number: 1, title: "Counting & permutations", duration: "16 Mins 00 Secs", viewed: true },
          { id: "p15-s1-v2", number: 2, title: "Combinations & binomial theorem", duration: "18 Mins 20 Secs", viewed: true },
          { id: "p15-s1-v3", number: 3, title: "Bayes' theorem applications", duration: "22 Mins 10 Secs", viewed: true },
        ],
        presentations: [
          { id: "p15-s1-p1", title: "Probability reference sheet", sizeKb: "480 KB", viewed: true },
        ],
      },
      {
        id: "p15-s2", title: "Section 2: Probability for ML", progress: 100,
        videos: [
          { id: "p15-s2-v1", number: 4, title: "MLE & MAP estimation", duration: "24 Mins 30 Secs", viewed: true },
          { id: "p15-s2-v2", number: 5, title: "Bayesian inference intro", duration: "20 Mins 00 Secs", viewed: true },
          { id: "p15-s2-v3", number: 6, title: "Probabilistic models overview", duration: "17 Mins 45 Secs", viewed: true },
        ],
        presentations: [
          { id: "p15-s2-p1", title: "Probability for ML guide", sizeKb: "620 KB", viewed: true },
          { id: "p15-s2-p2", title: "Practice problems", sizeKb: "360 KB", viewed: true },
        ],
      },
    ],
  },
  p16: {
    courseId: "p16",
    sections: [
      {
        id: "p16-s1", title: "Section 1: K-means Clustering", progress: 100,
        videos: [
          { id: "p16-s1-v1", number: 1, title: "K-means algorithm walkthrough", duration: "19 Mins 00 Secs", viewed: true },
          { id: "p16-s1-v2", number: 2, title: "Choosing k: Elbow & silhouette", duration: "16 Mins 30 Secs", viewed: true },
          { id: "p16-s1-v3", number: 3, title: "Initialisation strategies", duration: "14 Mins 50 Secs", viewed: true },
        ],
        presentations: [
          { id: "p16-s1-p1", title: "K-means reference guide", sizeKb: "560 KB", viewed: true },
        ],
      },
      {
        id: "p16-s2", title: "Section 2: DBSCAN & Hierarchical", progress: 100,
        videos: [
          { id: "p16-s2-v1", number: 4, title: "DBSCAN: Density-based clustering", duration: "21 Mins 20 Secs", viewed: true },
          { id: "p16-s2-v2", number: 5, title: "Hierarchical clustering & dendrograms", duration: "18 Mins 40 Secs", viewed: true },
          { id: "p16-s2-v3", number: 6, title: "Evaluating clustering quality", duration: "17 Mins 10 Secs", viewed: true },
        ],
        presentations: [
          { id: "p16-s2-p1", title: "Clustering algorithms comparison", sizeKb: "720 KB", viewed: true },
          { id: "p16-s2-p2", title: "Clustering exercise notebook", sizeKb: "390 KB", viewed: true },
        ],
      },
    ],
  },
  p17: {
    courseId: "p17",
    sections: [
      {
        id: "p17-s1", title: "Section 1: Data Ethics Principles", progress: 100,
        videos: [
          { id: "p17-s1-v1", number: 1, title: "Fairness & bias in AI systems", duration: "18 Mins 00 Secs", viewed: true },
          { id: "p17-s1-v2", number: 2, title: "Privacy, consent & data rights", duration: "16 Mins 30 Secs", viewed: true },
          { id: "p17-s1-v3", number: 3, title: "Transparency & explainability", duration: "20 Mins 15 Secs", viewed: true },
        ],
        presentations: [
          { id: "p17-s1-p1", title: "AI ethics framework", sizeKb: "650 KB", viewed: true },
        ],
      },
      {
        id: "p17-s2", title: "Section 2: Responsible AI in Practice", progress: 100,
        videos: [
          { id: "p17-s2-v1", number: 4, title: "Bias detection & mitigation", duration: "22 Mins 40 Secs", viewed: true },
          { id: "p17-s2-v2", number: 5, title: "Regulatory landscape: GDPR & AI Act", duration: "19 Mins 00 Secs", viewed: true },
          { id: "p17-s2-v3", number: 6, title: "Building an ethical review process", duration: "17 Mins 30 Secs", viewed: true },
        ],
        presentations: [
          { id: "p17-s2-p1", title: "Responsible AI checklist", sizeKb: "510 KB", viewed: true },
          { id: "p17-s2-p2", title: "Case studies in AI ethics", sizeKb: "720 KB", viewed: true },
        ],
      },
    ],
  },
  p18: {
    courseId: "p18",
    sections: [
      {
        id: "p18-s1", title: "Section 1: Advanced Query Techniques", progress: 100,
        videos: [
          { id: "p18-s1-v1", number: 1, title: "Recursive CTEs", duration: "20 Mins 00 Secs", viewed: true },
          { id: "p18-s1-v2", number: 2, title: "Dynamic SQL & pivoting", duration: "18 Mins 30 Secs", viewed: true },
          { id: "p18-s1-v3", number: 3, title: "Full-text search", duration: "15 Mins 50 Secs", viewed: true },
        ],
        presentations: [
          { id: "p18-s1-p1", title: "Advanced SQL reference", sizeKb: "790 KB", viewed: true },
        ],
      },
      {
        id: "p18-s2", title: "Section 2: Stored Procedures & Optimisation", progress: 100,
        videos: [
          { id: "p18-s2-v1", number: 4, title: "Writing stored procedures", duration: "24 Mins 10 Secs", viewed: true },
          { id: "p18-s2-v2", number: 5, title: "Indexing strategies & execution plans", duration: "22 Mins 00 Secs", viewed: true },
          { id: "p18-s2-v3", number: 6, title: "Query optimisation patterns", duration: "19 Mins 30 Secs", viewed: true },
        ],
        presentations: [
          { id: "p18-s2-p1", title: "Optimisation guide", sizeKb: "680 KB", viewed: true },
          { id: "p18-s2-p2", title: "Stored procedures exercise", sizeKb: "410 KB", viewed: true },
        ],
      },
    ],
  },
  p19: {
    courseId: "p19",
    sections: [
      {
        id: "p19-s1", title: "Section 1: Collaborative Filtering", progress: 100,
        videos: [
          { id: "p19-s1-v1", number: 1, title: "User-based & item-based CF", duration: "19 Mins 20 Secs", viewed: true },
          { id: "p19-s1-v2", number: 2, title: "Matrix factorisation: SVD", duration: "23 Mins 00 Secs", viewed: true },
          { id: "p19-s1-v3", number: 3, title: "Handling cold start problems", duration: "16 Mins 40 Secs", viewed: true },
        ],
        presentations: [
          { id: "p19-s1-p1", title: "Collaborative filtering guide", sizeKb: "630 KB", viewed: true },
        ],
      },
      {
        id: "p19-s2", title: "Section 2: Content-Based & Hybrid", progress: 100,
        videos: [
          { id: "p19-s2-v1", number: 4, title: "Content-based filtering", duration: "18 Mins 10 Secs", viewed: true },
          { id: "p19-s2-v2", number: 5, title: "Hybrid recommender architectures", duration: "21 Mins 30 Secs", viewed: true },
          { id: "p19-s2-v3", number: 6, title: "Evaluating recommender systems", duration: "17 Mins 00 Secs", viewed: true },
        ],
        presentations: [
          { id: "p19-s2-p1", title: "Recommender system design", sizeKb: "720 KB", viewed: true },
          { id: "p19-s2-p2", title: "Implementation notebook", sizeKb: "450 KB", viewed: true },
        ],
      },
    ],
  },
  p20: {
    courseId: "p20",
    sections: [
      {
        id: "p20-s1", title: "Section 1: Problem Framing", progress: 100,
        videos: [
          { id: "p20-s1-v1", number: 1, title: "Defining a strong problem statement", duration: "15 Mins 00 Secs", viewed: true },
          { id: "p20-s1-v2", number: 2, title: "Scoping your dataset", duration: "18 Mins 40 Secs", viewed: true },
          { id: "p20-s1-v3", number: 3, title: "Capstone rubric walkthrough", duration: "12 Mins 20 Secs", viewed: true },
        ],
        presentations: [
          { id: "p20-s1-p1", title: "Problem statement template", sizeKb: "415 KB", viewed: true },
        ],
      },
      {
        id: "p20-s2", title: "Section 2: Milestone Reviews", progress: 100,
        videos: [
          { id: "p20-s2-v1", number: 4, title: "Milestone 1: EDA & data prep", duration: "20 Mins 30 Secs", viewed: true },
          { id: "p20-s2-v2", number: 5, title: "Milestone 2: Model baseline", duration: "22 Mins 15 Secs", viewed: true },
          { id: "p20-s2-v3", number: 6, title: "Final presentation tips", duration: "16 Mins 10 Secs", viewed: true },
        ],
        presentations: [
          { id: "p20-s2-p1", title: "Review feedback template", sizeKb: "380 KB", viewed: true },
          { id: "p20-s2-p2", title: "Milestone checklist", sizeKb: "245 KB", viewed: true },
        ],
      },
    ],
  },
  p21: {
    courseId: "p21",
    sections: [
      {
        id: "p21-s1", title: "Section 1: Python Scripting & APIs", progress: 100,
        videos: [
          { id: "p21-s1-v1", number: 1, title: "Writing reusable scripts", duration: "17 Mins 00 Secs", viewed: true },
          { id: "p21-s1-v2", number: 2, title: "Working with REST APIs", duration: "21 Mins 30 Secs", viewed: true },
          { id: "p21-s1-v3", number: 3, title: "JSON & XML parsing", duration: "15 Mins 20 Secs", viewed: true },
        ],
        presentations: [
          { id: "p21-s1-p1", title: "Python scripting guide", sizeKb: "560 KB", viewed: true },
        ],
      },
      {
        id: "p21-s2", title: "Section 2: Automation & Scheduling", progress: 100,
        videos: [
          { id: "p21-s2-v1", number: 4, title: "Automating file operations", duration: "18 Mins 40 Secs", viewed: true },
          { id: "p21-s2-v2", number: 5, title: "Scheduling with cron & APScheduler", duration: "16 Mins 10 Secs", viewed: true },
          { id: "p21-s2-v3", number: 6, title: "Error handling & logging", duration: "14 Mins 30 Secs", viewed: true },
        ],
        presentations: [
          { id: "p21-s2-p1", title: "Automation project template", sizeKb: "490 KB", viewed: true },
          { id: "p21-s2-p2", title: "Scheduling exercise", sizeKb: "280 KB", viewed: true },
        ],
      },
    ],
  },
  p22: {
    courseId: "p22",
    sections: [
      {
        id: "p22-s1", title: "Section 1: Structuring Your Presentation", progress: 100,
        videos: [
          { id: "p22-s1-v1", number: 1, title: "The data story arc", duration: "14 Mins 00 Secs", viewed: true },
          { id: "p22-s1-v2", number: 2, title: "Slide design principles", duration: "17 Mins 30 Secs", viewed: true },
          { id: "p22-s1-v3", number: 3, title: "Opening strong & closing memorably", duration: "13 Mins 50 Secs", viewed: true },
        ],
        presentations: [
          { id: "p22-s1-p1", title: "Presentation structure template", sizeKb: "420 KB", viewed: true },
        ],
      },
      {
        id: "p22-s2", title: "Section 2: Delivery & Communication", progress: 100,
        videos: [
          { id: "p22-s2-v1", number: 4, title: "Vocal delivery & pacing", duration: "16 Mins 20 Secs", viewed: true },
          { id: "p22-s2-v2", number: 5, title: "Handling Q&A confidently", duration: "15 Mins 00 Secs", viewed: true },
          { id: "p22-s2-v3", number: 6, title: "Virtual presentation best practices", duration: "18 Mins 40 Secs", viewed: true },
        ],
        presentations: [
          { id: "p22-s2-p1", title: "Delivery skills checklist", sizeKb: "350 KB", viewed: true },
          { id: "p22-s2-p2", title: "Q&A facilitation guide", sizeKb: "265 KB", viewed: true },
        ],
      },
    ],
  },
  p23: {
    courseId: "p23",
    sections: [
      {
        id: "p23-s1", title: "Section 1: Decision Trees & Random Forests", progress: 100,
        videos: [
          { id: "p23-s1-v1", number: 1, title: "Decision tree fundamentals", duration: "18 Mins 00 Secs", viewed: true },
          { id: "p23-s1-v2", number: 2, title: "Bagging & random forests", duration: "22 Mins 30 Secs", viewed: true },
          { id: "p23-s1-v3", number: 3, title: "Feature importance & tuning", duration: "19 Mins 10 Secs", viewed: true },
        ],
        presentations: [
          { id: "p23-s1-p1", title: "Random forest guide", sizeKb: "680 KB", viewed: true },
        ],
      },
      {
        id: "p23-s2", title: "Section 2: Gradient Boosting & XGBoost", progress: 100,
        videos: [
          { id: "p23-s2-v1", number: 4, title: "Boosting concepts: AdaBoost", duration: "20 Mins 00 Secs", viewed: true },
          { id: "p23-s2-v2", number: 5, title: "XGBoost & LightGBM in practice", duration: "25 Mins 20 Secs", viewed: true },
          { id: "p23-s2-v3", number: 6, title: "Hyperparameter tuning for boosters", duration: "21 Mins 40 Secs", viewed: true },
        ],
        presentations: [
          { id: "p23-s2-p1", title: "Gradient boosting reference", sizeKb: "760 KB", viewed: true },
          { id: "p23-s2-p2", title: "XGBoost exercise notebook", sizeKb: "430 KB", viewed: true },
        ],
      },
    ],
  },
  p24: {
    courseId: "p24",
    sections: [
      {
        id: "p24-s1", title: "Section 1: Database Design Principles", progress: 100,
        videos: [
          { id: "p24-s1-v1", number: 1, title: "Entities, attributes & relationships", duration: "16 Mins 40 Secs", viewed: true },
          { id: "p24-s1-v2", number: 2, title: "ER diagrams in practice", duration: "20 Mins 10 Secs", viewed: true },
          { id: "p24-s1-v3", number: 3, title: "Normalisation: 1NF to 3NF", duration: "23 Mins 30 Secs", viewed: true },
        ],
        presentations: [
          { id: "p24-s1-p1", title: "ER modelling guide", sizeKb: "840 KB", viewed: true },
        ],
      },
      {
        id: "p24-s2", title: "Section 2: Advanced Database Concepts", progress: 100,
        videos: [
          { id: "p24-s2-v1", number: 4, title: "Denormalisation & trade-offs", duration: "18 Mins 00 Secs", viewed: true },
          { id: "p24-s2-v2", number: 5, title: "NoSQL vs relational databases", duration: "21 Mins 15 Secs", viewed: true },
          { id: "p24-s2-v3", number: 6, title: "Transactions & ACID properties", duration: "17 Mins 40 Secs", viewed: true },
        ],
        presentations: [
          { id: "p24-s2-p1", title: "Database design checklist", sizeKb: "590 KB", viewed: true },
          { id: "p24-s2-p2", title: "Normalisation exercise", sizeKb: "310 KB", viewed: true },
        ],
      },
    ],
  },
  p25: {
    courseId: "p25",
    sections: [
      {
        id: "p25-s1", title: "Section 1: Hypothesis Testing Framework", progress: 100,
        videos: [
          { id: "p25-s1-v1", number: 1, title: "Formulating business hypotheses", duration: "15 Mins 30 Secs", viewed: true },
          { id: "p25-s1-v2", number: 2, title: "A/B testing design", duration: "20 Mins 00 Secs", viewed: true },
          { id: "p25-s1-v3", number: 3, title: "Sample size & statistical power", duration: "18 Mins 20 Secs", viewed: true },
        ],
        presentations: [
          { id: "p25-s1-p1", title: "Hypothesis testing workbook", sizeKb: "570 KB", viewed: true },
        ],
      },
      {
        id: "p25-s2", title: "Section 2: A/B Testing in Business", progress: 100,
        videos: [
          { id: "p25-s2-v1", number: 4, title: "Running experiments end-to-end", duration: "22 Mins 10 Secs", viewed: true },
          { id: "p25-s2-v2", number: 5, title: "Interpreting results for stakeholders", duration: "17 Mins 40 Secs", viewed: true },
          { id: "p25-s2-v3", number: 6, title: "Common pitfalls & biases", duration: "16 Mins 00 Secs", viewed: true },
        ],
        presentations: [
          { id: "p25-s2-p1", title: "A/B testing playbook", sizeKb: "650 KB", viewed: true },
          { id: "p25-s2-p2", title: "Results reporting template", sizeKb: "320 KB", viewed: true },
        ],
      },
    ],
  },
  p26: {
    courseId: "p26",
    sections: [
      {
        id: "p26-s1", title: "Section 1: Computer Vision Fundamentals", progress: 100,
        videos: [
          { id: "p26-s1-v1", number: 1, title: "Image representation & preprocessing", duration: "17 Mins 20 Secs", viewed: true },
          { id: "p26-s1-v2", number: 2, title: "CNN architectures: VGG, ResNet", duration: "25 Mins 00 Secs", viewed: true },
          { id: "p26-s1-v3", number: 3, title: "Transfer learning for vision", duration: "21 Mins 30 Secs", viewed: true },
        ],
        presentations: [
          { id: "p26-s1-p1", title: "Computer vision reference", sizeKb: "1.1 MB", viewed: true },
        ],
      },
      {
        id: "p26-s2", title: "Section 2: Object Detection & Segmentation", progress: 100,
        videos: [
          { id: "p26-s2-v1", number: 4, title: "YOLO & Faster R-CNN overview", duration: "26 Mins 40 Secs", viewed: true },
          { id: "p26-s2-v2", number: 5, title: "Semantic vs instance segmentation", duration: "22 Mins 10 Secs", viewed: true },
          { id: "p26-s2-v3", number: 6, title: "Deploying vision models", duration: "19 Mins 00 Secs", viewed: true },
        ],
        presentations: [
          { id: "p26-s2-p1", title: "Object detection guide", sizeKb: "940 KB", viewed: true },
          { id: "p26-s2-p2", title: "Vision project brief", sizeKb: "380 KB", viewed: true },
        ],
      },
    ],
  },
};

export const demoExternalBusy: Busy[] = [
  {
    id: "b1",
    title: "Busy (Calendar)",
    dateYmd: "2026-02-22",
    start: minutes(10),
    end: minutes(11, 30),
  },
];

export const demoCohortStarts: CohortStart[] = [
  { id: "cs1", program: "PGP-DS", cohort: "Cohort Mar", dateYmd: "2026-03-02", note: "New PGP cohort starts" },
  { id: "cs2", program: "PGP-AIML", cohort: "Cohort Mar", dateYmd: "2026-03-09", note: "New PGP cohort starts" },
  { id: "cs3", program: "PGP-BA", cohort: "Cohort Feb", dateYmd: "2026-02-23", note: "New PGP cohort starts" },
];

export const demoCourseCatalog: CourseCatalogItem[] = [
  // ── Current courses ──────────────────────────────────────────────────────
  { id: "c1", title: "Python refresher: Data structures & functions", program: "PGP-DS", batch: "Cohort Mar", role: "Teacher", topics: ["python"], isNew: false, status: "current", color: "#3B82F6", pattern: 1 },
  { id: "c2", title: "SQL recap: Joins, aggregations & window functions", program: "PGP-DS", batch: "Cohort Mar", role: "Course Mentor", topics: ["sql"], isNew: false, status: "current", color: "#F59E0B", pattern: 6 },
  { id: "c3", title: "Statistics primer: Distributions & hypothesis testing", program: "PGP-SE", batch: "Cohort Mar", role: "Industry Expert", topics: ["statistics", "statistic"], isNew: false, status: "current", color: "#0D9488", pattern: 4 },
  { id: "c4", title: "ML essentials: Model evaluation & overfitting", program: "AIML", batch: "Cohort Mar", role: "Learner Success", topics: ["ml", "machine learning", "model", "evaluation", "overfitting"], isNew: true, status: "current", color: "#7C3AED", pattern: 2 },
  { id: "c5", title: "Mentor skills: Running effective sessions", program: "Core", batch: "Faculty Enablement", role: "Teacher", topics: ["mentor", "orientation", "capstone"], isNew: false, status: "current", color: "#0EA5E9", pattern: 5 },
  { id: "c6", title: "Data visualisation: Storytelling with charts", program: "PGP-BA", batch: "Cohort Mar", role: "Teacher", topics: ["visualization", "data viz", "dashboard", "chart"], isNew: true, status: "current", color: "#EC4899", pattern: 3 },
  { id: "c7", title: "Capstone guidance: Problem framing & milestone reviews", program: "PGP-DS", batch: "Cohort Mar", role: "Capstone Mentor", topics: ["capstone", "capstone review"], isNew: false, status: "current", color: "#64748B", pattern: 10 },

  // ── Past courses ─────────────────────────────────────────────────────────
  { id: "p1",  title: "Python refresher: Data structures & functions",              program: "PGP-DS",  batch: "Cohort Feb", role: "Teacher",          topics: ["python"],                                                     isNew: false, status: "past", color: "#3B82F6", pattern: 1  },
  { id: "p2",  title: "SQL recap: Joins, aggregations & window functions",           program: "AIML",    batch: "Cohort Feb", role: "Course Mentor",    topics: ["sql"],                                                        isNew: false, status: "past", color: "#F59E0B", pattern: 6  },
  { id: "p3",  title: "Exploratory data analysis: From raw data to insights",       program: "PGP-DS",  batch: "Cohort Jan", role: "Teacher",          topics: ["exploratory data analysis", "eda", "visualization"],          isNew: false, status: "past", color: "#14B8A6", pattern: 3  },
  { id: "p4",  title: "Statistics primer: Distributions & hypothesis testing",      program: "PGP-BA",  batch: "Cohort Feb", role: "Industry Expert",  topics: ["statistics", "statistic", "probability"],                     isNew: false, status: "past", color: "#0D9488", pattern: 4  },
  { id: "p5",  title: "Feature engineering & model selection",                      program: "AIML",    batch: "Cohort Jan", role: "Course Mentor",    topics: ["feature engineering", "model", "ml", "machine learning"],     isNew: false, status: "past", color: "#7C3AED", pattern: 2  },
  { id: "p6",  title: "Excel foundations: Pivot tables & dashboards",               program: "PGDM",    batch: "Cohort Jan", role: "Teacher",          topics: ["excel"],                                                      isNew: false, status: "past", color: "#10B981", pattern: 11 },
  { id: "p7",  title: "Data wrangling with Pandas & NumPy",                         program: "PGP-DS",  batch: "Cohort Nov", role: "Teacher",          topics: ["python", "pandas", "numpy"],                                  isNew: false, status: "past", color: "#3B82F6", pattern: 1  },
  { id: "p8",  title: "Deep learning fundamentals: CNNs & RNNs",                   program: "AIML",    batch: "Cohort Oct", role: "Industry Expert",  topics: ["deep learning", "neural network", "cnn", "rnn"],             isNew: false, status: "past", color: "#EF4444", pattern: 7  },
  { id: "p9",  title: "Business analytics: KPIs, dashboards & storytelling",       program: "PGP-BA",  batch: "Cohort Nov", role: "Teacher",          topics: ["business analytics", "kpi", "dashboard", "storytelling"],    isNew: false, status: "past", color: "#F43F5E", pattern: 5  },
  { id: "p10", title: "Regression analysis: Linear & logistic models",              program: "PGP-DS",  batch: "Cohort Oct", role: "Course Mentor",    topics: ["regression", "linear", "logistic", "model"],                 isNew: false, status: "past", color: "#7C3AED", pattern: 9  },
  { id: "p11", title: "Time series forecasting: ARIMA & Prophet",                   program: "AIML",    batch: "Cohort Sep", role: "Industry Expert",  topics: ["time series", "arima", "forecasting"],                       isNew: false, status: "past", color: "#06B6D4", pattern: 8  },
  { id: "p12", title: "Natural language processing: Text classification basics",    program: "PGP-SE",  batch: "Cohort Sep", role: "Teacher",          topics: ["nlp", "natural language", "text", "classification"],         isNew: false, status: "past", color: "#6366F1", pattern: 5  },
  { id: "p13", title: "Cloud fundamentals: AWS for data practitioners",             program: "PGP-DS",  batch: "Cohort Aug", role: "Industry Expert",  topics: ["cloud", "aws", "data engineering"],                          isNew: false, status: "past", color: "#F97316", pattern: 8  },
  { id: "p14", title: "Tableau & Power BI: Interactive dashboard design",           program: "PGP-BA",  batch: "Cohort Aug", role: "Course Mentor",    topics: ["tableau", "power bi", "dashboard", "visualization"],         isNew: false, status: "past", color: "#8B5CF6", pattern: 3  },
  { id: "p15", title: "Probability & combinatorics for ML",                         program: "PGP-DS",  batch: "Cohort Jul", role: "Teacher",          topics: ["probability", "statistics", "combinatorics"],                isNew: false, status: "past", color: "#0D9488", pattern: 4  },
  { id: "p16", title: "Clustering algorithms: K-means, DBSCAN & hierarchical",     program: "AIML",    batch: "Cohort Jul", role: "Course Mentor",    topics: ["clustering", "k-means", "dbscan", "ml", "machine learning"], isNew: false, status: "past", color: "#7C3AED", pattern: 2  },
  { id: "p17", title: "Data ethics & responsible AI principles",                    program: "Core",    batch: "Faculty Jul", role: "Teacher",          topics: ["ethics", "responsible ai", "bias"],                          isNew: false, status: "past", color: "#64748B", pattern: 11 },
  { id: "p18", title: "SQL advanced: CTEs, stored procedures & optimisation",       program: "PGDM",    batch: "Cohort Jun", role: "Industry Expert",  topics: ["sql", "cte", "stored procedures"],                           isNew: false, status: "past", color: "#F59E0B", pattern: 6  },
  { id: "p19", title: "Recommender systems: Collaborative & content-based",         program: "AIML",    batch: "Cohort Jun", role: "Course Mentor",    topics: ["recommender", "collaborative filtering", "ml"],              isNew: false, status: "past", color: "#A855F7", pattern: 2  },
  { id: "p20", title: "Capstone guidance: Structuring your final project",          program: "PGP-DS",  batch: "Cohort May", role: "Capstone Mentor",  topics: ["capstone", "project", "mentor"],                             isNew: false, status: "past", color: "#64748B", pattern: 10 },
  { id: "p21", title: "Python for automation: Scripts, APIs & scheduling",          program: "PGP-SE",  batch: "Cohort May", role: "Teacher",          topics: ["python", "automation", "api"],                               isNew: false, status: "past", color: "#3B82F6", pattern: 1  },
  { id: "p22", title: "Presentation skills for data professionals",                 program: "Core",    batch: "Faculty May", role: "Teacher",          topics: ["presentation", "communication", "storytelling"],             isNew: false, status: "past", color: "#FB923C", pattern: 5  },
  { id: "p23", title: "Random forests & gradient boosting in practice",             program: "AIML",    batch: "Cohort Apr", role: "Industry Expert",  topics: ["random forest", "gradient boosting", "xgboost", "ml"],       isNew: false, status: "past", color: "#84CC16", pattern: 7  },
  { id: "p24", title: "Database design: Normalisation & ER modelling",              program: "PGP-SE",  batch: "Cohort Apr", role: "Course Mentor",    topics: ["database", "sql", "normalisation", "er model"],              isNew: false, status: "past", color: "#EF4444", pattern: 6  },
  { id: "p25", title: "Hypothesis testing in business decisions",                   program: "PGP-BA",  batch: "Cohort Mar", role: "Industry Expert",  topics: ["hypothesis testing", "statistics", "a/b testing"],           isNew: false, status: "past", color: "#0D9488", pattern: 9  },
  { id: "p26", title: "Computer vision: Object detection & image segmentation",     program: "AIML",    batch: "Cohort Mar", role: "Teacher",          topics: ["computer vision", "object detection", "deep learning"],      isNew: false, status: "past", color: "#1D4ED8", pattern: 4  },
];
