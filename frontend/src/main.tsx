import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

// ブラウザ拡張機能のエラーを抑制
if (import.meta.env.DEV) {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    // ブラウザ拡張機能関連のエラーは無視
    if (
      message.includes('chrome-extension://') ||
      message.includes('net::ERR_FILE_NOT_FOUND') ||
      message.includes('completion_list.html')
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

// TanStack Query クライアント設定
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
