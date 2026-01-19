import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { 
  Plus, 
  FileText,
  Loader2,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Activity
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const Dashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get("/complaints/my-history");
        if (data.success) {
          setComplaints(data.data);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const stats = {
    total: complaints.length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    pending: complaints.filter(c => c.status !== 'resolved' && c.status !== 'rejected').length
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors font-sans text-slate-900 dark:text-slate-100">
      
      <Navbar />

      <div className="pt-24 px-6 max-w-7xl mx-auto pb-12">
        <div className="space-y-10">

            {/* --- WELCOME HERO --- */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-2xl shadow-indigo-500/30 group"
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-1000"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl group-hover:bg-purple-500/40 transition-all duration-1000"></div>

              <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight">
                    {getGreeting()}, <span className="text-blue-200">{user?.name?.split(' ')[0]}</span>
                  </h1>
                  <p className="mt-2 text-blue-100 text-lg max-w-xl font-medium opacity-90">
                    Your active participation helps build a safer, smarter community.
                  </p>
                  
                  <div className="mt-6 flex items-center gap-4">
                    <Link to="/submit-complaint">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-lg shadow-black/20 flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" /> Raise Complaint
                        </motion.button>
                    </Link>
                  </div>
                </div>

                <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white/10 backdrop-blur-lg border border-white/20 p-5 rounded-2xl flex items-center gap-5 min-w-[240px] shadow-inner"
                >
                  <div className="relative">
                    <div className={`p-4 rounded-full ${user?.trustScore > 80 ? 'bg-green-400' : 'bg-yellow-400'} shadow-[0_0_15px_rgba(255,255,255,0.5)]`}>
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-blue-100 uppercase font-bold tracking-widest mb-1">Trust Score</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">{user?.trustScore || 100}</span>
                        <span className="text-sm text-blue-200">/100</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* --- STATS CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Stat3DCard 
                    label="Total Submitted" 
                    value={stats.total} 
                    icon={<FileText className="w-6 h-6 text-white"/>} 
                    gradient="from-blue-500 to-cyan-400"
                    shadow="shadow-blue-500/30"
                />
                <Stat3DCard 
                    label="Pending Review" 
                    value={stats.pending} 
                    icon={<Clock className="w-6 h-6 text-white"/>} 
                    gradient="from-orange-500 to-amber-400"
                    shadow="shadow-orange-500/30"
                />
                <Stat3DCard 
                    label="Resolved Cases" 
                    value={stats.resolved} 
                    icon={<CheckCircle2 className="w-6 h-6 text-white"/>} 
                    gradient="from-emerald-500 to-teal-400"
                    shadow="shadow-emerald-500/30"
                />
            </div>

            {/* --- COMPLAINT LIST --- */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Activity className="w-6 h-6 text-indigo-500" />
                  Recent Activity
                </h2>
                <div className="bg-white dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm text-sm font-medium text-slate-500">
                    Showing last {complaints.length} records
                </div>
              </div>

              {loading ? (
                 <div className="flex flex-col items-center justify-center h-64">
                   <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
                   <p className="text-slate-500 font-medium">Fetching secure data...</p>
                 </div>
              ) : complaints.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <FileText className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">No complaints yet</h3>
                  <p className="text-slate-500 text-center mt-2 max-w-sm">You haven't reported any issues. Start by submitting a new complaint.</p>
                </div>
              ) : (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid gap-6"
                >
                  {complaints.map((complaint) => (
                    <motion.div
                      variants={itemVariants}
                      key={complaint._id}
                      className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="flex flex-col justify-between h-full">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-500`}>
                                        {complaint.category}
                                    </span>
                                    {complaint.priorityLevel === 'Critical' && (
                                        <span className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-red-100 text-red-600">
                                            Priority: Critical
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                                    {complaint.title}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 line-clamp-2 leading-relaxed">
                                {complaint.description}
                                </p>
                            </div>
                            
                            <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border shadow-sm shrink-0
                                ${complaint.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400' : 
                                  complaint.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400' : 
                                  'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400'}
                            `}>
                                {complaint.status.replace('_', ' ')}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50 gap-4">
                            <div className="flex gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {format(new Date(complaint.createdAt), 'MMM dd')}
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {complaint.zone}
                                </div>
                            </div>
                            
                            <Link to={`/complaint/${complaint._id}`} className="group/btn inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-all">
                                Track Status <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

// HELPER COMPONENT FOR 3D CARDS
const Stat3DCard = ({ label, value, icon, gradient, shadow }) => (
    <motion.div 
        whileHover={{ y: -5, rotateX: 5 }}
        className={`relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-5 border border-slate-100 dark:border-slate-700 ${shadow} shadow-xl`}
    >
        <div className={`absolute top-0 right-0 p-4 rounded-bl-3xl bg-gradient-to-br ${gradient} shadow-lg`}>
            {icon}
        </div>
        <div className="relative z-10 mt-2">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>
            <p className="text-4xl font-extrabold text-slate-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-10 bg-gradient-to-tr ${gradient}`}></div>
    </motion.div>
);

export default Dashboard;