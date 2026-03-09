import * as React from "react";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

// Forces Emotion (MUI) styles to inject first in <head>,
// so Tailwind utility classes always win in specificity.
const muiCache = createCache({
  key: "mui",
  prepend: true,
});

export function EmotionCacheProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CacheProvider value={muiCache}>{children}</CacheProvider>;
}
