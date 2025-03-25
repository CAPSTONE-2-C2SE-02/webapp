// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from "react-redux";
import { persistor, store } from "./stores/store.ts";
import AppRoutes from './routes/index.tsx';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from './components/ui/sonner.tsx';

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppRoutes />
        <Toaster position="top-right" />
      </PersistGate>
    </Provider>
  // </StrictMode>,
)
