import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Brain, CheckCircle, MapPin, AlertTriangle, Layers, Activity, Smartphone } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/ui/Button";
import Footer from "../../components/layout/Footer"; // Importing your new Footer

const Home = () => {
  // TODO: Replace with your actual Auth Context
  const isAuthenticated = !!localStorage.getItem("token"); 

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white overflow-hidden selection:bg-primary-500/30">
      <Navbar />

      {/* --- BACKGROUND DECORATION --- */}
      <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#6366f1 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] -z-10" />

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full">
          
          {/* LEFT: TEXT CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left flex flex-col items-center lg:items-start"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="px-4 py-1.5 rounded-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 backdrop-blur-md text-primary-600 dark:text-primary-400 text-sm font-bold tracking-wide uppercase mb-6 inline-flex items-center gap-2 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              AI-Powered Governance
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Solve Issues at the <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 animate-gradient-x">
                Speed of AI
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed">
              Report civic issues in seconds. Our AI automatically classifies, prioritizes, and routes complaints to the nearest officer instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button className="h-14 px-8 text-lg rounded-full w-full sm:w-auto shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all">
                    Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button className="h-14 px-8 text-lg rounded-full w-full sm:w-auto shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all">
                    Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              )}
              
              <Link to="/about">
                <Button variant="outline" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                  How it Works
                </Button>
              </Link>
            </div>
            
            <div className="mt-10 flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
              <div className="flex -space-x-3">
                 {[1,2,3,4].map((i) => (
                   <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700" />
                 ))}
              </div>
              <p>Trusted by 10k+ Citizens</p>
            </div>
          </motion.div>

          {/* RIGHT: 3D ILLUSTRATION */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:flex items-center justify-center h-[600px] perspective-1000"
          >
              <div className="relative w-full max-w-md transform transition-transform duration-500 hover:rotate-y-6 hover:rotate-x-6 preserve-3d">
                 {/* Floating Elements (Corrected Positions) 
                 <motion.div 
                   animate={{ y: [0, -15, 0] }} 
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute -top-20 -right-20 z-0"
                 >
                   <div className="bg-red-500/10 p-4 rounded-full backdrop-blur-md border border-red-500/20 shadow-lg">
                     <MapPin className="w-12 h-12 text-red-500" />
                   </div>
                 </motion.div>

                 <motion.div 
                   animate={{ y: [0, 15, 0] }} 
                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                   className="absolute bottom-10 -left-20 z-20"
                 >
                   <div className="bg-amber-500/10 p-3 rounded-2xl backdrop-blur-md border border-amber-500/20 shadow-xl">
                     <AlertTriangle className="w-10 h-10 text-amber-500" />
                   </div>
                 </motion.div>
                 */}

                 {/* MAIN CARD */}
                 <div className="relative bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl backdrop-blur-xl z-10 transform rotate-y-12 rotate-z-2">
                   <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">New Report #429</h3>
                          <p className="text-xs text-slate-500">Just now • Sector 62, Noida</p>
                        </div>
                     </div>
                     <span className="px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-bold">High Priority</span>
                   </div>

                   <div className="space-y-3 mb-6">
                     <div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-700/50 w-full relative overflow-hidden group border border-slate-200 dark:border-slate-600">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center text-slate-500 dark:text-slate-300 text-sm font-medium tracking-wide">
                          AI Processing...
                        </div>
                        <motion.div 
                          animate={{ top: ["0%", "100%", "0%"] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 right-0 h-[2px] bg-primary-500 shadow-[0_0_20px_rgba(99,102,241,0.6)]"
                        />
                     </div>
                     <div className="h-2 w-3/4 rounded-full bg-slate-100 dark:bg-slate-700" />
                     <div className="h-2 w-1/2 rounded-full bg-slate-100 dark:bg-slate-700" />
                   </div>

                   <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 flex items-center gap-3 border border-primary-100 dark:border-primary-800">
                     <Brain className="w-6 h-6 text-primary-600" />
                     <div>
                       <p className="text-sm font-bold text-primary-700 dark:text-primary-300">AI Assigned Officer</p>
                       <p className="text-xs text-primary-600/80 dark:text-primary-400/80">Routing complete in 0.4s</p>
                     </div>
                     <CheckCircle className="ml-auto w-5 h-5 text-primary-600" />
                   </div>
                 </div>

                 <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-3xl transform translate-x-4 translate-y-4 -z-10 opacity-40 blur-sm" />
              </div>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES SECTION (REVAMPED) --- */}
      <section className="relative py-32 bg-slate-50 dark:bg-[#0B1120]">
        
        {/* Section Background Effects */}
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl skew-y-1 transform origin-top-left -z-10" />
        
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-primary-500 font-bold tracking-wider uppercase text-sm"
              >
                Powerful Capabilities
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mt-3 mb-6"
              >
                Why Grievance<span className="text-primary-500">AI</span>?
              </motion.h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                We combine deep learning with geolocation data to bridge the gap between citizens and administration faster than ever before.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                <FeatureCard 
                  icon={<Brain className="w-8 h-8 text-white" />}
                  color="bg-purple-500"
                  title="AI Classification"
                  desc="Our NLP models automatically categorize complaints (Fire, Road, Water) with 99% accuracy."
                  delay={0}
                />
                <FeatureCard 
                  icon={<Zap className="w-8 h-8 text-white" />}
                  color="bg-yellow-500"
                  title="Instant Routing"
                  desc="Location-based algorithms assign the nearest available officer in milliseconds."
                  delay={0.2}
                />
                <FeatureCard 
                  icon={<Shield className="w-8 h-8 text-white" />}
                  color="bg-green-500"
                  title="Fraud Prevention"
                  desc="Trust Score system filters out spam and fake reports to keep the system efficient."
                  delay={0.4}
                />
            </div>
        </div>
      </section>

      {/* --- EXTERNAL FOOTER COMPONENT --- */}
      <Footer />
    </div>
  );
};

// 3D Tilt Feature Card
const FeatureCard = ({ icon, color, title, desc, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7, delay }}
    whileHover={{ y: -10 }}
    className="group relative p-8 rounded-[2rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl transition-all duration-300 overflow-hidden"
  >
    {/* Hover Gradient Border Effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    
    {/* Background Blob */}
    <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full ${color} opacity-10 group-hover:scale-150 transition-transform duration-500 ease-out`} />

    <div className="relative z-10">
      <div className={`w-16 h-16 rounded-2xl ${color} shadow-lg flex items-center justify-center mb-8 transform group-hover:rotate-6 transition-transform duration-300`}>
        {icon}
      </div>
      
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-primary-500 transition-colors">
        {title}
      </h3>
      
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        {desc}
      </p>

      {/* Arrow that appears on hover */}
      <div className="mt-8 flex items-center text-primary-500 font-bold text-sm opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
        Learn more <ArrowRight className="ml-2 w-4 h-4" />
      </div>
    </div>
  </motion.div>
);

export default Home;