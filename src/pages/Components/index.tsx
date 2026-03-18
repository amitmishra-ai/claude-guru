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
import { SessionCard, STATUS_SCHEDULED, STATUS_CONFIRMED, STATUS_DECLINED } from "@/components/shared/SessionCard";
import { minutes, fmtDateNice } from "@/lib/helpers";

/* ── Sample data for component showcase ── */

const sampleSession = {
  title: "Program Overview (All)",
  sessionType: "Mentored Learning session" as const,
  topic: "Orientation + Industry Landscape",
  batch: "AIML Online March 26 A",
  group: "Group 02 (Mixed work, beginner prog)",
  dateYmd: "2026-03-18",
  start: minutes(10),
  end: minutes(12),
};

const samplePlannedEvent = {
  sessionType: "Online session",
  title: "Machine Learning",
  batch: "PGP-AIML-BA-UTA-Nov25-C",
  contactEmail: "gurus_support@greatlearning.in",
  startDateYmd: "2026-01-22",
  endDateYmd: "2026-02-14",
};

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

export default function ComponentsPage() {
  return (
    <Stack spacing={3} sx={{ maxWidth: 800 }}>
      <Box>
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: "1.125rem", md: "1.25rem" } }}>
          Components
        </Typography>
        <Typography variant="body2" color="text.secondary">
          All session card variants used across the dashboard.
        </Typography>
      </Box>

      <Card sx={{ p: 2.5 }}>
        <Stack spacing={3} divider={<Divider />}>

          {/* ── 1. Next Session ── */}
          <ComponentSection
            title="Next Session"
            description="Highlighted card for today's session. Primary container background with join + materials actions."
          >
            <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: "hsl(var(--md-primary-container) / 0.12)", borderColor: "hsl(var(--md-primary) / 0.4)" }}>
              <SessionCard
                title={sampleSession.title}
                sessionType={sampleSession.sessionType}
                topic={sampleSession.topic}
                batch={sampleSession.batch}
                dateYmd={sampleSession.dateYmd}
                start={sampleSession.start}
                end={sampleSession.end}
                actions={
                  <>
                    <Button variant="contained" size="small" startIcon={<LinkOutlinedIcon sx={{ fontSize: 16 }} />}>
                      Join session
                    </Button>
                    <Button variant="soft" size="small" startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}>
                      Session Materials
                    </Button>
                  </>
                }
                secondaryAction={
                  <Button variant="text" size="small">View details</Button>
                }
              />
            </Card>
          </ComponentSection>

          {/* ── 2. Confirmed Session ── */}
          <ComponentSection
            title="Confirmed Session"
            description="Session that the guru has confirmed. Shows green Confirmed chip with materials + course content actions."
          >
            <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
              <SessionCard
                title={sampleSession.title}
                sessionType={sampleSession.sessionType}
                topic={sampleSession.topic}
                batch={sampleSession.batch}
                dateYmd={sampleSession.dateYmd}
                start={sampleSession.start}
                end={sampleSession.end}
                group={sampleSession.group}
                status={STATUS_CONFIRMED()}
                actions={
                  <>
                    <Button variant="soft" size="small" startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}>
                      Session Materials
                    </Button>
                    <Button variant="soft" size="small" startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />}>
                      View Course content
                    </Button>
                  </>
                }
                secondaryAction={
                  <Button variant="text" size="small">View details</Button>
                }
              />
            </Card>
          </ComponentSection>

          {/* ── 3. Scheduled Session ── */}
          <ComponentSection
            title="Scheduled Session"
            description="Unconfirmed session awaiting guru action. Shows Scheduled chip with Confirm + I'm unavailable actions."
          >
            <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
              <SessionCard
                title="Statistics for Data Science"
                sessionType="Capstone project mentoring session"
                topic="M5 W2 | Hypothesis Testing & Confidence Intervals"
                batch="PGPDS.O.MAR26.A"
                dateYmd="2026-03-13"
                start={minutes(18)}
                end={minutes(20)}
                group="Group 07 (High work, mixed prog)"
                status={STATUS_SCHEDULED}
                actions={
                  <>
                    <Button startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="contained">
                      Confirm
                    </Button>
                    <Button startIcon={<DoNotDisturbOnOutlinedIcon sx={{ fontSize: 18 }} />} size="small" variant="soft">
                      I'm unavailable
                    </Button>
                  </>
                }
                secondaryAction={
                  <Button variant="text" size="small">View details</Button>
                }
              />
            </Card>
          </ComponentSection>

          {/* ── 4. Declined Session ── */}
          <ComponentSection
            title="Declined Session"
            description="Session the guru declined. Shows red Declined chip with an Accept action to reverse the decision."
          >
            <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
              <SessionCard
                title="Python Fundamentals"
                sessionType="Online session"
                topic="M3 W1 | Variables, Data Types & Control Flow"
                batch="PGPDS.O.MAR26.A"
                dateYmd="2026-03-12"
                start={minutes(9, 30)}
                end={minutes(11)}
                group="Group 06 (Beginner)"
                status={STATUS_DECLINED}
                actions={
                  <Button startIcon={<TaskAltOutlinedIcon sx={{ fontSize: 18 }} />} variant="soft" size="small">
                    Accept
                  </Button>
                }
              />
            </Card>
          </ComponentSection>

          {/* ── 5. Planned Event Card ── */}
          <ComponentSection
            title="Planned Event Card"
            description="Upcoming planned event that is not yet scheduled. Shows date range, batch, and contact email."
          >
            <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                <Typography variant="h6" fontWeight={600} sx={{ fontSize: "0.875rem", minWidth: 0 }}>
                  {samplePlannedEvent.sessionType}: {samplePlannedEvent.title}
                </Typography>
                <Chip
                  label="To be confirmed"
                  size="small"
                  sx={{
                    bgcolor: "var(--gl-status-pending-bg)",
                    color: "var(--gl-status-pending-text)",
                    border: "1px solid var(--gl-status-pending-border)",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                    flexShrink: 0,
                  }}
                />
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: "text.secondary" }}>
                <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
                <Typography variant="caption" color="text.secondary">
                  {fmtDateNice(samplePlannedEvent.startDateYmd)} &ndash; {fmtDateNice(samplePlannedEvent.endDateYmd)} &bull; {samplePlannedEvent.batch}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.25 }}>
                <MailOutlineIcon sx={{ fontSize: 12, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">{samplePlannedEvent.contactEmail}</Typography>
              </Stack>
            </Card>
          </ComponentSection>

        </Stack>
      </Card>
    </Stack>
  );
}
