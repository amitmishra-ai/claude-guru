import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import DoNotDisturbOnOutlinedIcon from "@mui/icons-material/DoNotDisturbOnOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { SessionCard, STATUS_SCHEDULED, STATUS_CONFIRMED, STATUS_DECLINED } from "@/components/shared/SessionCard";
import { minutes, fmtDateNice } from "@/lib/helpers";
import { useAppSelector } from "@/store";
import type { GuruRole } from "@/store/slices/devPanelSlice";

/* ── Section wrapper ── */

function ComponentSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.25 }}>{title}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>{description}</Typography>
      {children}
    </Box>
  );
}

/* ── Star rating row (numeric + stars) for Residency & Online Session ── */
function StarRatingNumeric({ rating }: { rating: number }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
      <StarOutlinedIcon sx={{ fontSize: 14, color: "var(--gl-star-color)" }} />
      <Typography variant="subtitle2" fontWeight={600}>{rating.toFixed(1)}</Typography>
    </Stack>
  );
}

/* ── Star rating row (icons only, no numeric) for Evaluation & Moderation ── */
function StarRatingIcons({ rating }: { rating: number }) {
  return (
    <Stack direction="row" spacing={0.25} alignItems="center">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarOutlinedIcon
          key={i}
          sx={{ fontSize: 14, color: i <= Math.round(rating) ? "var(--gl-star-color)" : "action.disabled" }}
        />
      ))}
    </Stack>
  );
}

/* ── Planned Event Card ── */
function PlannedEventCard({ sessionType, title, batch, contactEmail, startDateYmd, endDateYmd }: {
  sessionType: string; title: string; batch: string; contactEmail: string; startDateYmd: string; endDateYmd: string;
}) {
  return (
    <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem", minWidth: 0 }}>
          {sessionType}: {title}
        </Typography>
        <Chip label="To be confirmed" size="small" sx={{ bgcolor: "var(--gl-status-pending-bg)", color: "var(--gl-status-pending-text)", border: "1px solid var(--gl-status-pending-border)", fontWeight: 500, fontSize: "0.75rem", flexShrink: 0 }} />
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary" }}>
        <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
        <Typography variant="caption" color="text.secondary">
          {fmtDateNice(startDateYmd)} &ndash; {fmtDateNice(endDateYmd)} &bull; {batch}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.25 }}>
        <MailOutlineIcon sx={{ fontSize: 12, color: "text.secondary" }} />
        <Typography variant="caption" color="text.secondary">{contactEmail}</Typography>
      </Stack>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ROLE → ACTIVITY CARD CONFIGS
   ══════════════════════════════════════════════════════════════════════════ */

function ResidencyCards() {
  return (
    <>
      {/* Confirmed */}
      <ComponentSection title="Residency — Confirmed" description="In-person teaching session. Shows date range, course (LMS link), batch, city, PM email, day-wise time slots.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Program Overview (All)"
            sessionType="Residency"
            batch="AIML Online March 26 A"
            dateYmd="2026-03-20"
            start={minutes(9)}
            end={minutes(17)}
            group="Batch 12 — Bangalore"
            status={STATUS_CONFIRMED()}
            actions={
              <>
                <Button variant="soft" size="small" startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />}>Course page</Button>
                <Button variant="soft" size="small" startIcon={<LocationOnOutlinedIcon sx={{ fontSize: 16 }} />}>View on map</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small">View details</Button>}
          />
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
            <MailOutlineIcon sx={{ fontSize: 12, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">pm.contact@greatlearning.in</Typography>
          </Stack>
        </Card>
      </ComponentSection>

      {/* Scheduled */}
      <ComponentSection title="Residency — Scheduled" description="Residency awaiting guru confirmation. Confirm or decline availability.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Program Overview (All)"
            sessionType="Residency"
            batch="AIML Online March 26 A"
            dateYmd="2026-03-25"
            start={minutes(9)}
            end={minutes(17)}
            group="Batch 12 — Bangalore"
            status={STATUS_SCHEDULED}
            actions={
              <>
                <Button startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="contained">Confirm</Button>
                <Button startIcon={<DoNotDisturbOnOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="soft">I'm unavailable</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small">View details</Button>}
          />
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
            <MailOutlineIcon sx={{ fontSize: 12, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">pm.contact@greatlearning.in</Typography>
          </Stack>
        </Card>
      </ComponentSection>

      {/* Tentative */}
      <ComponentSection title="Residency — Tentative" description="Planned residency, slots not yet confirmed.">
        <PlannedEventCard sessionType="Residency" title="Program Overview (All)" batch="AIML Online March 26 A" contactEmail="pm.contact@greatlearning.in" startDateYmd="2026-04-10" endDateYmd="2026-04-14" />
      </ComponentSection>

      {/* Completed — Gathering feedback */}
      <ComponentSection title="Residency — Completed (Gathering feedback)" description="Session done but learners haven't rated yet (within 30 days). No rating shown, payment pending.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Program Overview (All)"
            sessionType="Residency"
            batch="AIML Online March 26 A"
            dateYmd="2026-03-10"
            start={minutes(9)}
            end={minutes(17)}
            topRight={<Typography variant="caption" color="text.secondary">Gathering feedback!</Typography>}
            actions={
              <Button variant="soft" size="small" startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />}>View in payments</Button>
            }
          />
          <Typography variant="caption" color="var(--gl-status-pending-text)" sx={{ mt: 0.5, display: "block" }}>Payment pending</Typography>
        </Card>
      </ComponentSection>

      {/* Completed — with rating + payment processed */}
      <ComponentSection title="Residency — Completed" description="Past residency. Star rating + numeric score, Detailed Feedback button alongside rating, payment processed.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Program Overview (All)"
            sessionType="Residency"
            batch="AIML Online March 26 A"
            dateYmd="2026-03-05"
            start={minutes(9)}
            end={minutes(17)}
            topRight={<StarRatingNumeric rating={4.2} />}
            actions={
              <>
                <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Detailed Feedback</Button>
                <Button variant="soft" size="small" startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />}>View in payments</Button>
              </>
            }
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>Payment Processed, TXN ID: TXN-GL-8F3K2Q</Typography>
        </Card>
      </ComponentSection>
    </>
  );
}

function OnlineSessionCards() {
  return (
    <>
      {/* Confirmed */}
      <ComponentSection title="Online Session — Confirmed" description="Virtual session with join link, session materials, poll actions. Shows topic, batch, contact email, time, participants.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Statistics for Data Science"
            sessionType="Online session"
            topic="M5 W2 | Hypothesis Testing & Confidence Intervals"
            batch="PGPDS.O.MAR26.A"
            dateYmd="2026-03-18"
            start={minutes(18)}
            end={minutes(20)}
            group="Group 07 (High work, mixed prog)"
            status={STATUS_CONFIRMED()}
            actions={
              <>
                <Button variant="contained" size="small" startIcon={<LinkOutlinedIcon sx={{ fontSize: 16 }} />}>Join session</Button>
                <Button variant="soft" size="small" startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}>Session Materials</Button>
                <Button variant="soft" size="small" startIcon={<PollOutlinedIcon sx={{ fontSize: 16 }} />}>Create Poll</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small">View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* Scheduled */}
      <ComponentSection title="Online Session — Scheduled" description="Unconfirmed session awaiting guru action.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Python Fundamentals"
            sessionType="Online session"
            topic="M3 W1 | Variables, Data Types & Control Flow"
            batch="PGPDS.O.MAR26.A"
            dateYmd="2026-03-20"
            start={minutes(9, 30)}
            end={minutes(11)}
            group="Group 06 (Beginner)"
            status={STATUS_SCHEDULED}
            actions={
              <>
                <Button startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="contained">Confirm</Button>
                <Button startIcon={<DoNotDisturbOnOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="soft">I'm unavailable</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small">View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* Tentative */}
      <ComponentSection title="Online Session — Tentative" description="Planned online session, time not yet confirmed.">
        <PlannedEventCard sessionType="Online session" title="Machine Learning" batch="PGP-AIML-BA-UTA-Nov25-C" contactEmail="gurus_support@greatlearning.in" startDateYmd="2026-01-22" endDateYmd="2026-02-14" />
      </ComponentSection>

      {/* Completed — Gathering feedback */}
      <ComponentSection title="Online Session — Completed (Gathering feedback)" description="Session done within 30 days, learners haven't rated yet. Recording available, payment pending.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Statistics for Data Science"
            sessionType="Online session"
            topic="M5 W2 | Hypothesis Testing"
            batch="PGPDS.O.MAR26.A"
            dateYmd="2026-03-12"
            start={minutes(18)}
            end={minutes(20)}
            topRight={<Typography variant="caption" color="text.secondary">Gathering feedback!</Typography>}
            actions={
              <>
                <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Watch recording</Button>
                <Button variant="soft" size="small" startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />}>View in payments</Button>
              </>
            }
          />
          <Typography variant="caption" color="var(--gl-status-pending-text)" sx={{ mt: 0.5, display: "block" }}>Payment pending</Typography>
        </Card>
      </ComponentSection>

      {/* Completed — No feedback collected */}
      <ComponentSection title="Online Session — Completed (No feedback)" description="Session older than 30 days with no learner ratings. Shows 'No feedback collected'.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Python Fundamentals"
            sessionType="Online session"
            topic="M3 W1 | Variables, Data Types"
            batch="PGPDS.O.MAR26.A"
            dateYmd="2026-01-15"
            start={minutes(9, 30)}
            end={minutes(11)}
            topRight={<Typography variant="caption" color="text.disabled">No feedback collected</Typography>}
            actions={
              <>
                <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Watch recording</Button>
                <Button variant="soft" size="small" startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />}>View in payments</Button>
              </>
            }
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>Payment Processed, TXN ID: TXN-GL-2B8X4Q</Typography>
        </Card>
      </ComponentSection>

      {/* Completed — with rating + payment processed */}
      <ComponentSection title="Online Session — Completed" description="Past session. Star rating + numeric score, Detailed Feedback alongside, recording link, payment processed.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Statistics for Data Science"
            sessionType="Online session"
            topic="M5 W2 | Hypothesis Testing"
            batch="PGPDS.O.MAR26.A"
            dateYmd="2026-03-05"
            start={minutes(18)}
            end={minutes(20)}
            topRight={<StarRatingNumeric rating={4.5} />}
            actions={
              <>
                <Button variant="soft" size="small" startIcon={<VideocamOutlinedIcon sx={{ fontSize: 14 }} />}>Watch recording</Button>
                <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Detailed Feedback</Button>
                <Button variant="soft" size="small" startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />}>View in payments</Button>
              </>
            }
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>Payment Processed, TXN ID: TXN-GL-7A2P9R</Typography>
        </Card>
      </ComponentSection>
    </>
  );
}

function CareerMentorOnlineSessionCards() {
  return (
    <>
      {/* 1:1 Career Session — Confirmed */}
      <ComponentSection title="Career Session (1:1) — Confirmed" description="1:1 career mentoring. Shows student name, View Details modal (resume, LinkedIn, agenda).">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Career Mentoring"
            sessionType="Career mentoring session"
            topic="Resume Review & Interview Prep"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-03-18"
            start={minutes(14)}
            end={minutes(15)}
            status={STATUS_CONFIRMED()}
            actions={
              <>
                <Button variant="contained" size="small" startIcon={<LinkOutlinedIcon sx={{ fontSize: 16 }} />}>Join session</Button>
                <Button variant="soft" size="small" startIcon={<PersonOutlinedIcon sx={{ fontSize: 16 }} />}>View Student Details</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small">View details</Button>}
          />
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
            <PersonOutlinedIcon sx={{ fontSize: 12, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">Learner: Priya Sharma</Typography>
          </Stack>
        </Card>
      </ComponentSection>

      {/* Mock Interview — Confirmed */}
      <ComponentSection title="Mock Interview — Confirmed" description="Mock interview session with Share Feedback link.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Mock Interview"
            sessionType="Career mentoring session"
            topic="Technical Round — Data Structures"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-03-19"
            start={minutes(16)}
            end={minutes(17)}
            status={STATUS_CONFIRMED()}
            actions={
              <>
                <Button variant="contained" size="small" startIcon={<LinkOutlinedIcon sx={{ fontSize: 16 }} />}>Join session</Button>
                <Button variant="soft" size="small" startIcon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 16 }} />}>Share Feedback</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small">View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* Scheduled */}
      <ComponentSection title="Career Session — Scheduled" description="Career mentoring session awaiting guru confirmation.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Career Mentoring"
            sessionType="Career mentoring session"
            topic="Portfolio Review & Job Search Strategy"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-03-22"
            start={minutes(14)}
            end={minutes(15)}
            status={STATUS_SCHEDULED}
            actions={
              <>
                <Button startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="contained">Confirm</Button>
                <Button startIcon={<DoNotDisturbOnOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="soft">I'm unavailable</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small">View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* Completed — Gathering feedback + payment pending */}
      <ComponentSection title="Career Session — Completed (Gathering feedback)" description="Session done, learners haven't rated yet. Payment pending.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Career Mentoring"
            sessionType="Career mentoring session"
            topic="Resume Review"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-03-10"
            start={minutes(14)}
            end={minutes(15)}
            topRight={<Typography variant="caption" color="text.secondary">Gathering feedback!</Typography>}
            actions={
              <Button variant="soft" size="small" startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />}>View in payments</Button>
            }
          />
          <Typography variant="caption" color="var(--gl-status-pending-text)" sx={{ mt: 0.5, display: "block" }}>Payment pending</Typography>
        </Card>
      </ComponentSection>

      {/* Completed — with rating + payment processed */}
      <ComponentSection title="Career Session — Completed" description="Past career session. Star rating + numeric score, Detailed Feedback alongside, payment processed.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Career Mentoring"
            sessionType="Career mentoring session"
            topic="Resume Review & Interview Prep"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-02-20"
            start={minutes(14)}
            end={minutes(15)}
            topRight={<StarRatingNumeric rating={4.8} />}
            actions={
              <>
                <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}>Detailed Feedback</Button>
                <Button variant="soft" size="small" startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />}>View in payments</Button>
              </>
            }
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>Payment Processed, TXN ID: TXN-GL-6D4N8T</Typography>
        </Card>
      </ComponentSection>
    </>
  );
}

function EvaluationCards() {
  return (
    <>
      {/* Confirmed */}
      <ComponentSection title="Evaluation — Confirmed" description="Assignment grading. Date range (assessment due → grading due), assignment link, student submission progress.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Linear Regression Assignment"
            sessionType="Evaluation"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-03-15"
            start={minutes(0)}
            end={minutes(23, 59)}
            status={STATUS_CONFIRMED()}
            actions={
              <>
                <Button variant="soft" size="small" startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />}>Open in SpeedGrader</Button>
                <Button variant="soft" size="small" startIcon={<GroupOutlinedIcon sx={{ fontSize: 16 }} />}>Student Progress</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small">View details</Button>}
          />
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">Assessment due: Mar 15 &bull; Grading due: Mar 22</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.25 }}>
            <MailOutlineIcon sx={{ fontSize: 12, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">gurus_support@greatlearning.in</Typography>
          </Stack>
        </Card>
      </ComponentSection>

      {/* Tentative */}
      <ComponentSection title="Evaluation — Tentative" description="Planned evaluation, dates not yet locked.">
        <PlannedEventCard sessionType="Evaluation" title="Decision Tree Assignment" batch="PGP-AIML-BA-UTA-Nov25-C" contactEmail="gurus_support@greatlearning.in" startDateYmd="2026-04-01" endDateYmd="2026-04-10" />
      </ComponentSection>

      {/* Completed — Gathering feedback + payment pending */}
      <ComponentSection title="Evaluation — Completed (Gathering feedback)" description="Grading done, learners haven't rated yet. Payment pending.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Linear Regression Assignment"
            sessionType="Evaluation"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-03-08"
            start={minutes(0)}
            end={minutes(23, 59)}
            actions={
              <>
                <Button variant="soft" size="small" startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />}>Open in SpeedGrader</Button>
                <Button variant="soft" size="small" startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />}>View in payments</Button>
              </>
            }
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>Gathering feedback!</Typography>
          <Typography variant="caption" color="var(--gl-status-pending-text)" sx={{ display: "block" }}>Payment pending</Typography>
        </Card>
      </ComponentSection>

      {/* Completed — with rating + payment processed */}
      <ComponentSection title="Evaluation — Completed" description="Past evaluation. Star icons only (no numeric score), Detailed Feedback button below stars, payment processed.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Linear Regression Assignment"
            sessionType="Evaluation"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-03-01"
            start={minutes(0)}
            end={minutes(23, 59)}
            actions={
              <>
                <Button variant="soft" size="small" startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />}>Open in SpeedGrader</Button>
                <Button variant="soft" size="small" startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />}>View in payments</Button>
              </>
            }
          />
          <Stack spacing={0.5} sx={{ mt: 0.75 }}>
            <StarRatingIcons rating={4} />
            <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />} sx={{ alignSelf: "flex-start" }}>Detailed Feedback</Button>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>Payment Processed, TXN ID: TXN-GL-5E1M3N</Typography>
        </Card>
      </ComponentSection>
    </>
  );
}

function ModerationCards() {
  return (
    <>
      {/* Confirmed */}
      <ComponentSection title="Moderation — Confirmed" description="Discussion question moderation. Date range (start → grading due), DQ link, student response progress, last active.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Impact of AI on Healthcare"
            sessionType="Moderation"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-03-15"
            start={minutes(0)}
            end={minutes(23, 59)}
            status={STATUS_CONFIRMED()}
            actions={
              <>
                <Button variant="soft" size="small" startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />}>Open Discussion</Button>
                <Button variant="soft" size="small" startIcon={<GroupOutlinedIcon sx={{ fontSize: 16 }} />}>Student Responses</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small">View details</Button>}
          />
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 12, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">Moderation: Mar 15 &bull; Concluding remark: Mar 20 &bull; Grading due: Mar 22</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.25 }}>
            <MailOutlineIcon sx={{ fontSize: 12, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">gurus_support@greatlearning.in</Typography>
          </Stack>
        </Card>
      </ComponentSection>

      {/* Tentative */}
      <ComponentSection title="Moderation — Tentative" description="Planned discussion question, dates not confirmed.">
        <PlannedEventCard sessionType="Moderation" title="Ethics in Machine Learning" batch="PGP-AIML-BA-UTA-Nov25-C" contactEmail="gurus_support@greatlearning.in" startDateYmd="2026-04-05" endDateYmd="2026-04-15" />
      </ComponentSection>

      {/* Completed — Gathering feedback + payment pending */}
      <ComponentSection title="Moderation — Completed (Gathering feedback)" description="Moderation done, learners haven't rated yet. Payment pending.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Impact of AI on Healthcare"
            sessionType="Moderation"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-03-08"
            start={minutes(0)}
            end={minutes(23, 59)}
            actions={
              <Button variant="soft" size="small" startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />}>Open Discussion</Button>
            }
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>Gathering feedback!</Typography>
          <Typography variant="caption" color="var(--gl-status-pending-text)" sx={{ display: "block" }}>Payment pending</Typography>
        </Card>
      </ComponentSection>

      {/* Completed — with rating + payment processed */}
      <ComponentSection title="Moderation — Completed" description="Past moderation. Star icons only (no numeric), Detailed Feedback button below stars, payment processed.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Impact of AI on Healthcare"
            sessionType="Moderation"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-02-25"
            start={minutes(0)}
            end={minutes(23, 59)}
            actions={
              <Button variant="soft" size="small" startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />}>Open Discussion</Button>
            }
          />
          <Stack spacing={0.5} sx={{ mt: 0.75 }}>
            <StarRatingIcons rating={5} />
            <Button variant="soft" size="small" startIcon={<StarOutlinedIcon sx={{ fontSize: 14 }} />} sx={{ alignSelf: "flex-start" }}>Detailed Feedback</Button>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>Payment Processed, TXN ID: TXN-GL-9K4R2L</Typography>
        </Card>
      </ComponentSection>
    </>
  );
}

function CapstoneCards() {
  return (
    <>
      {/* Confirmed */}
      <ComponentSection title="Capstone Project — Confirmed" description="Long-running project mentoring. Date range (start → presentation), group name, domain, View Student Progress, Group Details.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Capstone — PGPDS.O.MAR26.A"
            sessionType="Capstone project mentoring session"
            batch="PGPDS.O.MAR26.A"
            dateYmd="2026-03-20"
            start={minutes(10)}
            end={minutes(12)}
            status={STATUS_CONFIRMED()}
            actions={
              <>
                <Button variant="soft" size="small" startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 16 }} />}>View Student Progress</Button>
                <Button variant="soft" size="small" startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />}>Group Details (LMS)</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small">View details</Button>}
          />
          <Stack spacing={0.25} sx={{ mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Group: Team Alpha &bull; Domain: NLP</Typography>
            <Typography variant="caption" color="text.secondary">Next session: Mar 20, 2026</Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <CalendarTodayOutlinedIcon sx={{ fontSize: 12, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">Start: Jan 15 &bull; Synopsis: Feb 5 &bull; Interim: Mar 1 &bull; Final: Apr 10 &bull; Presentation: Apr 20</Typography>
            </Stack>
          </Stack>
        </Card>
      </ComponentSection>

      {/* Scheduled */}
      <ComponentSection title="Capstone Project — Scheduled" description="Capstone mentoring session awaiting guru confirmation.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Capstone — PGPDS.O.MAR26.A"
            sessionType="Capstone project mentoring session"
            batch="PGPDS.O.MAR26.A"
            dateYmd="2026-03-25"
            start={minutes(10)}
            end={minutes(12)}
            status={STATUS_SCHEDULED}
            actions={
              <>
                <Button startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="contained">Confirm</Button>
                <Button startIcon={<DoNotDisturbOnOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="soft">I'm unavailable</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small">View details</Button>}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>Group: Team Alpha &bull; Domain: NLP</Typography>
        </Card>
      </ComponentSection>

      {/* Completed — payment pending */}
      <ComponentSection title="Capstone Project — Completed (Payment pending)" description="Capstone done but payment not yet processed.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Capstone — PGPDS.O.JUL25.A"
            sessionType="Capstone project mentoring session"
            batch="PGPDS.O.JUL25.A"
            dateYmd="2026-02-20"
            start={minutes(10)}
            end={minutes(12)}
            actions={
              <Button variant="soft" size="small" startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />}>View in payments</Button>
            }
          />
          <Stack spacing={0.25} sx={{ mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Group: Team Beta &bull; Domain: Computer Vision</Typography>
            <Typography variant="caption" color="var(--gl-status-pending-text)">Payment pending</Typography>
          </Stack>
        </Card>
      </ComponentSection>

      {/* Completed — payment processed */}
      <ComponentSection title="Capstone Project — Completed" description="Past capstone. No rating shown. Group, domain, batch, PM contact, payment processed.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="Capstone — PGPDS.O.JUL25.A"
            sessionType="Capstone project mentoring session"
            batch="PGPDS.O.JUL25.A"
            dateYmd="2026-01-15"
            start={minutes(10)}
            end={minutes(12)}
            actions={
              <Button variant="soft" size="small" startIcon={<TrendingUpOutlinedIcon sx={{ fontSize: 14 }} />}>View in payments</Button>
            }
          />
          <Stack spacing={0.25} sx={{ mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Group: Team Beta &bull; Domain: Computer Vision</Typography>
            <Typography variant="caption" color="text.secondary">Payment Processed, TXN ID: TXN-GL-3C7W1P</Typography>
          </Stack>
        </Card>
      </ComponentSection>
    </>
  );
}

function CVReviewCards() {
  return (
    <>
      {/* Confirmed */}
      <ComponentSection title="CV Review — Confirmed" description="Review student CVs. Due date, batch, View LinkedIn, View CV, Submit CV Review button.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="CV Review"
            sessionType="CV Review"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-03-22"
            start={minutes(0)}
            end={minutes(23, 59)}
            status={STATUS_CONFIRMED()}
            actions={
              <>
                <Button variant="soft" size="small" startIcon={<PersonOutlinedIcon sx={{ fontSize: 16 }} />}>View LinkedIn Profile</Button>
                <Button variant="soft" size="small" startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 16 }} />}>View CV</Button>
                <Button variant="contained" size="small">Submit CV Review</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small">View Comments</Button>}
          />
        </Card>
      </ComponentSection>

      {/* Scheduled */}
      <ComponentSection title="CV Review — Scheduled" description="CV review awaiting guru confirmation.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="CV Review"
            sessionType="CV Review"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-03-25"
            start={minutes(0)}
            end={minutes(23, 59)}
            status={STATUS_SCHEDULED}
            actions={
              <>
                <Button startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="contained">Confirm</Button>
                <Button startIcon={<DoNotDisturbOnOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="soft">I'm unavailable</Button>
              </>
            }
            secondaryAction={<Button variant="text" size="small">View details</Button>}
          />
        </Card>
      </ComponentSection>

      {/* Completed */}
      <ComponentSection title="CV Review — Completed" description="Past CV review. No rating, no feedback drilldown. Shows submission status.">
        <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <SessionCard
            title="CV Review"
            sessionType="CV Review"
            batch="PGP-AIML-BA-UTA-Nov25-C"
            dateYmd="2026-03-05"
            start={minutes(0)}
            end={minutes(23, 59)}
            actions={
              <Button variant="soft" size="small" startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 16 }} />}>View Reviewed CV</Button>
            }
          />
          <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: "block" }}>Already Submitted</Typography>
        </Card>
      </ComponentSection>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ROLE → ACTIVITY MAPPING
   ══════════════════════════════════════════════════════════════════════════ */

const ROLE_SECTIONS: Record<GuruRole, { label: string; render: () => React.ReactNode }[]> = {
  Teacher: [
    { label: "Residency", render: () => <ResidencyCards /> },
    { label: "Online Session", render: () => <OnlineSessionCards /> },
  ],
  "Course Mentor": [
    { label: "Online Session", render: () => <OnlineSessionCards /> },
    { label: "Residency", render: () => <ResidencyCards /> },
  ],
  "Career Mentor": [
    { label: "Career / Mock Interview Session", render: () => <CareerMentorOnlineSessionCards /> },
    { label: "CV Review", render: () => <CVReviewCards /> },
  ],
  "CV Review Mentor": [
    { label: "CV Review", render: () => <CVReviewCards /> },
  ],
  Evaluator: [
    { label: "Evaluation (Assignment)", render: () => <EvaluationCards /> },
  ],
  Moderator: [
    { label: "Moderation (Discussion Question)", render: () => <ModerationCards /> },
  ],
  "Project Mentor": [
    { label: "Capstone Project", render: () => <CapstoneCards /> },
  ],
  "Industry Expert": [
    { label: "Online Session", render: () => <OnlineSessionCards /> },
  ],
};

/* ══════════════════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ══════════════════════════════════════════════════════════════════════════ */

export default function ComponentsPage() {
  const selectedRole = useAppSelector((s) => s.devPanel.selectedRole);
  const sections = ROLE_SECTIONS[selectedRole];

  return (
    <Stack spacing={3} sx={{ maxWidth: 800 }}>
      <Box>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.25 }}>
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: "1.125rem", md: "1.25rem" } }}>
            Components
          </Typography>
          <Chip label={selectedRole} size="small" sx={{ fontWeight: 600 }} />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Session card variants for the <strong>{selectedRole}</strong> persona. Switch roles in the Dev Panel to see other activity types.
        </Typography>
      </Box>

      {sections.map((section) => (
        <Card key={section.label} sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>{section.label}</Typography>
          <Stack spacing={3} divider={<Divider />}>
            {section.render()}
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}
