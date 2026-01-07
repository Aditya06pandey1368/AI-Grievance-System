import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                G
              </div>
              <span className="font-bold text-xl text-slate-800 dark:text-white">
                Grievance<span className="text-primary-500">AI</span>
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
              Empowering citizens with AI-driven governance. Report issues instantly, track progress transparently, and build a better community together.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/" className="hover:text-primary-500">Home</Link></li>
              <li><Link to="/about" className="hover:text-primary-500">How it Works</Link></li>
              <li><Link to="/login" className="hover:text-primary-500">Officer Login</Link></li>
              <li><Link to="/register" className="hover:text-primary-500">Citizen Sign Up</Link></li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Connect</h3>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary-500 hover:text-white transition">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-400 hover:text-white transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {currentYear} GrievanceAI. All rights reserved.
          </p>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for Smart India Hackathon
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;