import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './lib/store';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

import { Dashboard } from './pages/Dashboard';
import { AdminUserManagement } from './pages/dashboard/AdminUserManagement';
import { SettingsPage } from './pages/settings/SettingsPage';
import { TransactionsPage } from './pages/transactions/TransactionsPage';
import { BettingAdminPage } from './pages/betting/BettingAdminPage';
import { CreditsPage } from './pages/credits/CreditsPage';
import { PendingApproval } from './pages/PendingApproval';

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const session = useAuthStore((state) => state.session);

  useEffect(() => {
    initialize().catch(err => {
      console.error("Failed to initialize auth store:", err);
    });
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!session ? <Register /> : <Navigate to="/" replace />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<AdminUserManagement />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/credits" element={<CreditsPage />} />
            <Route path="/betting" element={<BettingAdminPage />} />
            <Route path="/pending" element={<PendingApproval />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
