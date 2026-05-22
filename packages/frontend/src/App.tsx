import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Scripts from './pages/Scripts';
import ScriptEditor from './pages/ScriptEditor';
import Folders from './pages/Folders';
import Executions from './pages/Executions';
import CronJobs from './pages/CronJobs';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#181825',
            color: '#cdd6f4',
            border: '1px solid #313244',
          },
        }}
      />
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
        />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scripts" element={<Scripts />} />
            <Route path="/scripts/:id" element={<ScriptEditor />} />
            <Route path="/folders" element={<Folders />} />
            <Route path="/executions" element={<Executions />} />
            <Route path="/cron" element={<CronJobs />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  );
}
