import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { draftsReducer } from './slices/drafts/drafts-slice';
import { sbsApi } from './api';

/**
 * Mobile store (PLAN.md D14/D16, §8.5 — mirror shape of `apps/admin`).
 * RTK + RTK Query only; no ad-hoc fetch wrappers. No `redux-persist` yet —
 * the outbox slice is the durable queue for Phase 1; persisted-query-cache
 * arrives with the offline pass (R24 short-TTL discipline included then).
 */
const rootReducer = combineReducers({
  [sbsApi.reducerPath]: sbsApi.reducer,
  drafts: draftsReducer,
});

export function createStore() {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefault) => getDefault().concat(sbsApi.middleware),
  });
  setupListeners(store.dispatch);
  return store;
}

export type AppStore = ReturnType<typeof createStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore['dispatch'];
