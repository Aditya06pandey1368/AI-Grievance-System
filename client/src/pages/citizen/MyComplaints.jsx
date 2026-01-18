import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Calendar, MapPin, ArrowRight, FileText } from "lucide-react";
import api from "../../services/api";
import Navbar from "../../components/layout/Navbar";

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get("/complaints/my-history");
        if (data.success) setComplaints(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = complaints.filter(c => {
    const matchesFilter = filter === 'all' || c.status === filter;
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch(status) {
        case 'resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400';
        case 'rejected': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400';
        case 'submitted': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400';
        default: return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors font-sans">
      <Navbar />
      
      <div className="pt-24 px-4 max-w-5xl mx-auto pb-20">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              My Complaints History
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Track the real-time status and resolution details of your reports.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            {/* Filter */}
            <div className="relative">
                <Filter className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <select 
                className="w-full sm:w-48 pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer shadow-sm font-medium text-slate-600 dark:text-slate-300"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
                </select>
            </div>
          </div>
        </div>

        {/* LIST SECTION */}
        <div className="space-y-4">
          {loading ? (
             <div className="text-center py-20 text-slate-400 animate-pulse">Loading records...</div>
          ) : filtered.length === 0 ? (
             <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-slate-500 font-medium">No complaints found matching your criteria.</p>
                <button onClick={() => {setFilter('all'); setSearch('')}} className="text-indigo-500 hover:underline mt-2 text-sm">Clear filters</button>
             </div>
          ) : (
            <AnimatePresence>
                {filtered.map((c, index) => (
                    <motion.div 
                    key={c._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-900 transition-all duration-300 relative overflow-hidden"
                    >
                        {/* Status Bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getStatusColor(c.status).split(' ')[0].replace('bg-', 'bg-').replace('100', '500')}`}></div>

                        <div className="flex flex-col sm:flex-row justify-between gap-4 pl-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(c.status)}`}>
                                        {c.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(c.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {c.title}
                                </h3>
                                
                                <div className="flex items-center gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded">
                                        <MapPin className="w-3.5 h-3.5" /> {c.zone}
                                    </span>
                                    {c.priorityLevel === 'Critical' && (
                                        <span className="text-red-500 flex items-center gap-1 font-bold text-xs bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                                            Priority: Critical
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-end">
                                <Link to={`/complaint/${c._id}`}>
                                    <button className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 transform group-hover:rotate-[-45deg]">
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyComplaints;