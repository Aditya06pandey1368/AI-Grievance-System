import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  ArrowRight, Zap, Shield, Brain, CheckCircle, MapPin, 
  AlertTriangle, Activity, Globe, Server, Smartphone, 
  UserCheck, FileText, LayoutDashboard
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/ui/Button";
import Footer from "../../components/layout/Footer";

const Home = () => {
  const isAuthenticated = !!localStorage.getItem("token"); 
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white font-sans overflow-x-hidden selection:bg-indigo-500/30 transition-colors duration-300">
      <Navbar />

      {/* ================= HERO SECTION ================= */}
      <div className="relative min-h-[110vh] flex items-center justify-center pt-20 overflow-hidden">
        
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/20 dark:bg-cyan-500/10 rounded-full blur-[120px]" />
            {/* Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 backdrop-blur-md mb-8 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-bold tracking-widest text-slate-600 dark:text-slate-300 uppercase">System Operational</span>
                </div>

                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] mb-8 text-slate-900 dark:text-white">
                    The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 dark:from-indigo-400 dark:via-cyan-400 dark:to-emerald-400">Future</span> of <br /> 
                    Civic Response.
                </h1>

                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed mb-10 border-l-4 border-indigo-500 pl-6">
                    A smart grievance system that reads your complaint, finds the right department, and assigns an officer instantly.
                </p>

                <div className="flex flex-wrap gap-4">
                    <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                        <Button className="h-16 px-10 text-xl font-bold rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_10px_40px_-10px_rgba(79,70,229,0.4)] transition-all transform hover:scale-105">
                            {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                        </Button>
                    </Link>
                    <Link to="/about">
                        <Button variant="outline" className="h-16 px-10 text-xl font-bold rounded-full bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 backdrop-blur-sm">
                            Live Demo
                        </Button>
                    </Link>
                </div>

                {/* Mini Stats */}
                <div className="mt-12 flex gap-8 border-t border-slate-200 dark:border-slate-800 pt-8">
                    <div>
                        <h4 className="text-3xl font-bold text-slate-900 dark:text-white">Instant</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wider">Classification</p>
                    </div>
                    <div>
                        <h4 className="text-3xl font-bold text-slate-900 dark:text-white">100%</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wider">Automated</p>
                    </div>
                    <div>
                        <h4 className="text-3xl font-bold text-slate-900 dark:text-white">24/7</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wider">Availability</p>
                    </div>
                </div>
            </motion.div>

            {/* Right 3D Visual */}
            <div className="relative h-[600px] hidden lg:block perspective-[2000px]">
                {/* Floating Elements controlled by Scroll */}
                <motion.div style={{ y: y1 }} className="absolute top-0 right-10 z-20">
                    <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl w-64 transform rotate-y-[-20deg] rotate-x-[10deg]">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-red-100 dark:bg-red-500/20 rounded-xl text-red-600 dark:text-red-400"><AlertTriangle className="w-6 h-6" /></div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Priority: High</p>
                                <p className="font-bold text-slate-900 dark:text-white">Water Leakage</p>
                            </div>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: "90%" }} 
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="h-full bg-red-500" 
                            />
                        </div>
                    </div>
                </motion.div>

                <motion.div style={{ y: y2 }} className="absolute bottom-20 left-0 z-30">
                    <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl w-72 transform rotate-y-[20deg] rotate-x-[5deg]">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-green-100 dark:bg-green-500/20 rounded-xl text-green-600 dark:text-green-400"><CheckCircle className="w-6 h-6" /></div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Action Taken</p>
                                <p className="font-bold text-slate-900 dark:text-white">Officer Assigned</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center font-bold text-[10px]">A</div>
                            <span>Assigned to Ward 12 Officer</span>
                        </div>
                    </div>
                </motion.div>

                {/* Central Sphere */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-96 h-96">
                        <div className="absolute inset-0 rounded-full border border-indigo-500/30 dark:border-indigo-500/30 animate-[spin_10s_linear_infinite]" />
                        <div className="absolute inset-4 rounded-full border border-blue-500/30 dark:border-cyan-500/30 animate-[spin_15s_linear_infinite_reverse]" />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/10 to-blue-500/10 blur-3xl animate-pulse" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Brain className="w-32 h-32 text-indigo-600 dark:text-indigo-400 drop-shadow-[0_0_30px_rgba(99,102,241,0.5)]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* ================= BENTO GRID FEATURES ================= */}
      <section className="py-32 relative bg-white dark:bg-[#0B1120] transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto px-6">
            <div className="mb-20 max-w-3xl">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold tracking-widest uppercase">System Capabilities</span>
                <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mt-4 mb-6">Built for Efficiency. <br/>Powered by AI.</h2>
                <p className="text-slate-600 dark:text-slate-400 text-xl">An intelligent ecosystem designed to process complaints instantly and route them accurately.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                
                {/* Card 1: Large Span (Text Analysis) */}
                <motion.div 
                    whileHover={{ scale: 0.98 }}
                    className="md:col-span-2 bg-slate-50 dark:bg-slate-900 rounded-[2rem] p-10 border border-slate-200 dark:border-slate-800 relative overflow-hidden group shadow-lg"
                >
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[80px] group-hover:bg-indigo-500/10 dark:group-hover:bg-indigo-500/20 transition-all duration-500" />
                    <FileText className="w-12 h-12 text-indigo-600 dark:text-indigo-500 mb-6" />
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Smart Text Analysis</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md">
                        Our AI scans the text description of your complaint to automatically detect the issue type (e.g., Road, Electricity) and assign a priority level.
                    </p>
                    <div className="absolute bottom-10 right-10 flex gap-2">
                        <span className="px-3 py-1 bg-white dark:bg-slate-800 rounded-lg text-xs font-mono text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 shadow-sm">NLP</span>
                        <span className="px-3 py-1 bg-white dark:bg-slate-800 rounded-lg text-xs font-mono text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 shadow-sm">Automated</span>
                    </div>
                </motion.div>

                {/* Card 2: Zone Routing */}
                <motion.div 
                    whileHover={{ scale: 0.98 }}
                    className="md:col-span-1 bg-slate-50 dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden group shadow-lg"
                >
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/10 dark:bg-cyan-500/20 rounded-full blur-[50px]" />
                    <MapPin className="w-12 h-12 text-blue-600 dark:text-cyan-500 mb-6" />
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Zone-Based Routing</h3>
                    <p className="text-slate-600 dark:text-slate-400">Complaints are automatically routed to the specific officer assigned to your location zone.</p>
                </motion.div>

                {/* Card 3: Trust Score */}
                <motion.div 
                    whileHover={{ scale: 0.98 }}
                    className="md:col-span-1 bg-slate-50 dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden group shadow-lg"
                >
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[50px]" />
                    <Shield className="w-12 h-12 text-emerald-600 dark:text-emerald-500 mb-6" />
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Trust Score</h3>
                    <p className="text-slate-600 dark:text-slate-400">System filters spam and fake reports using a user reputation scoring mechanism.</p>
                </motion.div>

                {/* Card 4: SLA */}
                <motion.div 
                    whileHover={{ scale: 0.98 }}
                    className="md:col-span-2 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/30 dark:to-slate-900 rounded-[2rem] p-10 border border-indigo-100 dark:border-indigo-500/30 relative overflow-hidden group shadow-lg"
                >
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                    <Activity className="w-12 h-12 text-indigo-600 dark:text-white mb-6" />
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Real-Time SLA Monitoring</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-lg max-w-lg">
                        Officers have strict deadlines. If a ticket breaches the Service Level Agreement (SLA), it is automatically escalated to higher authorities.
                    </p>
                    <div className="mt-8 h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 w-[70%] animate-pulse" />
                    </div>
                </motion.div>

            </div>
        </div>
      </section>

      {/* ================= WORKFLOW STEPS ================= */}
      <section className="py-32 bg-slate-100 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
          {/* Connecting Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-700 to-transparent hidden md:block" />

          <div className="max-w-6xl mx-auto px-6 relative z-10">
              <div className="text-center mb-24">
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">How It Works</h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-4">From problem to solution in 4 simple steps.</p>
              </div>

              <div className="space-y-24">
                  <WorkflowStep 
                    number="01" 
                    title="You Report" 
                    desc="Fill the form with location and issue details. Use clear text descriptions."
                    icon={<Smartphone className="w-8 h-8" />}
                    align="left"
                  />
                  <WorkflowStep 
                    number="02" 
                    title="AI Processing" 
                    desc="Our AI reads your text to determine Department (Road/Water) and Priority."
                    icon={<Server className="w-8 h-8" />}
                    align="right"
                  />
                  <WorkflowStep 
                    number="03" 
                    title="Officer Assigned" 
                    desc="Ticket is routed to the officer managing your zone. SLA timer starts."
                    icon={<UserCheck className="w-8 h-8" />}
                    align="left"
                  />
                  <WorkflowStep 
                    number="04" 
                    title="Resolution" 
                    desc="Officer fixes the issue. You get notified and can rate the service."
                    icon={<CheckCircle className="w-8 h-8" />}
                    align="right"
                  />
              </div>
          </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="py-32 relative">
          <div className="absolute inset-0 bg-indigo-900 dark:bg-black">
              <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
              <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-slate-900 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
              >
                  <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight text-white">
                      Ready to Transform <br/> Your City?
                  </h2>
                  <p className="text-2xl text-indigo-200 mb-12 font-light">
                      Join the revolution of transparent, efficient governance.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                      <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                          <Button className="h-20 px-12 text-2xl font-bold rounded-full bg-white text-indigo-950 hover:bg-indigo-50 hover:scale-105 shadow-2xl transition-all">
                              {isAuthenticated ? "Go to Dashboard" : "Join Now"}
                          </Button>
                      </Link>
                      {!isAuthenticated && (
                        <Link to="/login">
                            <Button variant="outline" className="h-20 px-12 text-2xl font-bold rounded-full border-indigo-400 text-indigo-300 hover:bg-indigo-900/50 hover:text-white transition-all">
                                Login
                            </Button>
                        </Link>
                      )}
                  </div>
              </motion.div>
          </div>
      </section>

      {/* --- FOOTER --- */}
      <Footer />
    </div>
  );
};

// --- HELPER COMPONENT FOR WORKFLOW ---
const WorkflowStep = ({ number, title, desc, icon, align }) => {
    const isLeft = align === "left";
    return (
        <motion.div 
            initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`flex flex-col md:flex-row items-center gap-10 ${isLeft ? '' : 'md:flex-row-reverse'}`}
        >
            <div className="w-full md:w-1/2 flex justify-center md:justify-end px-10">
                <div className={`text-${isLeft ? 'right' : 'left'}`}>
                    <h3 className="text-4xl font-bold mb-4 flex items-center gap-4 justify-end text-slate-900 dark:text-white">
                        {isLeft && <span>{title}</span>}
                        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
                            {icon}
                        </div>
                        {!isLeft && <span>{title}</span>}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">{desc}</p>
                </div>
            </div>
            
            {/* Center Node */}
            <div className="relative hidden md:flex items-center justify-center w-12">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-700 z-10 flex items-center justify-center font-mono font-bold text-slate-500 dark:text-slate-400 shadow-sm">
                    {number}
                </div>
            </div>

            <div className="w-full md:w-1/2 px-10" />
        </motion.div>
    );
};

export default Home;