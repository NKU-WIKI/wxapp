import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PaginatedData } from '@/types/api/common';
import { GetPostsParams, Post, CreatePostParams, CreatePostResponse } from '@/types/api/post';
import { postApi } from '@/services/api/post';

// 云存储链接转换函数
const convertCloudUrl = (cloudUrl: string): string => {
  if (!cloudUrl || !cloudUrl.startsWith('cloud://')) {
    return cloudUrl;
  }

  // 将 cloud:// 链接转换为 HTTP 链接
  // cloud://cloud1-7gu881ir0a233c29.636c-cloud1-7gu881ir0a233c29-1352978573/avatars/xxx.jpg
  // 转换为: https://636c-cloud1-7gu881ir0a233c29-1352978573.tcb.qcloud.la/avatars/xxx.jpg

  try {
    const cloudPath = cloudUrl.replace('cloud://', '');
    const parts = cloudPath.split('/');
    const envId = parts[0]; // cloud1-7gu881ir0a233c29.636c-cloud1-7gu881ir0a233c29-1352978573
    const filePath = parts.slice(1).join('/'); // avatars/xxx.jpg

    // 提取环境ID中的关键部分
    const envMatch = envId.match(/636c-cloud1-7gu881ir0a233c29-1352978573/);
    if (envMatch) {
      return `https://${envMatch[0]}.tcb.qcloud.la/${filePath}`;
    }

    // 如果匹配失败，返回原链接
    return cloudUrl;
  } catch (error) {
    console.warn('转换云存储链接失败:', cloudUrl, error);
    return cloudUrl;
  }
};

// 获取帖子列表的 Thunk
export const fetchPosts = createAsyncThunk<PaginatedData<Post>, GetPostsParams>(
  'posts/fetchPosts',
  async (params: GetPostsParams, { rejectWithValue }) => {
    try {
      // postApi.getPosts() 现在返回完整的业务响应体: { code, message, data, pagination, ... }
      const response = await postApi.getPosts(params) as any;

      // 根据实际API响应结构，将返回的数据转换成前端统一的结构
      const transformedPosts = response.data.map((post: any) => {
        // 解析标签（从JSON字符串转为数组）
        let tags: string[] = [];
        try {
          if (post.tag && post.tag !== 'null') {
            tags = JSON.parse(post.tag);
          }
        } catch (e) {
          tags = [];
        }

        // 解析图片（从JSON字符串数组中取第一张作为预览图）
        let image: string | undefined = undefined;
        try {
          if (post.image && post.image !== 'null' && post.image !== '[]') {
            const images = JSON.parse(post.image);
            if (Array.isArray(images) && images.length > 0) {
              image = images[0];
            }
          }
        } catch (e) {
          image = undefined;
        }

        return {
          id: post.id,
          title: post.title || '',
          author: {
            name: post.user_info?.nickname || post.nickname || '匿名用户',
            avatar: convertCloudUrl(post.user_info?.avatar || post.avatar || ''),
            school: post.user_info?.bio || '未知学校'
          },
          time: post.create_time || '',
          content: post.content || '',
          image: image ? convertCloudUrl(image) : undefined,
          tags: tags,
          location: post.location,
          likes: post.like_count || 0,
          commentsCount: post.comment_count || 0
        };
      });

      const paginatedData: PaginatedData<Post> = {
        items: transformedPosts,
        page: response.pagination.page,
        pageSize: response.pagination.page_size,
        total: response.pagination.total,
        totalPages: response.pagination.total_pages,
      };

      return paginatedData;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

interface PostsState {
  list: Post[];
  pagination: Omit<PaginatedData<any>, 'items'> | null;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: any;
}

const initialState: PostsState = {
  list: [],
  pagination: null,
  loading: 'idle',
  error: null,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action: PayloadAction<PaginatedData<Post>>) => {
        state.loading = 'succeeded';
        const { items, ...pagination } = action.payload;
        state.list = items;
        state.pagination = pagination;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      })
      .addCase(createPost.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state) => {
        state.loading = 'succeeded';
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string || 'Failed to create post';
      });
  },
});

export default postsSlice.reducer;
