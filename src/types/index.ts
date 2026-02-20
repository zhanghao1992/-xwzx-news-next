// 用户类型
export interface User {
  id: number;
  username: string;
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  created_at?: string;
}

// 新闻分类
export interface Category {
  id: number;
  name: string;
  code: string;
}

// 新闻项目
export interface NewsItem {
  id: number;
  title: string;
  content: string;
  description?: string;
  categoryId?: number;
  author?: string;
  publishTime?: string;
  publish_time?: string;
  image?: string;
  views?: number;
  view_count?: number;
  created_at?: string;
  updated_at?: string;
}

// 新闻详情
export interface NewsDetail extends NewsItem {
  related_news?: NewsItem[];
}

// 登录请求
export interface LoginRequest {
  username: string;
  password: string;
}

// 注册请求
export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
  phone?: string;
}

// API 响应
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 登录响应
export interface LoginResponse {
  token: string;
  user: User;
}

// 新闻列表响应
export interface NewsListResponse {
  list: NewsItem[];
  total: number;
  page: number;
  pageSize: number;
}

// 浏览历史
export interface HistoryItem {
  id: number;
  user_id: number;
  news_id: number;
  news: NewsItem;
  viewed_at: string;
}

// 收藏
export interface FavoriteItem {
  id: number;
  user_id: number;
  news_id: number;
  news: NewsItem;
  created_at: string;
}

// AI 聊天消息
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
