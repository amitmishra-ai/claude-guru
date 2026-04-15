import Box, { type BoxProps } from "@mui/material/Box";

/**
 * FlexBox - Use instead of `<Box display="flex">` or `<Stack direction="row">`.
 *
 * Usage:
 *   <FlexBox alignItems="center" gap={2}>…</FlexBox>
 *   <FlexBox flexDirection="column" gap={1}>…</FlexBox>
 */
const FlexBox = ({ sx, ...props }: BoxProps) => (
  <Box display="flex" sx={sx} {...props} />
);

export default FlexBox;
