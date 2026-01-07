import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  ShieldAlert, 
  BarChart2, 
  Settings,
  LogOut 
} from "lucide-react";

const Sidebar = ({ isOpen, role, onClose }) => {
  // Define menu items based on Role
  const menus = {
    citizen: [
      { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard /> },
      { name: "My Complaints", path: "/my-complaints", icon: <FileText /> },
      { name: "File New", path: "/submit-complaint", icon: <ShieldAlert /> },
    ],
    officer: [
      { name: "Overview", path: "/officer/dashboard", icon: <LayoutDashboard /> },
      { name: "Assigned Tasks", path: "/officer/tasks", icon: <FileText /> },
      { name: "Resolved", path: "/officer/resolved", icon: <ShieldAlert /> },
    ],
    dept_admin: [
      { name: "Dept Overview", path: "/admin/dashboard", icon: <LayoutDashboard /> },
      { name: "Manage Officers", path: "/admin/officers", icon: <Users /> },
      { name: "SLA Tracker", path: "/admin/sla", icon: <BarChart2 /> },
    ],
    super_admin: [
      { name: "System Overview", path: "/super-admin/dashboard", icon: <LayoutDashboard /> },
      { name: "Departments", path: "/super-admin/departments", icon: <Settings /> },
      { name: "User Management", path: "/super-admin/users", icon: <Users /> },
      { name: "Audit Logs", path: "/super-admin/logs", icon: <ShieldAlert /> },
    ]
  };

  const links = menus[role] || menus.citizen;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for Mobile */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 bg-black z-40"
          />
          
          {/* Sidebar */}
          <motion.aside
            initial={{ x: -250 }} animate={{ x: 0 }} exit={{ x: -250 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40 p-4"
          >
            <div className="space-y-2 mt-4">
              {links.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={onClose} // Close on mobile click
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                    ${isActive 
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}
                  `}
                >
                  {link.icon}
                  {link.name}
                </NavLink>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;