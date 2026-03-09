import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Placeholder RTK Query API slice.
 * Currently uses fakeBaseQuery since the app runs with demo data.
 * Replace with fetchBaseQuery when a real API is available.
 */
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Sessions", "Requests", "Availability", "Notifications"],
  endpoints: () => ({}),
});
