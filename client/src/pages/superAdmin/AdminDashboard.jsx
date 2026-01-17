import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  RefreshCcw, 
  Building2,
  BarChart3,
  Filter
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]); // Store departments for dropdown
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // --- 1. INITIAL DATA FETCHING ---
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Parallel fetch: Get Complaints AND Departments
      const [complaintsRes, deptsRes] = await Promise.all([
        api.get('/complaints/admin/all'),
        api.get('/admin/departments') // Ensure this endpoint exists in your department.routes
      ]);

      // Handle Complaints Data
      const cData = complaintsRes.data.data || complaintsRes.data || [];
      setComplaints(Array.isArray(cData) ? cData : []);

      // Handle Departments Data
      const dData = deptsRes.data.data || deptsRes.data || [];
      setDepartments(Array.isArray(dData) ? dData : []);

    } catch (error) {
      console.error("Dashboard Sync Error:", error);
      toast.error("Failed to sync dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- 2. UNIVERSAL UPDATE HANDLER ---
  const handleUpdate = async (id, type, value) => {
    // 1. Create Optimistic Backup
    const originalComplaints = [...complaints];

    // 2. Optimistic UI Update
    setComplaints(prev => prev.map(c => {
      if (c._id === id) {
        if (type === 'status') return { ...c, status: value };
        if (type === 'priority') return { ...c, priority: value }; // standardized to 'priority'
        if (type === 'department') {
            const newDept = departments.find(d => d._id === value);
            return { ...c, department: newDept || c.department };
        }
      }
      return c;
    }));

    try {
      if (type === 'status') {
        // Call Status Endpoint
        await api.patch(`/complaints/${id}/status`, { status: value });
        toast.success(`Status updated to ${value}`);
      } else {
        // Call Reclassify Endpoint (For Priority & Department)
        // This handles "Human in the Loop" logic & Audit Logs
        const payload = type === 'priority' ? { priority: value } : { departmentId: value };
        await api.put(`/complaints/${id}/reclassify`, payload);
        toast.success(`${type === 'priority' ? 'Priority' : 'Department'} updated successfully`);
      }
    } catch (error) {
      console.error("Update failed", error);
      toast.error(`Failed to update ${type}`);
      setComplaints(originalComplaints); // Revert on failure
    }
  };

  // --- 3. FILTER LOGIC ---
  const filteredComplaints = complaints.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'resolved') return c.status === 'resolved';
    if (filter === 'pending') return c.status !== 'resolved' && c.status !== 'rejected';
    if (filter === 'critical') return c.priority === 'Critical';
    return true;
  });

  // --- 4. DYNAMIC STATS ---
  const stats = {
    pending: complaints.filter(c => c.status !== 'resolved' && c.status !== 'rejected').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    total: complaints.length
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors font-sans text-slate-900 dark:text-slate-100">
      <Navbar />
      
      <div className="pt-24 px-6 max-w-7xl mx-auto pb-12">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-primary-500" />
              Admin Command Center
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Override AI classifications and manage complaint workflows.
            </p>
          </div>
          
          <button 
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Data
          </button>
        </div>

        {/* STATS OVERVIEW */}
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

        {/* MAIN TABLE CONTAINER */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          
          {/* TOOLBAR */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-center bg-slate-50/50 dark:bg-slate-900/20">
             <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase tracking-wider mr-2">
                <Filter className="w-4 h-4" /> Filters:
             </div>
             <div className="flex gap-2">
                {['all', 'pending', 'resolved', 'critical'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all border ${
                      filter === f 
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-md' 
                      : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {f}
                  </button>
                ))}
             </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-900/80 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 rounded-tl-lg">Complaint Details</th>
                  <th className="px-6 py-4">Department (Route)</th>
                  <th className="px-6 py-4">Priority Score</th>
                  <th className="px-6 py-4">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                   <tr><td colSpan="4" className="px-6 py-20 text-center text-slate-400 animate-pulse">Syncing intelligence...</td></tr>
                ) : filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                      <CheckCircle className="w-10 h-10 text-slate-300" />
                      <span>No complaints match this filter.</span>
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((c) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={c._id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
                    >
                      {/* 1. Details Column */}
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 min-w-[2rem] h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                                {c.citizen?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white line-clamp-1" title={c.title}>
                                    {c.title}
                                </div>
                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                    <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 rounded text-[10px]">ID: {c._id.slice(-6)}</span>
                                    <span>• {new Date(c.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                      </td>

                      {/* 2. Department Dropdown (Re-routing) */}
                      <td className="px-6 py-4">
                        <div className="relative">
                            <select 
                                value={c.department?._id || c.department} 
                                onChange={(e) => handleUpdate(c._id, 'department', e.target.value)}
                                className="w-40 pl-9 pr-8 py-2 rounded-lg text-xs font-bold appearance-none bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-all hover:bg-slate-200 dark:hover:bg-slate-800"
                            >
                                {departments.map(d => (
                                    <option key={d._id} value={d._id}>{d.name}</option>
                                ))}
                            </select>
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                      </td>

                      {/* 3. Priority Dropdown (Re-classification) */}
                      <td className="px-6 py-4">
                        <select 
                          value={c.priority || 'Low'}
                          onChange={(e) => handleUpdate(c._id, 'priority', e.target.value)}
                          className={`appearance-none pl-4 pr-8 py-1.5 rounded-full text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 transition-all text-center w-32
                            ${(c.priority === 'Critical') ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800' : ''}
                            ${(c.priority === 'High') ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800' : ''}
                            ${(c.priority === 'Medium') ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800' : ''}
                            ${(!c.priority || c.priority === 'Low') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800' : ''}
                          `}
                        >
                          <option value="Critical">Critical</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </td>

                      {/* 4. Status Dropdown */}
                      <td className="px-6 py-4">
                        <select 
                          value={c.status}
                          onChange={(e) => handleUpdate(c._id, 'status', e.target.value)}
                          className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors border w-32
                            ${c.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' : 
                              c.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
                              'bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'}
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

// Simple Stat Card
const StatCard = ({ label, count, icon, color }) => (
  <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{count}</p>
      </div>
      <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
        {icon}
      </div>
    </div>
  </div>
);

export default AdminDashboard;