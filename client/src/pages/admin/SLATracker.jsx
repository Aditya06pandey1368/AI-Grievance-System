import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  CheckCircle, 
  ArrowRight,
  Siren,
  MapPin
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const SLATracker = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ breached: [], atRisk: [], stats: { breachedCount: 0, riskCount: 0 } });
  const [activeTab, setActiveTab] = useState('breached'); // 'breached' or 'risk'

  useEffect(() => {
    fetchSLAData();
  }, []);

  const priorityScore = {
    'Critical': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1
  };

  const fetchSLAData = async () => {
    try {
      const res = await api.get("/sla/tracker");
      if (res.data.success) {
        const rawData = res.data.data;
        
        const sortFn = (a, b) => {
            const pA = priorityScore[a.priority] || 0;
            const pB = priorityScore[b.priority] || 0;
            if (pB !== pA) return pB - pA;
            return parseFloat(a.hoursLeft) - parseFloat(b.hoursLeft);
        };

        setData({
            breached: rawData.breached.sort(sortFn),
            atRisk: rawData.atRisk.sort(sortFn),
            stats: rawData.stats
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to sync SLA data");
    } finally {
      setLoading(false);
    }
  };

  const listToDisplay = activeTab === 'breached' ? data.breached : data.atRisk;

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-colors duration-300">
        <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full"/>
    </div>
  );

  return (
    // UPDATED: Dynamic Background & Text Colors
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white font-sans selection:bg-red-500/30 transition-colors duration-300">
      <Navbar />
      
      {/* Background Glow (Adjusted for Light Mode visibility) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] transition-colors duration-1000 ${activeTab === 'breached' ? 'bg-red-500/10 dark:bg-red-600/20' : 'bg-orange-500/10 dark:bg-orange-500/20'}`} />
      </div>

      <div className="pt-28 px-6 max-w-7xl mx-auto pb-20 relative z-10">
        
        {/* Header */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6"
        >
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3 text-slate-900 dark:text-white">
                    <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-500" />
                    SLA Command Center
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg max-w-xl">
                    Real-time monitoring of service level breaches and critical deadlines.
                </p>
            </div>
            
            {/* 3D Summary Cards */}
            <div className="flex gap-4">
                <Summary3DCard 
                    label="Active Breaches" 
                    count={data.stats.breachedCount} 
                    color="red" 
                    icon={<Siren className="w-6 h-6"/>}
                    active={activeTab === 'breached'}
                    onClick={() => setActiveTab('breached')}
                />
                <Summary3DCard 
                    label="At Risk (<24h)" 
                    count={data.stats.riskCount} 
                    color="orange" 
                    icon={<Clock className="w-6 h-6"/>}
                    active={activeTab === 'risk'}
                    onClick={() => setActiveTab('risk')}
                />
            </div>
        </motion.div>

        {/* List Section */}
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4 px-2">
                <h2 className={`text-xl font-bold uppercase tracking-wider flex items-center gap-2 ${activeTab === 'breached' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
                    {activeTab === 'breached' ? 'Critical Violations' : 'Approaching Deadline'}
                    <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-white text-xs px-2 py-1 rounded-full border border-slate-300 dark:border-slate-700">
                        {listToDisplay.length}
                    </span>
                </h2>
            </div>

            {listToDisplay.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl bg-slate-100/50 dark:bg-slate-800/30">
                    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 text-lg">All systems normal. No issues found.</p>
                </div>
            ) : (
                listToDisplay.map((ticket, idx) => (
                    <TicketRow key={ticket._id} ticket={ticket} index={idx} type={activeTab} />
                ))
            )}
        </div>

      </div>
    </div>
  );
};

// 3D Tilt Card for Header
const Summary3DCard = ({ label, count, color, icon, active, onClick }) => {
    // UPDATED: Dynamic Colors for Cards
    const activeClass = active 
        ? `ring-2 ring-${color}-500 bg-white dark:bg-slate-800 scale-105 shadow-xl` 
        : `bg-white/60 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800`;

    return (
        <motion.button
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`relative p-5 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all duration-300 w-44 text-left group ${activeClass}`}
        >
            <div className={`absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity text-${color}-600 dark:text-${color}-500`}>
                {icon}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">{label}</p>
            <p className={`text-4xl font-black mt-1 text-${color}-600 dark:text-${color}-500`}>{count}</p>
        </motion.button>
    )
};

// Animated List Row
const TicketRow = ({ ticket, index, type }) => {
    const isBreached = type === 'breached';
    
    // UPDATED: Priority Badges for Light/Dark
    const priorityColor = {
        'Critical': 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/50',
        'High': 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/50',
        'Medium': 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/50',
        'Low': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/50',
    }[ticket.priority] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`group relative overflow-hidden bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:border-${isBreached ? 'red' : 'orange'}-500/50 rounded-2xl p-5 transition-all shadow-sm hover:shadow-md dark:hover:bg-slate-800`}
        >
            {/* Status Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${isBreached ? 'bg-red-600' : 'bg-orange-500'}`} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Left: Info */}
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${isBreached ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500' : 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-500'}`}>
                        {isBreached ? <AlertTriangle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            {/* PRIORITY BADGE */}
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${priorityColor}`}>
                                {ticket.priority}
                            </span>
                            <span className="text-slate-400 dark:text-slate-500 text-xs font-mono">ID: {ticket._id.slice(-6)}</span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-white transition-colors">
                            {ticket.title}
                        </h3>
                        
                        {/* Meta Data Row */}
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 mt-2">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                                {ticket.department}
                            </span>
                            
                            {/* LOCATION */}
                            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                <MapPin className="w-3.5 h-3.5" />
                                {ticket.location}
                            </span>

                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                                Officer: {ticket.assignedTo}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Metrics */}
                <div className="flex items-center gap-6 pl-14 md:pl-0">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs text-slate-500 uppercase font-bold">Deadline</p>
                        <p className="text-slate-700 dark:text-slate-300 font-mono text-sm">
                            {new Date(ticket.deadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                    
                    <div className={`text-right w-32 ${isBreached ? 'text-red-600 dark:text-red-500' : 'text-orange-600 dark:text-orange-400'}`}>
                        <p className="text-xs font-bold uppercase opacity-80">
                            {isBreached ? 'Overdue By' : 'Time Left'}
                        </p>
                        <p className="text-2xl font-black font-mono">
                            {Math.abs(ticket.hoursLeft)}h
                        </p>
                    </div>

                    <button className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                        <ArrowRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default SLATracker;