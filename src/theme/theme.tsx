import * as React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

/**
 * Builds an MUI theme using the Great Learning design-system colors.
 * Light primary: #196ae5, Secondary: #ff9800
 * Dark primary: #66bbff, Secondary: #ffcc80
 */
function buildTheme(mode: "light" | "dark") {
  const borderColor =
    mode === "light"
      ? "rgba(33, 33, 33, 0.08)"
      : "rgba(255, 255, 255, 0.1)";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "light" ? "#196ae5" : "#66bbff",
        dark: mode === "light" ? "#0f4089" : "#3a9ae8",
        light: mode === "light" ? "#4788ea" : "#e8f0fc",
        contrastText: mode === "light" ? "#ffffff" : "rgba(0, 0, 0, 0.87)",
      },
      secondary: {
        main: mode === "light" ? "#ff9800" : "#ffcc80",
        dark: mode === "light" ? "#ef6c00" : "#ca9b52",
        light: mode === "light" ? "#ffb74d" : "#ffffb0",
        contrastText: mode === "light" ? "#ffffff" : "rgba(0, 0, 0, 0.87)",
      },
      error: {
        main: mode === "light" ? "#ff3333" : "#f44336",
        dark: mode === "light" ? "#d10b25" : "#d32f2f",
        light: mode === "light" ? "#f9494f" : "#e57373",
        contrastText: "#ffffff",
      },
      warning: {
        main: mode === "light" ? "#ffbf00" : "#ffa726",
        dark: mode === "light" ? "#ff6d00" : "#f57c00",
        light: mode === "light" ? "#ffd44d" : "#ffb74d",
        contrastText: mode === "light" ? "#ffffff" : "rgba(0, 0, 0, 0.87)",
      },
      info: {
        main: mode === "light" ? "#196ae5" : "#29b6f6",
        dark: mode === "light" ? "#0f4089" : "#0288d1",
        light: mode === "light" ? "#4788ea" : "#4fc3f7",
        contrastText: mode === "light" ? "#ffffff" : "rgba(0, 0, 0, 0.87)",
      },
      success: {
        main: mode === "light" ? "#22bb34" : "#66bb6a",
        dark: mode === "light" ? "#00880f" : "#388e3c",
        light: mode === "light" ? "#74d176" : "#81c784",
        contrastText: mode === "light" ? "#ffffff" : "rgba(0, 0, 0, 0.87)",
      },
      background: {
        default: mode === "light" ? "#fafafa" : "#121212",
        paper: mode === "light" ? "#ffffff" : "#1B1B1B",
      },
      text: {
        primary:
          mode === "light" ? "rgba(33, 33, 33, 0.92)" : "#ffffff",
        secondary:
          mode === "light"
            ? "rgba(33, 33, 33, 0.72)"
            : "rgba(255, 255, 255, 0.7)",
        disabled:
          mode === "light"
            ? "rgba(33, 33, 33, 0.24)"
            : "rgba(255, 255, 255, 0.5)",
      },
      action: {
        active:
          mode === "light"
            ? "rgba(33, 33, 33, 0.64)"
            : "rgba(255, 255, 255, 0.64)",
        hover:
          mode === "light"
            ? "rgba(33, 33, 33, 0.04)"
            : "rgba(255, 255, 255, 0.08)",
        selected:
          mode === "light"
            ? "rgba(33, 33, 33, 0.08)"
            : "rgba(255, 255, 255, 0.16)",
        disabled:
          mode === "light"
            ? "rgba(33, 33, 33, 0.26)"
            : "rgba(255, 255, 255, 0.3)",
        disabledBackground:
          mode === "light"
            ? "rgba(33, 33, 33, 0.12)"
            : "rgba(255, 255, 255, 0.12)",
        focus:
          mode === "light"
            ? "rgba(33, 33, 33, 0.12)"
            : "rgba(255, 255, 255, 0.12)",
      },
      divider: borderColor,
    },

    /* ── Shape ──────────────────────────────────────────────────── */
    shape: {
      borderRadius: 8,
    },

    /* ── Typography Scale ──────────────────────────────────────── */
    typography: {
      fontFamily: "inherit",
      h4: {
        fontSize: "1.75rem",
        fontWeight: 700,
        lineHeight: 1.25,
        letterSpacing: "-0.01em",
      },
      h5: {
        fontSize: "1.375rem",
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: "-0.005em",
      },
      h6: {
        fontSize: "1.125rem",
        fontWeight: 700,
        lineHeight: 1.35,
      },
      subtitle1: {
        fontSize: "1rem",
        fontWeight: 600,
        lineHeight: 1.4,
      },
      subtitle2: {
        fontSize: "0.875rem",
        fontWeight: 600,
        lineHeight: 1.4,
      },
      body1: {
        fontSize: "0.9375rem",
        fontWeight: 400,
        lineHeight: 1.5,
      },
      body2: {
        fontSize: "0.8125rem",
        fontWeight: 400,
        lineHeight: 1.5,
      },
      caption: {
        fontSize: "0.75rem",
        fontWeight: 400,
        lineHeight: 1.4,
      },
      overline: {
        fontSize: "0.6875rem",
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: "0.04em",
        textTransform: "uppercase" as const,
      },
    },

    /* ── Component Overrides ───────────────────────────────────── */
    components: {
      /* Button — 8px radius, no elevation, no uppercase */
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            textTransform: "none" as const,
            borderRadius: 8,
            fontWeight: 500,
          },
          sizeSmall: {
            fontSize: "0.8125rem",
            padding: "4px 12px",
          },
        },
      },

      /* Chip — 8px rounded-square default; use sx borderRadius 9999px for pills */
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
        },
      },

      /* Card — 12px radius, outlined, no shadow */
      MuiCard: {
        defaultProps: { variant: "outlined" as const },
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: "none",
            borderColor,
          },
        },
      },

      /* CardContent — fix MUI's last-child extra bottom padding */
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: 20,
            "&:last-child": {
              paddingBottom: 20,
            },
          },
        },
      },

      /* Paper — no background gradient, themed border */
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
          outlined: {
            borderColor,
          },
        },
      },

      /* Dialog — 16px radius (replaces className="rounded-2xl" on every dialog) */
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 16 },
        },
      },

      /* DialogTitle — standardized weight, size, padding */
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            fontSize: "1.125rem",
            padding: "20px 24px 12px",
          },
        },
      },

      /* DialogContent — standardized padding */
      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: "8px 24px 16px",
          },
        },
      },

      /* DialogActions — standardized padding + gap */
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: "12px 24px 20px",
            gap: 8,
          },
        },
      },

      /* Popover — consistent shadow + border + radius */
      MuiPopover: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            boxShadow:
              "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
            border: "1px solid",
            borderColor,
          },
        },
      },

      /* Tabs — compact, no uppercase */
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none" as const,
            fontWeight: 500,
            fontSize: "0.875rem",
            minHeight: 40,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 40 },
        },
      },

      /* Table — refined sizing and themed borders */
      MuiTableCell: {
        styleOverrides: {
          root: {
            fontSize: "0.8125rem",
            borderColor,
          },
          head: {
            fontWeight: 600,
            fontSize: "0.75rem",
            color:
              mode === "light"
                ? "rgba(33, 33, 33, 0.6)"
                : "rgba(255, 255, 255, 0.6)",
          },
        },
      },

      /* TextField — 8px radius */
      MuiTextField: {
        defaultProps: { size: "small" as const },
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
            },
          },
        },
      },

      /* Select — 8px radius */
      MuiSelect: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },

      /* Avatar — square-ish with 8px radius */
      MuiAvatar: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
    },
  });
}

const lightTheme = buildTheme("light");
const darkTheme = buildTheme("dark");

export function AppThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}
