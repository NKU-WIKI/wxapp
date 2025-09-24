import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import Taro from '@tarojs/taro'
import { login as loginApi, register as registerApi } from '@/services/api/auth'
import { getAboutInfo } from '@/services/api/about'
import { getMe, updateMeProfile, getMyStats, getUserById } from '@/services/api/user'
import { getFollowersCount } from '@/services/api/followers'
import { getCollectionCount } from '@/services/api/collection'
import { UnifiedLoginRequest, RegisterRequest } from '@/types/api/auth'
import { User, UpdateUserProfileRequest, UserStats } from '@/types/api/user'
import { AboutInfo } from '@/types/about'
import { RootState } from '@/store'
import { DEFAULT_TENANT_NAME } from '@/constants'

interface UserState {
  user: User | null
  userStats: UserStats | null // 用户统计信息
  token: string | null
  isLoggedIn: boolean
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  statsStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  followersCount: { following_count: number; follower_count: number } | null // 关注/粉丝总数
  followersCountStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  collectionCount: number | null // 收藏的帖子数量
  collectionCountStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  aboutInfo: AboutInfo | null // 健康检查信息（包含租户信息）
  aboutStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: UserState = {
  user: null,
  userStats: null,
  token: Taro.getStorageSync('token') || null, // 从本地存储获取token
  isLoggedIn: false, // Default to false, rely on API check
  status: 'idle',
  statsStatus: 'idle',
  followersCount: null,
  followersCountStatus: 'idle',
  collectionCount: null,
  collectionCountStatus: 'idle',
  aboutInfo: null,
  aboutStatus: 'idle',
  error: null,
}

export const login = createAsyncThunk(
  'user/login',
  async (code: string, { dispatch, getState, rejectWithValue }) => {
    try {
      // 获取健康信息以获得租户ID
      const state = getState() as RootState
      let aboutInfo = state.user.aboutInfo

      if (!aboutInfo) {
        // 如果没有健康信息，先获取
        const aboutResponse = await getAboutInfo()
        aboutInfo = aboutResponse.data
      }

      const tenantId = getTenantId(aboutInfo)
      if (!tenantId) {
        return rejectWithValue('无法获取租户信息，请重试')
      }

      const loginData: UnifiedLoginRequest = {
        mode: 'weapp',
        weapp: {
          code: code,
          tenant_id: tenantId,
        },
      }

      const response = await loginApi(loginData)

      Taro.setStorageSync('token', response.data.access_token)
      // After login, immediately fetch current user info
      dispatch(fetchCurrentUser())
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.msg || error?.message || '登录失败')
    }
  }
)

/**
 * 用户名密码登录
 */
/**
 * 获取健康检查信息（包含租户信息）
 */
export const fetchAboutInfo = createAsyncThunk(
  'user/fetchAboutInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAboutInfo()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.msg || error?.message || '获取租户信息失败')
    }
  }
)

/**
 * 获取租户ID（通过租户名称）
 */
const getTenantId = (
  aboutInfo: AboutInfo | null,
  tenantName: string = DEFAULT_TENANT_NAME
): string => {
  if (!aboutInfo?.tenants) {
    return ''
  }

  const tenantId = aboutInfo.tenants[tenantName]
  if (!tenantId) {
    return ''
  }

  return tenantId
}

export const loginWithUsername = createAsyncThunk(
  'user/loginWithUsername',
  async (
    credentials: { username: string; password: string },
    { dispatch, getState, rejectWithValue }
  ) => {
    try {
      // 先获取健康信息以获得租户ID
      const state = getState() as RootState
      let aboutInfo = state.user.aboutInfo

      if (!aboutInfo) {
        // 如果没有健康信息，先获取
        const aboutResponse = await getAboutInfo()
        aboutInfo = aboutResponse.data
      }

      const tenantId = getTenantId(aboutInfo)
      if (!tenantId) {
        return rejectWithValue('无法获取租户信息，请重试')
      }

      const loginData: UnifiedLoginRequest = {
        mode: 'local',
        local: {
          username: credentials.username,
          password: credentials.password,
          tenant_id: tenantId,
        },
      }

      const response = await loginApi(loginData)

      Taro.setStorageSync('token', response.data.access_token)
      // After login, immediately fetch current user info
      dispatch(fetchCurrentUser())
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.msg || error?.message || '用户名或密码错误')
    }
  }
)

/**
 * 用户注册
 */
export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (
    userData: { username: string; password: string; nickname: string },
    { dispatch, getState, rejectWithValue }
  ) => {
    try {
      const registerData: RegisterRequest = {
        username: userData.username,
        password: userData.password,
        nickname: userData.nickname,
      }

      await registerApi(registerData)

      // 注册成功后自动登录
      const state = getState() as RootState
      let aboutInfo = state.user.aboutInfo

      if (!aboutInfo) {
        // 如果没有健康信息，先获取
        const aboutResponse = await getAboutInfo()
        aboutInfo = aboutResponse.data
      }

      const tenantId = getTenantId(aboutInfo)
      if (!tenantId) {
        return rejectWithValue('无法获取租户信息，请重试')
      }

      const loginData: UnifiedLoginRequest = {
        mode: 'local',
        local: {
          username: userData.username,
          password: userData.password,
          tenant_id: tenantId,
        },
      }

      const loginResponse = await loginApi(loginData)
      Taro.setStorageSync('token', loginResponse.data.access_token)
      dispatch(fetchCurrentUser())

      return loginResponse.data
    } catch (error: any) {
      return rejectWithValue(error?.msg || error?.message || '注册失败')
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMe()
      // Return only the `data` part of the response to the reducer
      return response.data
    } catch (error: any) {
      if (error?.statusCode === 401) {
        Taro.removeStorageSync('token')
      }
      return rejectWithValue(error?.msg || error?.message || '获取用户信息失败')
    }
  }
)

/**
 * 获取指定用户的详细信息
 */
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await getUserById(userId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.msg || error?.message || '获取用户资料失败')
    }
  }
)

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (data: UpdateUserProfileRequest, { dispatch, rejectWithValue }) => {
    try {
      // 注意：这里我们调用 updateMeProfile，但返回的是 UserProfile
      // 我们只用它来更新部分用户信息，或者需要后端返回更新后的 User 对象
      const response = await updateMeProfile(data)
      // 更新成功后，重新获取用户信息以确保数据同步
      await dispatch(fetchCurrentUser())
      return response // 返回的是 UserProfile
    } catch (error: any) {
      return rejectWithValue(error?.msg || error?.message || '更新失败')
    }
  }
)

// 获取用户统计信息
export const fetchUserStats = createAsyncThunk(
  'user/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyStats()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.msg || error?.message || '获取用户统计失败')
    }
  }
)

// 获取关注/粉丝总数
export const fetchFollowersCount = createAsyncThunk(
  'user/fetchFollowersCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getFollowersCount()
      return response
    } catch (error: any) {
      return rejectWithValue(error?.msg || error?.message || '获取关注/粉丝总数失败')
    }
  }
)

// 获取收藏的帖子数量
export const fetchCollectionCount = createAsyncThunk(
  'user/fetchCollectionCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCollectionCount()
      return response
    } catch (error: any) {
      return rejectWithValue(error?.msg || error?.message || '获取收藏数量失败')
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.isLoggedIn = false
      state.user = null
      state.userStats = null
      state.token = null
      state.status = 'idle'
      state.statsStatus = 'idle'
      state.aboutInfo = null // 清除应用信息
      state.aboutStatus = 'idle'
      state.error = null
      Taro.removeStorageSync('token')
    },
    resetUserStats: (state) => {
      state.userStats = null
      state.statsStatus = 'idle'
    },
    resetFollowersCount: (state) => {
      state.followersCount = null
      state.followersCountStatus = 'idle'
    },
    resetCollectionCount: (state) => {
      state.collectionCount = null
      state.collectionCountStatus = 'idle'
    },
    resetAboutInfo: (state) => {
      state.aboutInfo = null
      state.aboutStatus = 'idle'
    },
  },
  extraReducers: (builder) => {
    builder
      // Login (WeChat)
      .addCase(login.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.token = action.payload.access_token
        // Do NOT set isLoggedIn here. Let fetchCurrentUser handle it.
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
      // Login with Username
      .addCase(loginWithUsername.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(loginWithUsername.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.token = action.payload.access_token
        // Do NOT set isLoggedIn here. Let fetchCurrentUser handle it.
        state.error = null
      })
      .addCase(loginWithUsername.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.token = action.payload.access_token
        // Do NOT set isLoggedIn here. Let fetchCurrentUser handle it.
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
      // Fetch Current User (minimal info)
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // 通过 token 判断登录状态：有 token 且获取用户信息成功即视为已登录
        if (state.token) {
          // 有有效 token 且获取到用户信息，视为已登录
          state.user = action.payload
          state.isLoggedIn = true
        } else {
          // 无 token，视为未登录
          state.isLoggedIn = false
          state.user = null
        }
        state.error = null
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
        // 当获取用户信息失败时，清除 token 并设为未登录状态
        state.isLoggedIn = false
        state.user = null
        state.token = null
        Taro.removeStorageSync('token')
      })
      // Update User (Profile)
      .addCase(updateUser.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.status = 'succeeded'
        // 用户资料更新成功，fetchUserProfile已在thunk中调用
        state.error = null
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
      // Fetch User Stats
      .addCase(fetchUserStats.pending, (state) => {
        state.statsStatus = 'loading'
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.statsStatus = 'succeeded'
        state.userStats = action.payload
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.statsStatus = 'failed'
        state.error = action.payload as string
      })
      // Fetch Followers Count
      .addCase(fetchFollowersCount.pending, (state) => {
        state.followersCountStatus = 'loading'
      })
      .addCase(fetchFollowersCount.fulfilled, (state, action) => {
        state.followersCountStatus = 'succeeded'
        state.followersCount = action.payload
      })
      .addCase(fetchFollowersCount.rejected, (state, action) => {
        state.followersCountStatus = 'failed'
        state.error = action.payload as string
      })
      // Fetch Collection Count
      .addCase(fetchCollectionCount.pending, (state) => {
        state.collectionCountStatus = 'loading'
      })
      .addCase(fetchCollectionCount.fulfilled, (state, action) => {
        state.collectionCountStatus = 'succeeded'
        state.collectionCount = action.payload
      })
      .addCase(fetchCollectionCount.rejected, (state, action) => {
        state.collectionCountStatus = 'failed'
        state.error = action.payload as string
      })
      // Fetch About Info
      .addCase(fetchAboutInfo.pending, (state) => {
        state.aboutStatus = 'loading'
      })
      .addCase(fetchAboutInfo.fulfilled, (state, action) => {
        state.aboutStatus = 'succeeded'
        state.aboutInfo = action.payload
        // 将aboutInfo缓存到本地存储，以便在logout后仍能使用
        Taro.setStorageSync('aboutInfo', action.payload)
      })
      .addCase(fetchAboutInfo.rejected, (state, action) => {
        state.aboutStatus = 'failed'
        state.error = action.payload as string
      })
  },
})

export const { logout, resetUserStats, resetFollowersCount, resetCollectionCount, resetAboutInfo } =
  userSlice.actions

export default userSlice.reducer
