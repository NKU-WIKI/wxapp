/* eslint-disable no-unused-vars */
/**
 * 市场相关API类型定义
 */
import { BaseResponse } from './common';

// 使用common.d.ts中已定义的基础响应类型
export type ApiResponse<T = unknown> = BaseResponse<T>;

// 用户状态枚举
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

// 商品类型枚举
export enum ListingType {
  BUY = 'buy',
  SELL = 'sell',
  SERVICE = 'service',
  RENT = 'rent',
}

// 商品成色枚举
export enum ListingCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  ACCEPTABLE = 'acceptable',
  DAMAGED = 'damaged',
}

// 商品状态枚举
export enum ListingStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  RESERVED = 'reserved',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

// 预约状态枚举
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

// 用户基本信息
export interface UserRead {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  nickname: string;
  avatar?: string;
  bio?: string;
  birthday?: string;
  school?: string;
  college?: string;
  location?: string;
  wechat_id?: string;
  qq_id?: string;
  tel?: string;
  status: UserStatus;
}

// 商品分类
export interface CategoryRead {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description?: string;
  icon?: string;
  sort_order?: number;
  parent_id?: string;
  children?: CategoryRead[];
}

// 二手商品读取模型
export interface ListingRead {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  content?: string;
  category_id: string;
  listing_type?: ListingType;
  price?: string;
  condition?: ListingCondition;
  location?: string;
  tags?: string[];
  images?: string[];
  user_id: string;
  user: UserRead;
  status?: ListingStatus;
  view_count?: number;
  favorite_count?: number;
  booking_count?: number;
  comment_count?: number;
  share_count?: number;
  is_favorited?: boolean;
  category?: CategoryRead;
  similar_listings?: ListingRead[];
}

// 二手商品创建模型
export interface ListingCreate {
  title: string;
  content?: string;
  category_id: string;
  listing_type?: ListingType;
  price?: number;
  condition?: ListingCondition;
  location?: string;
  tags?: string[];
  images?: string[];
}

// 商品列表查询参数
export interface ListingListParams {
  category_id?: string;
  listing_type?: ListingType;
  condition?: ListingCondition;
  location?: string;
  price_min?: number;
  price_max?: number;
  keyword?: string;
  sort_by?: 'created_at' | 'price' | 'view_count';
  sort_order?: 'asc' | 'desc';
  skip?: number;
  limit?: number;
  [key: string]: unknown;
}

// 商品搜索参数
export interface ListingSearchParams {
  q: string;
  category_id?: string;
  listing_type?: ListingType;
  condition?: ListingCondition;
  price_min?: number;
  price_max?: number;
  location?: string;
  include_expired?: boolean;
  skip?: number;
  limit?: number;
  [key: string]: unknown;
}

// 预约创建模型
export interface BookingCreate {
  time_slot: string;
  message?: string;
  contact_info?: string;
}

// 预约读取模型
export interface BookingRead {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  time_slot: string;
  message?: string;
  contact_info?: string;
  listing_id: string;
  user_id: string;
  seller_id: string;
  status: BookingStatus;
  listing?: ListingRead;
  buyer?: UserRead;
  seller?: UserRead;
}

// 预约列表查询参数
export interface BookingListParams {
  status?: BookingStatus;
  skip?: number;
  limit?: number;
}

// 电商商品读取模型
export interface ProductRead {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
}

// 电商商品创建模型
export interface ProductCreate {
  name: string;
  description: string;
  price: number;
  stock: number;
}

// 电商商品更新模型
export interface ProductUpdate {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
}

// 电商商品列表查询参数
export interface ProductListParams {
  skip?: number;
  limit?: number;
}

// 市场统计信息
export interface MarketplaceStats {
  [key: string]: unknown;
}

// 热门趋势分析
export interface TrendingData {
  [key: string]: unknown;
}

// 跑腿任务类型枚举
export enum ErrandType {
  EXPRESS_PICKUP = 'express_pickup',
  FOOD_DELIVERY = 'food_delivery',
  GROCERY_SHOPPING = 'grocery_shopping',
  OTHER = 'other',
}

// 跑腿任务状态枚举
export enum ErrandStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// 跑腿任务读取模型
export interface ErrandRead {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  content?: string;
  errand_type: ErrandType;
  reward: number;
  location_from?: string;
  location_to?: string;
  deadline?: string;
  contact_info?: string;
  status: ErrandStatus;
  user_id: string;
  user: UserRead;
  accepted_by?: string;
  accepted_user?: UserRead;
  completed_at?: string;
}

// 跑腿任务创建模型
export interface ErrandCreate {
  title: string;
  content?: string;
  errand_type: ErrandType;
  reward: number;
  location_from?: string;
  location_to?: string;
  deadline?: string;
  contact_info?: string;
}

// 跑腿任务列表查询参数
export interface ErrandListParams {
  errand_type?: ErrandType;
  status?: ErrandStatus;
  skip?: number;
  limit?: number;
  [key: string]: unknown;
}

// API响应类型
export type ApiResponse_ListingRead_ = ApiResponse<ListingRead>;
export type ApiResponse_List_ListingRead__ = ApiResponse<ListingRead[]>;
export type ApiResponse_BookingRead_ = ApiResponse<BookingRead>;
export type ApiResponse_List_BookingRead__ = ApiResponse<BookingRead[]>;
export type ApiResponse_ProductRead_ = ApiResponse<ProductRead>;
export type ApiResponse_List_ProductRead__ = ApiResponse<ProductRead[]>;
export type ApiResponse_dict_ = ApiResponse<Record<string, unknown>>;
export type ApiResponse_List_dict__ = ApiResponse<Record<string, unknown>[]>;
