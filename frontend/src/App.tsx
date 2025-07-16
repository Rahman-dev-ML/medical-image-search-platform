import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import GlobalStyle from './styles/GlobalStyle';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import SearchPage from './pages/SearchPage';
import XRayDetailPage from './pages/XRayDetailPage';
import BrowsePage from './pages/BrowsePage';
import DatabasePage from './pages/DatabasePage';
import UploadPage from './pages/UploadPage';
import { ToastProvider } from './contexts/ToastContext';


// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <ToastProvider>
          <GlobalStyle />
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/xray/:id" element={<XRayDetailPage />} />
                <Route path="/browse" element={<BrowsePage />} />
                <Route path="/database" element={<DatabasePage />} />
                <Route path="/upload" element={<UploadPage />} />

              </Routes>
            </Layout>
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
