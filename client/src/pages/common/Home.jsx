import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Brain } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/ui/Button";

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg overflow-hidden transition-colors duration-300">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        {/* Background Glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-[100px] -z-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-bold tracking-wide uppercase mb-6 inline-block">
            AI-Powered Governance
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
            Solve Issues at the <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-purple-600">
              Speed of AI
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Report civic issues in seconds. Our AI automatically classifies, prioritizes, and routes complaints to the nearest officer instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button className="h-14 px-8 text-lg rounded-full">
                Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" className="h-14 px-8 text-lg rounded-full">
                Learn More
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* --- FEATURES --- */}
      <section className="py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Brain className="w-8 h-8 text-purple-500" />}
              title="AI Classification"
              desc="Automatic categorization of complaints (Fire, Road, Water) using advanced NLP models."
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-yellow-500" />}
              title="Instant Routing"
              desc="Location-based algorithm assigns the nearest available officer in milliseconds."
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-green-500" />}
              title="Fraud Prevention"
              desc="Trust Score system filters out spam and fake reports to keep the system efficient."
            />
        </div>
      </section>

      <footer className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm border-t border-slate-200 dark:border-slate-800">
        <p>© 2026 GrievanceAI. Built for Smart India Hackathon.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition">
    <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

export default Home;