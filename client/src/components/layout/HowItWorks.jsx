import { motion } from "framer-motion";
import { 
  Bot, FileText, CheckCircle, XCircle, AlertTriangle, 
  Send, MapPin, Search, Activity, ShieldAlert 
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500 font-sans overflow-x-hidden">
      <Navbar />
      
      {/* --- HERO SECTION --- */}
      <div className="relative pt-32 pb-20 px-6">
        {/* Background Decor */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4 border border-indigo-200 dark:border-indigo-800">
              AI-Powered Governance
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight mb-6">
              Your Voice, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Accelerated by AI.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Learn how our intelligent system categorizes, prioritizes, and routes your grievances to the right officer in seconds.
            </p>
          </motion.div>
        </div>
      </div>

      {/* --- PROCESS FLOW (3D CARDS) --- */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 perspective-1000">
          {[
            {
              icon: <FileText className="w-8 h-8 text-blue-500" />,
              title: "1. You File",
              desc: "Fill out the form with location and specific details. No complex categories needed—just describe the issue."
            },
            {
              icon: <Bot className="w-8 h-8 text-purple-500" />,
              title: "2. AI Analyzes",
              desc: "Our AI reads your complaint instantly. It detects the urgency, department (e.g., Road, Water), and sentiment."
            },
            {
              icon: <Send className="w-8 h-8 text-indigo-500" />,
              title: "3. Auto-Routing",
              desc: "The complaint is automatically assigned to the specific officer in charge of your Zone and Department."
            },
            {
              icon: <Activity className="w-8 h-8 text-green-500" />,
              title: "4. Resolution",
              desc: "Track status in real-time. Officers must resolve it within the SLA deadline to avoid escalation."
            }
          ].map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ rotateY: 10, scale: 1.05, z: 50 }}
              className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full -mr-10 -mt-10 transition-all group-hover:scale-150" />
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- THE PERFECT COMPLAINT (GUIDE) --- */}
      <div className="bg-slate-100 dark:bg-slate-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
              Help AI Help You: <span className="text-indigo-500">Writing Better Complaints</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              The AI uses your description to prioritize urgency. Vague complaints may be marked as "Low Priority". Be specific to ensure fast action.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* BAD EXAMPLE */}
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border-l-8 border-red-500 relative"
            >
              <div className="absolute -top-6 left-8 bg-red-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg">
                <XCircle className="w-4 h-4" /> Don't Do This
              </div>
              
              <div className="space-y-6 mt-4">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">Title</p>
                  <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 border-b border-red-200 dark:border-red-900/30 pb-2">"Road is bad"</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">Description</p>
                  <p className="text-base text-slate-600 dark:text-slate-400 italic">
                    "Please fix the road. It is very annoying."
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50">
                  <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase mb-1">AI Result:</p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Priority: <span className="font-bold">Low</span> | Dept: <span className="font-bold">Unclear</span>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* GOOD EXAMPLE */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border-l-8 border-emerald-500 relative"
            >
              <div className="absolute -top-6 left-8 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg">
                <CheckCircle className="w-4 h-4" /> Do This
              </div>
              
              <div className="space-y-6 mt-4">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">Title</p>
                  <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 border-b border-emerald-200 dark:border-emerald-900/30 pb-2">"Deep Pothole causing accidents at Sector 62"</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">Description</p>
                  <p className="text-base text-slate-600 dark:text-slate-400">
                    "There is a 3ft wide pothole near the main signal. It is filling with water and caused a bike accident today. Urgent repair needed."
                  </p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">AI Result:</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Priority: <span className="font-bold">High/Critical</span> | Dept: <span className="font-bold">Road Maintenance</span>
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* --- WARNING SECTION --- */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-8 md:p-12 rounded-[2.5rem] border border-red-200 dark:border-red-900/50 flex flex-col md:flex-row items-center gap-8 shadow-2xl"
        >
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center shrink-0 animate-pulse">
            <ShieldAlert className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Zero Tolerance for False Data</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              Our system maintains a <strong>Trust Score</strong> for every citizen. Submitting fake complaints, spamming, or using abusive language will lower your score.
            </p>
            <div className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow-md">
              Trust Score &lt; 20 = Automatic Account Ban
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default HowItWorks;