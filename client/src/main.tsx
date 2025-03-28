import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from "react-redux";
import { persistor, store } from "./stores/store.ts";
import AppRoutes from './routes/index.tsx';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from './components/ui/sonner.tsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppRoutes />
        <Toaster position="top-right" duration={2000} />
      </PersistGate>
    </Provider>
    </QueryClientProvider>
  </StrictMode>,
)
