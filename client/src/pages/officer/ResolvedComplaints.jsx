import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowLeft, CheckCircle, Calendar, User, FileText, XCircle } from "lucide-react";
import api from "../../services/api";
import Navbar from "../../components/layout/Navbar";

const ResolvedComplaints = () => {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/complaints/my-history');
        if (data.success) {
          // Filter ONLY Resolved/Rejected
          const resolved = data.data.filter(t => t.status === 'resolved' || t.status === 'rejected');
          
          // Sort Date DESC (Newest Finished First)
          resolved.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          
          setTasks(resolved);
        }
      } catch (error) {
        console.error("Error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t._id.toLowerCase().includes(search.toLowerCase()) ||
    t.citizen?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors font-sans pb-20">
      <Navbar />
      <div className="pt-24 px-4 max-w-5xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
            <Link to="/officer/dashboard" className="p-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm hover:scale-110 transition">
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </Link>
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Case History</h1>
                <p className="text-slate-500 dark:text-slate-400">Archive of resolved and closed grievances.</p>
            </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search by Title, ID or Citizen Name..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-500 outline-none shadow-lg text-lg font-medium transition-all"
                />
            </div>
        </div>

        {/* Timeline List */}
        <div className="space-y-6 relative before:absolute before:left-8 before:top-0 before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700 before:z-0">
            {loading ? (
                <div className="text-center py-20 pl-16">Loading history...</div>
            ) : filteredTasks.length === 0 ? (
                <div className="text-center py-20 pl-16 text-slate-500">No history found.</div>
            ) : (
                filteredTasks.map((task, index) => (
                    <motion.div 
                        key={task._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative z-10 pl-20"
                    >
                        {/* Timeline Dot */}
                        <div className={`absolute left-5 top-6 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 shadow-sm ${task.status === 'resolved' ? 'bg-green-500' : 'bg-red-500'}`}></div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-md border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {task.title}
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border flex items-center gap-1 ${task.status === 'resolved' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                            {task.status === 'resolved' ? <CheckCircle className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                                            {task.status}
                                        </span>
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" /> Closed on: {new Date(task.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Citizen</p>
                                    <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 justify-end">
                                        {task.citizen?.name} <span className="text-xs opacity-50">({task.citizen?._id.slice(-4)})</span>
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Status Remarks</p>
                                <p className="text-slate-600 dark:text-slate-300 italic text-sm">
                                    "{task.history[task.history.length - 1]?.remarks || "No remarks provided."}"
                                </p>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <Link to={`/complaint/${task._id}`} className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline flex items-center gap-1">
                                    View Full Case File <FileText className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ))
            )}
        </div>

      </div>
    </div>
  );
};

export default ResolvedComplaints;