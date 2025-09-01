import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import levelApi from '@/services/api/level';
import { LevelInfo, ExperienceRecordList, ExperienceRecordPage } from '@/types/api/level';

interface LevelState {
	data: LevelInfo | null;
	records: ExperienceRecordList;
	status: 'idle' | 'loading' | 'succeeded' | 'failed';
	error: string | null;
}

const initialState: LevelState = {
	data: null,
	records: [],
	status: 'idle',
	error: null,
};

export const fetchMyLevel = createAsyncThunk('level/fetchMyLevel', async () => {
	const response = await levelApi.getMyLevel();
	return response.data; // 返回 LevelInfo
});

export const fetchTodayExperienceRecords = createAsyncThunk('level/fetchTodayRecords', async () => {
	const response = await levelApi.getMyExperienceRecords();
	// 后端为分页结构，取 items 作为记录数组
	return (response.data as ExperienceRecordPage)?.items || [];
});

const levelSlice = createSlice({
	name: 'level',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchMyLevel.pending, (state) => {
				state.status = 'loading';
				state.error = null;
			})
			.addCase(fetchMyLevel.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.data = action.payload || null;
			})
			.addCase(fetchMyLevel.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message || '加载失败';
			})
			.addCase(fetchTodayExperienceRecords.fulfilled, (state, action) => {
				state.records = action.payload || [];
			});
	},
});

export default levelSlice.reducer; 
