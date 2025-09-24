import { combineReducers } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'

import persistStorage from '@/utils/persistStorage'

import aboutReducer from './slices/aboutSlice'
import actionReducer from './slices/actionSlice' // Action slice for like/favorite/follow actions
import campusVerificationReducer from './slices/campusVerificationSlice' // Campus verification slice
import chatReducer from './slices/chatSlice'
import commentReducer from './slices/commentSlice'
import favoriteReducer from './slices/favoriteSlice' // Favorite list slice
import feedbackReducer from './slices/feedbackSlice'
import levelReducer from './slices/levelSlice'
import likeReducer from './slices/likeSlice' // Like list slice
import likesReducer from './slices/likesSlice' // User likes list slice
import marketplaceReducer from './slices/marketplaceSlice' // Marketplace slice
import noteReducer from './slices/noteSlice' // Note slice
import notificationReducer from './slices/notificationSlice' // Notification slice
import postReducer from './slices/postSlice'
import ratingReducer from './slices/ratingSlice' // Rating slice
import searchReducer from './slices/searchSlice' // Search slice
import settingsReducer from './slices/settingsSlice' // Settings slice
import userCommentReducer from './slices/userCommentSlice' // User comment list slice
import userPostsReducer from './slices/userPostsSlice' // User posts list slice
import userReducer from './slices/userSlice'


const userPersistConfig = {
  key: 'user',
  storage: persistStorage,
  // Do not persist these fields
  blacklist: ['isLoggedIn', 'status', 'error'],
}

const settingsPersistConfig = {
  key: 'settings',
  storage: persistStorage,
  // 持久化所有设置
}

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
  note: noteReducer, // Add note reducer
  campusVerification: campusVerificationReducer, // Add campus verification reducer
  rating: ratingReducer, // Add rating reducer
  marketplace: marketplaceReducer, // Add marketplace reducer
  notification: notificationReducer, // Add notification reducer
})

export type RootState = ReturnType<typeof rootReducer>
export default rootReducer
