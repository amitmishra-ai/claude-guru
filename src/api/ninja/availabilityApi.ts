import { ninjaApi, NINJA_TAG_TYPES } from "./ninjaApi";
import type { Pattern } from "@/lib/types";
import { mockSaveAvailabilityResponse } from "./__mocks__/availabilityMockData";

// ─── Request / Response types ─────────────────────────────────────────────────

export interface ISaveAvailabilityRequest {
  patterns: Pattern[];
  maxPerWeek: number;
  rangeDays: number;
}

export interface ISaveAvailabilityResponse {
  message: string;
}

// ─── Injected endpoints ───────────────────────────────────────────────────────

export const availabilityApi = ninjaApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Save the guru's recurring availability patterns.
     *
     * First-iteration: uses queryFn with mock data.
     * TODO: replace queryFn body with real API call:
     *   return { data: await realApiClient.post("/guru/availability", arg) }
     */
    saveAvailability: builder.mutation<ISaveAvailabilityResponse, ISaveAvailabilityRequest>({
      queryFn: async (_arg) => {
        await new Promise<void>((resolve) => setTimeout(resolve, 300)); // simulate latency
        return { data: mockSaveAvailabilityResponse };
      },
      invalidatesTags: [NINJA_TAG_TYPES.AVAILABILITY],
    }),
  }),
});

// Auto-generated hooks
export const { useSaveAvailabilityMutation } = availabilityApi;
