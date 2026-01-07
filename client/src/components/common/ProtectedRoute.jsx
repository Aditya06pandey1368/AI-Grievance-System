import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // 1. Not Logged In? -> Go to Login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Wrong Role? -> Go to Unauthorized (or Home)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Or create a /unauthorized page
  }

  // 3. Allowed? -> Render the Page
  return <Outlet />;
};

export default ProtectedRoute;