import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import feedbackApi from '@/services/api/feedback';
import { Feedback, CreateFeedbackParams } from '@/types/api/feedback.d';

interface FeedbackState {
	feedbacks: Feedback[];
	loading: boolean;
	error: string | null;
	submitting: boolean;
}

const initialState: FeedbackState = {
	feedbacks: [],
	loading: false,
	error: null,
	submitting: false,
};

// 异步action：提交反馈
export const submitFeedback = createAsyncThunk(
	'feedback/submit',
	async (data: CreateFeedbackParams) => {
		const response = await feedbackApi.createFeedback(data);
		return response.data;
	}
);

// 异步action：获取反馈列表
export const getFeedbackList = createAsyncThunk(
	'feedback/getList',
	async (params?: { page?: number; page_size?: number; status?: string }) => {
		const response = await feedbackApi.getFeedbackList(params || {} as any);
		return response.data;
	}
);

const feedbackSlice = createSlice({
	name: 'feedback',
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
		clearFeedbacks: (state) => {
			state.feedbacks = [];
		},
	},
	extraReducers: (builder) => {
		// 提交反馈
		builder
			.addCase(submitFeedback.pending, (state) => {
				state.submitting = true;
				state.error = null;
			})
			.addCase(submitFeedback.fulfilled, (state) => {
				state.submitting = false;
			})
			.addCase(submitFeedback.rejected, (state, action) => {
				state.submitting = false;
				state.error = action.error.message || '提交失败';
			});

		// 获取反馈列表
		builder
			.addCase(getFeedbackList.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(getFeedbackList.fulfilled, (state, action) => {
				state.loading = false;
				const list = (action.payload?.data || []) as any[];
				state.feedbacks = list.map((item) => ({
					...item,
					// 直接使用 type 字段
					type: item.type,
					images: Array.isArray(item.images)
						? item.images
						: (typeof item.images === 'string' && item.images ? (() => { try { return JSON.parse(item.images); } catch { return []; } })() : []),
				}));
			})
			.addCase(getFeedbackList.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message || '获取失败';
			});
	},
});

export const { clearError, clearFeedbacks } = feedbackSlice.actions;
export default feedbackSlice.reducer; 