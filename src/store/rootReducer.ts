import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from 'redux-persist';
import persistStorage from '@/utils/persistStorage';
import userReducer from "./slices/userSlice";
import postReducer from "./slices/postSlice";
import commentReducer from "./slices/commentSlice";
import actionReducer from "./slices/actionSlice"; // Action slice for like/favorite/follow actions
import likeReducer from "./slices/likeSlice"; // Like list slice
import aboutReducer from "./slices/aboutSlice";
import chatReducer from "./slices/chatSlice";
import feedbackReducer from "./slices/feedbackSlice";
import levelReducer from "./slices/levelSlice";
import settingsReducer from "./slices/settingsSlice"; // Settings slice

const userPersistConfig = {
  key: 'user',
  storage: persistStorage,
  // Do not persist these fields
  blacklist: ['isLoggedIn', 'status', 'error'],
};

const settingsPersistConfig = {
  key: 'settings',
  storage: persistStorage,
  // 持久化所有设置
};

const rootReducer = combineReducers({
  user: persistReducer(userPersistConfig, userReducer),
  post: postReducer,
  comment: commentReducer,
  action: actionReducer,
  like: likeReducer, // Add like list reducer
  about: aboutReducer,
  chat: chatReducer,
  feedback: feedbackReducer,
  level: levelReducer,
  settings: persistReducer(settingsPersistConfig, settingsReducer), // Add settings reducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;