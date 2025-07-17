import { combineReducers } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import postReducer from './slices/postSlice';
import aboutReducer from './slices/aboutSlice'; // 导入 aboutReducer

const rootReducer = combineReducers({
  user: userReducer,
  post: postReducer,
  about: aboutReducer, // 添加 aboutReducer
});

export default rootReducer;