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
    try {
      const response = await userApi.login({ code });
      Taro.setStorageSync('token', response.data.token);
      return response.data;
    } catch (error) {
      console.log('Login API failed, using mock data');
      // 提供模拟数据作为后备方案
      const mockData = {
        token: 'mock-token-123',
        user_info: {
          id: 1,
          nickname: '测试用户',
          avatar: 'https://picsum.photos/80/80?random=1',
          gender: 1,
          level: '1',
          bio: '这是一个测试用户',
          wechatId: 'test_wx_001',
          qqId: '123456789',
          post_count: 5,
          follower_count: 12,
          following_count: 8
        }
      };
      Taro.setStorageSync('token', mockData.token);
      return mockData;
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async () => {
    try {
      const response = await userApi.getMyProfile();
      return response.data;
    } catch (error) {
      console.log('Fetch profile API failed, using mock data');
      // 提供模拟数据作为后备方案
      return {
        id: 1,
        nickname: '测试用户',
        avatar: 'https://picsum.photos/80/80?random=1',
        gender: 1,
        level: '1',
        bio: '这是一个测试用户',
        wechatId: 'test_wx_001',
        qqId: '123456789',
        post_count: 5,
        follower_count: 12,
        following_count: 8
      };
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (data: Partial<User>) => {
    try {
      // 这里的 response 已经是经过拦截器处理后的业务数据包 { code, data, ... }
      const response = await userApi.updateUserProfile(data);
      // 我们需要的是 data 字段里的具体用户信息
      return response.data;
    } catch (error) {
      console.log('Update profile API failed, returning input data');
      // API 失败时，直接返回输入的数据作为更新结果
      return data;
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
        if (state.userInfo && action.payload) {
          // 合并更新，而不是完全替换，过滤掉 undefined 值
          const filteredPayload = Object.fromEntries(
            Object.entries(action.payload).filter(([_, value]) => value !== undefined)
          );
          state.userInfo = { ...state.userInfo, ...filteredPayload } as User;
        } else if (action.payload) {
          // 确保 action.payload 包含所有必需的字段
          state.userInfo = {
            id: 0,
            nickname: '',
            avatar: '',
            gender: 1,
            level: '1',
            ...action.payload
          } as User;
        }
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;