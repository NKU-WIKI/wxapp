import { combineReducers } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import postReducer from './slices/postSlice';
import aboutReducer from './slices/aboutSlice';
import chatReducer from './slices/chatSlice';
import commentReducer from './slices/commentSlice';
import likeReducer from './slices/likeSlice';
import userCommentReducer from './slices/userCommentSlice';
import feedbackReducer from './slices/feedbackSlice';

const rootReducer = combineReducers({
  user: userReducer,
  post: postReducer,
  about: aboutReducer,
  chat: chatReducer,
  comment: commentReducer,
  like: likeReducer,
  userComment: userCommentReducer,
  feedback: feedbackReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;