import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Taro from '@tarojs/taro';
import { userApi } from '../../services/api/user';
import { User } from '../../types/api/user';

interface UserState {
  userInfo: User | null;
  token: string | null;
  isLoggedIn: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserState = {
  userInfo: null,
  token: Taro.getStorageSync('token') || null,
  isLoggedIn: !!Taro.getStorageSync('token'),
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk(
  'user/login',
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await userApi.login({ code });
      Taro.setStorageSync('token', response.data.token);
      return response.data;
    } catch (error: any) {
      console.error('Login API failed:', error);
      return rejectWithValue(error?.msg || error?.message || '登录失败');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getMyProfile();
      return response.data;
    } catch (error: any) {
      console.error('Fetch profile API failed:', error);
      // HTTP 未授权
      if (error?.statusCode === 401) {
        Taro.removeStorageSync('token');
      }
      return rejectWithValue(error?.msg || error?.message || '获取用户信息失败');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (data: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await userApi.updateUserProfile(data);
      return response.data;
    } catch (error: any) {
      console.error('Update profile API failed:', error);
      return rejectWithValue(error?.msg || error?.message || '更新失败');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.isLoggedIn = false;
      state.userInfo = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      Taro.removeStorageSync('token');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.userInfo = action.payload.user_info;
        state.isLoggedIn = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userInfo = action.payload;
        state.isLoggedIn = true; // 如果能获取到用户信息，说明是登录状态
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        // 如果获取用户信息失败（比如token失效），则登出
        state.isLoggedIn = false;
        state.userInfo = null;
        state.token = null;
      })
      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (state.userInfo && action.payload) {
          const filteredPayload = Object.fromEntries(
            Object.entries(action.payload).filter(([_, value]) => value !== undefined)
          );
          state.userInfo = { ...state.userInfo, ...filteredPayload } as User;
        }
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
