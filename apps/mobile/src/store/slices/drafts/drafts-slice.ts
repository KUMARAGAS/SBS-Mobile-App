import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { VisitCheckIn } from '@sbs/shared';

/**
 * Drafts slice — unsent visit writes (PLAN.md D16 outbox, risk R3).
 *
 * Failed `checkIn` mutations land here with their idempotency key intact;
 * the sync layer replays them verbatim so a dead-zone clock-out is never a
 * pay dispute — same key + same payload returns the stored visit (409 only
 * on genuine conflict).
 */
export interface QueuedCheckIn extends VisitCheckIn {
  /** Local enqueue time — ordering + "unsynced" badge (R3 alert to office). */
  enqueuedAt: string;
  attempts: number;
}

interface DraftsState {
  outbox: QueuedCheckIn[];
}

const initialState: DraftsState = {
  outbox: [],
};

const draftsSlice = createSlice({
  name: 'drafts',
  initialState,
  reducers: {
    enqueueCheckIn(state, action: PayloadAction<VisitCheckIn>) {
      const exists = state.outbox.some(
        (item) => item.idempotencyKey === action.payload.idempotencyKey,
      );
      if (!exists) {
        state.outbox.push({
          ...action.payload,
          enqueuedAt: new Date().toISOString(),
          attempts: 0,
        });
      }
    },
    dequeueCheckIn(state, action: PayloadAction<{ idempotencyKey: string }>) {
      state.outbox = state.outbox.filter(
        (item) => item.idempotencyKey !== action.payload.idempotencyKey,
      );
    },
    markAttempt(state, action: PayloadAction<{ idempotencyKey: string }>) {
      const item = state.outbox.find((q) => q.idempotencyKey === action.payload.idempotencyKey);
      if (item) {
        item.attempts += 1;
      }
    },
    clearOutbox(state) {
      state.outbox = [];
    },
  },
});

export const { enqueueCheckIn, dequeueCheckIn, markAttempt, clearOutbox } = draftsSlice.actions;
export const draftsReducer = draftsSlice.reducer;
