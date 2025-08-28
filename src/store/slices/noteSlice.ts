import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import noteApi, { NoteListItem } from '@/services/api/note';

// Mock数据，用于展示功能
const createMockNotes = (): NoteListItem[] => {
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
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang'
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
      author_name: '李小红',
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li'
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
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang'
    },
    {
      id: 'mock-4',
      title: '天津美食探店记录',
      content: '记录了在天津吃过的各种美食，从街边小吃到高档餐厅，每一家都有详细的评价和推荐...',
      category_id: 'food',
      tags: ['美食', '天津', '探店'],
      created_at: new Date(Date.now() - 10800000).toISOString(),
      updated_at: new Date(Date.now() - 10800000).toISOString(),
      is_public: true,
      view_count: 67,
      like_count: 18,
      comment_count: 6,
      author_name: '美食家小陈',
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chen'
    },
    {
      id: 'mock-5',
      title: '数据结构与算法笔记',
      content: '整理的数据结构与算法复习笔记，包含常见题型和解题思路，涵盖链表、树、图等重要数据结构...',
      category_id: 'study',
      tags: ['算法', '数据结构', '计算机科学'],
      created_at: new Date(Date.now() - 14400000).toISOString(),
      updated_at: new Date(Date.now() - 14400000).toISOString(),
      is_public: true,
      view_count: 312,
      like_count: 67,
      comment_count: 23,
      author_name: '算法小能手',
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=algo'
    },
    {
      id: 'mock-6',
      title: '摄影入门技巧分享',
      content: '分享一些摄影的基本技巧和后期处理方法，从构图到光线运用...',
      category_id: 'hobby',
      tags: ['摄影', '技巧'],
      created_at: new Date(Date.now() - 18000000).toISOString(),
      updated_at: new Date(Date.now() - 18000000).toISOString(),
      is_public: true,
      view_count: 128,
      like_count: 29,
      comment_count: 11,
      author_name: '摄影师小明',
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=photo'
    },
    {
      id: 'mock-7',
      title: 'TypeScript 进阶指南',
      content: '深入理解TypeScript的高级特性，包括泛型、装饰器、模块系统等内容，提升代码质量和开发效率',
      category_id: 'tech',
      tags: ['TypeScript', '进阶'],
      created_at: new Date(Date.now() - 21600000).toISOString(),
      updated_at: new Date(Date.now() - 21600000).toISOString(),
      is_public: true,
      view_count: 89,
      like_count: 16,
      comment_count: 4,
      author_name: 'TS大师',
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ts'
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
      author_name: '数学小王子',
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=math'
    },
    {
      id: 'mock-9',
      title: '健身入门完全指南',
      content: '从零开始的健身指南，包括基础动作、训练计划、饮食搭配等方面的详细介绍',
      category_id: 'health',
      tags: ['健身', '运动', '健康'],
      created_at: new Date(Date.now() - 28800000).toISOString(),
      updated_at: new Date(Date.now() - 28800000).toISOString(),
      is_public: true,
      view_count: 156,
      like_count: 34,
      comment_count: 9,
      author_name: '健身达人',
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fitness'
    },
    {
      id: 'mock-10',
      title: '学习Python的最佳路径',
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
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=python'
    },
    {
      id: 'mock-11',
      title: '旅行摄影技巧分享',
      content: '旅行中如何拍出好照片，风光摄影的构图技巧和设备选择',
      category_id: 'travel',
      tags: ['旅行', '摄影', '技巧'],
      created_at: new Date(Date.now() - 36000000).toISOString(),
      updated_at: new Date(Date.now() - 36000000).toISOString(),
      is_public: true,
      view_count: 123,
      like_count: 28,
      comment_count: 7,
      author_name: '旅行摄影师',
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=travel'
    },
    {
      id: 'mock-12',
      title: '前端面试经验总结',
      content: '整理了前端面试中的常见问题和答题技巧，包括HTML、CSS、JavaScript、React等',
      category_id: 'tech',
      tags: ['前端', '面试', '经验'],
      created_at: new Date(Date.now() - 39600000).toISOString(),
      updated_at: new Date(Date.now() - 39600000).toISOString(),
      is_public: true,
      view_count: 345,
      like_count: 78,
      comment_count: 25,
      author_name: '前端工程师',
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=frontend'
    },
    {
      id: 'mock-13',
      title: '咖啡入门指南',
      content: '从咖啡豆的选择到冲泡技巧，带你进入咖啡的世界',
      category_id: 'lifestyle',
      tags: ['咖啡', '生活', '品味'],
      created_at: new Date(Date.now() - 43200000).toISOString(),
      updated_at: new Date(Date.now() - 43200000).toISOString(),
      is_public: true,
      view_count: 92,
      like_count: 21,
      comment_count: 6,
      author_name: '咖啡爱好者',
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=coffee'
    },
    {
      id: 'mock-14',
      title: '英语学习方法分享',
      content: '提高英语口语和听力的实用方法，包括学习资源推荐',
      category_id: 'study',
      tags: ['英语', '学习方法', '口语'],
      created_at: new Date(Date.now() - 46800000).toISOString(),
      updated_at: new Date(Date.now() - 46800000).toISOString(),
      is_public: true,
      view_count: 187,
      like_count: 36,
      comment_count: 12,
      author_name: '英语老师',
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=english'
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
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=craft'
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
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=finance'
    },
    {
      id: 'mock-17',
      title: '极简生活心得',
      content: '分享极简生活的理念和实践方法，让生活更简单更快乐',
      category_id: 'lifestyle',
      tags: ['极简', '生活方式', '断舍离'],
      created_at: new Date(Date.now() - 57600000).toISOString(),
      updated_at: new Date(Date.now() - 57600000).toISOString(),
      is_public: true,
      view_count: 145,
      like_count: 33,
      comment_count: 8,
      author_name: '极简主义者',
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minimal'
    },
    {
      id: 'mock-18',
      title: '美食制作小技巧',
      content: '家常菜制作的小技巧和窍门，让你的厨艺更上一层楼',
      category_id: 'food',
      tags: ['美食', '烹饪', '技巧'],
      created_at: new Date(Date.now() - 61200000).toISOString(),
      updated_at: new Date(Date.now() - 61200000).toISOString(),
      is_public: true,
      view_count: 198,
      like_count: 41,
      comment_count: 13,
      author_name: '美食博主',
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cooking'
    }
  ];
  
  return mockNotes;
};

// 异步thunk - 获取笔记动态
export const fetchNoteFeed = createAsyncThunk(
  'note/fetchNoteFeed',
  async (params: { skip?: number; limit?: number } = {}, { getState }) => {
    const state = getState() as any;
    const isLoggedIn = state.user?.isLoggedIn || false;
    
    try {
      if (isLoggedIn) {
        // 已登录用户：优先尝试个性化推荐流
        console.log('已登录用户 - 尝试获取笔记推荐流...');
        const response = await noteApi.getNoteFeed(params);
        console.log('笔记推荐流响应:', response);
        return response;
      } else {
        // 未登录用户：直接使用mock数据，避免API调用失败
        console.log('未登录用户 - 直接使用mock数据提供浏览体验');
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
    } catch (error: any) {
      console.error(isLoggedIn ? '推荐流失败，尝试普通笔记列表:' : '使用mock数据:', error);
      
      // 对已登录用户：尝试fallback到普通笔记列表
      if (isLoggedIn) {
        try {
          const fallbackParams = {
            skip: params.skip || 0,
            limit: params.limit || 20,
            sort_by: 'created_at',
            sort_order: 'desc' as const
          };
          console.log('尝试获取普通笔记列表，参数:', fallbackParams);
          
          const fallbackResponse = await noteApi.getNotes(fallbackParams);
          
          console.log('普通笔记列表响应:', fallbackResponse);
          return fallbackResponse;
        } catch (fallbackError: any) {
          console.error('获取普通笔记列表也失败，使用mock数据:', fallbackError);
        }
      }
      
      // 最终回退：使用mock数据
      const mockData = createMockNotes();
      const skip = params.skip || 0;
      const limit = params.limit || 20;
      const slicedMockData = mockData.slice(skip, skip + limit);
      
      console.log('使用mock数据:', slicedMockData);
      
      return {
        code: 0,
        message: 'success',
        data: slicedMockData
      };
    }
  }
);

// 异步thunk - 加载更多笔记
export const loadMoreNotes = createAsyncThunk(
  'note/loadMoreNotes',
  async (params: { skip?: number; limit?: number } = {}, { getState }) => {
    const state = getState() as any;
    const isLoggedIn = state.user?.isLoggedIn || false;
    
    try {
      if (isLoggedIn) {
        // 已登录用户：尝试推荐流
        console.log('已登录用户 - 尝试加载更多笔记推荐流...');
        const response = await noteApi.getNoteFeed(params);
        return response;
      } else {
        // 未登录用户：直接使用mock数据，避免API调用失败
        console.log('未登录用户 - 直接使用mock数据提供加载更多内容');
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
    } catch (error: any) {
      console.error(isLoggedIn ? '加载更多推荐流失败，尝试普通笔记列表:' : '加载更多失败，使用mock数据:', error);
      
      // 对已登录用户：尝试fallback到普通笔记列表
      if (isLoggedIn) {
        try {
          const fallbackParams = {
            skip: params.skip || 0,
            limit: params.limit || 20,
            sort_by: 'created_at',
            sort_order: 'desc' as const
          };
          
          const fallbackResponse = await noteApi.getNotes(fallbackParams);
          return fallbackResponse;
        } catch (fallbackError: any) {
          console.error('加载更多普通笔记列表也失败，使用mock数据:', fallbackError);
        }
      }
      
      // 最终回退：使用mock数据
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
);

interface NoteState {
  notes: NoteListItem[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  error: string | null;
  page: number;
  pageSize: number;
}

const initialState: NoteState = {
  notes: [],
  loading: false,
  refreshing: false,
  hasMore: true,
  error: null,
  page: 1,
  pageSize: 20,
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
      // 获取笔记动态
      .addCase(fetchNoteFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNoteFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        // action.payload 现在是完整的API响应
        const response = action.payload;
        console.log('fetchNoteFeed fulfilled, response:', response);
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
        console.log('loadMoreNotes fulfilled, response:', response);
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
      });
  },
});

export const { resetNotes, setRefreshing } = noteSlice.actions;
export default noteSlice.reducer;
