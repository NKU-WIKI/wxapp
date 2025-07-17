import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState } from './rootReducer';
import type { ThunkDispatch } from 'redux-thunk';
import type { AnyAction } from 'redux';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<ThunkDispatch<RootState, any, AnyAction>>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 