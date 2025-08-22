import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Taro from "@tarojs/taro";
import { login as loginApi } from "@/services/api/auth";
import {
  getMe,
  updateMeProfile,
  getMeProfile,
  getMyLevel,
  getMyStats,
} from "@/services/api/user";
import { UnifiedLoginRequest } from "@/types/api/auth";
import { User, UpdateUserProfileRequest, CurrentUser, LevelInfo, UserStats } from "@/types/api/user";
import { RootState } from "@/store";
import { DEFAULT_DEV_TOKEN, NON_LOGGED_IN_USER_ID } from "@/constants";

interface UserState {
  currentUser: CurrentUser | null;
  userProfile: User | null; // For full user details
  userLevel: LevelInfo | null; // 用户等级信息
  userStats: UserStats | null; // 用户统计信息
  token: string | null;
  isLoggedIn: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  levelStatus: "idle" | "loading" | "succeeded" | "failed";
  statsStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  userProfile: null,
  userLevel: null,
  userStats: null,
  token: Taro.getStorageSync("token") || DEFAULT_DEV_TOKEN, // 默认兜底为 DEFAULT_DEV_TOKEN
  isLoggedIn: false, // Default to false, rely on API check
  status: "idle",
  levelStatus: "idle",
  statsStatus: "idle",
  error: null,
};

export const login = createAsyncThunk(
  "user/login",
  async (code: string, { dispatch, rejectWithValue }) => {
    try {
      const tenantId = "f6303899-a51a-460a-9cd8-fe35609151eb"; // Nankai tenant ID
      const loginData: UnifiedLoginRequest = {
        mode: 'weapp',
        weapp: {
          code: code,
          tenant_id: tenantId,
        }
      };
      
      console.log("Sending login request with data:", JSON.stringify(loginData));
      const response = await loginApi(loginData);
      console.log("Login response:", response);
      
      Taro.setStorageSync("token", response.data.access_token);
      // After login, immediately fetch current user info
      dispatch(fetchCurrentUser());
      return response.data;
    } catch (error: any) {
      console.error("Login API failed:", error);
      console.error("Error details:", {
        statusCode: error?.statusCode,
        data: error?.data,
        msg: error?.msg,
        message: error?.message
      });
      return rejectWithValue(error?.msg || error?.message || "登录失败");
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMe();
      // Return only the `data` part of the response to the reducer
      return response.data;
    } catch (error: any) {
      console.error("Fetch user API failed:", error);
      if (error?.statusCode === 401) {
        Taro.removeStorageSync("token");
      }
      return rejectWithValue(
        error?.msg || error?.message || "获取用户信息失败"
      );
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async (_, { getState, rejectWithValue }) => {
    try {
      // This thunk should fetch the detailed profile and merge it
      // with the basic info from currentUser.
      const response = await getMeProfile();
      const state = getState() as RootState;
      const currentUser = state.user.currentUser;

      // 根据OpenAPI文档，响应格式是 ApiResponse<UserProfileDetail>
      const profileData = response.data;
      
      // Combine basic user info with profile details
      const combinedProfile = {
        id: profileData?.user_id || currentUser?.user_id || '',
        tenant_id: '', // 如果需要，可以从其他地方获取
        created_at: profileData?.create_time || '',
        updated_at: '',
        nickname: profileData?.nickname || currentUser?.nickname || '',
        avatar: profileData?.avatar || null,
        bio: profileData?.bio || null,
        birthday: null,
        school: null,
        college: null,
        location: null,
        wechat_id: profileData?.wechat_id || null,
        qq_id: profileData?.qq_id || null,
        tel: profileData?.phone || null,
        status: 'active' as const,
        // 扩展字段
        level: profileData?.level || undefined,
        post_count: profileData?.post_count || undefined,
        total_likes: profileData?.total_likes || undefined,
        following_count: profileData?.following_count || undefined,
        follower_count: profileData?.follower_count || undefined,
        total_favorites: profileData?.total_favorites || undefined,
        points: profileData?.points || undefined,
        // 保留原有的profile数据
        assets: profileData?.assets || {},
        interest_tags: profileData?.interest_tags || [],
        tokens: profileData?.tokens || 0,
        user_id: profileData?.user_id || '',
        role: profileData?.role,
        gender: profileData?.gender,
        create_time: profileData?.create_time,
      };
      
      return combinedProfile;
    } catch (error: any) {
      return rejectWithValue(
        error?.msg || error?.message || "获取用户资料失败"
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async (data: UpdateUserProfileRequest, { dispatch, rejectWithValue }) => {
    try {
      // 注意：这里我们调用 updateMeProfile，但返回的是 UserProfile
      // 我们只用它来更新部分用户信息，或者需要后端返回更新后的 User 对象
      const response = await updateMeProfile(data);
      // 更新成功后，重新获取用户资料以确保数据同步
      await dispatch(fetchUserProfile());
      return response; // 返回的是 UserProfile
    } catch (error: any) {
      console.error("Update profile API failed:", error);
      return rejectWithValue(error?.msg || error?.message || "更新失败");
    }
  }
);

// 获取用户等级信息
export const fetchUserLevel = createAsyncThunk(
  "user/fetchUserLevel",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyLevel();
      return response.data;
    } catch (error: any) {
      console.error("Fetch user level API failed:", error);
      return rejectWithValue(
        error?.msg || error?.message || "获取用户等级失败"
      );
    }
  }
);

// 获取用户统计信息
export const fetchUserStats = createAsyncThunk(
  "user/fetchUserStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyStats();
      return response.data;
    } catch (error: any) {
      console.error("Fetch user stats API failed:", error);
      return rejectWithValue(
        error?.msg || error?.message || "获取用户统计失败"
      );
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.isLoggedIn = false;
      state.currentUser = null;
      state.userProfile = null;
      state.userLevel = null;
      state.userStats = null;
      state.token = null;
      state.status = "idle";
      state.levelStatus = "idle";
      state.statsStatus = "idle";
      state.error = null;
      Taro.removeStorageSync("token");
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.status = "loading";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.access_token;
        // Do NOT set isLoggedIn here. Let fetchCurrentUser handle it.
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Fetch Current User (minimal info)
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        // 按业务约定：当 user_id 或 id 等于 NON_LOGGED_IN_USER_ID 时视为未登录
        const payload: any = action.payload as any;
        const uid = String(payload?.user_id ?? payload?.id ?? "");
        if (uid === NON_LOGGED_IN_USER_ID) {
          state.isLoggedIn = false;
          state.currentUser = null;
        } else {
          state.currentUser = action.payload;
          state.isLoggedIn = true;
        }
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        state.isLoggedIn = false;
        state.currentUser = null;
        state.token = null;
      })
      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userProfile = action.payload; // This should be a User object
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Update User (Profile)
      .addCase(updateUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.status = "succeeded";
        // 用户资料更新成功，fetchUserProfile已在thunk中调用
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // Fetch User Level
      .addCase(fetchUserLevel.pending, (state) => {
        state.levelStatus = "loading";
      })
      .addCase(fetchUserLevel.fulfilled, (state, action) => {
        state.levelStatus = "succeeded";
        state.userLevel = action.payload;
      })
      .addCase(fetchUserLevel.rejected, (state, action) => {
        state.levelStatus = "failed";
        state.error = action.payload as string;
      })
      // Fetch User Stats
      .addCase(fetchUserStats.pending, (state) => {
        state.statsStatus = "loading";
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.statsStatus = "succeeded";
        state.userStats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.statsStatus = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { logout } = userSlice.actions;

export default userSlice.reducer;
