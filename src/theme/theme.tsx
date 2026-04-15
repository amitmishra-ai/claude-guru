import * as React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    soft: true;
  }
}

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
      borderRadius: 12,
    },

    /* ── Typography Scale (MUI standard scale) ─────────────────── */
    typography: {
      fontFamily: "'Inter', sans-serif",
      htmlFontSize: 16,
      fontSize: 14,

      h1: {
        fontSize: "6rem",
        fontWeight: 300,
        lineHeight: 1.167,
        letterSpacing: "-0.01562em",
      },
      h2: {
        fontSize: "3.75rem",
        fontWeight: 300,
        lineHeight: 1.2,
        letterSpacing: "-0.00833em",
      },
      h3: {
        fontSize: "3rem",
        fontWeight: 400,
        lineHeight: 1.167,
        letterSpacing: "0em",
      },
      h4: {
        fontSize: "2.125rem",
        fontWeight: 400,
        lineHeight: 1.235,
        letterSpacing: "0.00735em",
      },
      h5: {
        fontSize: "1.5rem",
        fontWeight: 400,
        lineHeight: 1.334,
        letterSpacing: "0em",
      },
      h6: {
        fontSize: "1.25rem",
        fontWeight: 500,
        lineHeight: 1.6,
        letterSpacing: "0.0075em",
      },
      subtitle1: {
        fontSize: "1rem",
        fontWeight: 400,
        lineHeight: 1.75,
        letterSpacing: "0.00938em",
      },
      subtitle2: {
        fontSize: "0.875rem",
        fontWeight: 500,
        lineHeight: 1.57,
        letterSpacing: "0.00714em",
      },
      body1: {
        fontSize: "1rem",
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: "0.00938em",
      },
      body2: {
        fontSize: "0.875rem",
        fontWeight: 400,
        lineHeight: 1.43,
        letterSpacing: "0.01071em",
      },
      button: {
        fontSize: "0.875rem",
        fontWeight: 500,
        lineHeight: 1.75,
        letterSpacing: "0.02857em",
        textTransform: "none" as const,
      },
      caption: {
        fontSize: "0.75rem",
        fontWeight: 400,
        lineHeight: 1.66,
        letterSpacing: "0.03333em",
      },
      overline: {
        fontSize: "0.75rem",
        fontWeight: 400,
        lineHeight: 2.66,
        letterSpacing: "0.08333em",
        textTransform: "uppercase" as const,
      },
    },

    /* ── Component Overrides ───────────────────────────────────── */
    components: {
      /* Button - 8px radius, no elevation, no uppercase */
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
            "@media (max-width: 599.95px)": { minHeight: 40, padding: "8px 14px" },
          },
        },
        variants: [
          {
            props: { variant: "soft" },
            style: {
              backgroundColor:
                mode === "light"
                  ? "rgba(25, 106, 229, 0.10)"
                  : "rgba(102, 187, 255, 0.15)",
              color:
                mode === "light" ? "#0f4089" : "#66bbff",
              "&:hover": {
                backgroundColor:
                  mode === "light"
                    ? "rgba(25, 106, 229, 0.17)"
                    : "rgba(102, 187, 255, 0.22)",
              },
              "&:disabled": {
                backgroundColor:
                  mode === "light"
                    ? "rgba(25, 106, 229, 0.05)"
                    : "rgba(102, 187, 255, 0.08)",
                color:
                  mode === "light"
                    ? "rgba(15, 64, 137, 0.4)"
                    : "rgba(102, 187, 255, 0.4)",
              },
            },
          },
        ],
      },

      /* Chip - 4px radius (smallest level) */
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            fontWeight: 500,
          },
        },
      },

      /* Card - 12px outer radius, outlined, no shadow */
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

      /* CardContent - 16px padding, fix MUI's last-child extra bottom padding */
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: 16,
            "&:last-child": {
              paddingBottom: 16,
            },
          },
        },
      },

      /* Paper - no background gradient, themed border */
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
          outlined: {
            borderColor,
          },
        },
      },

      /* Dialog - 16px radius (outermost container level) */
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 16 },
        },
      },

      /* DialogTitle - standardized weight, size, padding */
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            fontSize: "1.125rem",
            padding: "24px 24px 12px",
          },
        },
      },

      /* DialogContent - standardized padding */
      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: "8px 24px 16px",
          },
        },
      },

      /* DialogActions - standardized padding + gap */
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: "12px 24px 24px",
            gap: 8,
          },
        },
      },

      /* Popover - 16px radius (outermost container level) */
      MuiPopover: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            boxShadow:
              "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
            border: "1px solid",
            borderColor,
          },
        },
      },

      /* Tabs - compact, no uppercase */
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none" as const,
            fontWeight: 500,
            fontSize: "0.875rem",
            minHeight: 40,
            "@media (max-width: 599.95px)": { minHeight: 48 },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: 40,
            "@media (max-width: 599.95px)": { minHeight: 48 },
          },
        },
      },

      /* Table - refined sizing and themed borders */
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

      /* TextField - 8px radius */
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

      /* Select - 4px inner radius */
      MuiSelect: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },

      /* Avatar - 4px inner radius (use borderRadius: "50%" in sx for circles) */
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

export { lightTheme };

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
