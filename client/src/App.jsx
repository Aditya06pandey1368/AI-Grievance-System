import { BrowserRouter, Routes, Route } from "react-router-dom";

// --- CONTEXT & LAYOUTS ---
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Toast from "./components/common/Toast";
import ProtectedRoute from "./components/common/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

// --- PUBLIC PAGES ---
import Home from "./pages/common/Home";
import Login from "./pages/common/Login";
import Register from "./pages/common/Register";
import NotFound from "./pages/common/NotFound";
import Unauthorized from "./pages/common/Unauthorized";

// --- CITIZEN PAGES ---
import Dashboard from "./pages/citizen/Dashboard";
import SubmitComplaint from "./pages/citizen/SubmitComplaint";
import MyComplaints from "./pages/citizen/MyComplaints";
import ComplaintDetail from "./pages/citizen/ComplaintDetail";

// --- OFFICER PAGES ---
import OfficerDashboard from "./pages/officer/OfficerDashboard";
import ComplaintAction from "./pages/officer/ComplaintAction";

// --- ADMIN PAGES ---
import DeptDashboard from "./pages/admin/DeptDashboard";
import OfficerManagement from "./pages/admin/OfficerManagement";
import SLATracker from "./pages/admin/SLATracker";
import FraudMonitor from "./pages/admin/FraudMonitor";
import OfficerList from "./pages/admin/OfficerList";

// --- SUPER ADMIN PAGES ---
// FIX: Imported 'AdminDashboard' instead of 'SuperDashboard' to match your file structure
import SuperDashboard from "./pages/superAdmin/AdminDashboard"; 
import DeptManagement from "./pages/superAdmin/DeptManagement";
import AuditLogs from "./pages/superAdmin/AuditLogs";
import AbuseControl from "./pages/superAdmin/AbuseControl";
import UserManagement from "./pages/superAdmin/UserManagement";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toast /> {/* Global Popup Container */}
          
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* --- CITIZEN ROUTES --- */}
            <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
               <Route path="/dashboard" element={<Dashboard />} />
               <Route path="/submit-complaint" element={<SubmitComplaint />} />
               <Route path="/my-complaints" element={<MyComplaints />} />
               <Route path="/complaint/:id" element={<ComplaintDetail />} />
            </Route>

            {/* --- OFFICER ROUTES --- */}
            <Route element={<ProtectedRoute allowedRoles={['officer']} />}>
              <Route element={<DashboardLayout role="officer" />}>
                <Route path="/officer/dashboard" element={<OfficerDashboard />} />
                <Route path="/officer/tasks" element={<OfficerDashboard />} />
                <Route path="/officer/complaint/:id/action" element={<ComplaintAction />} />
              </Route>
            </Route>

            {/* --- DEPT ADMIN ROUTES --- */}
            <Route element={<ProtectedRoute allowedRoles={['dept_admin']} />}>
              <Route element={<DashboardLayout role="dept_admin" />}>
                <Route path="/admin/dashboard" element={<DeptDashboard />} />
                <Route path="/admin/officers" element={<OfficerManagement />} />
                <Route path="/admin/officerslist" element={<OfficerList />} />
                <Route path="/admin/sla" element={<SLATracker />} />
                <Route path="/admin/fraud" element={<FraudMonitor />} />
              </Route>
            </Route>

            {/* --- SUPER ADMIN ROUTES --- */}
            <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
              <Route element={<DashboardLayout role="super_admin" />}>
                <Route path="/super-admin/dashboard" element={<SuperDashboard />} />
                <Route path="/super-admin/departments" element={<DeptManagement />} />
                <Route path="/super-admin/user_management" element={<UserManagement />} />
                <Route path="/super-admin/logs" element={<AuditLogs />} />
                <Route path="/super-admin/abuse" element={<AbuseControl />} />
              </Route>
            </Route>

            {/* --- FALLBACK --- */}
            <Route path="*" element={<NotFound />} />
          </Routes>

        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;