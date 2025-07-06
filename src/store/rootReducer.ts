import { combineReducers } from '@reduxjs/toolkit';
import postsReducer from './slices/postSlice';

const rootReducer = combineReducers({
  posts: postsReducer,
  // 在这里添加其他的 reducer
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer; 