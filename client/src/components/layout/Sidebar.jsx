import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Users,
  ShieldAlert,
  BarChart2,
  Settings,
  ClipboardList,
  EyeOff,
  Plus
} from "lucide-react";

const Sidebar = ({ isOpen, role = "citizen", onClose }) => {
  
  // Define menu items based on Role
  const menus = {
    citizen: [
      { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
      { name: "My Complaints", path: "/my-complaints", icon: <FileText className="w-5 h-5" /> },
      { name: "File New", path: "/submit-complaint", icon: <Plus className="w-5 h-5" /> },
    ],
    officer: [
      { name: "Overview", path: "/officer/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
      { name: "Resolved", path: "/officer/resolved-complaints", icon: <ShieldAlert className="w-5 h-5" /> },
    ],
    dept_admin : [
      { name: "Dept Overview", path: "/admin/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
      { name: "Manage Officers", path: "/admin/officers", icon: <Users className="w-5 h-5" /> },
      { name: "SLA Tracker", path: "/admin/sla", icon: <BarChart2 className="w-5 h-5" /> },
      { name: "Officer List", path: "/admin/officer-list", icon: <ClipboardList className="w-5 h-5" /> },
    ],
    super_admin: [
      { name: "System Overview", path: "/super-admin/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
      { name: "Departments", path: "/super-admin/departments", icon: <Settings className="w-5 h-5" /> },
      { name: "Dept Management", path: "/super-admin/user_management", icon: <Users className="w-5 h-5" /> },
      { name: "Fraud Monitor", path: "/super-admin/fraud", icon: <EyeOff className="w-5 h-5" /> },
      { name: "Audit Logs", path: "/super-admin/logs", icon: <ShieldAlert className="w-5 h-5" /> },
    ]
  };

  // Fallback to citizen if role is undefined or invalid
  const links = menus[role] || menus.citizen;

  return (
    <>
      {/* 1. MOBILE BACKDROP (Only visible when isOpen is true on mobile) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.5 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 bg-black z-40"
          />
        )}
      </AnimatePresence>

      {/* 2. SIDEBAR (Fixed layout) */}
      <aside 
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
          z-50 overflow-y-auto transition-transform duration-300 ease-in-out
          
          /* KEY FIX: Transform logic */
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 /* Always show on Desktop (md screens and up) */
        `}
      >
        <div className="p-4 space-y-2 mt-2">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => {
                // Only close sidebar on mobile when a link is clicked
                if (window.innerWidth < 768) onClose();
              }}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                ${isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"}
              `}
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}
        </div>
        
        {/* Optional: User Role Badge at Bottom */}
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Role</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">{role.replace('_', ' ')}</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;