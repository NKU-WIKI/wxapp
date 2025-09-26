import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAboutInfo } from '@/services/api/about';
import { AboutInfo } from '@/types/about.d';

// 错误处理辅助函数
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return '操作失败';
};

interface AboutState {
  info: AboutInfo | null;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AboutState = {
  info: null,
  loading: 'idle',
  error: null,
};

export const fetchAboutInfo = createAsyncThunk(
  'about/fetchInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAboutInfo();
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error) || 'Failed to fetch about info');
    }
  },
);

const aboutSlice = createSlice({
  name: 'about',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAboutInfo.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchAboutInfo.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.info = action.payload;
      })
      .addCase(fetchAboutInfo.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default aboutSlice.reducer;
