import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon, Menu, X, User } from "lucide-react";
import { useState } from "react";
import useTheme from "../../hooks/useTheme";
import Button from "../ui/Button";

const Navbar = ({ toggleSidebar }) => { // Accept toggleSidebar prop
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // 1. Get User Data securely
  const token = localStorage.getItem('token');
  // Parse user from stored JSON if available, else null
  const userStr = localStorage.getItem('user'); 
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload(); 
  };

  const navVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <motion.nav 
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20 dark:border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* LEFT SIDE: Logo & Mobile Toggle */}
          <div className="flex items-center gap-4">
             {/* Show Sidebar Toggle ONLY if user is logged in (Dashboard mode) */}
             {token && (
               <button onClick={toggleSidebar} className="md:hidden text-slate-600 dark:text-white">
                 <Menu className="w-6 h-6" />
               </button>
             )}

             <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-primary-500/50 transition-all">
                G
              </div>
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300">
                Grievance<span className="text-primary-500">AI</span>
              </span>
            </Link>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-6">
            {!token && (
              <>
                <Link to="/" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-500 transition-colors">Home</Link>
                <Link to="/about" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-500 transition-colors">How it Works</Link>
              </>
            )}
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Auth Buttons */}
            {token ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                   <User className="w-4 h-4" />
                   <span className="font-medium">{user?.name || 'User'}</span>
                   <span className="text-xs opacity-70 bg-primary-100 text-primary-700 px-1.5 rounded uppercase">{user?.role}</span>
                </div>
                <Button 
                  onClick={handleLogout} 
                  variant="ghost" 
                  className="text-sm text-red-500 hover:bg-red-50"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" className="text-sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button className="text-sm px-5 py-2">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;