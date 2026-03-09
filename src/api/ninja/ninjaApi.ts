import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Base RTK Query API for the Ninja backend.
 * Currently uses fakeBaseQuery with queryFn mocks (first-iteration pattern).
 * Replace fakeBaseQuery with fetchBaseQuery once the real API is available:
 *
 *   baseQuery: fetchBaseQuery({
 *     baseUrl: import.meta.env.VITE_API_BASE_URL,
 *     prepareHeaders: (headers) => {
 *       headers.set("Authorization", `Bearer ${getToken()}`);
 *       return headers;
 *     },
 *   }),
 */

export const NINJA_TAG_TYPES = {
  SESSIONS: "Sessions",
  REQUESTS: "Requests",
  AVAILABILITY: "Availability",
  NOTIFICATIONS: "Notifications",
} as const;

export const ninjaApi = createApi({
  reducerPath: "ninjaApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: Object.values(NINJA_TAG_TYPES),
  endpoints: () => ({}),
});
