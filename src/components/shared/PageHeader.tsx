import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  action,
  iconBoxSx,
}: {
  icon?: React.ElementType;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  iconBoxSx?: object;
}) {
  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      justifyContent="space-between"
      spacing={1.5}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        {Icon && (
          <Box
            sx={{
              mt: 0.25,
              p: 1,
              borderRadius: "8px",
              border: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...iconBoxSx,
            }}
          >
            <Icon style={{ width: 16, height: 16 }} />
          </Box>
        )}

        <Box>
          <Typography variant="h6" sx={{ lineHeight: 1.35, fontWeight: 700 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.25 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>

      {action}
    </Stack>
  );
}
