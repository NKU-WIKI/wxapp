import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from 'redux-persist';
import persistStorage from '@/utils/persistStorage';
import userReducer from "./slices/userSlice";
import postReducer from "./slices/postSlice";
import commentReducer from "./slices/commentSlice";
import actionReducer from "./slices/actionSlice"; // Action slice for like/favorite/follow actions
import likeReducer from "./slices/likeSlice"; // Like list slice
import userCommentReducer from "./slices/userCommentSlice"; // User comment list slice
import favoriteReducer from "./slices/favoriteSlice"; // Favorite list slice
import userPostsReducer from "./slices/userPostsSlice"; // User posts list slice
import likesReducer from "./slices/likesSlice"; // User likes list slice
import aboutReducer from "./slices/aboutSlice";
import chatReducer from "./slices/chatSlice";
import feedbackReducer from "./slices/feedbackSlice";
import levelReducer from "./slices/levelSlice";
import settingsReducer from "./slices/settingsSlice"; // Settings slice
import searchReducer from "./slices/searchSlice"; // Search slice

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
  userComment: userCommentReducer, // Add user comment list reducer
  favorite: favoriteReducer, // Add favorite list reducer
  userPosts: userPostsReducer, // Add user posts list reducer
  likes: likesReducer, // Add user likes list reducer
  about: aboutReducer,
  chat: chatReducer,
  feedback: feedbackReducer,
  level: levelReducer,
  settings: persistReducer(settingsPersistConfig, settingsReducer), // Add settings reducer
  search: searchReducer, // Add search reducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;