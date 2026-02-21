# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 news application that was rewritten from a Vue 3 version (`xwzx-news` in the parent directory). It maintains feature parity with the original Vue version while using modern React technologies.

## Development Commands

```bash
# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

### Next.js App Router Structure

- **App Router**: Uses Next.js 16 App Router (not Pages Router)
- **Internationalization**: All routes are prefixed with locale `[locale]` (`zh-CN` or `en-US`)
- **File-based routing**: Pages are in `src/app/[locale]/`
- **Path aliases**: `@/*` maps to `./src/*` (configured in `tsconfig.json`)

### API Integration

**Backend Proxy**: All `/api/*` requests are proxied to `http://127.0.0.1:8000` via Next.js rewrites (configured in `next.config.js`)

**HTTP Client**: Axios instance in `src/lib/api.ts` with:
- Request interceptor that injects auth token from Zustand persist storage (`user-storage`)
- Response interceptor that handles 401 errors and redirects to login
- Base URL from `NEXT_PUBLIC_API_BASE_URL` env var

### State Management (Zustand)

- **User Store** (`src/store/userStore.ts`): Auth state, user profile, token persistence
- **Chat Store** (`src/store/chatStore.ts`): AI chat messages with persistence
- All stores use `zustand/middleware` with localStorage persistence

### Internationalization (next-intl)

- **Config**: `src/i18n/routing.ts` - defines supported locales (`zh-CN`, `en-US`)
- **Locales**: `src/i18n/locales/` - translation files
- **Navigation**: Use wrapped navigation APIs from `@/i18n/routing`:
  ```typescript
  import { Link, useRouter, redirect } from '@/i18n/routing';
  ```
- **Middleware**: `src/middleware.ts` handles locale detection and routing

### AI Chat Implementation

**Critical**: AI chat uses Server-Sent Events (SSE) streaming from Alibaba Cloud Dashscope API.

- **API**: `src/lib/ai.ts` - streaming fetch implementation with callbacks
- **Key configuration**:
  - Base URL: `https://dashscope.aliyuncs.com/compatible-mode/v1`
  - Model: `qwen3-max-preview`
  - API Key: `NEXT_PUBLIC_AI_API_KEY` env var
  - Required headers: `X-DashScope-SSE: enable`, `Authorization: Bearer <key>`
  - Response format: `choices[0].delta.content` or `output.text`

### API Endpoints Reference

**User Authentication:**
- `POST /api/user/login` - Login, returns `{ userInfo, token }`
- `POST /api/user/register` - Register, returns `{ userInfo, token }`
- `GET /api/user/info` - Get current user info

**News:**
- `GET /api/news/categories` - Category list
- `GET /api/news/list` - News list with pagination
- `GET /api/news/detail?id={id}` - News detail

**User Data:**
- `GET /api/history/list` - Browse history (flat structure, same as Vue version)
- `GET /api/favorite/list` - Favorites list (flat structure, same as Vue version)
- `POST /api/favorite/add` - Add to favorites
- `DELETE /api/favorite/remove?newsId={id}` - Remove favorite
- `DELETE /api/favorite/clear` - Clear all favorites
- `DELETE /api/history/delete/{id}` - Delete single history item
- `DELETE /api/history/clear` - Clear all history

### Data Structure Compatibility

**Important**: The backend returns flat data structures (same as Vue version), not nested:

```typescript
// Favorites/History are flat arrays of news items:
interface NewsItem {
  id: number;
  title: string;
  content: string;
  image?: string;
  // ... other news fields
}

// NOT nested like:
// { id, news_id, news: { title, content } }
```

When handling responses, check for multiple possible structures:
- Direct array: `response.data` is array
- Nested in list: `response.data.list` is array
- Double nested: `response.data.data.list` is array

### Key Implementation Patterns

**SSE Streaming (AI Chat)**:
```typescript
const reader = response.body?.getReader();
const decoder = new TextDecoder();
let buffer = '';
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  // Parse SSE data lines...
}
```

**List Keys for History/Favorites**:
- Use composite keys to avoid duplicates: `${index}_${newsId}_${timestamp}`
- Same news can appear multiple times in history

**Auth Token Management**:
- Token stored in localStorage key `user-storage`
- Structure: `{"state": {"token": "xxx", "user": {...}, "isLoggedIn": true}}`
- Automatically injected via axios interceptor

**Markdown Rendering**:
- Uses `marked` library with DOMPurify for XSS protection
- Custom prose styles in `src/app/globals.css`

### Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_AI_API_KEY=your_alibaba_cloud_dashscope_key
```

### Common Issues

**401 Errors**: Token expired or missing - user will be redirected to login automatically
**History/Favorites Empty**: Backend returns flat structure, not nested with `news` property
**Duplicate Key Warnings**: Use composite keys for history/favorites lists
**AI Chat "Unknown Error"**: Check if API key is valid and SSE headers are set correctly
**Locale Routing**: Always use locale prefix in URLs (e.g., `/zh-CN/home`, `/en-US/home`)
