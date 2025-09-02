import { Post } from '../types/api/post';

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: '南开校园随拍',
    status: 'published' as const,
    user_id: '1',
    user: {
      id: '1',
      tenant_id: 'f6303899-a51a-460a-9cd8-fe35609151eb',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      nickname: '南开艺术学院的小艺',
      avatar: '/assets/avatar1.png',
      school: '南开大学',
      status: 'active' as const,
    },
    created_at: '2024-01-15T10:00:00Z',
    content:
      '今天漫步南开大学校园，感受到百年学府的厚重与活力。阳光透过梧桐树叶洒在主楼前，学子们穿梭其中，构成一幅生机勃勃的画面。站在伯苓大讲堂前，仿佛能听到"允公允能，日新月异"的校训回响。分享一组照片，希望能带给大家一份学术氛围与青春活力。',
    image: '/assets/placeholder.jpg', // 列表预览图
    images: [ // 详情页图集
      '/assets/placeholder.jpg',
      '/assets/book-green.png',
    ],
    tags: ['#南开大学', '#大学生活'],
    location: '南开大学八里台校区',
    like_count: 2800,
    favorite_count: 128,
    comment_count: 128,
  },
  {
    id: '2',
    title: '新生求助：课程选择建议',
    status: 'published' as const,
    user_id: '2',
    user: {
      id: '2',
      tenant_id: 'f6303899-a51a-460a-9cd8-fe35609151eb',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      nickname: '千堆雪',
      avatar: '/assets/avatar2.png',
      school: '南开大学',
      status: 'active' as const,
    },
    created_at: '2024-01-15T14:50:00Z',
    content:
      '大家好！我是计算机系的新生，想请教一下学长学姐们关于专业课程的选择建议。特别是对算法和数据结构感兴趣，不知道大家有什么推荐的课程或学习路径吗？',
    tags: ['#新生求助', '#课程咨询', '#计算机', '#算法'],
    like_count: 18,
    comment_count: 23,
    favorite_count: 8,
  },
  {
    id: '3',
    title: '互联网创业经验分享会预告',
    status: 'published' as const,
    user_id: '3',
    user: {
      id: '3',
      tenant_id: 'f6303899-a51a-460a-9cd8-fe35609151eb',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      nickname: '大列巴',
      avatar: '/assets/avatar1.png',
      school: '南开大学',
      status: 'active' as const,
    },
    created_at: '2024-01-15T12:00:00Z',
    content:
      '【活动预告】下周三下午3点在图书馆报告厅举办"互联网创业经验分享会"，特邀三位优秀校友分享创业历程。感兴趣的同学欢迎报名参加！详情戳图片👇',
    image: '/assets/activity.png',
    tags: ['#创业分享', '#校园活动', '#讲座', '#校友'],
    like_count: 45,
    comment_count: 32,
    favorite_count: 15,
  },
];

export const getPostById = (id: string): Post | undefined => {
  return MOCK_POSTS.find(post => post.id === id);
}
