import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import useTheme from "../../hooks/useTheme";

const DashboardLayout = ({ role }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  
  // Auto-close sidebar on mobile, open on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors">
      <Navbar toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        role={role} 
        onClose={() => window.innerWidth < 768 && setSidebarOpen(false)} 
      />

      <main 
        className={`pt-20 px-4 pb-8 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : ''}`}
      >
        <div className="max-w-7xl mx-auto">
          <Outlet /> {/* This renders the child page (Dashboard, etc.) */}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;