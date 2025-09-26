import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import searchApi from '@/services/api/search';
import { BaseResponse } from '@/types/api/common';
import {
  SearchRequest,
  SearchBundleRead,
  SearchResultItem,
  SearchHistoryResponse,
  SearchHistoryItem,
} from '@/types/api/search';

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

// 搜索状态接口
interface SearchState {
  // 搜索结果
  searchResults: SearchResultItem[];
  total: number;
  searchTime: number;
  isSearching: boolean;
  searchError: string | null;

  // 热门搜索词
  hotQueries: string[];
  isLoadingHotQueries: boolean;
  hotQueriesError: string | null;

  // 搜索历史
  searchHistory: SearchHistoryItem[];
  isLoadingHistory: boolean;
  historyError: string | null;

  // 当前搜索参数
  currentSearchParams: SearchRequest | null;
}

// 初始状态
const initialState: SearchState = {
  searchResults: [],
  total: 0,
  searchTime: 0,
  isSearching: false,
  searchError: null,
  hotQueries: [],
  isLoadingHotQueries: false,
  hotQueriesError: null,
  searchHistory: [],
  isLoadingHistory: false,
  historyError: null,
  currentSearchParams: null,
};

/**
 * 执行搜索的异步thunk
 */
export const performSearch = createAsyncThunk(
  'search/performSearch',
  async (params: SearchRequest, { rejectWithValue }) => {
    try {
      const response = await searchApi.search(params);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error) || '搜索失败');
    }
  },
);

/**
 * 获取热门搜索词的异步thunk
 */
export const fetchHotQueries = createAsyncThunk(
  'search/fetchHotQueries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await searchApi.getHotQueries();
      return response;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error) || '获取热门搜索词失败');
    }
  },
);

/**
 * 获取搜索历史的异步thunk
 */
export const fetchSearchHistory = createAsyncThunk(
  'search/fetchSearchHistory',
  async (pageSize: number = 10, { rejectWithValue }) => {
    try {
      const response = await searchApi.getSearchHistory(pageSize);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error) || '获取搜索历史失败');
    }
  },
);

/**
 * 清空搜索历史的异步thunk
 */
export const clearSearchHistory = createAsyncThunk(
  'search/clearSearchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await searchApi.clearSearchHistory();
      return response;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error) || '清空搜索历史失败');
    }
  },
);

// 创建搜索slice
const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    // 清空搜索结果
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.total = 0;
      state.searchTime = 0;
      state.searchError = null;
      state.currentSearchParams = null;
    },

    // 设置当前搜索参数
    setCurrentSearchParams: (state, action: PayloadAction<SearchRequest>) => {
      state.currentSearchParams = action.payload;
    },

    // 清空搜索错误
    clearSearchError: (state) => {
      state.searchError = null;
    },

    // 清空热门搜索词错误
    clearHotQueriesError: (state) => {
      state.hotQueriesError = null;
    },

    // 清空历史错误
    clearHistoryError: (state) => {
      state.historyError = null;
    },
  },
  extraReducers: (builder) => {
    // 执行搜索
    builder
      .addCase(performSearch.pending, (state) => {
        state.isSearching = true;
        state.searchError = null;
      })
      .addCase(
        performSearch.fulfilled,
        (state, action: PayloadAction<BaseResponse<SearchBundleRead>>) => {
          state.isSearching = false;
          state.searchResults = action.payload.data.items;
          state.total = action.payload.data.total;
          state.searchTime = action.payload.data.search_time;
        },
      )
      .addCase(performSearch.rejected, (state, action) => {
        state.isSearching = false;
        state.searchError = action.payload as string;
        state.searchResults = [];
        state.total = 0;
        state.searchTime = 0;
      });

    // 获取热门搜索词
    builder
      .addCase(fetchHotQueries.pending, (state) => {
        state.isLoadingHotQueries = true;
        state.hotQueriesError = null;
      })
      .addCase(
        fetchHotQueries.fulfilled,
        (state, action: PayloadAction<BaseResponse<string[]>>) => {
          state.isLoadingHotQueries = false;
          state.hotQueries = action.payload.data;
        },
      )
      .addCase(fetchHotQueries.rejected, (state, action) => {
        state.isLoadingHotQueries = false;
        state.hotQueriesError = action.payload as string;
      });

    // 获取搜索历史
    builder
      .addCase(fetchSearchHistory.pending, (state) => {
        state.isLoadingHistory = true;
        state.historyError = null;
      })
      .addCase(
        fetchSearchHistory.fulfilled,
        (state, action: PayloadAction<BaseResponse<SearchHistoryResponse>>) => {
          state.isLoadingHistory = false;
          state.searchHistory = action.payload.data.data;
        },
      )
      .addCase(fetchSearchHistory.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.historyError = action.payload as string;
      });

    // 清空搜索历史
    builder
      .addCase(clearSearchHistory.fulfilled, (state) => {
        state.searchHistory = [];
      })
      .addCase(clearSearchHistory.rejected, (state, action) => {
        state.historyError = action.payload as string;
      });
  },
});

// 导出actions
export const {
  clearSearchResults,
  setCurrentSearchParams,
  clearSearchError,
  clearHotQueriesError,
  clearHistoryError,
} = searchSlice.actions;

// 导出reducer
export default searchSlice.reducer;

// 选择器
export const selectSearchResults = (state: { search: SearchState }) => state.search.searchResults;
export const selectSearchTotal = (state: { search: SearchState }) => state.search.total;
export const selectSearchTime = (state: { search: SearchState }) => state.search.searchTime;
export const selectIsSearching = (state: { search: SearchState }) => state.search.isSearching;
export const selectSearchError = (state: { search: SearchState }) => state.search.searchError;
export const selectHotQueries = (state: { search: SearchState }) => state.search.hotQueries;
export const selectIsLoadingHotQueries = (state: { search: SearchState }) =>
  state.search.isLoadingHotQueries;
export const selectHotQueriesError = (state: { search: SearchState }) =>
  state.search.hotQueriesError;
export const selectSearchHistory = (state: { search: SearchState }) => state.search.searchHistory;
export const selectIsLoadingHistory = (state: { search: SearchState }) =>
  state.search.isLoadingHistory;
export const selectHistoryError = (state: { search: SearchState }) => state.search.historyError;
export const selectCurrentSearchParams = (state: { search: SearchState }) =>
  state.search.currentSearchParams;
