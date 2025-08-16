import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Taro from "@tarojs/taro";
import { login as loginApi } from "@/services/api/auth";
import {
  getMe,
  updateMeProfile,
  getMeProfile,
} from "@/services/api/user";
import { UnifiedLoginRequest } from "@/types/api/auth";
import { User, UpdateUserProfileRequest, CurrentUser } from "@/types/api/user";
import { RootState } from "@/store";

interface UserState {
  currentUser: CurrentUser | null;
  userProfile: User | null; // For full user details
  token: string | null;
  isLoggedIn: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  userProfile: null,
  token: Taro.getStorageSync("token") || null, // 移除默认token，让用户正常登录
  isLoggedIn: false, // Default to false, rely on API check
  status: "idle",
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

      // Combine basic user info with profile details
      const combinedProfile = {
        id: currentUser?.user_id || 0,
        nickname: currentUser?.nickname || '',
        avatar: '', // Assuming avatar is not in these responses, default to empty
        ...response.data, // This will include assets and interest_tags
      };
      
      return combinedProfile;
    } catch (error: any)      {
      return rejectWithValue(
        error?.msg || error?.message || "获取用户资料失败"
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async (data: UpdateUserProfileRequest, { rejectWithValue }) => {
    try {
      // 注意：这里我们调用 updateMeProfile，但返回的是 UserProfile
      // 我们只用它来更新部分用户信息，或者需要后端返回更新后的 User 对象
      const response = await updateMeProfile(data);
      // 假设我们希望更新后能拿到完整的用户信息，可能需要重新 fetch 或后端直接返回
      // 为简化，这里我们只返回 payload，并在 reducer 中进行 optimistic update
      // 或者我们可以 dispatch(fetchUser())
      return response; // 返回的是 UserProfile
    } catch (error: any) {
      console.error("Update profile API failed:", error);
      return rejectWithValue(error?.msg || error?.message || "更新失败");
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
      state.token = null;
      state.status = "idle";
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
        // Per business logic, user_id 1 indicates a non-logged-in state
        if (action.payload.user_id === 1) {
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
        // Here we could update the userProfile if needed
        // For now, just mark as succeeded
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
