import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ role }) => {
  // Initialize: Open on Desktop, Closed on Mobile
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  
  // Handler to toggle specifically
  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  // Handler to close sidebar (passed to Sidebar for mobile link clicks)
  const closeSidebar = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors">
      {/* Pass toggleSidebar function specifically */}
      <Navbar toggleSidebar={toggleSidebar} />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        role={role} 
        onClose={closeSidebar} 
      />

      <main 
        className={`pt-20 px-4 pb-8 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'md:ml-64' : 'ml-0'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;