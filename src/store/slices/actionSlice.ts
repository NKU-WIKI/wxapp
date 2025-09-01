import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  ToggleActionRequest,
  ToggleActionResponse,
} from "@/types/api/action";
import { toggleAction as toggleActionApi } from "@/services/api/action";

// 通用交互动作 Thunk (点赞/收藏/关注)
export const toggleAction = createAsyncThunk<
  ToggleActionResponse & { request: ToggleActionRequest }, // 响应体中附加原始请求参数
  ToggleActionRequest,
  { rejectValue: string }
>("action/toggle", async (request, { rejectWithValue }) => {
  try {
    const response = await toggleActionApi(request);
    // 重要：仅返回后端响应的 data 字段，保持与 ToggleActionResponse 类型一致
    return { ...response.data, request };
  } catch (error: any) {
    return rejectWithValue(error.message || `Failed to toggle action`);
  }
});

export interface ActionState {
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ActionState = {
  loading: "idle",
  error: null,
};

const actionSlice = createSlice({
  name: "action",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(toggleAction.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(toggleAction.fulfilled, (state) => {
        state.loading = "succeeded";
      })
      .addCase(toggleAction.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      });
  },
});

export default actionSlice.reducer;
