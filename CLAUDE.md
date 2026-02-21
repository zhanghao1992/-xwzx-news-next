# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

这是一个从 Vue 3 版本(项目源码路径：../xwzx-news)重写为 Next.js 16 的新闻应用（父目录中的 `xwzx-news` 是原 Vue 版本）。它在保持与原 Vue 版本功能对等的同时，使用了现代化的 React 技术。

## 开发命令

```bash
# 启动开发服务器（运行在 3000 端口）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

## 架构

### Next.js App Router 结构

- **App Router**: 使用 Next.js 16 App Router（不是 Pages Router）
- **国际化**: 所有路由都带有语言前缀 `[locale]`（`zh-CN` 或 `en-US`）
- **基于文件的路由**: 页面位于 `src/app/[locale]/` 目录
- **路径别名**: `@/*` 映射到 `./src/*`（在 `tsconfig.json` 中配置）

### API 集成

**后端代理**: 所有 `/api/*` 请求通过 Next.js rewrites 代理到 `http://127.0.0.1:8000`（在 `next.config.js` 中配置）

**HTTP 客户端**: `src/lib/api.ts` 中的 Axios 实例具有：
- 请求拦截器：从 Zustand persist storage (`user-storage`) 注入认证令牌
- 响应拦截器：处理 401 错误并重定向到登录页
- Base URL 来自 `NEXT_PUBLIC_API_BASE_URL` 环境变量

### 状态管理 (Zustand)

- **用户 Store** (`src/store/userStore.ts`): 认证状态、用户资料、令牌持久化
- **聊天 Store** (`src/store/chatStore.ts`): AI 聊天消息持久化
- 所有 Store 都使用 `zustand/middleware` 进行 localStorage 持久化

### 国际化 (next-intl)

- **配置**: `src/i18n/routing.ts` - 定义支持的语言环境（`zh-CN`、`en-US`）
- **语言文件**: `src/i18n/locales/` - 翻译文件
- **导航**: 使用来自 `@/i18n/routing` 的封装导航 API：
  ```typescript
  import { Link, useRouter, redirect } from '@/i18n/routing';
  ```
- **中间件**: `src/middleware.ts` 处理语言检测和路由

### AI 聊天实现

**重要提示**: AI 聊天使用来自阿里云 Dashscope API 的服务器发送事件 (SSE) 流式传输。

- **API**: `src/lib/ai.ts` - 带有回调函数的流式 fetch 实现
- **关键配置**:
  - Base URL: `https://dashscope.aliyuncs.com/compatible-mode/v1`
  - Model: `qwen3-max-preview`
  - API Key: `NEXT_PUBLIC_AI_API_KEY` 环境变量
  - 必需的请求头: `X-DashScope-SSE: enable`、`Authorization: Bearer <key>`
  - 响应格式: `choices[0].delta.content` 或 `output.text`

### API 端点参考

**用户认证:**
- `POST /api/user/login` - 登录，返回 `{ userInfo, token }`
- `POST /api/user/register` - 注册，返回 `{ userInfo, token }`
- `GET /api/user/info` - 获取当前用户信息

**新闻:**
- `GET /api/news/categories` - 分类列表
- `GET /api/news/list` - 新闻列表（带分页）
- `GET /api/news/detail?id={id}` - 新闻详情

**用户数据:**
- `GET /api/history/list` - 浏览历史（扁平结构，与 Vue 版本相同）
- `GET /api/favorite/list` - 收藏列表（扁平结构，与 Vue 版本相同）
- `POST /api/favorite/add` - 添加收藏
- `DELETE /api/favorite/remove?newsId={id}` - 取消收藏
- `DELETE /api/favorite/clear` - 清空所有收藏
- `DELETE /api/history/delete/{id}` - 删除单条历史记录
- `DELETE /api/history/clear` - 清空所有历史

### 数据结构兼容性

**重要提示**: 后端返回扁平的数据结构（与 Vue 版本相同），不是嵌套结构：

```typescript
// 收藏/历史是新闻项的扁平数组：
interface NewsItem {
  id: number;
  title: string;
  content: string;
  image?: string;
  // ... 其他新闻字段
}

// 不是这样的嵌套结构：
// { id, news_id, news: { title, content } }
```

处理响应时，需要检查多种可能的结构：
- 直接数组: `response.data` 是数组
- 嵌套在 list 中: `response.data.list` 是数组
- 双重嵌套: `response.data.data.list` 是数组

### 关键实现模式

**SSE 流式传输（AI 聊天）**:
```typescript
const reader = response.body?.getReader();
const decoder = new TextDecoder();
let buffer = '';
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  // 解析 SSE 数据行...
}
```

**历史/收藏列表的 Keys**:
- 使用组合键避免重复: `${index}_${newsId}_${timestamp}`
- 同一新闻可能在历史记录中出现多次

**认证令牌管理**:
- 令牌存储在 localStorage 的 `user-storage` 键中
- 结构: `{"state": {"token": "xxx", "user": {...}, "isLoggedIn": true}}`
- 通过 axios 拦截器自动注入

**Markdown 渲染**:
- 使用 `marked` 库配合 DOMPurify 进行 XSS 防护
- 自定义 prose 样式在 `src/app/globals.css` 中

### 环境变量

创建 `.env.local` 文件：
```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_AI_API_KEY=your_alibaba_cloud_dashscope_key
```

### 常见问题

**401 错误**: 令牌过期或缺失 - 用户会自动重定向到登录页
**历史/收藏为空**: 后端返回扁平结构，不是嵌套的 `news` 属性
**重复 Key 警告**: 对历史/收藏列表使用组合键
**AI 聊天"未知错误"**: 检查 API key 是否有效以及 SSE 头是否正确设置
**语言路由**: URL 始终使用语言前缀（例如：`/zh-CN/home`、`/en-US/home`）
