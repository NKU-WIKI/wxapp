# **“商业中心” (Commerce) 模块技术方案**

## 1. 概述

本文档旨在为 `nkuwiki` 微信小程序的“商业中心”功能模块提供一套完整、高层次的技术设计方案。该模块将整合“二手交易”与“校园跑腿”两大核心业务，并为未来可能的商业功能（如店铺、团购）预留扩展空间。

本方案严格遵循项目既有的技术栈（Taro, React, Redux, TypeScript）和开发规范，旨在确保新模块的高质量、可维护性和高性能。

## 2. 核心设计原则

*   **模块化与高内聚**: 将所有商业相关功能聚合到一个独立的Taro分包 (`subpackage-commerce`) 中，与主包业务逻辑解耦，降低模块间复杂度。
*   **原子化与可复用**: 提倡原子化组件设计，将UI拆分为可复用的基础组件（如 `Card`, `Button`, `Tag`）和业务组件（如 `ProductListItem`, `ErrandTaskCard`），提升开发效率和UI一致性。
*   **API驱动开发 (ADF)**: 严格遵循项目定义的“类型 -> 服务 -> Thunk -> 组件”的API对接工作流，确保前后端协作的顺畅与数据类型的安全。
*   **性能优先**: 通过分包加载、骨架屏、虚拟列表、图片优化等手段，确保模块拥有流畅的用户体验。

## 3. 架构设计

#### 3.1. 分包架构 (Subpackage)

我们将采用Taro的分包加载机制，创建 `subpackage-commerce`。

**优势**:
*   **优化主包体积**: 核心商业逻辑和页面资源被打包到分包中，显著减小主包大小，提升小程序首次加载速度。
*   **按需加载**: 用户只有在访问商业中心相关功能时，才会下载和加载对应的分包资源。
*   **独立开发与部署**: 便于团队并行开发，分包的迭代不影响主包的稳定性。

#### 3.2. 模块内部结构

分包内部将划分为几个核心目录，以实现清晰的关注点分离：

```
src/pages/subpackage-commerce/
├── pages/
│   ├── index.tsx               # 商业中心主入口/导航页
│   ├── second-hand/            # 二手交易模块
│   │   ├── home/               #   - 列表页
│   │   ├── publish/            #   - 发布页
│   │   └── detail/             #   - 详情页
│   └── errands/                # 校园跑腿模块
│       ├── home/               #   - 任务广场
│       ├── publish/            #   - 发布任务页
│       └── my-orders/          #   - 我的跑腿订单
├── components/                 # 模块内可复用组件
│   ├── ProductCard.tsx         #   - 商品卡片
│   ├── ErrandOrderCard.tsx     #   - 跑腿订单卡片
│   └── ...
├── services/                   # API服务
│   ├── api/
│   │   └── commerce.ts         #   - 商业模块API
│   └── index.ts
├── store/                      # Redux状态管理
│   └── commerceSlice.ts        #   - 商业模块的Slice
└── types/                      # TypeScript类型定义
    └── commerce.d.ts           #   - 商业模块相关接口类型
```

## 4. 数据流与状态管理

我们将使用 `Redux Toolkit (RTK)` 来管理商业模块的状态。

*   **单一Slice**: 创建一个 `commerceSlice.ts`，统一管理二手交易和校园跑腿的状态。如果未来业务变得极其复杂，再考虑拆分为多个Slice。
*   **异步Action**: 使用 `createAsyncThunk` 来处理所有API请求，它会自动处理 `pending`, `fulfilled`, `rejected` 三种状态，简化加载和错误处理逻辑。
*   **状态结构 (State Shape)**:

    ```typescript
    interface CommerceState {
      secondHand: {
        products: Product[]; // 商品列表
        loading: 'idle' | 'pending';
        error: string | null;
        pagination: {
          currentPage: number;
          pageSize: number;
          total: number;
        };
      };
      errands: {
        tasks: ErrandTask[]; // 任务列表
        loading: 'idle' | 'pending';
        error: string | null;
        // ... more state for errands
      };
    }
    ```
*   **选择器 (Selectors)**: 使用 `Reselect` 或简单的 `useSelector` 函数从Store中派生和计算数据，避免在组件中进行复杂的逻辑处理，并利用其缓存机制提升性能。

## 5. 核心页面与组件设计

#### 5.1. 二手交易

*   **商品列表页 (`second-hand/home`)**:
    *   **UI**: 采用瀑布流或网格布局展示商品卡片。
    *   **组件**: `ProductCard` (商品卡片), `SearchBar` (搜索栏), `FilterTabs` (分类筛选)。
    *   **功能**:
        *   下拉刷新与上拉加载更多（分页）。
        *   关键词搜索。
        *   按分类、新旧程度、价格区间筛选。
    *   **性能**: 对于长列表，考虑使用Taro的 `VirtualList` 组件进行性能优化。

*   **商品发布页 (`second-hand/publish`)**:
    *   **UI**: 表单驱动，包含图片上传、标题、描述、价格、分类等输入项。
    *   **组件**: `ImageUploader`, `FormInput`, `CategoryPicker`。
    *   **功能**:
        *   多图上传与预览。
        *   表单校验。
        *   集成AI润色建议（可选，调用 `services/ai.ts`）。

*   **商品详情页 (`second-hand/detail`)**:
    *   **UI**: 展示商品轮播图、详细信息、价格、发布者信息。
    *   **组件**: `Swiper` (轮播), `UserInfo` (发布者信息), `ActionSheet` (操作菜单)。
    *   **功能**:
        *   图片预览。
        *   收藏商品。
        *   联系卖家（如跳转到聊天页面）。

#### 5.2. 校园跑腿

*   **任务广场 (`errands/home`)**:
    *   **UI**: 卡片式列表，清晰展示任务类型、取/送地点、悬赏金额、截止时间。
    *   **组件**: `ErrandOrderCard` (任务卡片), `FilterTabs` (任务类型筛选)。
    *   **功能**:
        *   实时任务列表（可考虑轮询或WebSocket）。
        *   筛选不同类型的任务（代取快递、食堂带饭等）。
        *   接单操作。

*   **我的跑腿订单 (`errands/my-orders`)**:
    *   **UI**: 使用 `Tabs` 组件区分“我发布的”和“我接收的”订单。
    *   **功能**:
        *   查看订单状态（待接单、进行中、已完成、已取消）。
        *   对订单进行操作（如取消订单、确认送达）。

## 6. API 设计与对接

基于提供的 `nkuwiki (1).md` 文档，我们将主要使用其中的 **电商** 部分API。对于“校园跑腿”等文档未覆盖的功能，需要与后端团队协作定义新的API。

#### 6.1. 接口建模 (示例)

*   `src/types/api/commerce.d.ts`:
    ```typescript
    // 根据API文档定义二手商品类型
    export interface SecondHandProduct {
      id: string;
      title: string;
      description: string;
      price: number;
      images: string[];
      category: string;
      seller: UserInfo;
      createdAt: string;
    }

    // 预定义跑腿任务类型
    export interface ErrandTask {
      id: string;
      type: 'delivery' | 'canteen' | 'shopping';
      from: string;
      to: string;
      reward: number;
      deadline: string;
      status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    }
    ```

*   `src/services/api/commerce.ts`:
    ```typescript
    import http from '../request';
    import { SecondHandProduct, PaginatedData } from '@/types';

    // 获取二手商品列表
    export const getSecondHandProducts = (params: { page: number; pageSize: number; category?: string }) => {
      return http.get<PaginatedData<SecondHandProduct>>('/commerce/products/second-hand', params);
    }

    // 发布商品
    export const createSecondHandProduct = (data: Omit<SecondHandProduct, 'id' | 'seller' | 'createdAt'>) => {
      return http.post('/commerce/products/second-hand', data);
    }

    // ... 其他API服务
    ```

## 7. 最佳实践与规范遵循

*   **强制布局规范**: 所有页面**必须**遵循“防内容遮挡”的顶级布局结构，使用统一的 `<CustomHeader>` 和 `<ScrollView>`。
*   **颜色与样式**: **严禁**硬编码颜色值。SCSS文件必须使用 `src/styles/variables.scss` 中定义的变量，TSX中的样式必须使用 `src/constants/colors.ts` 的常量。所有组件样式使用 `.module.scss` 隔离。
*   **图片资源**: 所有静态图片（如图标）**严禁使用 `import` 方式引入**，必须通过字符串路径引用，并统一存放于 `src/assets` 目录，以规避Webpack `url-loader` 的潜在问题。
*   **错误处理**: 在 `request.ts` 中进行统一的API错误拦截和处理，并在 `createAsyncThunk` 的 `rejected` case中更新UI状态，向用户提供清晰的错误反馈。
*   **代码质量**: 遵循ESLint和Prettier规范，编写可读性高、易于维护的代码。为核心组件和函数编写JSDoc注释。

## 8. 未来的可扩展性

*   **店铺功能**: 当前的商品模型可以轻松扩展，增加 `storeId` 字段，为未来的B2C店铺功能打下基础。
*   **支付集成**: 订单和支付流程可以复用文档中定义的 `/commerce/orders` 和 `/commerce/payments` 相关API。
*   **团购/活动**: 可以在 `subpackage-commerce` 中继续扩展新的页面模块，与现有功能并行。
