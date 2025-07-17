import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // 在 Redux 中存储非序列化数据（如 Date 对象、函数等）时，
      // RTK 的序列化检查中间件会发出警告。在某些情况下，这可能是必要的，
      // 但也可能导致不必要的日志噪音。
      // serializableCheck: false,
    }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store; 