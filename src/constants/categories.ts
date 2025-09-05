/**
 * @description 分类信息结构
 */
export interface Category {
  id: string;
  name: string;
  icon: string; // SVG图标路径
}

/**
 * @description 应用支持的分类列表
 */
export const Categories: Category[] = [
  { id: 'c1a7e7e4-a5a6-4b1b-8c8d-9e9f9f9f9f9f', name: '学习交流', icon: '/assets/school.svg' },
  { id: 'c2b8f8f5-b6b7-4c2c-9d9e-1f1f1f1f1f1f', name: '校园生活', icon: '/assets/hat.svg' },
  { id: 'c3c9a9a6-c7c8-4d3d-aeaf-2a2b2c2d2e2f', name: '就业创业', icon: '/assets/star2.svg' },
  { id: 'd4d1a1a7-d8d9-4e4e-bfbf-3a3b3c3d3e3f', name: '社团活动', icon: '/assets/p2p-fill.svg' },
  { id: 'e5e2b2b8-e9ea-4f5f-cfdf-4a4b4c4d4e4f', name: '失物招领', icon: '/assets/bag.svg' },
];
