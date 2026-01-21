import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, MapPin, AlertTriangle, User, ArrowRight, 
  PlayCircle, CheckCircle, XCircle, History
} from "lucide-react";
import api from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import { toast } from "react-hot-toast";

const OfficerDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State for Confirmation
  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, id: null });

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/complaints/my-history');
      if (data.success) {
        // Filter OUT resolved/rejected
        const activeTasks = data.data.filter(t => t.status !== 'resolved' && t.status !== 'rejected');
        
        // SORTING: Priority (Critical > High) -> Date (Oldest First)
        const priorityWeight = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        
        activeTasks.sort((a, b) => {
            const pDiff = priorityWeight[b.priorityLevel] - priorityWeight[a.priorityLevel];
            if (pDiff !== 0) return pDiff;
            return new Date(a.createdAt) - new Date(b.createdAt);
        });

        setTasks(activeTasks);
      }
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  // --- ACTIONS ---
  const handleConfirm = async () => {
    const { action, id } = confirmModal;
    setConfirmModal({ show: false, action: null, id: null }); // Close immediately

    // Default remarks based on action
    let status = '';
    let defaultRemarks = '';

    if (action === 'start') {
        status = 'in_progress';
        defaultRemarks = 'Officer started working on the issue.';
    } else if (action === 'resolve') {
        status = 'resolved';
        defaultRemarks = 'Complaint resolved by officer.';
    } else if (action === 'reject') {
        status = 'rejected';
        defaultRemarks = 'Complaint rejected by officer.';
    }

    try {
        // ✅ FIX: Changed from .put() to .patch() to match backend route
        await api.patch(`/complaints/${id}/status`, { status, remarks: defaultRemarks });
        toast.success(`Action Successful: ${status.replace('_', ' ')}`);
        fetchTasks(); // Refresh list
    } catch (error) {
        console.error(error);
        toast.error("Action failed. Please try again.");
    }
  };

  const getPriorityStyle = (level) => {
    switch(level) {
        case 'Critical': return 'bg-red-500 text-white shadow-red-500/40';
        case 'High': return 'bg-orange-500 text-white shadow-orange-500/40';
        case 'Medium': return 'bg-yellow-500 text-white shadow-yellow-500/40';
        default: return 'bg-blue-500 text-white shadow-blue-500/40';
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a] text-slate-500">Loading Assignments...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors font-sans pb-20">
      <Navbar />
      
      {/* --- CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {confirmModal.show && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                    <div className={`p-6 text-center text-white ${confirmModal.action === 'resolve' ? 'bg-green-600' : confirmModal.action === 'reject' ? 'bg-red-600' : 'bg-blue-600'}`}>
                        <div className="mb-3 flex justify-center">
                            {confirmModal.action === 'resolve' && <CheckCircle className="w-12 h-12" />}
                            {confirmModal.action === 'reject' && <XCircle className="w-12 h-12" />}
                            {confirmModal.action === 'start' && <PlayCircle className="w-12 h-12" />}
                        </div>
                        <h3 className="text-xl font-bold uppercase tracking-wider">
                            {confirmModal.action === 'start' ? 'Start Task?' : confirmModal.action === 'resolve' ? 'Resolve Case?' : 'Reject Case?'}
                        </h3>
                    </div>
                    <div className="p-6 text-center">
                        <p className="text-slate-600 dark:text-slate-300 mb-6">
                            Are you sure you want to perform this action?
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button onClick={() => setConfirmModal({ show: false })} className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-600 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition">No</button>
                            <button onClick={handleConfirm} className={`flex-1 py-3 rounded-xl text-white font-bold shadow-lg transition transform active:scale-95 ${confirmModal.action === 'resolve' ? 'bg-green-600 hover:bg-green-700' : confirmModal.action === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>Yes</button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <div className="pt-24 px-4 max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                    Officer Dashboard <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm px-3 py-1 rounded-full">{tasks.length} Active</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Prioritize critical tasks. Oldest pending cases shown first.</p>
            </div>
            <Link to="/officer/resolved-complaints">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition text-slate-700 dark:text-slate-200 font-bold">
                    <History className="w-4 h-4" /> Resolved History
                </button>
            </Link>
        </div>

        {/* TASK LIST */}
        <div className="space-y-6">
           {tasks.length === 0 ? (
               <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                   <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                   <h3 className="text-xl font-bold text-slate-500">All caught up!</h3>
                   <p className="text-slate-400">No pending complaints assigned to you.</p>
               </div>
           ) : (
               tasks.map((task, index) => (
                 <motion.div 
                   key={task._id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.1 }}
                   className="bg-white dark:bg-slate-800 rounded-3xl p-1 shadow-lg border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
                 >
                   <div className="p-6">
                       {/* Top Row: Priority & ID */}
                       <div className="flex justify-between items-start mb-4">
                           <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg ${getPriorityStyle(task.priorityLevel)}`}>
                               {task.priorityLevel} Priority
                           </div>
                           <span className="font-mono text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">#{task._id.slice(-6).toUpperCase()}</span>
                       </div>

                       {/* Main Content */}
                       <div className="mb-6">
                           <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{task.title}</h3>
                           
                           <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                               <div className="flex items-center gap-1.5">
                                   <User className="w-4 h-4 text-indigo-500" />
                                   <span className="font-semibold text-slate-700 dark:text-slate-300">{task.citizen?.name || "Anonymous"}</span>
                                   <span className="text-xs opacity-70">({task.citizen?._id.slice(-4)})</span>
                               </div>
                               <div className="flex items-center gap-1.5">
                                   <MapPin className="w-4 h-4 text-indigo-500" />
                                   {task.zone}
                               </div>
                               <div className="flex items-center gap-1.5">
                                   <Clock className="w-4 h-4 text-indigo-500" />
                                   {new Date(task.createdAt).toLocaleDateString()}
                               </div>
                           </div>
                       </div>

                       {/* Action Bar */}
                       <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                           
                           <Link to={`/complaint/${task._id}`} className="flex-1 w-full">
                                <button className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2">
                                    View Full Details <ArrowRight className="w-4 h-4" />
                                </button>
                           </Link>

                           <div className="flex gap-2 w-full sm:w-auto">
                               {task.status !== 'in_progress' && (
                                   <button onClick={() => setConfirmModal({ show: true, action: 'start', id: task._id })} className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition flex items-center justify-center gap-2" title="Start Working">
                                       <PlayCircle className="w-5 h-5" /> Start
                                   </button>
                               )}
                               
                               <button onClick={() => setConfirmModal({ show: true, action: 'reject', id: task._id })} className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition flex items-center justify-center gap-2" title="Reject">
                                   <XCircle className="w-5 h-5" />
                               </button>

                               <button onClick={() => setConfirmModal({ show: true, action: 'resolve', id: task._id })} className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm shadow-lg shadow-green-500/30 transition flex items-center justify-center gap-2">
                                   <CheckCircle className="w-5 h-5" /> Resolve
                               </button>
                           </div>
                       </div>
                   </div>
                   {/* Status Indicator Bar */}
                   <div className={`h-1.5 w-full rounded-b-3xl ${task.status === 'in_progress' ? 'bg-blue-500 animate-pulse' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                 </motion.div>
               ))
           )}
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;