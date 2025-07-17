import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Taro from '@tarojs/taro';
import { userApi } from '../../services/api/user';
import { User } from '../../types/api/user';

interface UserState {
  userInfo: User | null;
  token: string | null;
  isLoggedIn: boolean;
}

const initialState: UserState = {
  userInfo: null,
  token: Taro.getStorageSync('token') || null,
  isLoggedIn: !!Taro.getStorageSync('token'),
};

export const login = createAsyncThunk(
  'user/login',
  async (code: string) => {
    const response = await userApi.login({ code });
    Taro.setStorageSync('token', response.data.token);
    return response.data;
  }
);

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async () => {
    const response = await userApi.getMyProfile();
    return response.data;
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (data: Partial<User>) => {
    // 这里的 response 已经是经过拦截器处理后的业务数据包 { code, data, ... }
    const response = await userApi.updateUserProfile(data);
    // 我们需要的是 data 字段里的具体用户信息
    return response.data;
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
      Taro.removeStorageSync('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.userInfo = action.payload.user_info;
        state.isLoggedIn = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.userInfo = action.payload;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        // 此时 action.payload 就是最新的用户信息对象
        if (state.userInfo) {
          // 合并更新，而不是完全替换
          state.userInfo = { ...state.userInfo, ...action.payload };
        } else {
          state.userInfo = action.payload;
        }
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;