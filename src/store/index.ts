import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import persistStorage from '@/utils/persistStorage';
import rootReducer from './rootReducer';

// 持久化配置
const persistConfig = {
  key: 'root',
  storage: persistStorage, // 使用自定义的 Taro 存储适配器
  // 只持久化指定的reducer
  whitelist: ['chat', 'user'],
};

// 创建持久化reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 配置store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // 允许redux-persist的action通过序列化检查
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// 创建persistor
export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;