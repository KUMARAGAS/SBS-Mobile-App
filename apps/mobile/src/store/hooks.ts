import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';

import type { AppDispatch, AppStore, RootState } from './store';

/** Typed hooks — use these, never bare `useDispatch` / `useSelector`. */
export const useAppDispatch: () => AppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector.withTypes<RootState>();
export type { AppDispatch, AppStore, RootState };
