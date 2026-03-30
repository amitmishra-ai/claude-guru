import React from "react";
import Box from "@mui/material/Box";

export function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column-reverse", alignItems: "flex-start", gap: 1.5 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <Box
          sx={{
            mt: 0.25,
            borderRadius: "12px",
            border: 1,
            borderColor: "divider",
            backgroundColor: "hsl(var(--md-surface))",
            p: 1,
          }}
        >
          <Icon sx={{ fontSize: 16 }} />
        </Box>
        <Box>
          <Box sx={{ fontSize: "1.125rem", fontWeight: 600 }}>{title}</Box>
          {subtitle ? (
            <Box sx={{ fontSize: "0.875rem", color: "hsl(var(--md-on-surface-variant))" }}>{subtitle}</Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
