import Box from "@mui/material/Box";

function PatternImg({ src, top, right, bottom, left, opacity = 1, transform }: {
  src: string; top: string; right: string; bottom: string; left: string;
  opacity?: number; transform?: string;
}) {
  return (
    <Box sx={{ position: "absolute", top, right, bottom, left, opacity, transform }}>
      <Box component="img" src={src} alt="" sx={{ width: "100%", height: "100%", display: "block" }} />
    </Box>
  );
}

function PatternOverlay({ pattern }: { pattern: number }) {
  switch (pattern) {
    case 1:
      return <PatternImg src="/course-patterns/p1.svg" top="-63.54%" right="0" bottom="26.66%" left="0" opacity={0.8} />;
    case 2:
      return (
        <Box sx={{ position: "absolute", inset: 0, opacity: 0.8 }}>
          <PatternImg src="/course-patterns/p2.svg" top="33.33%" right="54.18%" bottom="33.33%" left="12.5%"  transform="rotate(180deg)" opacity={0.64} />
          <PatternImg src="/course-patterns/p2.svg" top="14.58%" right="33.35%" bottom="52.08%" left="33.33%" transform="rotate(180deg)" opacity={0.64} />
          <PatternImg src="/course-patterns/p2.svg" top="52.08%" right="33.35%" bottom="14.58%" left="33.33%" transform="rotate(180deg)" opacity={0.64} />
          <PatternImg src="/course-patterns/p2.svg" top="33.33%" right="12.52%" bottom="33.33%" left="54.17%" transform="rotate(180deg)" opacity={0.64} />
        </Box>
      );
    case 3:
      return <PatternImg src="/course-patterns/p3.svg" top="-46.88%" right="-0.14%" bottom="31.24%" left="0" opacity={0.8} />;
    case 4:
      return <PatternImg src="/course-patterns/p4.svg" top="8.33%" right="8.33%" bottom="29.17%" left="33.33%" opacity={0.8} />;
    case 5:
      return <PatternImg src="/course-patterns/p5.svg" top="8.33%" right="8.55%" bottom="8.33%" left="9.38%" opacity={0.8} />;
    case 6:
      return <PatternImg src="/course-patterns/p6.svg" top="16.67%" right="16.67%" bottom="16.67%" left="16.67%" opacity={0.8} />;
    case 7:
      return (
        <Box sx={{ position: "absolute", top: "10.42%", right: "9.38%", bottom: "10.42%", left: "10.42%", overflow: "hidden", opacity: 0.8 }}>
          <PatternImg src="/course-patterns/p7a.svg" top="0" right="50%"    bottom="42.86%" left="0"      />
          <PatternImg src="/course-patterns/p7a.svg" top="0" right="-0.65%" bottom="42.86%" left="50.65%" />
          <PatternImg src="/course-patterns/p7b.svg" top="43.42%" right="24.68%" bottom="-0.56%" left="25.32%" />
        </Box>
      );
    case 8:
      return <PatternImg src="/course-patterns/p8.svg" top="11.46%" right="11.94%" bottom="11.94%" left="11.46%" opacity={0.7} />;
    case 9:
      return <PatternImg src="/course-patterns/p9.svg" top="14.92%" right="4.22%" bottom="14.81%" left="4.27%" opacity={0.5} />;
    case 10:
      return <PatternImg src="/course-patterns/p10.svg" top="8.33%" right="8.33%" bottom="8.33%" left="8.33%" />;
    case 11:
      return <PatternImg src="/course-patterns/p11.svg" top="16.67%" right="16.67%" bottom="16.67%" left="16.67%" />;
    default:
      return null;
  }
}

export function CoursePatternThumb({ color, pattern, size = 72, borderRadius = 12 }: {
  color: string;
  pattern: number;
  size?: number;
  borderRadius?: number;
}) {
  return (
    <Box sx={{ width: size, height: size, borderRadius: `${borderRadius}px`, bgcolor: color, position: "relative", overflow: "hidden", flexShrink: 0 }}>
      <PatternOverlay pattern={pattern} />
    </Box>
  );
}
