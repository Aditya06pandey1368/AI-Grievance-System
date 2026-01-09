import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Heart, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-slate-50 dark:bg-[#0B1120] border-t border-slate-200 dark:border-slate-800 overflow-hidden pt-16 pb-8">
      
      {/* --- 3D Background Elements --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
             style={{ backgroundImage: "radial-gradient(#6366f1 1px, transparent 1px)", backgroundSize: "24px 24px" }} 
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Column (Span 4) */}
          <div className="md:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-primary-500 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-500" />
                <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-xl">
                  G
                </div>
              </div>
              <span className="font-bold text-2xl text-slate-800 dark:text-white tracking-tight">
                Grievance<span className="text-primary-500">AI</span>
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
              Empowering citizens with AI-driven governance. We bridge the gap between problems and resolutions using advanced routing algorithms.
            </p>
            
            {/* Newsletter Input */}
            <div className="relative mt-4">
              <input 
                type="email" 
                placeholder="Enter email for updates" 
                className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full py-3 pl-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
              />
              <button className="absolute right-1.5 top-1.5 p-1.5 bg-primary-500 rounded-full text-white hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/30">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="md:col-span-2 md:col-start-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Platform</h3>
            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/" className="hover:text-primary-500 transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-primary-500 transition-colors">How it Works</Link></li>
              <li><Link to="/features" className="hover:text-primary-500 transition-colors">Features</Link></li>
              <li><Link to="/roadmap" className="hover:text-primary-500 transition-colors">Roadmap</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="md:col-span-2">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Support</h3>
            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/faq" className="hover:text-primary-500 transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-primary-500 transition-colors">Contact Us</Link></li>
              <li><Link to="/terms" className="hover:text-primary-500 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-500 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Socials Column */}
          <div className="md:col-span-3">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Connect</h3>
            <div className="flex gap-4">
              <SocialButton icon={<Github className="w-5 h-5" />} href="#" label="Github" />
              <SocialButton icon={<Twitter className="w-5 h-5" />} href="#" label="Twitter" />
              <SocialButton icon={<Linkedin className="w-5 h-5" />} href="#" label="LinkedIn" />
              <SocialButton icon={<Mail className="w-5 h-5" />} href="#" label="Email" />
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {currentYear} GrievanceAI. All rights reserved.
          </p>
          <div className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" /> for Smart India Hackathon
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

// 3D Hover Button Component
const SocialButton = ({ icon, href, label }) => (
  <motion.a 
    href={href}
    aria-label={label}
    whileHover={{ y: -5 }}
    className="relative p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 shadow-sm hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300"
  >
    {icon}
  </motion.a>
);

export default Footer;