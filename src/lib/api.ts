import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  NewsListResponse,
  NewsDetail,
  Category,
  User,
  ApiResponse,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从 zustand persist storage 获取 token
    if (typeof window !== 'undefined') {
      try {
        const userStorage = localStorage.getItem('user-storage');
        if (userStorage) {
          const userData = JSON.parse(userStorage);
          const token = userData.state?.token;
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      } catch (error) {
        console.error('Failed to parse user storage:', error);
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token 过期，清除 zustand 存储
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user-storage');
        window.location.href = '/zh-CN/login';
      }
    }
    return Promise.reject(error);
  }
);

// 用户相关 API
export const userApi = {
  // 登录
  login: (data: LoginRequest): Promise<ApiResponse<{ userInfo: User; token: string }>> => {
    return apiClient.post('/api/user/login', data);
  },

  // 注册
  register: (data: RegisterRequest): Promise<ApiResponse<{ userInfo: User; token: string }>> => {
    return apiClient.post('/api/user/register', data);
  },

  // 获取用户信息
  getUserInfo: (): Promise<ApiResponse<User>> => {
    return apiClient.get('/api/user/info');
  },

  // 更新用户信息
  updateUser: (data: Partial<User>): Promise<ApiResponse<User>> => {
    return apiClient.put('/api/user/update', data);
  },

  // 修改密码
  changePassword: (data: { old_password: string; new_password: string }): Promise<ApiResponse> => {
    return apiClient.put('/api/user/password', data);
  },
};

// 新闻相关 API
export const newsApi = {
  // 获取分类列表
  getCategories: (): Promise<ApiResponse<Category[]>> => {
    return apiClient.get('/api/news/categories');
  },

  // 获取新闻列表
  getNewsList: (params: {
    page?: number;
    pageSize?: number;
    categoryId?: number;
  }): Promise<ApiResponse<NewsListResponse>> => {
    return apiClient.get('/api/news/list', { params });
  },

  // 获取新闻详情
  getNewsDetail: (id: number): Promise<ApiResponse<NewsDetail>> => {
    return apiClient.get('/api/news/detail', { params: { id } });
  },

  // 获取浏览历史
  getHistory: (params: { page?: number; page_size?: number }): Promise<ApiResponse<any>> => {
    return apiClient.get('/api/history/list', { params });
  },

  // 获取收藏列表
  getFavorites: (params: { page?: number; page_size?: number }): Promise<ApiResponse<any>> => {
    return apiClient.get('/api/favorite/list', { params });
  },

  // 添加收藏
  addFavorite: (newsId: number): Promise<ApiResponse> => {
    return apiClient.post('/api/favorite/add', { newsId });
  },

  // 取消收藏
  removeFavorite: (newsId: number): Promise<ApiResponse> => {
    return apiClient.delete(`/api/favorite/remove?newsId=${newsId}`);
  },

  // 清空收藏
  clearFavorites: (): Promise<ApiResponse> => {
    return apiClient.delete('/api/favorite/clear');
  },

  // 删除单条浏览历史
  removeHistory: (id: number): Promise<ApiResponse> => {
    return apiClient.delete(`/api/history/delete/${id}`);
  },

  // 清空浏览历史
  clearHistory: (): Promise<ApiResponse> => {
    return apiClient.delete('/api/history/clear');
  },
};

export default apiClient;
