import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Taro from '@tarojs/taro';
import { userApi } from '@/services/api/user';
import { UserInfo } from '@/types/api/user';

interface UserState {
  userInfo: UserInfo | null;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
  token: string | null;
  isLoggedIn: boolean;
}

const initialState: UserState = {
  userInfo: null,
  loading: 'idle',
  error: null,
  token: Taro.getStorageSync('token') || null,
  isLoggedIn: !!Taro.getStorageSync('token'),
};

export const loginWithWechat = createAsyncThunk<any, void, { rejectValue: string }>(
  'user/loginWithWechat',
  async (_, { rejectWithValue }) => {
    try {
      const loginRes = await Taro.login();
      const code = loginRes.code;
      const response = await userApi.login({ code });
      Taro.setStorageSync('token', response.data.token);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const checkAuth = createAsyncThunk<any, void, { rejectValue: string }>(
  'user/checkAuth',
  async (_, { dispatch, rejectWithValue }) => {
    const token = Taro.getStorageSync('token');
    if (!token) {
      return rejectWithValue('No token found');
    }
    try {
      // 这里应该调用一个后端接口来验证 token 的有效性
      // 暂时我们假设只要有 token 就是有效的
      const response = await userApi.getProfile();
      return response.data;
    } catch (error: any) {
      dispatch(logout());
      return rejectWithValue('Token is invalid or expired');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.userInfo = null;
      state.token = null;
      state.isLoggedIn = false;
      Taro.removeStorageSync('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithWechat.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(loginWithWechat.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.userInfo = action.payload.user_info;
        state.token = action.payload.token;
        state.isLoggedIn = true;
      })
      .addCase(loginWithWechat.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || 'Login failed';
        state.isLoggedIn = false;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoggedIn = true;
        state.userInfo = action.payload;
        state.loading = 'succeeded';
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoggedIn = false;
        state.userInfo = null;
        state.token = null;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;