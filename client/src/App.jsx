import { BrowserRouter, Routes, Route } from "react-router-dom";

// --- IMPORTS ---
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SubmitComplaint from "./pages/SubmitComplaint";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/submit-complaint" element={<SubmitComplaint />} />
        
        {/* Admin Route */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;