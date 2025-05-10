import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from "react-redux";
import { persistor, store } from "./stores/store.ts";
import AppRoutes from './routes/index.tsx';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from './components/ui/sonner.tsx';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SocketProvider } from './context/socket-context.tsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <SocketProvider>
              <AppRoutes />
            </SocketProvider>
            <Toaster position="bottom-right" duration={2000} />
          </PersistGate>
        </Provider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
