import { Routes, Route } from "react-router-dom";
import Login from "./pages/login_page";
import Dashboard from "./pages/dashboard";
import Profile from "./pages/profile";
import ProtectedRoute from "./componants/ProtectedRoute";
import AttendanceScanner from "./pages/AttendanceScanner";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./componants/AdminRoute";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/scan"
          element={
            <AdminRoute>
              <AttendanceScanner />
            </AdminRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
