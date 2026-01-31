import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import useTheme from "../../hooks/useTheme";
import Button from "../ui/Button";

const Navbar = ({ toggleSidebar }) => { 
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Local state for Landing Page mobile menu
  const navigate = useNavigate();

  // 1. Get User Data securely
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user'); 
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload(); 
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* --- LEFT: LOGO & SIDEBAR TOGGLE (LOGGED IN ONLY) --- */}
          <div className="flex items-center gap-4">
             {/* Burger Bar: ONLY shows here if Logged In (Triggers Sidebar) */}
             {token && (
               <button 
                 onClick={toggleSidebar} 
                 className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
               >
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

          {/* --- RIGHT: ACTIONS --- */}
          <div className="flex items-center gap-2 md:gap-6">
            
            {/* 1. Theme Toggle (ALWAYS VISIBLE) */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* 2. Desktop Menu (Hidden on Mobile) */}
            <div className="hidden md:flex items-center gap-6">
              {!token ? (
                <>
                  <Link to="/" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-500 transition-colors">Home</Link>
                  <Link to="/about" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-500 transition-colors">How it Works</Link>
                  <div className="flex items-center gap-2 ml-4">
                    <Link to="/login"><Button variant="ghost" className="text-sm">Sign In</Button></Link>
                    <Link to="/register"><Button className="text-sm px-5 py-2">Get Started</Button></Link>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                     <User className="w-4 h-4" />
                     <span className="font-medium">{user?.name || 'User'}</span>
                  </div>
                  <Button onClick={handleLogout} variant="ghost" className="text-sm text-red-500 hover:bg-red-50">Logout</Button>
                </div>
              )}
            </div>

            {/* 3. Mobile Menu Toggle (ONLY shows if Logged OUT) */}
            {!token && (
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- MOBILE DROPDOWN MENU (LOGGED OUT ONLY) --- */}
      <AnimatePresence>
        {isMobileMenuOpen && !token && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800"
          >
            <div className="px-4 py-6 space-y-4">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium text-slate-600 dark:text-slate-300">Home</Link>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block text-base font-medium text-slate-600 dark:text-slate-300">How it Works</Link>
              <div className="pt-4 flex flex-col gap-3">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-center">Sign In</Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full justify-center">Get Started</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;