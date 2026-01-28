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
import ResolvedComplaints from "./pages/officer/ResolvedComplaints";

// --- ADMIN PAGES ---
import DeptDashboard from "./pages/admin/DeptDashboard";
import OfficerManagement from "./pages/admin/OfficerManagement";
import SLATracker from "./pages/admin/SLATracker";
import OfficerList from "./pages/admin/OfficerList";

// --- SUPER ADMIN PAGES ---
import SuperDashboard from "./pages/superAdmin/AdminDashboard"; 
import DeptManagement from "./pages/superAdmin/DeptManagement";
import AuditLogs from "./pages/superAdmin/AuditLogs";
import UserManagement from "./pages/superAdmin/UserManagement";
import FraudMonitor from "./pages/superAdmin/FraudMonitor";
import HowItWorks from "./components/layout/HowItWorks";
import Faq from "./pages/common/Faq";

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
            <Route path="/complaint/:id" element={<ComplaintDetail />} />
            <Route path="/about" element={<HowItWorks />} />
            <Route path="/faq" element={<Faq />} />

            {/* --- CITIZEN ROUTES (Fixed) --- */}
            <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
               {/* ADDED: DashboardLayout wrapper so Sidebar appears */}
               <Route element={<DashboardLayout role="citizen" />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/submit-complaint" element={<SubmitComplaint />} />
                  <Route path="/my-complaints" element={<MyComplaints />} />
               </Route>
            </Route>

            {/* --- OFFICER ROUTES --- */}
            <Route element={<ProtectedRoute allowedRoles={['officer']} />}>
              <Route element={<DashboardLayout role="officer" />}>
                <Route path="/officer/dashboard" element={<OfficerDashboard />} />
                <Route path="/officer/resolved-complaints" element={<ResolvedComplaints/>} />
              </Route>
            </Route>

            {/* --- DEPT ADMIN ROUTES --- */}
            <Route element={<ProtectedRoute allowedRoles={['dept_admin']} />}>
              <Route element={<DashboardLayout role="dept_admin" />}>
                <Route path="/admin/dashboard" element={<DeptDashboard />} />
                <Route path="/admin/officers" element={<OfficerManagement />} />
                <Route path="/admin/officer-list" element={<OfficerList />} />
                <Route path="/admin/sla" element={<SLATracker />} />
              </Route>
            </Route>

            {/* --- SUPER ADMIN ROUTES --- */}
            <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
              <Route element={<DashboardLayout role="super_admin" />}>
                <Route path="/super-admin/dashboard" element={<SuperDashboard />} />
                <Route path="/super-admin/departments" element={<DeptManagement />} />
                <Route path="/super-admin/user_management" element={<UserManagement />} />
                <Route path="/super-admin/logs" element={<AuditLogs />} />
                <Route path="/super-admin/fraud" element={<FraudMonitor />} />
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