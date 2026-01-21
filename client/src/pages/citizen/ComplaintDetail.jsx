import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPin, Calendar, User, CheckCircle2, Clock, AlertTriangle, 
  ArrowLeft, Building2, FileText, Activity 
} from "lucide-react";
import api from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import { useAuth } from "../../context/AuthContext"; // Import Auth Context

const ComplaintDetail = () => {
  const { id } = useParams();
  const { user } = useAuth(); // Get current user to check role
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await api.get(`/complaints/${id}`);
        if (res.data.success) setData(res.data.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a]">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Retrieving case files...</p>
        </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a] text-slate-500">
        Complaint not found or access denied.
    </div>
  );

  const steps = ['submitted', 'assigned', 'in_progress', 'resolved'];
  const currentStepIndex = steps.indexOf(data.status) === -1 ? 0 : steps.indexOf(data.status);
  const isRejected = data.status === 'rejected';

  // --- DYNAMIC BACK LINK BASED ON ROLE ---
  const backLink = user?.role === 'officer' 
    ? '/officer/dashboard' 
    : user?.role === 'super_admin' || user?.role === 'dept_admin'
    ? '/admin/dashboard'
    : '/dashboard'; // Default for citizen

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors font-sans pb-20">
      <Navbar />
      <div className="pt-24 px-4 max-w-6xl mx-auto">
        
        <Link to={backLink} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border dark:border-slate-700 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${data.priorityLevel === 'Critical' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-blue-100 text-blue-600 border-blue-200'}`}>
                    {data.priorityLevel} Priority
                </span>
                <span className="text-slate-400 text-sm font-mono">#{data._id.slice(-6).toUpperCase()}</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{data.title}</h1>
              <div className="flex items-center gap-4 mt-3 text-slate-500 text-sm">
                <span className="flex gap-1"><Calendar className="w-4 h-4"/> {new Date(data.createdAt).toLocaleDateString()}</span>
                <span className="flex gap-1"><Clock className="w-4 h-4"/> {new Date(data.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
            <div className={`px-6 py-3 rounded-2xl border-2 flex items-center gap-3 ${isRejected ? 'bg-red-50 text-red-700 border-red-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
              {isRejected ? <AlertTriangle className="w-6 h-6"/> : <Activity className="w-6 h-6"/>}
              <div><p className="text-xs uppercase font-bold opacity-70">Status</p><p className="text-xl font-black capitalize">{data.status.replace('_', ' ')}</p></div>
            </div>
          </div>
          
          {/* PROGRESS BAR */}
          {!isRejected && (
            <div className="mt-10 relative">
              <div className="absolute top-1/2 w-full h-1 bg-slate-100 dark:bg-slate-700 -translate-y-1/2 rounded-full"></div>
              <div className="absolute top-1/2 h-1 bg-indigo-500 -translate-y-1/2 rounded-full transition-all duration-1000" style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}></div>
              <div className="relative flex justify-between">
                {steps.map((step, index) => (
                  <div key={step} className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-colors duration-500 ${index <= currentStepIndex ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
                      {index <= currentStepIndex ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${index <= currentStepIndex ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>{step.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg border dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4"><FileText className="w-5 h-5 text-indigo-500" /> Details</h3>
              <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">{data.description}</p>
              <div className="mt-6 flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border dark:border-slate-700">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm text-indigo-500"><MapPin className="w-6 h-6" /></div>
                <div><p className="text-xs font-bold text-slate-400 uppercase">Location</p><p className="font-bold text-slate-800 dark:text-white">{data.location}</p><p className="text-sm text-slate-500">Zone: {data.zone}</p></div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg border dark:border-slate-700 relative overflow-hidden">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 relative z-10">Assigned Officer</h3>
              {data.assignedOfficer ? (
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400"><User className="w-8 h-8" /></div>
                    <div><p className="text-xl font-bold text-slate-900 dark:text-white">{data.assignedOfficer.name}</p><span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active Duty</span></div>
                  </div>
                  <div className="space-y-3 pt-4 border-t dark:border-slate-700">
                    <div className="flex items-center gap-3 text-sm"><Building2 className="w-4 h-4 text-slate-400" /><div><p className="text-slate-500 text-xs">Department</p><p className="font-semibold text-slate-800 dark:text-white">{data.department ? data.department.name : "General"}</p></div></div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 relative z-10"><p className="text-slate-500 font-medium">Pending Assignment</p><p className="text-xs text-slate-400">Waiting for department allocation</p></div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg border dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Activity Log</h3>
              <div className="space-y-6 relative pl-2">
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
                {data.history?.map((h, i) => (
                  <div key={i} className="relative pl-8 group">
                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border-4 border-slate-200 dark:border-slate-600 group-hover:border-indigo-500 transition-colors z-10"></div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400 uppercase mb-0.5">{new Date(h.timestamp).toLocaleDateString()} • {new Date(h.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{h.action.replace(/_/g, ' ')}</p>
                      {h.remarks && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">"{h.remarks}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;