import { combineReducers } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import postReducer from './slices/postSlice';
import aboutReducer from './slices/aboutSlice'; // 导入 aboutReducer
import chatReducer from './slices/chatSlice'; // 导入 chatReducer
import commentReducer from './slices/commentSlice'; // 导入 commentReducer

const rootReducer = combineReducers({
  user: userReducer,
  post: postReducer,
  about: aboutReducer, // 添加 aboutReducer
  chat: chatReducer, // 添加 chatReducer
  comment: commentReducer, // 添加 commentReducer
});

export default rootReducer;