import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import noteApi, { NoteListItem, CreateNoteRequest } from '@/services/api/note';
import { getActionStatus } from '@/services/api/user';
import { BaseResponse } from '@/types/api/common';
import type { NoteDetail } from '@/types/api/note';

// Mock数据，用于展示功�?const createMockNotes = (): NoteListItem[] => {
const mockNotes: NoteListItem[] = [
  {
    id: 'mock-1',
    title: '机器学习入门指南',
    content: '这是一份详细的机器学习入门指南，涵盖了从基础概念到实际应用的全部内容，包括监督学习、无监督学习、深度学习等核心概念...',
    category_id: 'tech',
    tags: ['机器学习', 'AI', '入门'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_public: true,
    view_count: 150,
    like_count: 23,
    comment_count: 8,
    author_name: '张同学',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang',
    user_id: 'user-001' // 新增：用户ID
  },
  {
    id: 'mock-2',
    title: '南开大学校园生活指南',
    content: '作为南开新生，这里整理了一些实用的校园生活小贴士，包括食堂推荐、图书馆使用指南、选课技巧等...',
    category_id: 'life',
    tags: ['南开', '校园生活', '新生指南'],
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    is_public: true,
    view_count: 89,
    like_count: 15,
    comment_count: 5,
    author_name: '李小明',
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li',
    user_id: 'user-002' // 新增：用户ID
  },
  {
    id: 'mock-3',
    title: 'React Hooks 最佳实践',
    content: '总结了React Hooks的常见使用模式和最佳实践，包括useState、useEffect、useContext等常用hooks的详细用法...',
    category_id: 'tech',
    tags: ['React', 'Hooks', '前端'],
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
    is_public: true,
    view_count: 234,
    like_count: 45,
    comment_count: 12,
    author_name: '王程序员',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang',
    user_id: 'user-003' // 新增：用户ID
  },
  {
    id: 'mock-4',
    title: '天津美食探店记录',
    content: '记录了在天津吃过的各种美食，从街边小吃到高档餐厅，每一家都有详细的评价和推�?..',
    category_id: 'food',
    tags: ['美食', '天津', '探店'],
    created_at: new Date(Date.now() - 10800000).toISOString(),
    updated_at: new Date(Date.now() - 10800000).toISOString(),
    is_public: true,
    view_count: 67,
    like_count: 18,
    comment_count: 6,
    author_name: '美食家小陈',
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chen',
    user_id: 'user-004' // 新增：用户ID
  },
  {
    id: 'mock-5',
    title: '数据结构与算法笔�?,
      content: '整理的数据结构与算法复习笔记，包含常见题型和解题思路，涵盖链表、树、图等重要数据结�?..',
    category_id: 'study',
    tags: ['算法', '数据结构', '计算机科�?],
      created_at: new Date(Date.now() - 14400000).toISOString(),
      updated_at: new Date(Date.now() - 14400000).toISOString(),
      is_public: true,
      view_count: 312,
      like_count: 67,
      comment_count: 23,
      author_name: '算法小能�?,
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=algo',
      user_id: 'user-005' // 新增：用户ID
    },
  {
    id: 'mock-6',
    title: '摄影入门技巧分�?,
      content: '分享一些摄影的基本技巧和后期处理方法，从构图到光线运�?..',
    category_id: 'hobby',
    tags: ['摄影', '技�?],
      created_at: new Date(Date.now() - 18000000).toISOString(),
      updated_at: new Date(Date.now() - 18000000).toISOString(),
      is_public: true,
      view_count: 128,
      like_count: 29,
      comment_count: 11,
      author_name: '摄影师小�?,
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=photo',
      user_id: 'user-006' // 新增：用户ID
    },
  {
    id: 'mock-7',
    title: 'TypeScript 进阶指南',
    content: '深入理解TypeScript的高级特性，包括泛型、装饰器、模块系统等内容，提升代码质量和开发效�?,
      category_id: 'tech',
    tags: ['TypeScript', '进阶'],
    created_at: new Date(Date.now() - 21600000).toISOString(),
    updated_at: new Date(Date.now() - 21600000).toISOString(),
    is_public: true,
    view_count: 89,
    like_count: 16,
    comment_count: 4,
    author_name: 'TS大师',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ts',
    user_id: 'user-007' // 新增：用户ID
  },
  {
    id: 'mock-8',
    title: '考研数学复习心得',
    content: '分享考研数学的复习经验和方法，包括高数、线代、概率论的重点知识总结',
    category_id: 'study',
    tags: ['考研', '数学', '复习'],
    created_at: new Date(Date.now() - 25200000).toISOString(),
    updated_at: new Date(Date.now() - 25200000).toISOString(),
    is_public: true,
    view_count: 203,
    like_count: 42,
    comment_count: 18,
    author_name: '数学小王�?,
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=math',
    user_id: 'user-008' // 新增：用户ID
  },
  {
    id: 'mock-9',
    title: '健身入门完全指南',
    content: '从零开始的健身指南，包括基础动作、训练计划、饮食搭配等方面的详细介�?,
      category_id: 'health',
    tags: ['健身', '运动', '健康'],
    created_at: new Date(Date.now() - 28800000).toISOString(),
    updated_at: new Date(Date.now() - 28800000).toISOString(),
    is_public: true,
    view_count: 156,
    like_count: 34,
    comment_count: 9,
    author_name: '健身达人',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fitness',
    user_id: 'user-009' // 新增：用户ID
  },
  {
    id: 'mock-10',
    title: '学习Python的最佳路�?,
      content: 'Python学习路线图，从基础语法到高级应用，包含实战项目推荐',
    category_id: 'tech',
    tags: ['Python', '编程', '学习路径'],
    created_at: new Date(Date.now() - 32400000).toISOString(),
    updated_at: new Date(Date.now() - 32400000).toISOString(),
    is_public: true,
    view_count: 278,
    like_count: 52,
    comment_count: 15,
    author_name: 'Python老师',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=python',
    user_id: 'user-010' // 新增：用户ID
  },
  {
    id: 'mock-11',
    title: '旅行摄影技巧分�?,
      content: '旅行中如何拍出好照片，风光摄影的构图技巧和设备选择',
    category_id: 'travel',
    tags: ['旅行', '摄影', '技�?],
      created_at: new Date(Date.now() - 36000000).toISOString(),
      updated_at: new Date(Date.now() - 36000000).toISOString(),
      is_public: true,
      view_count: 123,
      like_count: 28,
      comment_count: 7,
      author_name: '旅行摄影�?,
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=travel',
      user_id: 'user-011' // 新增：用户ID
    },
  {
    id: 'mock-12',
    title: '前端面试经验总结',
    content: '整理了前端面试中的常见问题和答题技巧，包括HTML、CSS、JavaScript、React�?,
      category_id: 'tech',
    tags: ['前端', '面试', '经验'],
    created_at: new Date(Date.now() - 39600000).toISOString(),
    updated_at: new Date(Date.now() - 39600000).toISOString(),
    is_public: true,
    view_count: 345,
    like_count: 78,
    comment_count: 25,
    author_name: '前端工程�?,
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=frontend',
    user_id: 'user-012' // 新增：用户ID
  },
  {
    id: 'mock-13',
    title: '咖啡入门指南',
    content: '从咖啡豆的选择到冲泡技巧，带你进入咖啡的世�?,
      category_id: 'lifestyle',
    tags: ['咖啡', '生活', '品味'],
    created_at: new Date(Date.now() - 43200000).toISOString(),
    updated_at: new Date(Date.now() - 43200000).toISOString(),
    is_public: true,
    view_count: 92,
    like_count: 21,
    comment_count: 6,
    author_name: '咖啡爱好�?,
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=coffee',
    user_id: 'user-013' // 新增：用户ID
  },
  {
    id: 'mock-14',
    title: '英语学习方法分享',
    content: '提高英语口语和听力的实用方法，包括学习资源推�?,
      category_id: 'study',
    tags: ['英语', '学习方法', '口语'],
    created_at: new Date(Date.now() - 46800000).toISOString(),
    updated_at: new Date(Date.now() - 46800000).toISOString(),
    is_public: true,
    view_count: 187,
    like_count: 36,
    comment_count: 12,
    author_name: '英语老师',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=english',
    user_id: 'user-014' // 新增：用户ID
  },
  {
    id: 'mock-15',
    title: '手工制作教程',
    content: '简单易学的手工制作项目，培养动手能力和创造力',
    category_id: 'hobby',
    tags: ['手工', 'DIY', '创意'],
    created_at: new Date(Date.now() - 50400000).toISOString(),
    updated_at: new Date(Date.now() - 50400000).toISOString(),
    is_public: true,
    view_count: 76,
    like_count: 19,
    comment_count: 4,
    author_name: '手工达人',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=craft',
    user_id: 'user-015' // 新增：用户ID
  },
  {
    id: 'mock-16',
    title: '投资理财入门',
    content: '理财新手必看，基金、股票、保险等投资工具的基础知识',
    category_id: 'finance',
    tags: ['理财', '投资', '基金'],
    created_at: new Date(Date.now() - 54000000).toISOString(),
    updated_at: new Date(Date.now() - 54000000).toISOString(),
    is_public: true,
    view_count: 234,
    like_count: 48,
    comment_count: 16,
    author_name: '理财顾问',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=finance',
    user_id: 'user-016' // 新增：用户ID
  },
  {
    id: 'mock-17',
    title: '极简生活心得',
    content: '分享极简生活的理念和实践方法，让生活更简单更快乐',
    category_id: 'lifestyle',
    tags: ['极简', '生活方式', '断舍�?],
      created_at: new Date(Date.now() - 57600000).toISOString(),
      updated_at: new Date(Date.now() - 57600000).toISOString(),
      is_public: true,
      view_count: 145,
      like_count: 33,
      comment_count: 8,
      author_name: '极简主义�?,
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minimal',
      user_id: 'user-017' // 新增：用户ID
    },
  {
    id: 'mock-18',
    title: '美食制作小技�?,
      content: '家常菜制作的小技巧和窍门，让你的厨艺更上一层楼',
    category_id: 'food',
    tags: ['美食', '烹饪', '技�?],
      created_at: new Date(Date.now() - 61200000).toISOString(),
      updated_at: new Date(Date.now() - 61200000).toISOString(),
      is_public: true,
      view_count: 198,
      like_count: 41,
      comment_count: 13,
      author_name: '美食博主',
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cooking',
      user_id: 'user-018' // 新增：用户ID
    }
];

return mockNotes;
};

// 异步thunk - 获取笔记动�?export const fetchNoteFeed = createAsyncThunk(
'note/fetchNoteFeed',
  async (params: { skip?: number; limit?: number } = {}) => {
    // 不再需要检查登录状态，因为API支持可选认�?    
    try {
      // 无论是否登录都尝试调用笔记推荐流接口（可选认证）
      const response = await noteApi.getNoteFeed(params);

      // 详细检查可能的用户ID字段
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const firstNote = response.data[0];

        // 检查整个笔记对象的结构

        // 检查后端数据是否完整（是否有用户信息）
        const hasUserInfo = firstNote.user_id || firstNote.author_id || firstNote.creator_id ||
          firstNote.user || firstNote.author || firstNote.creator;

        if (!hasUserInfo) {
        }
      }

      return response;
    } catch (error: any) {
      // Fallback到普通笔记列表接�?      try {
      const fallbackParams = {
        skip: params.skip || 0,
        limit: params.limit || 20,
        sort_by: 'created_at',
        sort_order: 'desc' as const
      };

      const fallbackResponse = await noteApi.getNotes(fallbackParams);
      return fallbackResponse;
    } catch (fallbackError: any) {
      // 如果所有API都失败，使用模拟数据作为最后的后备方案
      const mockData = createMockNotes();
      const skip = params.skip || 0;
      const limit = params.limit || 20;
      const slicedMockData = mockData.slice(skip, skip + limit);

      return {
        code: 0,
        message: 'success',
        data: slicedMockData
      };
    }
  }
  }
);

// 异步thunk - 创建笔记
export const createNote = createAsyncThunk<
  BaseResponse<NoteDetail>,
  CreateNoteRequest
>(
  'note/createNote',
  async (noteData: CreateNoteRequest, { rejectWithValue }) => {
    try {

      const response = await noteApi.createNote(noteData);

      return response;
    } catch (error: any) {

      return rejectWithValue(error.message || '创建笔记失败');
    }
  }
);

// 异步thunk - 加载更多笔记
export const loadMoreNotes = createAsyncThunk(
  'note/loadMoreNotes',
  async (params: { skip?: number; limit?: number } = {}) => {
    // 不再需要检查登录状态，因为API支持可选认�?    
    try {
      // 无论是否登录都尝试调用笔记推荐流接口（可选认证）
      const response = await noteApi.getNoteFeed(params);
      return response;
    } catch (error: any) {

      // Fallback到普通笔记列表接�?      try {
      const fallbackParams = {
        skip: params.skip || 0,
        limit: params.limit || 20,
        sort_by: 'created_at',
        sort_order: 'desc' as const
      };

      const fallbackResponse = await noteApi.getNotes(fallbackParams);
      return fallbackResponse;
    } catch (fallbackError: any) {

      // 如果所有API都失败，使用模拟数据作为最后的后备方案
      const mockData = createMockNotes();
      const skip = params.skip || 0;
      const limit = params.limit || 20;
      const slicedMockData = mockData.slice(skip, skip + limit);

      return {
        code: 0,
        message: 'success',
        data: slicedMockData
      };
    }
  }
  }
);

// 批量查询笔记的用户交互状�?export const fetchNotesInteractionStatus = createAsyncThunk(
'note/fetchNotesInteractionStatus',
  async (noteIds: string[], { getState }) => {
    const state = getState() as any;
    const isLoggedIn = state.user?.isLoggedIn || false;

    if (!isLoggedIn || noteIds.length === 0) {
      return {};
    }

    try {
      // 并发查询所有笔记的点赞和收藏状�?      const statusPromises = noteIds.flatMap(noteId => [
      getActionStatus(noteId, 'note', 'like').then(res => ({
        noteId,
        type: 'like' as const,
        status: res.data?.is_active || false
      })).catch(() => ({
        noteId,
        type: 'like' as const,
        status: false
      })),
        getActionStatus(noteId, 'note', 'favorite').then(res => ({
          noteId,
          type: 'favorite' as const,
          status: res.data?.is_active || false
        })).catch(() => ({
          noteId,
          type: 'favorite' as const,
          status: false
        }))
      ]);

      const results = await Promise.all(statusPromises);

      // 组织返回数据
      const statusMap: Record<string, { is_liked: boolean; is_favorited: boolean }> = {};

      results.forEach(result => {
        if (!statusMap[result.noteId]) {
          statusMap[result.noteId] = { is_liked: false, is_favorited: false };
        }

        if (result.type === 'like') {
          statusMap[result.noteId].is_liked = result.status;
        } else if (result.type === 'favorite') {
          statusMap[result.noteId].is_favorited = result.status;
        }
      });

      return statusMap;
    } catch (error) {
      return {};
    }
  }
);

// 扩展的笔记列表项，包含用户交互状�?interface NoteListItemWithStatus extends NoteListItem {
is_liked ?: boolean;
is_favorited ?: boolean;
interaction_loading ?: boolean;
}

interface NoteState {
  notes: NoteListItemWithStatus[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  creating: boolean;
  createError: string | null;
}

const initialState: NoteState = {
  notes: [],
  loading: false,
  refreshing: false,
  hasMore: true,
  error: null,
  page: 1,
  pageSize: 20,
  creating: false,
  createError: null,
};

const noteSlice = createSlice({
  name: 'note',
  initialState,
  reducers: {
    resetNotes: (state) => {
      state.notes = [];
      state.page = 1;
      state.hasMore = true;
      state.error = null;
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.refreshing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
    // 获取笔记动�?      .addCase(fetchNoteFeed.pending, (state) => {
    state.loading = true;
    state.error = null;
  })
  .addCase(fetchNoteFeed.fulfilled, (state, action) => {
    state.loading = false;
    state.refreshing = false;
    // action.payload 现在是完整的API响应
    const response = action.payload;

    if (response.code === 0 && Array.isArray(response.data)) {
      state.notes = response.data;
      state.hasMore = response.data.length >= state.pageSize;
      state.page = 1;
      state.error = null;
    } else {
      state.error = response.message || '获取笔记失败';
    }
  })
  .addCase(fetchNoteFeed.rejected, (state, action) => {
    state.loading = false;
    state.refreshing = false;
    state.error = action.payload as string || action.error.message || '获取笔记失败';
  })
  // 加载更多笔记
  .addCase(loadMoreNotes.pending, (state) => {
    state.loading = true;
    state.error = null;
  })
  .addCase(loadMoreNotes.fulfilled, (state, action) => {
    state.loading = false;
    // action.payload 现在是完整的API响应
    const response = action.payload;

    if (response.code === 0 && Array.isArray(response.data)) {
      // 去重并追加新笔记
      const existingIds = new Set(state.notes.map(note => note.id));
      const newNotes = response.data.filter(note => !existingIds.has(note.id));
      state.notes = [...state.notes, ...newNotes];
      state.hasMore = response.data.length >= state.pageSize;
      state.page += 1;
      state.error = null;
    } else {
      state.error = response.message || '加载更多笔记失败';
    }
  })
  .addCase(loadMoreNotes.rejected, (state, action) => {
    state.loading = false;
    state.error = action.error.message || '加载更多笔记失败';
  })
  // 创建笔记
  .addCase(createNote.pending, (state) => {
    state.creating = true;
    state.createError = null;
  })
  .addCase(createNote.fulfilled, (state, action) => {
    state.creating = false;
    const response = action.payload;

    if (response.code === 0 && response.data) {
      // 将新创建的笔记添加到列表顶部
      const newNote: NoteListItem = {
        id: response.data.id,
        title: response.data.title,
        content: response.data.content || '',
        category_id: response.data.category_id,
        tags: response.data.tags || [],
        created_at: response.data.created_at,
        updated_at: response.data.updated_at,
        is_public: response.data.visibility === 'PUBLIC',
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        author_name: response.data.author?.nickname || '�?,
            author_avatar: response.data.author?.avatar || ''
      };
      state.notes = [newNote, ...state.notes];
      state.createError = null;
    } else {
      state.createError = response.message || '创建笔记失败';
    }
  })
  .addCase(createNote.rejected, (state, action) => {
    state.creating = false;
    state.createError = action.payload as string || action.error.message || '创建笔记失败';
  })
// 批量查询交互状�?      .addCase(fetchNotesInteractionStatus.fulfilled, (state, action) => {
const statusMap = action.payload;

        // 更新笔记的交互状�?        state.notes = state.notes.map(note => ({
          ...note,
  is_liked: statusMap[note.id]?.is_liked ?? note.is_liked ?? false,
    is_favorited: statusMap[note.id]?.is_favorited ?? note.is_favorited ?? false,
      interaction_loading: false
        }));
      })
      .addCase(fetchNotesInteractionStatus.pending, (state, _action) => {
        // 标记正在查询交互状态的笔记
        const noteIds = _action.meta.arg;
        state.notes = state.notes.map(note => ({
          ...note,
          interaction_loading: noteIds.includes(note.id) ? true : note.interaction_loading
        }));
      })
  .addCase(fetchNotesInteractionStatus.rejected, (state, _action) => {
        // 清除加载状�?        state.notes = state.notes.map(note => ({
          ...note,
    interaction_loading: false
        }));
      });
  },
});

export const { resetNotes, setRefreshing } = noteSlice.actions;
export default noteSlice.reducer;
