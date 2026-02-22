import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import NewsVerification from './pages/NewsVerification';
import ContentStudioPage from './pages/ContentStudioPage';
import SavedContentsPage from './pages/SavedContentsPage';
import SettingsPage from './pages/SettingsPage';
import PlaceholderPage from './pages/PlaceholderPage';

import Login from './pages/Login';

import ErrorBoundary from './components/ErrorBoundary';

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pagePath = `${location.pathname}${location.search}${location.hash}`;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'virtual_page_view',
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname, location.search, location.hash]);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AnalyticsTracker />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="verify" element={<NewsVerification />} />
            <Route path="contents" element={<SavedContentsPage />} />
            <Route path="content-studio" element={<ContentStudioPage />} />
            <Route path="settings" element={<SettingsPage />} />

            <Route path="content" element={
              <PlaceholderPage title="İçerik Stüdyosu" message="İçerik üretim ve düzenleme arayüzü hazırlanıyor." />
            } />

            <Route path="newsletter" element={
              <PlaceholderPage title="Bülten Motoru" message="Haftalık bülten taslakları burada görüntülenecek." />
            } />

            {/* Development Routes */}
            <Route path="trends" element={
              <PlaceholderPage title="Trend Avcısı" message="Google Trends ve Sosyal Medya analiz modülü geliştiriliyor." />
            } />

            <Route path="competitors" element={
              <PlaceholderPage title="Rakip Radarı" message="Rakip analizi ve RSS takibi bu ekranda olacak." />
            } />

            <Route path="stats" element={
              <PlaceholderPage title="Detaylı İstatistikler" />
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

