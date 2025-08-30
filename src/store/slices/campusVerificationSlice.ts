import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import campusVerificationApi from '@/services/api/campus-verification';
import { CampusVerificationInfo, CampusVerificationRequest } from '@/types/api/campus-verification';

interface CampusVerificationState {
  info: CampusVerificationInfo | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  submitStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CampusVerificationState = {
  info: null,
  status: 'idle',
  submitStatus: 'idle',
  error: null,
};

// 获取校园认证信息
export const fetchCampusVerificationInfo = createAsyncThunk(
  'campusVerification/fetchInfo',
  async () => {
    const response = await campusVerificationApi.getCampusVerificationInfo();
    return response.data;
  }
);

// 提交校园认证申请
export const submitCampusVerification = createAsyncThunk(
  'campusVerification/submit',
  async (data: CampusVerificationRequest) => {
    const response = await campusVerificationApi.submitCampusVerification(data);
    return response.data;
  }
);

const campusVerificationSlice = createSlice({
  name: 'campusVerification',
  initialState,
  reducers: {
    resetSubmitStatus: (state) => {
      state.submitStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取认证信息
      .addCase(fetchCampusVerificationInfo.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCampusVerificationInfo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.info = action.payload;
      })
      .addCase(fetchCampusVerificationInfo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || '获取认证信息失败';
      })
      // 提交认证申请
      .addCase(submitCampusVerification.pending, (state) => {
        state.submitStatus = 'loading';
        state.error = null;
      })
      .addCase(submitCampusVerification.fulfilled, (state, action) => {
        state.submitStatus = 'succeeded';
        // 提交成功后重新获取认证信息
        if (state.info) {
          state.info.verification_status = 'pending';
        }
      })
      .addCase(submitCampusVerification.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.error.message || '提交认证失败';
      });
  },
});

export const { resetSubmitStatus } = campusVerificationSlice.actions;
export default campusVerificationSlice.reducer; 