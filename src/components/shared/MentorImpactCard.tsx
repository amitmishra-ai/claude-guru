import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

/* ── Mock data ───────────────────────────────────────────────────────────── */

const METRICS = [
  { icon: <GroupsOutlinedIcon sx={{ fontSize: 16 }} />, value: "1,240", label: "Learners", delta: "+213 in Feb", iconBg: "rgba(25,106,229,0.08)", iconColor: "#196ae5" },
  { icon: <AccessTimeOutlinedIcon sx={{ fontSize: 16 }} />, value: "186h", label: "Teaching hours", delta: "+32h in Feb", iconBg: "rgba(34,187,52,0.08)", iconColor: "#22bb34" },
  { icon: <StarOutlinedIcon sx={{ fontSize: 16 }} />, value: "94%", label: "4 & 5 star", delta: "+2.1% MoM", iconBg: "rgba(245,158,11,0.08)", iconColor: "#f59e0b" },
];

const TESTIMONIALS = [
  { quote: "One of the most structured sessions I've attended. Real-world examples made complex concepts intuitive.", name: "Priya S.", program: "PGP-DS · 26A", avatar: "P" },
  { quote: "Truly inspiring — always goes above and beyond to ensure every learner understands thoroughly.", name: "Aarav M.", program: "AIML · 25B", avatar: "A" },
  { quote: "The neural networks session was phenomenal. Clear explanations, great pacing, very approachable.", name: "Neha K.", program: "PGP-DS · 25A", avatar: "N" },
  { quote: "Best mentor I've had. Every session has practical takeaways I can immediately apply at work.", name: "Rohan D.", program: "PGP-SE · 26A", avatar: "R" },
];

/* ── Main component ──────────────────────────────────────────────────────── */

export default function MentorImpactCard({ guruName }: { guruName: string }) {
  const [tPage, setTPage] = useState(0);
  const perPage = 2;
  const totalPages = Math.ceil(TESTIMONIALS.length / perPage);
  const visibleTestimonials = TESTIMONIALS.slice(tPage * perPage, tPage * perPage + perPage);

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "divider", overflow: "hidden", mb: 4 }}>
      <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
        {/* ── Hero + Metrics in one row ────────────────────────────────── */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2.5} alignItems={{ md: "center" }}>
          {/* Left: appreciation */}
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: 36, height: 36, borderRadius: 2, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                bgcolor: "action.hover", border: "1px solid", borderColor: "divider",
              }}
            >
              <EmojiEventsOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={700} noWrap>
                Thank you, {guruName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                Your expertise continues to shape learner outcomes.
              </Typography>
            </Box>
          </Stack>

          {/* Right: compact metric cards */}
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            {METRICS.map((m) => (
              <Card
                key={m.label}
                elevation={0}
                sx={{ px: 1.5, py: 1.25, borderRadius: 2, bgcolor: "transparent", border: "none", boxShadow: "none", minWidth: 115 }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem", fontWeight: 500, display: "block", lineHeight: 1 }}>
                  {m.label}
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2, letterSpacing: "-0.02em", my: 0.25 }}>
                  {m.value}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Box
                    sx={{
                      display: "inline-flex", alignItems: "center", gap: 0.25,
                      px: 0.5, py: 0.125, borderRadius: 0.75,
                      bgcolor: m.iconBg, color: m.iconColor,
                    }}
                  >
                    {m.icon}
                    <Typography sx={{ fontSize: "0.6rem", fontWeight: 600, color: "inherit" }}>
                      {m.delta.split(" ")[0]}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.55rem" }}>
                    {m.delta.split(" ").slice(1).join(" ")}
                  </Typography>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Stack>

        {/* ── Row 2: Testimonials + Share ─────────────────────────────── */}
        <Box sx={{ mt: 2 }} />

        <Stack direction="row" alignItems="center" spacing={1.5}>
          {/* Nav left */}
          <IconButton size="small" disabled={tPage === 0} onClick={() => setTPage((p) => p - 1)} sx={{ width: 28, height: 28, flexShrink: 0 }}>
            <ChevronLeftIcon sx={{ fontSize: 16 }} />
          </IconButton>

          {/* Two testimonial cards */}
          <Stack direction="row" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            {visibleTestimonials.map((t) => (
              <Card key={t.name} variant="outlined" sx={{ flex: 1, px: 3, py: 2.5, borderRadius: 3, borderColor: "divider", display: "flex", flexDirection: "column", minWidth: 0 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", mb: 2 }}>
                  &ldquo;{t.quote}&rdquo;
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mt: "auto" }}>
                  <Avatar sx={{ width: 30, height: 30, fontSize: 12, fontWeight: 600, bgcolor: "action.selected", color: "text.primary" }}>
                    {t.avatar}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" fontWeight={600} sx={{ display: "block", lineHeight: 1.2 }}>
                      {t.name}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.65rem" }}>
                      {t.program}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            ))}
          </Stack>

          {/* Nav right */}
          <IconButton size="small" disabled={tPage >= totalPages - 1} onClick={() => setTPage((p) => p + 1)} sx={{ width: 28, height: 28, flexShrink: 0 }}>
            <ChevronRightIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>

        {/* Carousel dots */}
        {totalPages > 1 && (
          <Stack direction="row" justifyContent="center" spacing={0.5} sx={{ mt: 1 }}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <Box
                key={i}
                onClick={() => setTPage(i)}
                sx={{
                  width: tPage === i ? 12 : 5, height: 5, borderRadius: 3,
                  bgcolor: tPage === i ? "text.primary" : "action.disabled",
                  cursor: "pointer", transition: "all 0.2s ease",
                }}
              />
            ))}
          </Stack>
        )}

        {/* ── Row 3: Share actions ──────────────────────────────────────── */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mr: 0.5 }}>
            Share your impact
          </Typography>
          <Button size="small" variant="soft" startIcon={<LinkedInIcon sx={{ fontSize: 16 }} />}>
            LinkedIn
          </Button>
          <Button size="small" variant="soft" startIcon={<FacebookIcon sx={{ fontSize: 16 }} />}>
            Facebook
          </Button>
          <Button size="small" variant="soft" startIcon={<ContentCopyOutlinedIcon sx={{ fontSize: 14 }} />}>
            Copy link
          </Button>
        </Stack>
      </Box>
    </Card>
  );
}
