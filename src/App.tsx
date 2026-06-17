import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toast } from '@/components/ui/Toast.js';
import ProtectedRoute from '@/pages/ProtectedRoute.js';
import Login from '@/pages/Login.js';
import Register from '@/pages/Register.js';
import GuildHall from '@/pages/GuildHall.js';
import GuildHome from '@/pages/GuildHome.js';
import Members from '@/pages/Members.js';
import Quests from '@/pages/Quests.js';
import Warehouse from '@/pages/Warehouse.js';
import Announcements from '@/pages/Announcements.js';
import GuildLogs from '@/pages/GuildLogs.js';

export default function App() {
  return (
    <Router>
      <Toast />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/hall"
          element={
            <ProtectedRoute>
              <GuildHall />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guild/:id/*"
          element={
            <ProtectedRoute>
              <GuildHome />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
