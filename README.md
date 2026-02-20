# 新闻资讯 Next.js 版本

这是基于 Next.js 16 技术栈重构的新闻应用，保持与原 Vue 3 版本相同的功能和接口对接。

## 技术栈

- **Next.js 16** - React 框架（App Router）
- **React 19** - UI 库
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Zustand** - 状态管理
- **next-intl** - 国际化
- **Axios** - HTTP 客户端
- **Lucide React** - 图标库

## 功能特性

- ✅ 新闻列表（分类浏览、下拉刷新、无限滚动）
- ✅ 新闻详情（Markdown 渲染、相关推荐）
- ✅ 用户系统（登录、注册、个人信息管理）
- ✅ AI 聊天助手（集成阿里云 Qwen 模型）
- ✅ 浏览历史
- ✅ 收藏功能
- ✅ 主题切换（深色/浅色模式）
- ✅ 多语言支持（中文/英文）

## 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── [locale]/          # 国际化路由
│   │   ├── home/          # 首页
│   │   ├── news/          # 新闻详情
│   │   ├── category/      # 分类选择
│   │   ├── history/       # 浏览历史
│   │   ├── favorite/      # 我的收藏
│   │   ├── aichat/        # AI 聊天
│   │   ├── my/            # 个人中心
│   │   ├── profile/       # 个人信息
│   │   ├── settings/      # 设置
│   │   ├── login/         # 登录
│   │   └── register/      # 注册
│   ├── globals.css        # 全局样式
│   └── layout.tsx         # 根布局
├── components/            # 共享组件
│   ├── TabBar.tsx         # 底部导航栏
│   └── NewsItem.tsx       # 新闻列表项
├── lib/                   # 工具库
│   ├── api.ts             # API 配置
│   └── ai.ts              # AI 聊天配置
├── store/                 # 状态管理
│   ├── userStore.ts       # 用户状态
│   ├── themeStore.ts      # 主题状态
│   ├── languageStore.ts   # 语言状态
│   └── chatStore.ts       # 聊天状态
├── i18n/                  # 国际化
│   ├── routing.ts         # 路由配置
│   ├── request.ts         # 请求配置
│   └── locales/           # 语言文件
│       ├── zh-CN.ts       # 简体中文
│       └── en-US.ts       # English
├── types/                 # TypeScript 类型
│   └── index.ts
└── middleware.ts          # Next.js 中间件
```

## 开始使用

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 文件为 `.env.local` 并配置：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`：

```env
# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000

# AI API Key (for Alibaba Cloud Dashscope)
NEXT_PUBLIC_AI_API_KEY=your_ai_api_key_here
```

### 3. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 4. 构建生产版本

```bash
npm run build
npm start
```

## API 对接

应用通过 `next.config.js` 中的 `rewrites` 配置代理后端 API：

```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://127.0.0.1:8000/api/:path*',
    },
  ];
}
```

### 主要 API 端点

**用户相关：**
- `POST /api/user/login` - 用户登录
- `POST /api/user/register` - 用户注册
- `GET /api/user/info` - 获取用户信息
- `PUT /api/user/update` - 更新用户信息

**新闻相关：**
- `GET /api/news/categories` - 获取分类列表
- `GET /api/news/list` - 获取新闻列表
- `GET /api/news/detail` - 获取新闻详情

**用户数据：**
- `GET /api/user/history` - 获取浏览历史
- `GET /api/user/favorites` - 获取收藏列表
- `POST /api/user/favorite` - 添加收藏
- `DELETE /api/user/favorite` - 取消收藏

## 与 Vue 版本的对应关系

| Vue 3 版本 | Next.js 版本 |
|-----------|-------------|
| `src/views/Home.vue` | `src/app/[locale]/home/page.tsx` |
| `src/views/NewsDetail.vue` | `src/app/[locale]/news/detail/[id]/page.tsx` |
| `src/views/Category.vue` | `src/app/[locale]/category/page.tsx` |
| `src/views/Login.vue` | `src/app/[locale]/login/page.tsx` |
| `src/views/Register.vue` | `src/app/[locale]/register/page.tsx` |
| `src/views/AIChat.vue` | `src/app/[locale]/aichat/page.tsx` |
| `src/views/My.vue` | `src/app/[locale]/my/page.tsx` |
| `src/views/Profile.vue` | `src/app/[locale]/profile/page.tsx` |
| `src/views/History.vue` | `src/app/[locale]/history/page.tsx` |
| `src/views/Favorite.vue` | `src/app/[locale]/favorite/page.tsx` |
| `src/views/Settings.vue` | `src/app/[locale]/settings/page.tsx` |
| `src/store/` (Pinia) | `src/store/` (Zustand) |
| `src/i18n/` (Vue I18n) | `src/i18n/` (next-intl) |
| `src/config/api.js` | `src/lib/api.ts` |

## 浏览器支持

- Chrome (最新版)
- Safari (最新版)
- Firefox (最新版)
- Edge (最新版)

移动端浏览器：
- iOS Safari (iOS 12+)
- Chrome for Android
- 微信内置浏览器

## 许可证

ISC
