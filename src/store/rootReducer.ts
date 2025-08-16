import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from 'redux-persist';
import persistStorage from '@/utils/persistStorage';
import userReducer from "./slices/userSlice";
import postReducer from "./slices/postSlice";
import commentReducer from "./slices/commentSlice";
import actionReducer from "./slices/likeSlice"; // Renamed from likeSlice
import aboutReducer from "./slices/aboutSlice";
import chatReducer from "./slices/chatSlice";
import feedbackReducer from "./slices/feedbackSlice";

const userPersistConfig = {
  key: 'user',
  storage: persistStorage,
  // Do not persist these fields
  blacklist: ['isLoggedIn', 'status', 'error'],
};

const rootReducer = combineReducers({
  user: persistReducer(userPersistConfig, userReducer),
  post: postReducer,
  comment: commentReducer,
  action: actionReducer,
  about: aboutReducer,
  chat: chatReducer,
  feedback: feedbackReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;