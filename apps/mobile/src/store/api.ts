import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { MeResponse, MyTicketsResponse, Ticket, Visit, VisitCheckIn } from '@sbs/shared';
import { KEEP_UNUSED_DATA_FOR_SECONDS } from '@sbs/shared';

/**
 * RTK Query API slice (PLAN.md D14/D16).
 *
 * Auth: every request carries the Clerk session token (`getToken()`), so the
 * `(app)/_layout` client-side guard stays UX-only and `apps/api` remains the
 * real authoriser. `getToken` is injected per-request (not captured at store
 * creation) so token refreshes never go stale.
 *
 * Offline (D16): queries retry; mutations queue. The persisted outbox slice
 * (next file) replays failed check-ins with the same idempotency key.
 * Cache is read-through with a short `keepUnusedDataFor` — persisted cache
 * serving stale job data is risk R24.
 */
export interface ApiContext {
  getToken: () => Promise<string | null>;
  baseUrl: string;
}

let apiContext: ApiContext = {
  getToken: async () => null,
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000',
};

/** Called once from the root layout after Clerk is ready. */
export function configureApiContext(context: Partial<ApiContext>): void {
  apiContext = { ...apiContext, ...context };
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${apiContext.baseUrl}/v1`,
  prepareHeaders: async (headers) => {
    const token = await apiContext.getToken();
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('content-type', 'application/json');
    return headers;
  },
});

const baseQueryWithEnvelope: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =
  async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);
    // Unwrap `{ ok: true, data }` so hooks receive `data` directly; surface
    // `{ ok: false, error }` as the query error with its stable code.
    const payload = result.data as { ok?: boolean; data?: unknown; error?: unknown } | undefined;
    if (payload && typeof payload === 'object' && 'ok' in payload) {
      if (payload.ok === true) {
        return { data: payload.data };
      }
      return {
        error: {
          status: typeof result.error?.status === 'number' ? result.error.status : 500,
          data: payload.error,
        } as FetchBaseQueryError,
      };
    }
    return result;
  };

export const sbsApi = createApi({
  reducerPath: 'sbsApi',
  baseQuery: baseQueryWithEnvelope,
  keepUnusedDataFor: KEEP_UNUSED_DATA_FOR_SECONDS,
  refetchOnReconnect: true,
  refetchOnFocus: true,
  tagTypes: ['Me', 'MyTickets', 'Visit'],
  endpoints: (build) => ({
    /** Caller employment record — F1 auth read (J1). 404 = needs invite. */
    me: build.query<MeResponse, void>({
      query: () => ({ url: 'employees/me' }),
      providesTags: ['Me'],
    }),
    /** My Jobs — technician's own queue (J3 step 1, works from cache offline). */
    myTickets: build.query<MyTicketsResponse, { status?: Ticket['status'] } | void>({
      query: (params) => ({
        url: 'tickets/mine',
        params: { limit: 20, ...(params ?? {}) },
      }),
      providesTags: (result) => [
        'MyTickets',
        ...(result?.tickets.map(({ id }) => ({ type: 'MyTickets' as const, id })) ?? []),
      ],
    }),
    /** Start travel / Arrived — device timestamp captured at tap time (R3). */
    checkIn: build.mutation<Visit, VisitCheckIn>({
      query: (body) => ({ url: 'visits/check-in', method: 'POST', body }),
      invalidatesTags: ['MyTickets', 'Visit'],
    }),
  }),
});

export const { useMeQuery, useMyTicketsQuery, useCheckInMutation } = sbsApi;
