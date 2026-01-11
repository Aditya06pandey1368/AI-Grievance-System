import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  RefreshCcw, 
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // 1. Fetch Data
  const fetchAllComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints/admin/all');
      // Robust check: handles if data comes as res.data.data or just res.data
      const data = res.data.data || res.data || [];
      
      if (Array.isArray(data)) {
        setComplaints(data);
      } else {
        console.error("API did not return an array:", data);
        setComplaints([]);
      }
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllComplaints();
  }, []);

  // 2. Handle Status Update
  const handleStatusChange = async (id, newStatus) => {
    try {
      // Optimistic Update
      setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));
      await api.patch(`/complaints/${id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Update failed");
      fetchAllComplaints(); // Revert on error
    }
  };

  // 3. Filter Logic
  const filteredComplaints = complaints.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'resolved') return c.status === 'resolved';
    if (filter === 'pending') return c.status !== 'resolved' && c.status !== 'rejected';
    return true;
  });

  // 4. Dynamic Stats Calculation
  const stats = {
    pending: complaints.filter(c => c.status !== 'resolved' && c.status !== 'rejected').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    total: complaints.length
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors font-sans">
      <Navbar />
      
      <div className="pt-24 px-6 max-w-7xl mx-auto pb-12">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Admin Command Center
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage, prioritize, and resolve citizen grievances.
            </p>
          </div>
          
          <button 
            onClick={fetchAllComplaints}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* STATS OVERVIEW - Uses calculated stats object */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard 
              label="Pending Action" 
              count={stats.pending} 
              icon={<AlertCircle className="w-6 h-6 text-orange-500" />} 
              color="border-orange-500"
            />
            <StatCard 
              label="Resolved Cases" 
              count={stats.resolved} 
              icon={<CheckCircle className="w-6 h-6 text-green-500" />} 
              color="border-green-500"
            />
            <StatCard 
              label="Total Database" 
              count={stats.total} 
              icon={<Clock className="w-6 h-6 text-blue-500" />} 
              color="border-blue-500"
            />
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          
          {/* TOOLBAR */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex gap-4 items-center">
             <div className="flex gap-2">
                {['all', 'pending', 'resolved'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                      filter === f 
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {f}
                  </button>
                ))}
             </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Complaint</th>
                  <th className="px-6 py-4">Citizen</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                   <tr><td colSpan="5" className="px-6 py-12 text-center">Loading...</td></tr>
                ) : filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      No complaints found in this category.
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((c) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={c._id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      {/* Title & Category */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">{c.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{c.category}</div>
                      </td>

                      {/* Citizen Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold">
                              {c.citizen?.name?.charAt(0) || "U"}
                           </div>
                           <span>{c.citizen?.name || "Anonymous"}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>

                      {/* Priority Badge */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold
                          ${c.priorityLevel === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                          ${c.priorityLevel === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                          ${c.priorityLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                          ${c.priorityLevel === 'Low' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                        `}>
                          {c.priorityLevel}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-6 py-4">
                        <select 
                          value={c.status}
                          onChange={(e) => handleStatusChange(c._id, e.target.value)}
                          className={`appearance-none pl-3 pr-8 py-1 rounded-md text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors
                            ${c.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                              c.status === 'rejected' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' :
                              'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20'}
                          `}
                        >
                          <option value="submitted">Submitted</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// StatCard Component
const StatCard = ({ label, count, icon, color }) => (
  <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{count}</p>
      </div>
      <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
        {icon}
      </div>
    </div>
  </div>
);

export default AdminDashboard;