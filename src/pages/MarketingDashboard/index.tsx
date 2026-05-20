import { useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  House as HomeIcon,
  Calendar as CalendarIcon,
  BookOpen as CoursesIcon,
  Users as ProfileIcon,
  Wallet as PaymentsIcon,
  Star as StarIcon,
  Video as VideoIcon,
  CheckCircle2 as CheckCircleIcon,
  CalendarDays as EventIcon,
  Headphones as HeadsetIcon,
  ChevronUp as ChevronUpIcon,
} from "lucide-react";

/* ---------- tokens ---------- */
/* Marketing-only mock. Scaled ~1.5x of product baseline; radii relaxed
   from the project 4px rule so a screenshot still reads as polished UI
   when shrunk into a hero banner illustration. */

const BRAND = "#0E39A9";
const LINK_BLUE = "#1974D2";
const STAR = "#F59E0B";
const PURPLE = "#7C3AED";
const GREEN = "#16A34A";
const RED = "#DC2626";
const ORANGE = "#F97316";
const INK = "#0B1220";
const INK_2 = "#475569";
const INK_3 = "#94A3B8";
const SURFACE = "#FFFFFF";
const CANVAS = "#F5F6FA";
const HAIRLINE_RGBA = "rgba(15,23,42,0.06)";
const HAIRLINE = "#EEF1F6";

const FONT_STACK =
  '"Geist", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
const NUM_DISPLAY = '"Geist", "Inter", -apple-system, system-ui, sans-serif';
const FEATURE_TNUM = "'tnum' 1, 'cv11' 1, 'ss01' 1";

/* layered depth: 1px hairline + ambient + soft contact */
const CARD_SHADOW =
  "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -10px rgba(15,23,42,0.08), 0 24px 48px -24px rgba(15,23,42,0.10)";
const CARD_INNER_HIGHLIGHT = "inset 0 1px 0 rgba(255,255,255,0.85)";
const CARD_BOX_SHADOW = `${CARD_SHADOW}, ${CARD_INNER_HIGHLIGHT}`;
const TILE_SHADOW =
  "0 1px 2px rgba(15,23,42,0.03), 0 4px 12px -6px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.85)";

const R_CARD = 18;
const R_INNER = 12;
const R_CHIP = 10;
const R_PILL = 999;

/* ---------- GL logo ---------- */

function GLLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.9338 30.4595L20.0177 30.3608L23.4279 26.2037H18.8904C13.201 26.2037 8.57217 21.6262 8.57217 15.9998C8.57217 10.3731 13.201 5.79565 18.8904 5.79565H24.1907L27.7173 1.54004H18.8904C10.8277 1.54004 4.26855 8.02664 4.26855 15.9998C4.26855 23.9729 10.8277 30.4595 18.8904 30.4595H19.9338Z" fill={BRAND} />
      <path d="M4.26855 15.9998C4.26855 19.6784 5.66696 23.0386 7.96278 25.5933L10.726 22.2286C9.37739 20.5039 8.57193 18.3438 8.57193 15.9998C8.57193 10.3733 13.201 5.79588 18.8904 5.79588H24.2224L27.7173 1.54004H18.8904C10.8277 1.54004 4.26855 8.02664 4.26855 15.9998Z" fill={LINK_BLUE} />
      <path d="M23.4277 26.2038L27.7311 20.9576V13.7129H18.5888L15.1025 17.9687H23.4277V26.2038Z" fill={BRAND} />
    </svg>
  );
}

/* ---------- sidebar (icon-only) ---------- */

function MiniSidebar() {
  const items = [
    { icon: <HomeIcon size={26} strokeWidth={2} />, key: "Home", active: true },
    { icon: <CalendarIcon size={26} strokeWidth={2} />, key: "Calendar" },
    { icon: <CoursesIcon size={26} strokeWidth={2} />, key: "Courses" },
    { icon: <ProfileIcon size={26} strokeWidth={2} />, key: "Profile" },
    { icon: <PaymentsIcon size={26} strokeWidth={2} />, key: "Payments" },
  ];
  return (
    <Box
      sx={{
        width: 88,
        bgcolor: SURFACE,
        borderRight: `1px solid ${HAIRLINE_RGBA}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 4,
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        alignSelf: "flex-start",
        overflowY: "auto",
      }}
    >
      <Box sx={{ mb: 4 }}>
        <GLLogo size={36} />
      </Box>
      <Stack spacing={1.25} sx={{ width: "100%", px: 1.5, alignItems: "center" }}>
        {items.map((it) => (
          <Box
            key={it.key}
            sx={{
              width: 56,
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: `${R_INNER}px`,
              bgcolor: it.active ? "#E8F0FE" : "transparent",
              color: it.active ? BRAND : INK_2,
              transition: "background-color .2s",
            }}
          >
            {it.icon}
          </Box>
        ))}
      </Stack>

      <Box sx={{ flex: 1 }} />

      <Box
        sx={{
          width: 56,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: INK_2,
          mb: 2,
        }}
      >
        <HeadsetIcon size={26} strokeWidth={2} />
      </Box>
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          bgcolor: BRAND,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: "0.02em",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 2px rgba(15,23,42,0.18)",
        }}
      >
        SS
      </Box>
    </Box>
  );
}

/* ---------- custom action button (replaces MUI Chip) ---------- */

function ActionButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        height: 46,
        px: 2,
        bgcolor: "#EEF3FE",
        color: LINK_BLUE,
        borderRadius: `${R_CHIP}px`,
        boxShadow: "inset 0 0 0 1px rgba(25,116,210,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
        fontSize: 18,
        fontWeight: 600,
        letterSpacing: "-0.005em",
        cursor: "default",
      }}
    >
      {icon}
      <Box component="span">{label}</Box>
    </Box>
  );
}

/* ---------- date tile + session row ---------- */

function DateTile({ dow, day }: { dow: string; day: string }) {
  return (
    <Box
      sx={{
        width: 64,
        flexShrink: 0,
        bgcolor: "#F4F6FB",
        border: `1px solid ${HAIRLINE_RGBA}`,
        borderRadius: `${R_INNER}px`,
        py: 1.25,
        px: 0.5,
        textAlign: "center",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          color: INK_3,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          lineHeight: 1,
        }}
      >
        {dow}
      </Typography>
      <Typography
        sx={{
          fontSize: 26,
          fontWeight: 700,
          color: INK,
          fontFamily: NUM_DISPLAY,
          fontFeatureSettings: FEATURE_TNUM,
          letterSpacing: "-0.035em",
          lineHeight: 1.15,
          mt: 0.25,
        }}
      >
        {day}
      </Typography>
    </Box>
  );
}

function SessionRow({
  type,
  title,
  dow,
  day,
  rating,
}: {
  type: string;
  title: string;
  dow: string;
  day: string;
  rating: number;
}) {
  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <DateTile dow={dow} day={day} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 500,
              color: INK,
              lineHeight: 1.3,
              letterSpacing: "-0.012em",
              flex: 1,
              minWidth: 0,
            }}
          >
            <Box component="span" sx={{ color: INK, fontWeight: 500 }}>{type}: </Box>
            <Box component="span" sx={{ color: LINK_BLUE, fontWeight: 600 }}>{title}</Box>
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{
              flexShrink: 0,
              px: 1,
              py: 0.5,
              borderRadius: `${R_PILL}px`,
              bgcolor: "#FFF8E5",
              border: "1px solid rgba(245,158,11,0.18)",
            }}
          >
            <StarIcon size={18} fill={STAR} stroke={STAR} strokeWidth={1.75} />
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 700,
                color: "#92400E",
                fontFamily: NUM_DISPLAY,
                fontFeatureSettings: FEATURE_TNUM,
                letterSpacing: "-0.02em",
              }}
            >
              {rating.toFixed(2)}
            </Typography>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1.25} sx={{ mt: 1.75 }}>
          <ActionButton
            icon={<VideoIcon size={20} strokeWidth={2} />}
            label="Recording"
          />
          <ActionButton
            icon={<StarIcon size={20} strokeWidth={2} />}
            label="Feedback"
          />
        </Stack>
      </Box>
    </Stack>
  );
}

/* ---------- performance chartlet (refined) ---------- */

type SparklineShape = "steady" | "lateClimb" | "earlyJump" | "wave";

const SPARKLINES: Record<SparklineShape, { path: string; endY: number }> = {
  /* steady, gradually accelerating climb */
  steady: {
    path: "M0,32 C24,30 50,26 88,18 C120,12 156,8 200,5 L240,3",
    endY: 3,
  },
  /* slow first half, sharp climb at the end */
  lateClimb: {
    path: "M0,30 C30,29 64,27 104,24 C144,20 184,11 240,4",
    endY: 4,
  },
  /* flat plateau then a sudden rise to a ceiling */
  earlyJump: {
    path: "M0,28 C30,27 60,26 100,24 C140,20 180,9 240,5",
    endY: 5,
  },
  /* small dip mid-period, recovers strongly */
  wave: {
    path: "M0,24 C20,22 40,26 72,25 C112,22 168,12 240,7",
    endY: 7,
  },
};

function HeroStat({
  label,
  value,
  delta,
  trend,
  color,
  gradId,
  caption,
  shape,
}: {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  color: string;
  gradId: string;
  caption: string;
  shape: SparklineShape;
}) {
  const isUp = trend === "up";
  const trendColor = isUp ? GREEN : RED;
  const trendBg = isUp ? "rgba(22,163,74,0.10)" : "rgba(220,38,38,0.10)";
  const { path, endY } = SPARKLINES[shape];
  return (
    <Box
      sx={{
        position: "relative",
        bgcolor: SURFACE,
        border: `1px solid ${HAIRLINE_RGBA}`,
        borderRadius: `${R_INNER}px`,
        p: 1.75,
        boxShadow: TILE_SHADOW,
        overflow: "hidden",
        backgroundImage: `radial-gradient(120% 80% at 100% 0%, ${color}10, transparent 55%)`,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.75}>
        <Stack direction="row" alignItems="center" spacing={0.875}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: color,
              boxShadow: `0 0 0 3px ${color}1f`,
            }}
          />
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </Typography>
        </Stack>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            px: 1.5,
            py: 0.625,
            borderRadius: `${R_PILL}px`,
            bgcolor: trendBg,
            color: trendColor,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: NUM_DISPLAY,
            fontFeatureSettings: FEATURE_TNUM,
            letterSpacing: "-0.01em",
            boxShadow: `inset 0 0 0 1px ${trendColor}1f`,
          }}
        >
          {isUp ? "▲" : "▼"} {delta}
        </Box>
      </Stack>
      <Stack direction="row" alignItems="baseline" spacing={0.75}>
        <Typography
          sx={{
            fontSize: 30,
            fontWeight: 700,
            color: INK,
            lineHeight: 1,
            fontFamily: NUM_DISPLAY,
            fontFeatureSettings: FEATURE_TNUM,
            letterSpacing: "-0.035em",
          }}
        >
          {value}
        </Typography>
        <Typography sx={{ fontSize: 11, color: INK_3, fontWeight: 500 }}>/ 5.00</Typography>
      </Stack>
      <Typography sx={{ fontSize: 11, color: INK_3, fontWeight: 500, mt: 0.25 }}>
        {caption}
      </Typography>
      <Box sx={{ mt: 0.75, mx: -1.75, mb: -1.75, lineHeight: 0 }}>
        <svg width="100%" height="40" viewBox="0 0 240 40" preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${path} L240,40 L0,40 Z`} fill={`url(#${gradId})`} />
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="240" cy={endY} r="3" fill={color} />
          <circle cx="240" cy={endY} r="6" fill={color} fillOpacity="0.18" />
        </svg>
      </Box>
    </Box>
  );
}


/* ---------- page ---------- */

export default function MarketingDashboardPage() {
  /* load Geist Sans on mount, scoped by tag id so we can clean up */
  useEffect(() => {
    const id = "marketing-dashboard-geist";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: CANVAS,
        backgroundImage:
          "radial-gradient(1200px 600px at 88% -10%, rgba(25,116,210,0.07), transparent 60%)",
        fontFamily: FONT_STACK,
        color: INK,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      <MiniSidebar />

      <Box sx={{ flex: 1, p: 5, minWidth: 0 }}>
        {/* welcome */}
        <Typography
          sx={{
            fontSize: 30,
            fontWeight: 700,
            color: INK,
            mb: 3,
            letterSpacing: "-0.028em",
          }}
        >
          Welcome Sachin Sinha
        </Typography>

        <Stack direction="row" spacing={3} alignItems="flex-start">
          {/* Activities card */}
          <Box sx={{ flex: 2 }}>
            <Box
              sx={{
                bgcolor: SURFACE,
                borderRadius: `${R_CARD}px`,
                border: `1px solid ${HAIRLINE_RGBA}`,
                boxShadow: CARD_BOX_SHADOW,
                p: 4,
              }}
            >
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: INK,
                  mb: 2.5,
                  letterSpacing: "-0.022em",
                }}
              >
                Activities
              </Typography>

              {/* tabs */}
              <Box
                sx={{
                  display: "inline-flex",
                  bgcolor: "#F1F4F9",
                  borderRadius: `${R_PILL}px`,
                  p: 0.5,
                  mb: 3,
                  boxShadow: "inset 0 1px 1px rgba(15,23,42,0.04)",
                }}
              >
                <Box
                  sx={{
                    px: 3.5,
                    py: 1.5,
                    borderRadius: `${R_PILL}px`,
                    color: INK_2,
                    fontSize: 18,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    cursor: "pointer",
                    letterSpacing: "-0.005em",
                  }}
                >
                  <EventIcon size={20} strokeWidth={2} />
                  Upcoming (2)
                </Box>
                <Box
                  sx={{
                    px: 3.5,
                    py: 1.5,
                    borderRadius: `${R_PILL}px`,
                    bgcolor: SURFACE,
                    color: LINK_BLUE,
                    fontSize: 18,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    boxShadow:
                      "0 1px 2px rgba(15,23,42,0.06), 0 4px 8px -2px rgba(15,23,42,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
                    letterSpacing: "-0.005em",
                  }}
                >
                  <CheckCircleIcon size={20} strokeWidth={2} />
                  Completed (99+)
                </Box>
              </Box>

              {/* MAY 2026 */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  borderTop: `1px solid ${HAIRLINE}`,
                  borderBottom: `1px solid ${HAIRLINE}`,
                  py: 1.5,
                  mt: 0.5,
                  mb: 2.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: INK_3,
                    letterSpacing: "0.12em",
                  }}
                >
                  MAY 2026
                </Typography>
                <ChevronUpIcon size={20} strokeWidth={2} color={INK_3} />
              </Stack>

              <Stack
                spacing={2.75}
                divider={<Box sx={{ height: 1, bgcolor: HAIRLINE }} />}
              >
                <SessionRow
                  type="Online class"
                  title="Data Visualization using Tableau"
                  dow="SUN"
                  day="03"
                  rating={4.82}
                />
                <SessionRow
                  type="Mentored Learning"
                  title="Program Overview"
                  dow="SUN"
                  day="03"
                  rating={4.75}
                />
                <SessionRow
                  type="Career mentoring"
                  title="Resume Review with Aanya"
                  dow="FRI"
                  day="01"
                  rating={4.95}
                />
              </Stack>
            </Box>
          </Box>

          {/* sidebar column */}
          <Stack spacing={3} sx={{ flex: 1, minWidth: 300 }}>
            {/* Performance */}
            <Box
              sx={{
                bgcolor: SURFACE,
                borderRadius: `${R_CARD}px`,
                border: `1px solid ${HAIRLINE_RGBA}`,
                boxShadow: CARD_BOX_SHADOW,
                p: 3,
              }}
            >
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: INK,
                  mb: 2,
                  letterSpacing: "-0.022em",
                }}
              >
                Your Performance
              </Typography>
              <Stack spacing={1.25}>
                <HeroStat
                  label="Mentoring"
                  value="4.83"
                  delta="0.09"
                  trend="up"
                  color={PURPLE}
                  gradId="grad-mentor"
                  caption="Trending up over the last 6 months"
                  shape="steady"
                />
                <HeroStat
                  label="Career Mentoring"
                  value="4.91"
                  delta="0.05"
                  trend="up"
                  color={ORANGE}
                  gradId="grad-career"
                  caption="Above program average"
                  shape="lateClimb"
                />
                <HeroStat
                  label="Evaluation & Moderation"
                  value="5.00"
                  delta="0.12"
                  trend="up"
                  color={GREEN}
                  gradId="grad-eval"
                  caption="Perfect score across 12 sessions"
                  shape="earlyJump"
                />
                <HeroStat
                  label="Teaching"
                  value="4.81"
                  delta="0.06"
                  trend="up"
                  color={LINK_BLUE}
                  gradId="grad-teach"
                  caption="Up from 4.75 last quarter"
                  shape="wave"
                />
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
